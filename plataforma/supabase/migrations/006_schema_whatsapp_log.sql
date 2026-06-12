-- ============================================================================
-- FanFest AI — Migration 006: WhatsApp Messages Log
-- ============================================================================
-- Tables: whatsapp_messages_log
-- Purpose: Registra cada mensaje de WhatsApp enviado por los flujos de n8n.
--          Sirve como CRM de comunicaciones y previene duplicados.
-- Depends on: 001_schema_core.sql, 005_schema_beta_businesses.sql
-- ============================================================================

CREATE TABLE public.whatsapp_messages_log (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Referencias
  beta_business_id    uuid REFERENCES public.beta_businesses(id) ON DELETE SET NULL,
  sports_event_id     uuid REFERENCES public.sports_events(id) ON DELETE SET NULL,

  -- Tipo de mensaje enviado
  message_type        text NOT NULL
                      CHECK (message_type IN (
                        'onboarding_welcome',    -- Bienvenida post-registro
                        'pre_match_content',     -- Contenido IA 48h antes del partido
                        'post_match_followup',   -- Follow-up 24h después del partido
                        'conversion_offer',      -- Oferta de conversión post-Mundial
                        'manual'                 -- Mensaje manual del equipo
                      )),

  -- Datos del mensaje
  wa_message_id       text,                      -- ID de mensaje retornado por Meta API
  message_body        text,                      -- Cuerpo del mensaje enviado
  ai_response_raw     text,                      -- Respuesta cruda de Gemini (si aplica)

  -- Estado del envío
  sent_successfully   boolean NOT NULL DEFAULT false,
  error_details       text,                      -- Detalle del error si sent_successfully = false

  -- Respuesta del destinatario (actualizada manualmente o por webhook de WA)
  recipient_response  text,                      -- e.g., 'SÍ', 'NO', 'FOTO', 'LUEGO'
  response_received_at timestamptz,

  -- Metadatos
  created_at          timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.whatsapp_messages_log IS 'Registro de todos los mensajes WhatsApp enviados por los flujos n8n. Previene duplicados y sirve como CRM de comunicaciones.';
COMMENT ON COLUMN public.whatsapp_messages_log.message_type IS 'Tipo de mensaje: onboarding, contenido pre-partido, follow-up, conversión o manual.';
COMMENT ON COLUMN public.whatsapp_messages_log.wa_message_id IS 'ID único del mensaje en la API de WhatsApp Business (Meta). Útil para rastrear entrega.';
COMMENT ON COLUMN public.whatsapp_messages_log.recipient_response IS 'Respuesta del dueño del negocio al follow-up. Actualizar manualmente o vía webhook de WA.';

-- Indexes para deduplicación (usados por los flujos n8n para verificar si ya se envió)
CREATE INDEX idx_wa_log_business_event_type
  ON public.whatsapp_messages_log (beta_business_id, sports_event_id, message_type);

CREATE INDEX idx_wa_log_business
  ON public.whatsapp_messages_log (beta_business_id);

CREATE INDEX idx_wa_log_type
  ON public.whatsapp_messages_log (message_type);

CREATE INDEX idx_wa_log_created_at
  ON public.whatsapp_messages_log (created_at DESC);

CREATE INDEX idx_wa_log_successful
  ON public.whatsapp_messages_log (sent_successfully)
  WHERE sent_successfully = true;

-- Enable Row Level Security
ALTER TABLE public.whatsapp_messages_log ENABLE ROW LEVEL SECURITY;

-- Solo service_role (n8n) puede insertar registros
-- Los usuarios autenticados pueden ver los logs de sus propios negocios
CREATE POLICY wa_log_select_auth ON public.whatsapp_messages_log
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- n8n usa service_role key — bypass RLS automáticamente
-- No se necesita policy de insert para service_role

-- ============================================================================
-- View: CRM Dashboard de Comunicaciones
-- ============================================================================
-- Vista útil para monitorear el estado del piloto sin hacer JOINs manuales
CREATE OR REPLACE VIEW public.v_pilot_crm_dashboard AS
SELECT
  bb.id                   AS business_id,
  bb.business_name,
  bb.owner_name,
  bb.whatsapp,
  bb.city,
  bb.neighborhood,
  bb.business_type,
  bb.status               AS crm_status,
  bb.created_at           AS registered_at,

  -- Bienvenida
  welcome.sent_successfully  AS welcome_sent,
  welcome.created_at         AS welcome_sent_at,

  -- Contenidos pre-partido enviados
  COUNT(DISTINCT pre.id)     AS pre_match_contents_sent,

  -- Follow-ups enviados
  COUNT(DISTINCT fu.id)      AS followups_sent,

  -- Respuestas positivas (publicó el contenido)
  COUNT(DISTINCT CASE WHEN fu.recipient_response IN ('SÍ', 'SI', 'FOTO') THEN fu.id END)
                             AS confirmed_publications,

  -- Última comunicación
  MAX(all_msgs.created_at)   AS last_message_at

FROM public.beta_businesses bb

LEFT JOIN public.whatsapp_messages_log welcome
  ON welcome.beta_business_id = bb.id
  AND welcome.message_type = 'onboarding_welcome'

LEFT JOIN public.whatsapp_messages_log pre
  ON pre.beta_business_id = bb.id
  AND pre.message_type = 'pre_match_content'
  AND pre.sent_successfully = true

LEFT JOIN public.whatsapp_messages_log fu
  ON fu.beta_business_id = bb.id
  AND fu.message_type = 'post_match_followup'

LEFT JOIN public.whatsapp_messages_log all_msgs
  ON all_msgs.beta_business_id = bb.id

GROUP BY
  bb.id, bb.business_name, bb.owner_name, bb.whatsapp,
  bb.city, bb.neighborhood, bb.business_type, bb.status, bb.created_at,
  welcome.sent_successfully, welcome.created_at

ORDER BY bb.created_at DESC;

COMMENT ON VIEW public.v_pilot_crm_dashboard IS 'Vista consolidada del CRM del piloto: muestra estado de cada negocio beta con sus métricas de comunicación WhatsApp.';
