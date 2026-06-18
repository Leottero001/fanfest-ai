# Extracted Content: 01_estructura_maestra.docx

FANFEST AI — ESTRUCTURA MAESTRA DEL PROYECTO
1. Información General del Proyecto
Nombre del Proyecto
FanFest AI
Tipo de Proyecto
Plataforma SaaS híbrida de automatización de marketing contextual impulsado por IA para negocios locales.
Versión
v1.0 — Mayo 2026
Estado
Planeación estratégica + definición de MVP.
Responsable
Fundador / Dirección estratégica del proyecto.
Stakeholders
Fundador 
Desarrollo 
Diseño UX/UI 
Automatización IA 
Marketing 
Comercios piloto 
Operaciones 

2. Resumen Ejecutivo
FanFest AI es una plataforma de inteligencia artificial enfocada en automatizar contenido comercial contextual para negocios físicos durante eventos deportivos masivos.
El sistema permitirá:
generar contenido automático, 
activar promociones en tiempo real, 
publicar contenido contextual, 
adaptar lenguaje y tono según el negocio y barrio, 
y reaccionar automáticamente a eventos deportivos. 
El enfoque inicial será:Medellín
con expansión futura hacia otras ciudades de LATAM.

3. Contexto del Proyecto
Actualmente los pequeños negocios:
no publican contenido constantemente, 
dependen de procesos manuales, 
reaccionan tarde a tendencias, 
y pierden oportunidades comerciales durante eventos deportivos. 
La explosión de:
IA generativa, 
automatización no-code, 
APIs deportivas, 
y consumo de contenido corto, 
abre una oportunidad para construir una plataforma especializada en marketing deportivo contextual.

4. Problema Principal
Problema
Los pequeños negocios locales no tienen capacidad constante para crear contenido deportivo atractivo y contextual en tiempo real.

Consecuencia
menor engagement, 
baja visibilidad, 
menos tráfico físico, 
pérdida de oportunidades comerciales. 

Oportunidad
Automatizar campañas deportivas hiperlocales usando IA y eventos en vivo.

5. Objetivos del Proyecto
Objetivo General
Construir una plataforma IA capaz de generar y automatizar contenido comercial contextual para negocios locales durante eventos deportivos.

Objetivos Específicos
Reducir tiempo de creación de contenido. 
Automatizar promociones deportivas. 
Generar contenido localizado culturalmente. 
Publicar automáticamente en redes sociales. 
Validar modelo SaaS híbrido. 
Construir un motor escalable de marketing contextual. 

6. Público Objetivo
Usuario Principal
Negocios físicos
bares, 
gastrobares, 
restaurantes, 
tiendas deportivas, 
marcas urbanas, 
licoreras. 

Usuario Secundario
agencias pequeñas, 
community managers, 
marcas locales. 

7. User Persona
“Juan — Dueño de Bar Deportivo”
35 años 
administra Instagram manualmente 
poco tiempo operativo 
no sabe diseño 
depende del tráfico de partidos 
quiere aumentar ventas durante eventos deportivos 

8. Propuesta de Valor
Ayudamos a negocios locales a generar contenido deportivo contextual automáticamente mediante IA y automatización, sin depender de agencias o diseñadores.

9. Alcance del Proyecto (Scope)
INCLUYE
Generación IA
posts, 
captions, 
stories, 
promociones, 
hooks, 
copies deportivos. 

Automatización
workflows deportivos, 
triggers por eventos, 
programación de contenido. 

Integración Social
Instagram Business, 
Facebook. 

Segmentación Cultural
tono por barrio, 
lenguaje local, 
personalidad comercial. 

Dashboard MVP
campañas, 
publicaciones, 
calendario deportivo. 

NO INCLUYE
app móvil nativa, 
ERP, 
marketplace, 
facturación electrónica, 
TikTok avanzado, 
IA entrenada propia, 
dashboards BI complejos, 
machine learning predictivo. 

10. Funcionalidades Principales
MÓDULO 1 — Usuarios
registro, 
login, 
recuperación contraseña, 
gestión negocio. 

