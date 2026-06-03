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
