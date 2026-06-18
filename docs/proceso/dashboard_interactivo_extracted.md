# Extracted Content: dashboard_interactivo.docx

¡Listo! El servidor de desarrollo ya está en funcionamiento.
Puedes abrir y probar el dashboard interactivo de FanFest AI ingresando a la siguiente dirección en tu navegador:
👉 http://localhost:3000
¿Qué puedes probar en el dashboard?
Simulación de Gol: Haz clic en el botón "⚽ Simular Gol de Nacional" en el widget del partido en vivo. Verás que el marcador aumenta, el minutero avanza y la IA simula la regeneración del post en tiempo real.
Selector de Barrio: Cambia la ubicación en la configuración del negocio (Laureles, El Poblado, Envigado) y mira cómo se adapta el contenido y el tono del post.
Selector de Tono: Alterna entre "Dialecto Paisa" y "Premium / Neutro" para observar el cambio en la jerga generada.
Publicación Simulada: Haz clic en "🚀 Aprobar y Publicar en Instagram". El botón cambiará de estado para confirmar que el post fue subido exitosamente.
Cuéntame qué te parece el diseño y cómo deseas que sigamos (configuración de Supabase, integración con Gemini para que las respuestas sean reales, etc.).
7:04 p. m.

El servidor se está iniciando nuevamente en segundo plano.
Para entrar a la aplicación y ver la interfaz, solo tienes que:
Abrir tu navegador web favorito (Chrome, Edge, Safari, etc.).
Ir a la siguiente dirección: http://localhost:3000
Ahí podrás interactuar con el Dashboard que acabamos de modificar.
¿Qué puedes probar en la interfaz?
Cambiar la configuración del negocio (Sede/Barrio y Tono/Dialecto).
Hacer clic en el botón "⚽ Simular Gol de Nacional" para ver cómo cambian el minuto y el marcador en vivo.
Hacer clic en el botón "🔄 Regenerar con Gemini" (el que acabamos de conectar). Este debería mostrarte el estado de "Generando..." y luego, en lugar de un texto predeterminado, debería mostrar el copy generado en tiempo real por la Edge Function (si ya configuraste la API Key de Gemini en Supabase, funcionará; si no, probablemente te arroje un error indicando que falta la key o fallará la llamada).
Probar el flujo de "Aprobar y Publicar en Instagram".
Recuerda que para que el botón de Regenerar con Gemini funcione al 100%, debes completar el paso de agregar tu GEMINI_API_KEY en el dashboard de Supabase (Settings -> Edge Functions -> Secrets) y darle a "Deploy" a la función, tal como te dejé en las instrucciones anteriores.
¡Entra a la URL y me cuentas qué tal se ve!