MÓDULO 2 — Perfil Comercial
tipo negocio, 
barrio, 
promociones, 
tono comunicación, 
horarios. 

MÓDULO 3 — IA Generativa
generación copies, 
generación promociones, 
generación campañas, 
adaptación contextual. 

MÓDULO 4 — Automatización
triggers deportivos, 
workflows n8n, 
automatización eventos. 

MÓDULO 5 — Publicación Social
programación, 
publicación, 
aprobación manual, 
logs. 

MÓDULO 6 — Dashboard
campañas activas, 
calendario, 
historial contenido. 

11. Requerimientos Funcionales
El sistema debe:
generar contenido automáticamente, 
permitir configuración del negocio, 
detectar eventos deportivos, 
activar promociones, 
programar publicaciones, 
almacenar historial, 
gestionar assets visuales. 

12. Requerimientos No Funcionales
Rendimiento
respuesta < 3 segundos. 

Disponibilidad
uptime > 95%. 

Seguridad
autenticación segura, 
protección tokens APIs. 

Escalabilidad
arquitectura modular. 

UX
interfaz simple, 
usable por usuarios no técnicos. 

13. Arquitectura del Sistema
Usuario   ↓Frontend Dashboard   ↓Backend API   ↓n8n Orchestrator   ↓IA Generativa   ↓Canva / Assets   ↓Instagram API

14. Stack Tecnológico
Frontend
React 
Next.js 
Tailwind CSS 

Backend
Node.js 
FastAPI (servicios IA opcionales) 

Automatización
n8n 

IA
Google Gemini 
Anthropic Claude 
OpenAI GPT 

Base de Datos
PostgreSQL 
Supabase 

Assets
Canva 
Cloudinary 

Infraestructura
Docker 
VPS Linux 
Vercel 
GitHub 

15. Flujo Operativo
Flujo Principal
Negocio configura perfil. 
API deportiva detecta evento. 
n8n activa workflow. 
IA genera contenido. 
Sistema aplica plantilla. 
Usuario aprueba. 
Publicación automática. 
Métricas registradas. 

16. Diseño y UX
Estilo Visual
moderno, 
deportivo, 
urbano, 
minimalista, 
rápido. 

Referencias
dashboards SaaS modernos, 
interfaces deportivas, 
estética street/digital. 

17. KPIs y Métricas
Comerciales
negocios activos, 
clientes pagos, 
retención. 

Operativas
tiempo generación, 
automatizaciones exitosas, 
errores publicación. 

Marketing
engagement, 
alcance, 
interacción, 
tráfico generado. 

18. Riesgos Identificados
Dependencia de Meta
Mitigación:
canales alternos, 
exportación manual. 

Contenido poco auténtico
Mitigación:
prompts especializados, 
revisión humana. 

Saturación visual
Mitigación:
personalización dinámica. 

Costos IA
Mitigación:
modelos híbridos, 
límites uso. 

19. Cronograma General
Fase
Duración
Investigación
1 semana
Arquitectura
1 semana
UX/UI
2 semanas
Desarrollo MVP
4 semanas
Integración IA
2 semanas
Testing
1 semana
Piloto
2 semanas
Lanzamiento
1 semana

20. Presupuesto Inicial
Infraestructura
VPS 
APIs 
almacenamiento 

Desarrollo
frontend 
backend 
automatización 

IA
inferencias 
prompts 
optimización 

Marketing
pilotos 
contenido 
ventas iniciales 

21. Criterios de Aceptación
El proyecto será aceptado si:
genera contenido automáticamente, 
publica correctamente, 
funciona en eventos reales, 
soporta múltiples negocios, 
logra engagement real, 
reduce trabajo operativo. 

22. Validación del Proyecto
Técnica
pruebas automatización, 
APIs, 
publicación social. 

Comercial
10 negocios piloto, 
mínimo 5 pagos, 
testimonios. 

Marketing
Comparar:
contenido IA, 
engagement, 
publicaciones manuales. 

