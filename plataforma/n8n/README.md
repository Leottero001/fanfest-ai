# n8n - FanFest AI

Este directorio contiene las configuraciones, respaldos de flujos (JSON) e instrucciones para el orquestador n8n.

## Despliegue 100% Gratis en Hugging Face Spaces

Para desplegar n8n de forma gratuita con persistencia en la base de datos de Supabase:

1. **Crear una cuenta en Hugging Face** (si aún no tienes una).
2. **Crear un nuevo Space**:
   * Ve a [huggingface.co/new-space](https://huggingface.co/new-space).
   * Nombre del Space: `fanfest-n8n` (o el que prefieras).
   * License: `mit` o la de tu preferencia.
   * SDK: Selecciona **Docker** (luego elige la plantilla `Blank`).
   * Space visibility: **Public** o **Private** (se recomienda *Private* para proteger tus flujos de automatización, pero debe ser accesible por webhooks).
3. **Configurar el archivo Dockerfile**:
   En la raíz del repositorio de tu Space, crea un archivo llamado `Dockerfile` con el siguiente contenido:
   ```dockerfile
   FROM n8nio/n8n:latest
   ```
4. **Configurar las Variables de Entorno (Secrets)**:
   Ve a la pestaña **Settings** de tu Space en Hugging Face y añade las siguientes variables en la sección **Variables and Secrets**:
   * `DB_TYPE`: `postgresdb`
   * `DB_POSTGRESDB_HOST`: El host de tu base de datos de Supabase (ej: `aws-0-us-east-1.pooler.supabase.com`).
   * `DB_POSTGRESDB_PORT`: `6543` (puerto del pooler de Supabase) o `5432` (directo).
   * `DB_POSTGRESDB_DATABASE`: `postgres`
   * `DB_POSTGRESDB_USER`: `postgres`
   * `DB_POSTGRESDB_PASSWORD`: Tu contraseña de Supabase.
   * `N8N_ENCRYPTION_KEY`: Una cadena de texto aleatoria para cifrar credenciales.
   * `N8N_PORT`: `7860` (Puerto requerido por Hugging Face para exponer el contenedor).
   * `WEBHOOK_URL`: La URL pública de tu Space en Hugging Face (ej. `https://<tu-usuario>-<tu-space>.hf.space/`).

5. **Evitar que se duerma (Keep-Alive)**:
   Los Spaces gratuitos de Hugging Face entran en estado inactivo si no reciben tráfico. Para mantenerlo activo 24/7 y recibir webhooks en tiempo real:
   * Crea una cuenta gratuita en [Cron-Job.org](https://cron-job.org/) o [UptimeRobot.com](https://uptimerobot.com/).
   * Configura un cron-job que haga una petición HTTP GET a tu URL de n8n (ej: `https://<tu-usuario>-<tu-space>.hf.space/healthz` o la URL raíz) cada **10 minutos**.

---

## Flujos Disponibles

| Archivo | Propósito | Trigger |
|---|---|---|
| `onboarding_whatsapp.json` | Mensaje de bienvenida post-registro en `beta_businesses` | Supabase Realtime / Schedule |
| `pre_match_content.json` | Contenido IA 48h antes del partido | Schedule (cron) |
| `post_match_followup.json` | Follow-up 24h después del partido | Schedule (cron) |
| `live_match_orchestrator.json` | Orquestador en tiempo real (goles → campañas) | Schedule (polling API-Football) |
| `social_publisher.json` | Publicación en Instagram cuando se aprueba campaña | Supabase Realtime |
| `whatsapp_webhook_receiver.json` | **NUEVO** — Recibe respuestas de los negocios vía Meta | Webhook (GET + POST) |

---

## Configurar el Webhook Receptor de WhatsApp

### Variables de entorno requeridas en n8n

Agrega esta variable en los Secrets de tu Hugging Face Space:
- `WA_VERIFY_TOKEN`: Una cadena aleatoria que tú defines (ej: `fanfest-wa-token-2026`). Debe coincidir exactamente con lo que registras en Meta.

### Pasos para registrar el webhook en Meta Business Manager

1. **Ir al portal de developers**: [developers.facebook.com](https://developers.facebook.com)
2. Selecciona tu App → **WhatsApp** → **Configuration** → **Webhook**
3. Haz clic en **Edit** y completa:
   - **Callback URL**: `https://<tu-usuario>-<tu-space>.hf.space/webhook/wa-incoming`
   - **Verify Token**: El mismo valor de `WA_VERIFY_TOKEN`
4. Haz clic en **Verify and Save**. Meta hará un GET al webhook; n8n responderá con el `hub.challenge` automáticamente.
5. En **Webhook fields**, suscríbete al campo: `messages`

### Flujo de una respuesta entrante

```
Dueño del bar responde "SÍ" en WhatsApp
        ↓
Meta envía POST a n8n (webhook)
        ↓
n8n normaliza respuesta → busca negocio por número
        ↓
Actualiza whatsapp_messages_log.recipient_response = 'SÍ'
        ↓
Si es positiva → beta_businesses.status = 'pilot_active'
        ↓
CRM Dashboard muestra "✅ Publicó" en tiempo real
```

### Respuestas reconocidas automáticamente

| Texto del dueño | Normalizado a |
|---|---|
| "si", "sí", "dale", "ok", "claro" | `SÍ` |
| "foto", "acá", "enviando" | `FOTO` |
| "no" | `NO` |
| "luego", "después", "más tarde" | `LUEGO` |

