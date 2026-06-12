-- ============================================================================
-- FanFest AI — Migration 009: Digital Identity Layer
-- ============================================================================
-- Purpose: Adds new columns to beta_businesses to capture the identity and tone
--          of each business, ensuring AI-generated content is highly customized.
-- ============================================================================

ALTER TABLE public.beta_businesses
  ADD COLUMN IF NOT EXISTS target_audience text[],
  ADD COLUMN IF NOT EXISTS communication_tone text,
  ADD COLUMN IF NOT EXISTS specialties text[],
  ADD COLUMN IF NOT EXISTS usual_promos text[],
  ADD COLUMN IF NOT EXISTS preferred_hashtags text[],
  ADD COLUMN IF NOT EXISTS active_social_networks text[],
  ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'Español';

COMMENT ON COLUMN public.beta_businesses.target_audience IS 'e.g., Jóvenes, Ejecutivos, Familias';
COMMENT ON COLUMN public.beta_businesses.communication_tone IS 'e.g., Formal, Informal, Humorístico, Paisa';
COMMENT ON COLUMN public.beta_businesses.specialties IS 'e.g., Cerveza artesanal, Alitas, Pantallas gigantes';
COMMENT ON COLUMN public.beta_businesses.usual_promos IS 'e.g., 2x1, Happy Hour';

-- ============================================================================
-- View: CRM Dashboard de Comunicaciones (Updated)
-- ============================================================================
-- Recreating the view to include communication_tone

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
  bb.communication_tone,  -- NUEVO CAMPO
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
  bb.city, bb.neighborhood, bb.business_type, bb.status, bb.communication_tone, bb.created_at,
  welcome.sent_successfully, welcome.created_at

ORDER BY bb.created_at DESC;
