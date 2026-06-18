# Extracted Content: PROMPT 4.3 — WEBHOOK COMPATIBLE.docx

PROMPT 4.3 — WEBHOOK COMPATIBLE
Nombre
WEBHOOK_PAYLOAD
Construye una estructura compatible con recepción de webhook.Formato:{  "event_id": "",  "event_type": "",  "created_at": "",  "data": {}}Reglas:- JSON válido.- Fechas ISO 8601.- Sin texto adicional.- Sin markdown.Devuelve únicamente la estructura.
