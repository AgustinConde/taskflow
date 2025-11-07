# TaskFlow AI Assistant

<details>
<summary>English version</summary>

---

# TaskFlow AI Assistant (English)

## Overview

TaskFlow ships with an embedded AI assistant focused on task management. The backend now targets the [Hugging Face router](https://huggingface.co/inference-api) by default; Ollama remains available only as an offline fallback for edge cases.

## Main Features

- 💬 Modern chat UI with conversation history
- 🔒 Strict task-management scope enforced by a shared system prompt
- 🎯 Personalized responses that incorporate your tasks, categories, and achievements
- 🌐 Automatic language detection (Spanish or English)
- 🔐 JWT-protected API; no conversation persistence
- ⚙️ Cloud-first provider (Hugging Face router) with optional Ollama fallback

## Requirements

### Hugging Face (Default)

1. Create or use an existing Hugging Face account.
2. Generate a **Write** access token from https://huggingface.co/settings/tokens.
3. Pick a text-generation model that is available to your token (the router exposes a catalog at `GET https://router.huggingface.co/v1/models`; the defaults below use `HuggingFaceTB/SmolLM3-3B`).
4. (Optional) Upgrade the workspace if you need higher rate limits or private models.

### Fallback: Ollama (Local, optional)

Only configure [Ollama](https://ollama.com) if you need to run completely offline or keep all inference on the workstation (`ollama pull llama3.2:latest`). Switch providers by setting `AI__PROVIDER=ollama` when Hugging Face is not an option.

## Configuration

### Backend (.NET)

The assistant reads strongly-typed options from the `AI` configuration section. Add the following to your environment-specific settings (or populate the corresponding environment variables):

```json
{
	"AI": {
		"Provider": "huggingface",
		"ApiKey": "hf_your_write_token",
		"Model": "HuggingFaceTB/SmolLM3-3B",
		"BaseUrl": "https://router.huggingface.co",
		"TimeoutSeconds": 90
	}
}
```

Environment variable overrides are also supported:

- `AI__PROVIDER`
- `AI__APIKEY` (or legacy `HUGGINGFACE_API_KEY`)
- `AI__MODEL`
- `AI__BASEURL`
- `AI__TIMEOUTSECONDS`

The dependency injection container automatically selects the correct provider:

- `huggingface` → `HuggingFaceProvider`
- `ollama` → `OllamaProvider` (use only when Hugging Face is unavailable)
- anything else → defaults back to Hugging Face

### Frontend (.env)

No changes are required for the frontend, but the status banner surfaces when the provider is offline or misconfigured so users know to verify credentials.

## Usage

1. Log in to TaskFlow.
2. Open the purple floating action button at the bottom-right corner.
3. The header chip shows `Online` when the provider responds to health checks.
4. Ask for task-planning advice, prioritization tips, or category suggestions. The assistant will decline unrelated topics.

## Customization

- **System Prompt**: update `SYSTEM_PROMPT` in `TaskFlow.Api/Services/AIAssistantService.cs`.
- **Prompt Formatting**: adjust `AiPromptBuilder` if you want to change how tasks/categories are injected.
- **Generation Parameters**: tweak `MaxNewTokens`, `Temperature`, and `TopP` inside `TaskFlow.Api/Services/HuggingFaceProvider.cs`.
- **Provider Swap**: keep `AI__PROVIDER=huggingface` for production; switch to `ollama` only for offline demos or emergency fallback.

## Troubleshooting

| Symptom | Checks |
| --- | --- |
| `AI Assistant is not available` banner | Ensure `AI__APIKEY` is set, the selected model exists, and your Hugging Face account has quota. If you intentionally switched to Ollama, confirm the daemon is running and the model is downloaded. |
| 401 Unauthorized responses | Regenerate the Hugging Face token and make sure it has **Write** permissions. |
| 429 Too Many Requests | Upgrade your Hugging Face plan or slow down request frequency. |
| Slow first response | Hugging Face may need to spin up the model; retry after a few seconds. For Ollama, the model loads into memory the first time. |

## Security & Privacy

- No conversation data is persisted in the database.
- Requests are only sent to the configured provider (Hugging Face router by default, or Ollama when explicitly selected).
- API access requires a valid JWT.
- Only curated task/category summaries are shared with the provider.

## References

- [Hugging Face Inference API](https://huggingface.co/inference-api)
- [Ollama Documentation](https://github.com/ollama/ollama)

</details>

---

# TaskFlow AI Assistant (Español)

## Descripción

TaskFlow incluye un asistente de IA enfocado en la gestión de tareas. El backend ahora apunta al router de [Hugging Face](https://huggingface.co/inference-api) como opción principal; Ollama queda reservado como alternativa local para escenarios sin conexión.

## Características Principales

- 💬 Interfaz de chat moderna con historial
- 🔒 Ámbito restringido a temas de productividad y organización
- 🎯 Respuestas personalizadas con tus tareas, categorías y logros
- 🌐 Detección automática de idioma (español o inglés)
- 🔐 API protegida con JWT; no se guardan las conversaciones
- ⚙️ Proveedor principal en la nube (router de Hugging Face) con fallback opcional en Ollama

## Requisitos

### Hugging Face (Modo predeterminado)

1. Crea o usa una cuenta existente en Hugging Face.
2. Genera un token con permiso **Write** desde https://huggingface.co/settings/tokens.
3. Elegí un modelo de texto disponible para tu token (consultá `GET https://router.huggingface.co/v1/models`; el valor por defecto usa `HuggingFaceTB/SmolLM3-3B`).
4. (Opcional) Mejora tu plan si necesitas más capacidad o modelos privados.

### Fallback: Ollama (local, opcional)

Configurá [Ollama](https://ollama.com) solo si necesitás ejecutar completamente sin conexión o mantener la inferencia en tu equipo (`ollama pull llama3.2:latest`). Cambiá el proveedor con `AI__PROVIDER=ollama` únicamente cuando Hugging Face no sea viable.

## Configuración

### Backend (.NET)

El asistente lee las opciones desde la sección `AI` de configuración. Agrega lo siguiente a tus settings o variables de entorno:

```json
{
	"AI": {
		"Provider": "huggingface",
		"ApiKey": "hf_tu_token",
		"Model": "HuggingFaceTB/SmolLM3-3B",
		"BaseUrl": "https://router.huggingface.co",
		"TimeoutSeconds": 90
	}
}
```

Variables de entorno soportadas:

- `AI__PROVIDER`
- `AI__APIKEY` (o el legado `HUGGINGFACE_API_KEY`)
- `AI__MODEL`
- `AI__BASEURL`
- `AI__TIMEOUTSECONDS`

El contenedor de dependencias elige el proveedor automáticamente:

- `huggingface` → `HuggingFaceProvider`
- `ollama` → `OllamaProvider` (usar solo cuando Hugging Face no esté disponible)
- cualquier otro valor → vuelve a Hugging Face por omisión

### Frontend (.env)

No se requieren cambios. El indicador de estado mostrará cuando el proveedor no esté disponible para que los usuarios revisen las credenciales.

## Uso

1. Inicia sesión en TaskFlow.
2. Abre el botón flotante morado en la esquina inferior derecha.
3. El chip en el encabezado mostrará `En línea` cuando el proveedor responda correctamente.
4. Pide sugerencias sobre tus tareas, organización del día o prioridades. El asistente rechazará temas ajenos.

## Personalización

- **System Prompt**: modifica `SYSTEM_PROMPT` en `TaskFlow.Api/Services/AIAssistantService.cs`.
- **Formato del contexto**: ajusta `AiPromptBuilder` para cambiar cómo se envían las tareas/categorías.
- **Parámetros de generación**: modifica `MaxNewTokens`, `Temperature` y `TopP` en `TaskFlow.Api/Services/HuggingFaceProvider.cs`.
- **Cambiar proveedor**: mantené `AI__PROVIDER=huggingface` en entornos normales; elegí `ollama` solo para demos offline o contingencia.

## Resolución de Problemas

| Síntoma | Verificaciones |
| --- | --- |
| Mensaje "El asistente de IA no está disponible" | Asegúrate de definir `AI__APIKEY`, que el modelo exista y que tu cuenta tenga cuota. Si decidiste usar Ollama, confirmá que el servicio esté activo y que el modelo se descargó. |
| Respuesta 401 Unauthorized | Regenera el token de Hugging Face y comprueba que tenga permisos **Write**. |
| Respuesta 429 Too Many Requests | Incrementa tu plan en Hugging Face o reduce la frecuencia de llamadas. |
| Primera respuesta lenta | Hugging Face puede demorar en activar el modelo; vuelve a intentar. En Ollama, el modelo se carga en memoria la primera vez. |

## Seguridad y Privacidad

- No se persisten conversaciones en la base de datos.
- Las solicitudes solo se envían al proveedor configurado (router de Hugging Face por defecto u Ollama si lo seleccionás explícitamente).
- El acceso requiere un JWT válido.
- Solo se comparten resúmenes de tareas y categorías necesarios para el contexto.

## Referencias

- [Hugging Face Inference API](https://huggingface.co/inference-api)
- [Documentación de Ollama](https://github.com/ollama/ollama)
