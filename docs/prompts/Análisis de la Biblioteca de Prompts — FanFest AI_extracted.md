# Extracted Content: Análisis de la Biblioteca de Prompts — FanFest AI.docx

Análisis de la Biblioteca de Prompts — FanFest AI
Contexto de la evaluación: FanFest AI se encuentra en estado de MVP funcional (Frontend 100%, DB 80%, n8n 60%, IA 30%), próximo a lanzamiento. El análisis evalúa cada prompt desde esa realidad concreta, no desde el sistema ideal final.

📋 Resumen Ejecutivo
La biblioteca es valiosa a mediano plazo y muestra madurez conceptual, pero en su mayoría fue diseñada para una versión v2–v3 del producto. Para el lanzamiento inmediato, solo un subconjunto pequeño es aplicable ahora mismo sin retrasar el proyecto.
Carpeta
Prompts
Pertinencia HOY
Pertinencia v2+
01 POS
1
⭐⭐⭐ Marco de referencia
⭐⭐⭐⭐⭐
02 Core
12
⭐⭐ Solo 3–4 usables ahora
⭐⭐⭐⭐⭐
03 Orchestration
7
⭐⭐ Solo 2 urgentes
⭐⭐⭐⭐⭐
04 formatos
10
⭐⭐⭐⭐ Muy útiles ya
⭐⭐⭐⭐⭐
05 seguridad/Calidad
7+1
⭐⭐⭐ 2 críticos ya
⭐⭐⭐⭐⭐
06 Memory/Personality
12+1
⭐ Prematuros ahora
⭐⭐⭐⭐⭐

📁 01 — Prompt Operating System (POS)
Evaluación general
El documento es más un manifiesto arquitectónico que un prompt ejecutable. Define la meta de tener un sistema organizado por: objetivo, contexto, rol, entradas, formato de salida, modelo recomendado, nivel de criticidad y métricas de calidad.
¿Sirve ahora?
Sí, como marco de referencia, pero no es un prompt funcional. Lo que describe es exactamente la infraestructura que la biblioteca debería tener y que actualmente no tiene implementada en sus prompts individuales. Ninguno de los prompts de las otras carpetas incluye: model_recommended, temperature, version, quality_score ni author.
Problemas de construcción
❌ Es un documento de intención, no un prompt deployable.
❌ La biblioteca no sigue el estándar que el POS describe. Hay una brecha entre el framework declarado y los prompts reales.
❌ Falta el campo más importante para el proyecto actual: el contexto de activación (¿cuándo se usa este prompt? ¿qué lo dispara?).
Recomendación
Usarlo como checklist para re-formatear los prompts que sí vayas a implementar. Antes de conectar cualquier prompt al sistema, añadir: versión, modelo, temperatura, inputs esperados y outputs esperados.

