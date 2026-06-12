-- ============================================================================
-- FanFest AI — Migration 011: CRM RLS Security & Campaign Webhook Triggers
-- ============================================================================
-- Propósito: 
--  1. Habilitar la columna is_admin en profiles y corregir RLS en beta_businesses
--  2. Habilitar webhook de base de datos para la automatización de la publicación
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Seguridad RLS: Profiles & beta_businesses (Leads)
-- ----------------------------------------------------------------------------

-- Agregar columna is_admin a profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false NOT NULL;

-- Comentario explicativo
COMMENT ON COLUMN public.profiles.is_admin IS 'Flag to identify administrator accounts with CRM and system configuration access.';

-- Eliminar políticas antiguas inseguras de beta_businesses
DROP POLICY IF EXISTS beta_businesses_select_auth ON public.beta_businesses;
DROP POLICY IF EXISTS beta_businesses_update_auth ON public.beta_businesses;
DROP POLICY IF EXISTS beta_businesses_delete_auth ON public.beta_businesses;

-- Crear nuevas políticas seguras basadas en is_admin
CREATE POLICY beta_businesses_select_admin ON public.beta_businesses
  FOR SELECT USING (
    auth.role() = 'service_role' OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY beta_businesses_update_admin ON public.beta_businesses
  FOR UPDATE USING (
    auth.role() = 'service_role' OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY beta_businesses_delete_admin ON public.beta_businesses
  FOR DELETE USING (
    auth.role() = 'service_role' OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- ----------------------------------------------------------------------------
-- 2. Configuración de Webhook de Publicación (pg_net)
-- ----------------------------------------------------------------------------

-- Habilitar extensión pg_net si no está activa
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Crear tabla de configuraciones del sistema si no existe
CREATE TABLE IF NOT EXISTS public.app_settings (
  key   text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Registrar URL base por defecto para n8n
INSERT INTO public.app_settings (key, value)
VALUES ('n8n_base_url', 'http://localhost:5678')
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE public.app_settings IS 'System configurations (like integration base URLs, API endpoints, etc.)';

-- Trigger Function para invocar webhook n8n cuando una campaña sea aprobada
CREATE OR REPLACE FUNCTION public.trg_fn_trigger_campaign_publish()
RETURNS TRIGGER AS $$
DECLARE
  n8n_url text;
  payload_json json;
BEGIN
  -- Se dispara únicamente cuando el estado pasa a 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    -- Buscar la URL base de n8n en app_settings
    SELECT value INTO n8n_url FROM public.app_settings WHERE key = 'n8n_base_url';
    
    IF n8n_url IS NOT NULL AND n8n_url <> '' THEN
      -- Estructurar el payload
      payload_json := json_build_object('campaign_id', NEW.id);
      
      -- Enviar HTTP POST asíncrono usando pg_net
      -- Envía a: http://<n8n-url>/webhook/publish-campaign
      PERFORM net.http_post(
        url := n8n_url || '/webhook/publish-campaign',
        body := payload_json::text,
        headers := '{"Content-Type": "application/json"}'::jsonb
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Crear el Trigger en la tabla campaigns
DROP TRIGGER IF EXISTS trg_campaign_approved ON public.campaigns;
CREATE TRIGGER trg_campaign_approved
  AFTER UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_fn_trigger_campaign_publish();

COMMENT ON FUNCTION public.trg_fn_trigger_campaign_publish()
  IS 'Webhook trigger that hits n8n to publish campaigns to Instagram/Facebook when approved in the frontend.';
