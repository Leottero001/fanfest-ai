# FanFest AI ⚽🤖

Este repositorio contiene el código, las automatizaciones y la documentación del proyecto **FanFest AI**, una plataforma SaaS de automatización de marketing contextual impulsado por IA para negocios locales y gastrobares durante eventos deportivos en vivo.

## Estructura del Repositorio

El proyecto está organizado en las siguientes carpetas:

### 📁 [plataforma/](file:///c:/Users/USER/Documentos/01. Proyectos/10 FanFest AI/plataforma)
Contiene todo el código fuente y las configuraciones técnicas del sistema:
* **[frontend/](file:///c:/Users/USER/Documentos/01. Proyectos/10 FanFest AI/plataforma/frontend):** Aplicación interactiva construida en Next.js 16 + React 19 + Tailwind CSS v4. Es el dashboard de cara al usuario.
* **[supabase/](file:///c:/Users/USER/Documentos/01. Proyectos/10 FanFest AI/plataforma/supabase):** Configuraciones, esquemas de bases de datos y migraciones de la base de datos PostgreSQL, junto con Supabase Edge Functions.
* **[n8n/](file:///c:/Users/USER/Documentos/01. Proyectos/10 FanFest AI/plataforma/n8n):** Configuraciones de flujos de trabajo (workflows), webhooks y orquestación de automatizaciones en Hugging Face Spaces.

### 📁 [documentacion/](file:///c:/Users/USER/Documentos/01. Proyectos/10 FanFest AI/documentacion)
Contiene los archivos de planificación estratégica, modelo de negocio y ROI:
* **[FANFEST AI — ESTRUCTURA MAESTRA DEL PROYECTO.docx](file:///c:/Users/USER/Documentos/01. Proyectos/10 FanFest AI/documentacion/FANFEST AI — ESTRUCTURA MAESTRA DEL PROYECTO.docx):** Estructura del proyecto, alcances, módulos y cronograma del MVP.
* **[Dashboard que simule el ROI.docx](file:///c:/Users/USER/Documentos/01. Proyectos/10 FanFest AI/documentacion/Dashboard que simule el ROI.docx):** Simulador de retorno de inversión para los negocios locales de Medellín.
* **[Modelo de atención o prestación de servicios.docx](file:///c:/Users/USER/Documentos/01. Proyectos/10 FanFest AI/documentacion/Modelo de atención o prestación de servicios.docx):** Planes comerciales y modelo de ingresos (Starter, Pro, Empresa).
* **[Proceso.docx](file:///c:/Users/USER/Documentos/01. Proyectos/10 FanFest AI/documentacion/Proceso.docx):** Guía rápida para probar las funcionalidades simuladas en el frontend.

---

## Cómo Iniciar el Servidor de Desarrollo

Para correr la interfaz de usuario de forma local, navega a la carpeta de frontend e inicia el servidor:

```bash
cd plataforma/frontend
npm install
npm run dev
```

El dashboard interactivo estará disponible en **http://localhost:3000**.