📁 02 — Core (12 prompts)
Estos son los prompts "motor" del producto. Son conceptualmente los más importantes del sistema.
Análisis prompt por prompt
#
Prompt
Calidad Técnica
¿Usable ahora?
Observaciones
1
Análisis Prepartido
⭐⭐⭐⭐
✅ Sí
El más completo. Bien estructurado, lógico, cubre contexto táctico, emocional y de riesgo. Listo para conectar a Gemini.
2
Predicción Probabilística
⭐⭐⭐⭐
✅ Sí
Buena estructura. Advertencia: menciona xG como variable obligatoria pero el proyecto no tiene fuente de datos xG integrada. Riesgo de alucinación alta.
3
Análisis Táctico
⭐⭐⭐
⚠️ Parcial
Depende de datos tácticos en tiempo real que no existen en el stack actual.
4
Lectura Emocional de la Afición
⭐⭐⭐⭐
✅ Sí
Muy relevante para el core del producto. Bien diseñado. No necesita datos externos si se alimenta del contexto del partido.
5
Generación de Campañas
⭐⭐⭐⭐
✅ Sí
El más crítico para el lanzamiento. Es el prompt que debería estar conectado a Gemini hoy. Bien construido, outputs claros. Necesita adaptación a barrios de Medellín.
6
Scoring de Engagement
⭐⭐⭐
⚠️ Parcial
Útil pero el "volumen social" y "tendencia de búsqueda" requieren APIs externas que no están en el stack.
7
Detección de Tendencias
⭐⭐⭐
❌ No aún
Requiere ingesta de datos en tiempo real de redes sociales. Infraestructura no lista.
8
Segmentación de Fans
⭐⭐⭐⭐
⚠️ Parcial
Excelente para v2 cuando haya historial de usuarios. Hoy no hay datos de comportamiento real.
9
Resumen de Partido
⭐⭐⭐
✅ Sí
Simple y útil. Buena opción para conectar ahora mismo.
10
Análisis de Cuotas
⭐⭐⭐
⚠️ Parcial
Requiere integración con bookmakers. No está en el stack.
11
Detección de Valor
⭐⭐⭐
❌ No aún
Muy especializado en betting. Interesante pero fuera del scope del MVP actual.
12
Generación de Narrativa Deportiva
⭐⭐⭐⭐
✅ Sí
Complementa perfectamente la Generación de Campañas. Bueno para el tono narrativo del negocio.
Problemas generales de construcción en los prompts Core
⚠️ Ausencia total de variables de entrada (inputs). Todos dicen "analiza" o "evalúa" pero no especifican el formato de los datos que recibirán (¿JSON? ¿texto libre? ¿qué campos?). Esto es un problema grave para conectarlos a n8n/Gemini.
⚠️ No hay manejo de errores ni de datos faltantes. Si llega un partido sin xG o sin datos recientes, ¿qué hace el prompt? Nada está especificado.
⚠️ El contexto de Medellín/Colombia está ausente. Ninguno menciona el dialecto paisa, los equipos locales (Nacional, Medellín), ni el tono de barrio que es el diferenciador del producto.
Prompts Core recomendados para implementar AHORA
Prompt 5 — Generación de Campañas (con adaptación a barrios)
Prompt 1 — Análisis Prepartido (alimentado con datos de sports_events)
Prompt 4 — Lectura Emocional (para tono de campaña)
Prompt 12 — Narrativa Deportiva (complemento del 5)

📁 03 — Orchestration (7 prompts)
Estos son los prompts que definen la "inteligencia de pipeline". Son muy avanzados para el estado actual.
Análisis por prompt
#
Prompt
Calidad Técnica
¿Usable ahora?
Observaciones
1
Orquestador Central del Pipeline
⭐⭐⭐⭐⭐
✅ Urgente
El mejor construido de toda la biblioteca. Tiene SYSTEM ROLE, reglas claras, OUTPUT JSON definido. Debería ser la base del workflow en n8n.
2
Generador Creativo (Copywriter)
⭐⭐⭐⭐
✅ Sí
Complementa al Orquestador. Buen enfoque.
3
Auditor Lógico de Negocio
⭐⭐⭐⭐
✅ Sí
Muy útil para evitar que salga contenido incoherente. Crítico antes de publicar.
4
Detector de Placeholders
⭐⭐⭐⭐
✅ Urgente
Crítico. El problema más obvio en demos es que quedan {{variables}} sin reemplazar en el copy final. Este prompt ataca ese problema directamente.
5
Moderador de Safety y Hinchadas
⭐⭐⭐⭐⭐
✅ Urgente
El más relevante para el lanzamiento. Muy bien construido. Específico para cultura futbolera colombiana. Output JSON claro. Este debe implementarse antes del lanzamiento.
6
Decisor Final de Publicación
⭐⭐⭐⭐⭐
✅ Urgente
Excelente. Toma todos los resultados y decide aprobar/revisar/rechazar. Pipeline de publicación sólido.
7
Formateador JSON para APIs
⭐⭐⭐⭐
✅ Sí
Necesario para la integración con n8n y Supabase.
Observaciones generales
La carpeta de Orquestación es la más madura técnicamente de toda la biblioteca.
Los prompts 1, 5 y 6 tienen OUTPUT JSON bien definido, lo que los hace directamente integrables con n8n.
El prompt del Moderador de Safety (05) es el único de toda la biblioteca que menciona explícitamente el contexto colombiano ("barras", "cultura futbolera colombiana"). Es el más contextualizado al producto real.
⚠️ Advertencia importante
Implementar el pipeline de orquestación completo (7 prompts en cadena) en n8n multiplica por 7 las llamadas a la API de IA, lo cual tiene implicaciones serias de:
Costo: Múltiples llamadas por evento en tiempo real.
Latencia: El tiempo de respuesta del sistema puede superar los 30–60 segundos.
Complejidad: Para el MVP, una cadena de 3 pasos (generar → safety → publicar) podría ser suficiente.

