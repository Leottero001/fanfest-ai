-- ============================================================================
-- FanFest AI — Migration 004: Prompt Templates System
-- ============================================================================
-- Tables: prompt_templates
-- Depends on: 001_schema_core.sql
-- ============================================================================

CREATE TABLE public.prompt_templates (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key            text UNIQUE NOT NULL,             -- Unique key, e.g., 'copy_paisa', 'copy_premium', 'safety_validator'
  name           text NOT NULL,                    -- Human-readable name
  system_prompt  text,                             -- System instructions
  user_template  text NOT NULL,                    -- Template with variables
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.prompt_templates IS 'SaaS Prompt Template repository. Dynamic prompts decouple AI instructions from n8n nodes.';
COMMENT ON COLUMN public.prompt_templates.key IS 'Unique lookup key used by the n8n orchestrator to fetch templates dynamically.';

-- Auto-update updated_at
CREATE TRIGGER trg_prompt_templates_updated_at
  BEFORE UPDATE ON public.prompt_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read prompt templates
CREATE POLICY prompt_templates_select_authenticated ON public.prompt_templates
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only service_role (system/n8n/admin) can modify prompt templates
-- No user-facing insert/update/delete policies are created.

-- -------------------------------------------------------
-- Seed Prompt Templates
-- -------------------------------------------------------
INSERT INTO public.prompt_templates (key, name, system_prompt, user_template)
VALUES
  (
    'copy_paisa',
    'Generador de Copys Paisa',
    'Eres un redactor creativo de marketing deportivo para locales en Medellín. Escribe con jerga y dialecto paisa auténtico de forma divertida y cercana (parce, mor, pues, mor, ¡qué golazo de mi verde!, ¡se prendió esto!). Usa emojis relevantes. Mantén el texto corto, dinámico y enfocado a la conversión rápida. Máximo 260 caracteres.',
    'Genera una publicación de Instagram para el negocio "{{business_name}}" en el barrio "{{neighborhood}}". Contexto del partido: gol de {{scorer}} para {{team}} (marcador actual: {{score}}, minuto: {{minute}}). Promoción activa: "{{discount}}" con duración de {{duration_minutes}} minutos. El texto debe incluir la promoción, animar a la gente a venir o consumir de inmediato y cerrar con hashtags relevantes (ej. #Nacional, #DIM, #Medellin).'
  ),
  (
    'copy_premium',
    'Generador de Copys Premium / Bilingüe',
    'Eres un redactor de marketing de alta gama para bares sofisticados en Medellín. Escribe en un tono premium, refinado, a veces bilingüe (español/inglés) o neutro elegante. Evita el dialecto local exagerado. Usa emojis de manera moderada y estilizada. Máximo 260 caracteres.',
    'Generate an Instagram post for "{{business_name}}" located in "{{neighborhood}}". Context: {{team}} scored a goal! Current score: {{score}}, minute: {{minute}} by {{scorer}}. Promotion: "{{discount}}" valid for the next {{duration_minutes}} minutes. Build an elegant, inviting vibe for fans watching the classic match and encourage reservations or premium table orders.'
  ),
  (
    'safety_validator',
    'Validador de Seguridad y Calidad (AI Safety)',
    'Actúas como un validador automático de control de calidad y seguridad para publicaciones de redes sociales (AI Safety Validator). Tu única tarea es analizar el texto propuesto y retornar exclusivamente un objeto JSON válido. No agregues introducciones, ni formatees como markdown. No escribas nada fuera del JSON.',
    'Analiza el siguiente texto propuesto para publicación en redes sociales:
---
"{{copy_text}}"
---

Debes validar lo siguiente:
1. Longitud: Que no supere los 280 caracteres.
2. Variables vacías: Que no contenga marcadores como {{...}}, undefined, null, NaN o placeholders incompletos.
3. Exceso de emojis: Que no tenga más de 6 emojis en total.
4. Lenguaje inapropiado: Que no contenga insultos, groserías ofensivas o incitación a la violencia física o riñas entre hinchadas.
5. Consistencia de la promoción: El texto debe mencionar explícitamente la promoción "{{discount}}" o la duración de "{{duration_minutes}}" minutos.

Retorna exactamente este esquema JSON:
{
  "is_safe": boolean,
  "reason": "si is_safe es false, detalla la razón exacta de manera corta; si es true escribe ''OK''",
  "checks": {
    "length_valid": boolean,
    "no_placeholders": boolean,
    "emojis_moderate": boolean,
    "appropriate_language": boolean,
    "promo_consistent": boolean
  }
}'
  )
ON CONFLICT (key) DO UPDATE SET
  system_prompt = EXCLUDED.system_prompt,
  user_template = EXCLUDED.user_template;
