-- ============================================================================
-- FanFest AI — Migration 005: Beta Businesses CRM
-- ============================================================================
-- Tables: beta_businesses
-- Purpose: Captures leads from the Landing Page for the MVP / Pilot phase.
-- ============================================================================

CREATE TABLE public.beta_businesses (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Datos del Responsable
  owner_name          text NOT NULL,
  owner_role          text,
  whatsapp            text NOT NULL,
  email               text NOT NULL,
  owner_instagram     text,
  
  -- Datos del Negocio
  business_name       text NOT NULL,
  business_type       text NOT NULL, -- e.g., 'Gastrobar', 'Bar', 'Restaurante', 'Discoteca'
  neighborhood        text NOT NULL,
  city                text NOT NULL DEFAULT 'Medellín',
  instagram           text,
  capacity_approx     text,
  will_stream_world_cup boolean NOT NULL DEFAULT true,
  
  -- Preguntas de Validación
  current_promo_methods text[],      -- e.g., ['Instagram', 'WhatsApp']
  world_cup_interest    text[],      -- e.g., ['Más clientes', 'Fidelización']
  wants_free_pilot      boolean NOT NULL DEFAULT true,
  
  -- Status CRM
  status              text NOT NULL DEFAULT 'new'
                      CHECK (status IN ('new', 'contacted', 'qualified', 'pilot_active', 'rejected')),
  
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.beta_businesses IS 'Lead capture table for the FanFest AI Beta Program.';
COMMENT ON COLUMN public.beta_businesses.status IS 'CRM status for sales pipeline.';

-- Auto-update updated_at
CREATE TRIGGER trg_beta_businesses_updated_at
  BEFORE UPDATE ON public.beta_businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.beta_businesses ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for the public Landing Page form)
CREATE POLICY beta_businesses_insert_anon ON public.beta_businesses
  FOR INSERT WITH CHECK (true);

-- Only authenticated admins/service_role can view or edit
CREATE POLICY beta_businesses_select_auth ON public.beta_businesses
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY beta_businesses_update_auth ON public.beta_businesses
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY beta_businesses_delete_auth ON public.beta_businesses
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Indexes for CRM filtering
CREATE INDEX idx_beta_businesses_status ON public.beta_businesses (status);
CREATE INDEX idx_beta_businesses_created_at ON public.beta_businesses (created_at DESC);
