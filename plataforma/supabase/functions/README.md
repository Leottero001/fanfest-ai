# Edge Functions — FanFest AI

Este directorio contiene las Supabase Edge Functions del proyecto.

---

## `generate-campaign-copy`

Llama a Gemini AI para generar copy contextual de Instagram basado en el estado del partido y la promoción activa del negocio.

### Variables de entorno requeridas en Supabase

Ve a tu proyecto → **Settings → Edge Functions → Secrets** y agrega:

| Variable | Descripción |
|---|---|
| `GEMINI_API_KEY` | Tu API Key de Google AI Studio (gratuita) |

> Las variables `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` son **inyectadas automáticamente** por Supabase.

### Cómo obtener tu GEMINI_API_KEY (gratis)

1. Visita [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Crea una nueva API Key
3. Cópiala y pégala en Supabase Secrets como `GEMINI_API_KEY`

---

## Despliegue

### Opción A — Supabase CLI (recomendada)

```bash
# Instalar CLI si no lo tienes
npm install -g supabase

# Login
supabase login

# Linkear al proyecto
supabase link --project-ref pgywucfykshkrdvwsejf

# Desplegar solo la función generate-campaign-copy
supabase functions deploy generate-campaign-copy

# Verificar que quedó desplegada
supabase functions list
```

### Opción B — Dashboard (sin CLI)

1. Ve a tu proyecto en [supabase.com](https://supabase.com/dashboard)
2. Navega a **Edge Functions → New Function**
3. Nombra la función `generate-campaign-copy`
4. Copia y pega el contenido de `generate-campaign-copy/index.ts`
5. Haz clic en **Deploy**

---

## Probar la función localmente

```bash
# Correr la función en modo local (requiere Docker)
supabase functions serve generate-campaign-copy --env-file ../frontend/.env.local

# Llamarla desde otra terminal
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/generate-campaign-copy' \
  --header 'Authorization: Bearer TU_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "business_id": "b0000000-0000-0000-0000-000000000001",
    "tone": "paisa",
    "context": {
      "business_name": "El Templo Bar",
      "neighborhood": "laureles",
      "home_team": "Atlético Nacional",
      "away_team": "Independiente Medellín",
      "score": "2-0",
      "minute": 78,
      "scorer": "Jefferson Duque",
      "discount": "2x1 en cerveza Águila",
      "duration_minutes": 30
    }
  }'
```

---

## Respuesta esperada

```json
{
  "success": true,
  "campaign_id": "uuid...",
  "generation_id": "uuid...",
  "generated_text": "¡Qué golazo de mi Verde, parce! ⚽🔥 Segundo gol del Nacional...",
  "model": "gemini-2.0-flash",
  "tokens": { "prompt": 210, "completion": 95, "total": 305 },
  "estimated_cost_usd": 0.000044
}
```
