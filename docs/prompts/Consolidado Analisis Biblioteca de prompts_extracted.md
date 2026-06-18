# Extracted Content: Consolidado Analisis Biblioteca de prompts.docx


Acá está mi análisis completo. Revisé las 6 carpetas, leí una muestra representativa de todos los prompts y los contraté con el estado real del proyecto (Frontend 100%, DB 80%, n8n 60%, IA en mock al 30%).

🗺️ Lo más importante, en resumen
La biblioteca es buena, pero está adelantada al proyecto
Fue diseñada para una v2–v3 del sistema. En su mayoría describe lo que FanFest AI debería ser, no lo que puede usar hoy.

¿Qué implementar ANTES del lanzamiento? (5 prompts)
Prioridad
Prompt
Por qué
🔴 Urgente
03-05 Moderador de Safety
Es el único contextualizado en Colombia/barras. Evita publicaciones que escalen conflictos. Muy bien construido.
🔴 Urgente
03-06 Decisor Final de Publicación
Gate de seguridad. Necesario antes de automatizar cualquier publicación.
🔴 Urgente
05-01 Detector de Alucinaciones
Evita que salgan estadísticas inventadas. Crítico en producción.
🔴 Urgente
04-01/02 JSON Estricto para n8n
Como sufijo estándar. Resuelve el problema de parsear respuestas de Gemini en texto libre.
🟡 Importante
05-07 Auditor Maestro de Calidad
Puede ejecutarse al final de cualquier workflow. El mejor construido de la carpeta 05.

¿Qué NO implementar todavía?
Toda la carpeta 06 (Memory/Personality): Requiere historial de usuarios que no existe.
Prompts 10 y 11 Core (Cuotas y Valor): Sin integración a bookmakers = riesgo de alucinaciones sobre apuestas. Peligroso legal y reputacionalmente.
El pipeline de Orquestación completo: 7 prompts en cadena por evento en tiempo real = 7x el costo de API + ~60s de latencia. Para el MVP, 3 pasos son suficientes.

El diagnóstico más crítico
Los prompts Core carecen de inputs definidos. Dicen "analiza" pero no especifican en qué formato llegan los datos. Antes de conectarlos a Gemini/n8n, hay que añadirles el bloque INPUT: {{json_payload}} con el schema real de Supabase. Sin eso, cada conexión es manual y frágil.
El análisis completo con la tabla de impactos y el roadmap por versiones está en el reporte detallado.