📁 04 — Formatos (10 prompts)
Esta carpeta es la más pragmática e inmediatamente útil para el stack actual del proyecto.
Análisis
Prompt
Calidad
¿Útil ahora?
Notas
4.1 — JSON Estricto
⭐⭐⭐⭐⭐
✅ Crítico
Esencial para toda salida de IA hacia n8n/Supabase
4.2 — JSON para n8n
⭐⭐⭐⭐⭐
✅ Crítico
Específico para el stack que usa el proyecto
4.3 — Webhook Compatible
⭐⭐⭐⭐
✅ Sí
Útil para los workflows de n8n
4.4 — Schema Supabase
⭐⭐⭐⭐
✅ Sí
Muy útil para diseñar tablas nuevas en Supabase
4.5 — INSERT para Supabase
⭐⭐⭐⭐
✅ Sí
Directamente aplicable al proyecto
4.6 — Tabla Ejecutiva
⭐⭐⭐
⚠️ Parcial
Útil para reportes del dashboard
4.7 — Matriz de Decisión
⭐⭐⭐
⚠️ Parcial
Útil en v2 para decisiones de campaña
4.8 — Respuesta para API
⭐⭐⭐⭐
✅ Sí
Estandariza respuestas de la IA hacia el frontend
4.9 — Formato para Agentes IA
⭐⭐⭐⭐⭐
✅ Urgente
Output estándar multiagente. Crítico para arquitectura escalable
4.10 — FanFest AI Standard Output
⭐⭐⭐⭐⭐
✅ Urgente
Si existe un formato estándar de salida para FanFest AI, este es el punto de partida
Observación crítica
Esta carpeta resuelve uno de los problemas más comunes y costosos del proyecto actual: que los outputs de Gemini llegan en formato libre (markdown, texto) y deben ser parseados manualmente o con lógica adicional en n8n. Los prompts 4.1, 4.2, 4.9 y 4.10 deberían ser incorporados como sufijos estándar en todos los prompts Core que generen salidas hacia el pipeline.

📁 05 — Seguridad y Calidad (7 prompts + 1 doc de orden)
Esta carpeta tiene el mayor valor estratégico a mediano plazo. Para el lanzamiento, dos son críticos.
Análisis
Prompt
Calidad
¿Urgente ahora?
Notas
01 — Detector de Alucinaciones
⭐⭐⭐⭐⭐
✅ Urgente
Output JSON perfecto. Detecta el problema #1 de IA en producción.
02 — Verificador de Fuentes
⭐⭐⭐⭐
⚠️ Parcial
Útil, pero implica que se indiquen las fuentes en el input.
03 — Auditor de Coherencia
⭐⭐⭐⭐
✅ Sí
Detecta contradicciones internas en el contenido generado.
04 — Scoring de Confianza
⭐⭐⭐⭐
✅ Sí
Añade un nivel de confianza cuantificado a las predicciones.
05 — Clasificador de Riesgo
⭐⭐⭐⭐
✅ Sí
Complemento del Moderador de Safety de la carpeta 03.
06 — Verificador de Predicciones
⭐⭐⭐
⚠️ Parcial
Requiere datos históricos para contrastar.
07 — Auditor Maestro de Calidad
⭐⭐⭐⭐⭐
✅ Urgente
El más importante de la carpeta. 5 dimensiones, Output JSON claro. Puede ejecutarse al final de cualquier workflow.
El pipeline sugerido en el doc de orden es correcto
Generación IA → Detector Alucinaciones → Verificador Fuentes → 
Auditor Coherencia → Scoring Confianza → Clasificador Riesgo → 
Auditor Maestro → Publicación
Sin embargo, ejecutar todo esto por cada evento en tiempo real es demasiado costoso para el MVP. La versión mínima viable de seguridad sería:
Generación IA → Detector Alucinaciones → Auditor Maestro → Publicación

