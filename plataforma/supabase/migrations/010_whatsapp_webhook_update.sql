-- ============================================================================
-- FanFest AI — Migration 010: WhatsApp Webhook — Permiso de Update
-- ============================================================================
-- Propósito: Permite que el servicio (n8n con service_role key) actualice
--            el campo recipient_response en whatsapp_messages_log cuando
--            llega una respuesta del dueño del negocio vía Meta webhook.
--
-- Nota: n8n usa service_role key que bypasea RLS automáticamente.
--       Esta migration agrega políticas adicionales para casos de uso futuros
--       donde se usen anon keys o funciones edge.
-- ============================================================================

-- Política: Permite que el service_role (n8n) actualice recipient_response
-- Nota: service_role bypasea RLS, pero documentamos la intención aquí.

-- Política de update para columnas específicas (recipient_response, response_received_at)
-- Usada si en el futuro se procesa el webhook desde una Edge Function con anon key
CREATE POLICY wa_log_update_response ON public.whatsapp_messages_log
  FOR UPDATE
  USING (auth.uid() IS NOT NULL OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() IS NOT NULL OR auth.role() = 'service_role');

-- Índice para búsqueda rápida de mensajes por número de teléfono del remitente
-- (necesario para el webhook: recibir número → buscar negocio → actualizar log)
CREATE INDEX IF NOT EXISTS idx_wa_log_whatsapp_number
  ON public.whatsapp_messages_log (beta_business_id);

-- Vista adicional para monitorear respuestas pendientes
CREATE OR REPLACE VIEW public.v_wa_pending_responses AS
SELECT
  wl.id                  AS log_id,
  bb.business_name,
  bb.owner_name,
  bb.whatsapp,
  wl.message_type,
  wl.message_body,
  wl.created_at          AS sent_at,
  wl.recipient_response,
  wl.response_received_at,
  CASE
    WHEN wl.recipient_response IS NULL THEN 'pending'
    WHEN wl.recipient_response IN ('SÍ', 'SI', 'FOTO') THEN 'positive'
    WHEN wl.recipient_response IN ('NO', 'LUEGO') THEN 'negative'
    ELSE 'other'
  END AS response_status
FROM public.whatsapp_messages_log wl
JOIN public.beta_businesses bb ON bb.id = wl.beta_business_id
WHERE wl.sent_successfully = true
  AND wl.message_type IN ('post_match_followup', 'pre_match_content')
ORDER BY wl.created_at DESC;

COMMENT ON VIEW public.v_wa_pending_responses
  IS 'Vista de mensajes de follow-up enviados y su estado de respuesta. Útil para el equipo de ventas.';
