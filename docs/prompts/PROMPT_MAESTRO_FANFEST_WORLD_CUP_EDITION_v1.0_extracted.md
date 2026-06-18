# Extracted Content: PROMPT_MAESTRO_FANFEST_WORLD_CUP_EDITION_v1.0.docx

PROMPT_MAESTRO_FANFEST_WORLD_CUP_EDITION_v1.0
El Prompt Maestro está creado y guardado en ambas ubicaciones. Acá te doy el resumen de las decisiones de diseño:

🧠 Decisiones clave de arquitectura que tomé
1. El proceso de razonamiento es interno (Chain of Thought oculto)
Los 5 pasos (clasificar → detectar emoción → detectar oportunidad → generar campaña → evaluar seguridad) ocurren dentro del modelo antes de producir el JSON. Esto hace que el output sea más coherente sin que el usuario vea el "razonamiento sucio".
2. El TIER system resuelve un problema real
Sin un sistema de jerarquía, el modelo trataría igual un partido Colombia vs Brasil que uno Noruega vs Arabia Saudita. El TIER define automáticamente la intensidad de la campaña, el revenue_potential y la complejidad del contenido generado.
3. El n8n_control es el puente directo al pipeline
El campo next_action: "publish | review | reject | retry" es lo que un nodo IF de n8n lee directamente para decidir qué hacer. No necesita lógica adicional en el workflow.
4. La ventana de publicación es parte del output
publish_window_start y publish_window_end permiten que n8n programe la publicación automáticamente para el momento de mayor impacto (la noche anterior al partido), sin intervención humana.
5. Los metadatos de versionado son infraestructura, no decoración
Cuando tengas 20+ prompts activos en producción, el campo "version": "1.0" en cada respuesta de Supabase te permitirá saber exactamente qué versión del prompt generó qué campaña, y hacer rollback si una versión falla.

El archivo está en bibliotecaPrompts listo para usar. El siguiente paso natural sería conectarlo al nodo de Gemini en n8n, pero dijiste que no adelantáramos nada. Cuando quieras damos ese paso.