📁 06 — Memory & Personality (12 prompts + 1 doc)
Esta es la carpeta más prematura para el estado actual del proyecto. Está diseñada para cuando FanFest AI tenga:
Historial de interacciones por usuario
Perfiles de fan almacenados en DB
Motor de personalización activo
Agentes con contexto persistente
Nada de eso existe aún en el stack.
¿Hay algo útil ahora?
Prompt
¿Aplicable ahora?
Por qué
01 — Personalidad Base
⚠️ Solo para system prompt
Define el carácter de FanFest AI. Se puede usar como system prompt global en Gemini.
07 — Personalidad de Marca
✅ Parcialmente
Útil para definir el tono del negocio cliente (ej: El Templo Bar). Podría integrarse al onboarding.
12 — Orquestador de Personalidad Global
❌ Prematuro
Requiere perfil de usuario, estado emocional, historial. Nada de esto existe.
Resto (02-06, 08-11)
❌ Prematuros
Todos requieren datos de usuario que no están en el DB actual.
Observación estratégica
El documento "Resultado esperado" lo dice bien: "Esta carpeta será una de las más valiosas cuando FanFest AI evolucione de un sistema de análisis a una plataforma de experiencia personalizada." Eso no es hoy. No conviene implementarlos prematuramente porque introducen complejidad sin retorno inmediato.

🔍 Diagnóstico General de Calidad de Construcción
Fortalezas generales de la biblioteca
✅ Conceptualmente bien diseñada. La taxonomía (Core → Orquestación → Formatos → Seguridad → Personalidad) es correcta y escalable.
✅ Los prompts de Orquestación son los mejor construidos (tienen SYSTEM ROLE, INPUT y OUTPUT JSON definidos).
✅ El Moderador de Safety es el más específico al contexto colombiano. Es una ventaja competitiva real.
✅ La carpeta de Formatos resuelve problemas reales y concretos del stack actual.
Debilidades generales
❌ No hay inputs definidos en la mayoría. Los prompts Core dicen "analiza" pero no especifican el formato de datos que recibirán. Esto hace que sean difíciles de conectar directamente a n8n/Supabase.
❌ Ausencia de versionado. Ningún prompt tiene v1/v2, fecha, autor, ni historial de cambios. El POS lo recomienda, pero no se implementó.
❌ Contexto de Colombia es escaso. Solo el Moderador de Safety menciona el contexto local. Los prompts Core deberían tener: equipos locales, barrios de Medellín, jerga paisa, redes usadas en Colombia (WhatsApp Business, Instagram).
❌ Temperatura y modelo recomendado ausentes. Prompts creativos (campañas, narrativa) necesitan temperatura alta (0.8–1.0); prompts de auditoría necesitan temperatura baja (0.1–0.2). No está especificado en ninguno.
❌ Ejemplos de outputs ausentes. Los mejores prompts incluyen un ejemplo de output esperado. Solo los de Orquestación tienen OUTPUT JSON parcialmente definido.
❌ No hay manejo de casos edge (¿qué pasa si faltan datos? ¿si el partido se suspende? ¿si no hay información reciente del equipo?).