23. Roadmap Futuro
Fase 2
TikTok, 
WhatsApp, 
Telegram. 

Fase 3
IA predictiva, 
analítica avanzada, 
recomendaciones automáticas. 

Fase 4
expansión LATAM, 
multiidioma, 
franquicias comerciales. 

24. DESGLOSE DEL BRIEF A TAREAS
ETAPA 1 — ARQUITECTURA
Objetivo
Diseñar la base técnica y lógica del sistema.

Tareas
Arquitectura General
definir arquitectura modular, 
definir separación frontend/backend, 
definir orquestación IA. 

Infraestructura
configurar VPS, 
configurar Docker, 
repositorios GitHub. 

Integraciones
Meta API, 
APIs deportivas, 
Gemini/Claude/OpenAI. 

Seguridad
autenticación, 
manejo tokens, 
variables entorno. 

Entregables
diagrama arquitectura, 
mapa integraciones, 
definición stack, 
repositorios base. 

ETAPA 2 — MODELO DE DATOS
Objetivo
Definir estructura lógica de la información.

Entidades Principales
Usuarios
id, 
email, 
password, 
rol. 

Negocios
nombre, 
categoría, 
barrio, 
tono comunicación. 

Campañas
tipo, 
fecha, 
estado. 

Publicaciones
contenido, 
plataforma, 
estado, 
engagement. 

Eventos Deportivos
partido, 
marcador, 
estado, 
trigger. 

Tareas
diseñar esquema PostgreSQL, 
relaciones entidades, 
normalización básica, 
migraciones iniciales. 

Entregables
ERD, 
schema SQL, 
documentación datos. 

ETAPA 3 — UI / UX
Objetivo
Diseñar experiencia simple y rápida.

Pantallas MVP
Auth
login, 
registro, 
recuperación. 

Dashboard
campañas, 
calendario, 
métricas básicas. 

Configuración Negocio
branding, 
promociones, 
tono. 

Generador IA
preview contenido, 
edición, 
aprobación. 

Tareas
wireframes, 
design system, 
prototipo Figma, 
responsive mobile. 

Entregables
sistema visual, 
componentes UI, 
prototipo navegable. 

ETAPA 4 — API / LÓGICA DE NEGOCIO
Objetivo
Construir motor funcional del sistema.

APIs
Auth API
login, 
JWT, 
sesiones. 

Business API
CRUD negocios, 
configuración. 

AI API
generación contenido, 
prompts dinámicos. 

Automation API
triggers deportivos, 
workflows. 

Publishing API
programación, 
publicación social. 

Tareas
endpoints, 
validaciones, 
middlewares, 
integración n8n, 
integración IA. 

Entregables
API funcional, 
documentación endpoints, 
workflows activos. 

ETAPA 5 — TESTS
Objetivo
Garantizar estabilidad y funcionamiento.

Tipos de Tests
Unitarios
funciones IA, 
validaciones. 

Integración
APIs, 
workflows, 
Meta API. 

End-to-End
generación completa, 
publicación completa. 

UX Testing
pruebas usuarios piloto. 

Entregables
cobertura mínima, 
reporte errores, 
checklist QA. 

ETAPA 6 — DOCUMENTACIÓN Y DESPLIEGUE
Objetivo
Preparar sistema para piloto real.

Documentación
Técnica
arquitectura, 
APIs, 
workflows. 

Operativa
onboarding, 
uso dashboard, 
gestión campañas. 

Comercial
pitch, 
pricing, 
demo piloto. 

Despliegue
Infraestructura
producción VPS, 
dominios, 
SSL. 

DevOps
CI/CD básico, 
backups, 
monitoreo. 

Entregables
MVP desplegado, 
documentación completa, 
entorno producción funcional. 

25. RESULTADO ESPERADO
FanFest AI deberá convertirse en:
una plataforma de marketing contextual deportivo impulsada por IA capaz de automatizar campañas comerciales hiperlocales para negocios físicos en tiempo real.