🚦 Roadmap de Implementación Recomendado
🔴 ANTES DEL LANZAMIENTO — Implementar ya
Estos no bloquean el lanzamiento, pero elevan significativamente la calidad del MVP:
04-01 JSON Estricto + 04-02 JSON para n8n → Como sufijos estándar en todos los prompts
03-05 Moderador de Safety → Antes de cualquier publicación automática
03-06 Decisor Final de Publicación → Gate de seguridad del pipeline
05-01 Detector de Alucinaciones → Evitar vergüenzas en producción
05-07 Auditor Maestro → Control de calidad final
🟡 POST-LANZAMIENTO INMEDIATO (v1.1) — Primeras semanas
Cuando haya datos reales y la IA esté conectada:
02-01 Análisis Prepartido → Adaptar con contexto de Colombia/Medellín
02-05 Generación de Campañas → El core del producto, adaptar con barrios y negocios
02-04 Lectura Emocional → Para calibrar el tono de las campañas
02-12 Narrativa Deportiva → Complemento del generador de campañas
03-01 Orquestador Central → Organizar el pipeline de n8n
🟢 MEDIANO PLAZO (v2) — Cuando haya usuarios reales
02-08 Segmentación de Fans → Con historial real de usuarios
02-06 Scoring de Engagement → Con datos de interacción real
06-01 Personalidad Base + 06-07 Personalidad de Marca → Onboarding de negocios
05 (completo) → Pipeline de calidad completo
⚫ LARGO PLAZO (v3+) — Plataforma madura
06 Memory/Personality completo → Personalización por fan
02-07 Detección de Tendencias → Requiere ingesta de redes sociales
02-10 Análisis de Cuotas + 02-11 Detección de Valor → Módulo de apuestas

⚠️ Impacto de Adoptar Nuevos Prompts en el Proyecto
Cambios que SÍ traen impacto significativo
Cambio
Impacto
Implementar pipeline de Orquestación completo (7 prompts en cadena)
🔴 Alto — Multiplica costos de API, añade latencia, require refactor de n8n
Incorporar prompts de Personalidad sin la infraestructura de BD de usuarios
🔴 Alto — Crea falsa ilusión de personalización sin datos reales
Añadir Detección de Valor/Cuotas sin integración a bookmakers
🔴 Alto — Genera outputs de betting inventados, riesgo legal y reputacional
Añadir los prompts de Formato (4.1, 4.2, 4.9)
🟡 Medio — Requiere ajustar los nodos de n8n que parsean las respuestas
Añadir Moderador de Safety + Decisor Final
🟢 Bajo-positivo — Solo añade 2 pasos al pipeline, reduce riesgo de publicación
Adaptar el contexto colombiano en los prompts Core
🟢 Bajo-positivo — Mejora la calidad sin cambios en infraestructura
El cambio de mayor retorno inmediato
Adaptar el Prompt 5 (Generación de Campañas) con contexto local colombiano y conectarlo a Gemini. Este es el corazón del producto y actualmente está mock. Con ese prompt adaptado, el botón "Regenerar con Gemini" pasaría de simulado a real, que es probablemente la demo más importante para el lanzamiento.

💡 Consideraciones Finales
La biblioteca existe antes que la infraestructura. Los prompts están pensados para un sistema que aún no existe del todo. No hay que implementarlos todos: hay que elegir los 5–7 que se alinean con lo que ya está construido.
El mayor riesgo es implementar sin contexto local. Si se conectan prompts genéricos sin adaptar al contexto de Medellín, los negocios de Laureles o el Poblado recibirán contenido que podría sonar extraño o fuera de contexto.
Los prompts de Orquestación son los listos para producción, irónicamente. Son los mejor construidos técnicamente (tienen OUTPUT JSON, SYSTEM ROLE, reglas claras). Los prompts Core son más "conceptuales" y necesitan más trabajo antes de deployarse.
El Moderador de Safety es un activo único. El hecho de que mencione explícitamente barras, cultura futbolera colombiana y contenido ofensivo es una ventaja diferencial real. Ese nivel de especificidad no existe en herramientas genéricas de moderación.
La biblioteca necesita evolucionar junto con el producto. No es un sistema fijo. A medida que el proyecto consiga datos reales (usuarios, engagement, barrios), los prompts deberían actualizarse con esos contextos. El versionado que el POS recomienda, pero nadie implementó es urgente.
