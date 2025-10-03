# TaskFlow AI Assistant

<details>
<summary>English version</summary>

---

# TaskFlow AI Assistant (English)

## **AI Assistant System with Ollama**

TaskFlow includes a fully integrated AI assistant that helps users with task management, organization, and productivity.

## **Main Features**

- 💬 **Complete chat** with intuitive and modern interface
- 🔒 **Restricted context** - Only answers questions about task management
- 🎯 **Personalized suggestions** based on your tasks, categories, and achievements
- 🌐 **Multilingual** - Automatically detects and responds in Spanish or English
- 🔐 **Secure** - Requires JWT authentication, doesn't store conversations
- 🏠 **Local and free** - Uses Ollama (no paid APIs needed)
- 📊 **Context-aware** - Analyzes your current tasks to give better advice

## **Requirements**

### **Ollama (Local AI)**

1. **Install Ollama**:
   - **Windows**: Download from [ollama.com](https://ollama.com/download)
   - **macOS**: `brew install ollama`
   - **Linux**: `curl -fsSL https://ollama.com/install.sh | sh`

2. **Download recommended model**:
   ```bash
   ollama pull llama3.2:latest
   ```
   
3. **Verify installation**:
   ```bash
   ollama list
   ```

## **Configuration**

### **Backend (.NET)**

1. **Configure in `appsettings.Development.json`**:
   ```json
   {
     "Ollama": {
       "BaseUrl": "http://localhost:11434",
       "ModelName": "llama3.2:latest"
     }
   }
   ```

2. **Services are already registered** in `Program.cs`:
   ```csharp
   builder.Services.AddHttpClient();
   builder.Services.AddScoped<IAIProvider, OllamaProvider>();
   builder.Services.AddScoped<AIAssistantService>();
   ```

## **Usage**

### **1. Start Ollama**

Before using the assistant, make sure Ollama is running:

```bash
ollama serve
```

**On Windows**: Ollama runs automatically as a service after installation.

### **2. Access the Assistant**

1. Log in to TaskFlow
2. You'll see a **purple floating button** in the bottom-right corner
3. Click to open the chat
4. The "Online/Offline" status indicates if Ollama is available

### **3. Conversation Examples**

#### ✅ **Allowed questions**:

```
User: "Suggest new tasks for this week"
Assistant: "Based on your current tasks, I suggest:
           1. Review important emails
           2. Plan next week's meetings
           3. Update project documentation..."

User: "How can I better organize my tasks?"
Assistant: "I recommend organizing by priority:
           - Urgent and Important: Do it first
           - Important but not urgent: Schedule time..."

User: "Help me create a plan for tomorrow"
Assistant: "Sure! I see you have 5 pending tasks.
           Here's your suggested plan for tomorrow..."
```

#### ❌ **NOT allowed questions**:

```
User: "What's 2+2?"
Assistant: "Sorry, I can only help you with task management in TaskFlow."

User: "Who won the 2022 World Cup?"
Assistant: "That's outside my scope. Ask me about your tasks or productivity."

User: "Write a poem"
Assistant: "I specialize in task organization, not creative writing."
```

## **Assistant Features**

1. **Task Suggestions**:
   - Analyzes your existing tasks
   - Suggests new tasks based on patterns
   - Considers your categories and achievements

2. **Smart Organization**:
   - Tips for prioritizing tasks
   - Categorization suggestions
   - Personalized productivity strategies

3. **Planning**:
   - Helps create daily/weekly plans
   - Distributes tasks in a balanced way
   - Considers due dates

4. **Productivity Analysis**:
   - Identifies patterns in your work
   - Suggests improvements based on your history
   - Motivation based on achievements

## **Customization**

### **Change AI Model**

Edit `appsettings.Development.json`:

```json
{
  "Ollama": {
    "ModelName": "llama3:latest"  // Change here
  }
}
```

### **Adjust Temperature (Creativity)**

In `OllamaProvider.cs`, line ~70:

```csharp
options = new
{
    temperature = 0.7,  // 0.0 = precise, 1.0 = creative
    top_p = 0.9,
    num_predict = 500  // Maximum response tokens
}
```

### **Modify System Prompt**

In `AIAssistantService.cs`, line ~24:

```csharp
private const string SYSTEM_PROMPT = @"You are TaskFlow Assistant...";
```

Customize the instructions to change the assistant's behavior.

## **Troubleshooting**

### **Problem: "AI Assistant is not available"**

**Solutions**:
1. Verify Ollama is running:
   ```bash
   ollama serve
   ```

2. Verify the model is downloaded:
   ```bash
   ollama list
   ```

3. Test the connection manually:
   ```bash
   curl http://localhost:11434/api/tags
   ```

4. Check backend (.NET) logs:
   - Look for errors related to "Ollama"
   - Verify the URL: `http://localhost:11434`

### **Problem: Slow responses**

**Common causes**:
- First execution (Ollama loads model into memory)
- Model too large for your hardware
- Too many tasks in context

**Solutions**:
1. Use a smaller model:
   ```bash
   ollama pull phi3:latest
   ```

2. Reduce context in `AIAssistantService.cs`:
   ```csharp
   .Take(20)  // Number of tasks grabbed by context
   ```

### **Problem: Responses in wrong language**

The assistant automatically detects the user's message language. If it responds in the wrong language, write your next message in the desired language and the assistant will adapt automatically.

### **Problem: Assistant responds about unrelated topics**

If the system prompt isn't working correctly:

1. Verify you're using `llama3.2` or higher (older models may ignore restrictions)
2. Consider adjusting the system prompt to be more strict

## **Security and Privacy**

-  **No persistent storage**: Conversations are not saved in database
-  **Local**: Everything runs on your machine, nothing is sent to the internet
-  **Authentication required**: Only authenticated users can use the assistant
-  **Limited context**: Only task summaries are sent, not complete sensitive data
-  **No tracking**: Conversations are not tracked or analyzed


## **References**

- [Ollama Documentation](https://github.com/ollama/ollama)
- [Llama 3.2 Model Card](https://ollama.com/library/llama3.2)

</details>

---

# TaskFlow AI Assistant (Español)

## **Sistema de Asistente IA con Ollama**

TaskFlow incluye un asistente de IA completamente integrado que ayuda a los usuarios con la gestión de tareas, organización y productividad.

##  **Características Principales**

- 💬 **Chat completo** con interfaz intuitiva y moderna
- 🔒 **Contexto restringido** - Solo responde preguntas sobre gestión de tareas
- 🎯 **Sugerencias personalizadas** basadas en tus tareas, categorías y logros
- 🌐 **Multiidioma** - Detecta y responde en español o inglés automáticamente
- 🔐 **Seguro** - Requiere autenticación JWT, no almacena conversaciones
- 🏠 **Local y gratuito** - Usa Ollama (sin necesidad de APIs de pago)
- 📊 **Consciente del contexto** - Analiza tus tareas actuales para dar mejores consejos

##  **Requisitos**

### **Ollama (Local AI)**

1. **Instalar Ollama**:
   - **Windows**: Descarga desde [ollama.com](https://ollama.com/download)
   - **macOS**: `brew install ollama`
   - **Linux**: `curl -fsSL https://ollama.com/install.sh | sh`

2. **Descargar modelo recomendado**:
   ```bash
   ollama pull llama3.2:latest
   ```
   
3. **Verificar instalación**:
   ```bash
   ollama list
   ```

##  **Configuración**

### **Backend (.NET)**

1. **Configurar en `appsettings.Development.json`**:
   ```json
   {
     "Ollama": {
       "BaseUrl": "http://localhost:11434",
       "ModelName": "llama3.2:latest"
     }
   }
   ```

2. **Los servicios ya están registrados** en `Program.cs`:
   ```csharp
   builder.Services.AddHttpClient();
   builder.Services.AddScoped<IAIProvider, OllamaProvider>();
   builder.Services.AddScoped<AIAssistantService>();
   ```


##  **Uso**

### **1. Iniciar Ollama**

Antes de usar el asistente, asegúrate de que Ollama esté ejecutándose:

```bash
ollama serve
```

**En Windows**: Ollama se ejecuta automáticamente como servicio después de la instalación.

### **2. Acceder al Asistente**

1. Inicia sesión en TaskFlow
2. Verás un **botón flotante morado** en la esquina inferior derecha
3. Click para abrir el chat
4. El estado "Online/Offline" indica si Ollama está disponible

### **3. Ejemplos de Conversación**

#### ✅ **Preguntas permitidas**:

```
Usuario: "Sugiere nuevas tareas para esta semana"
Asistente: "Basándome en tus tareas actuales, te sugiero:
           1. Revisar emails importantes
           2. Planificar reuniones de la próxima semana
           3. Actualizar documentación del proyecto..."

Usuario: "¿Cómo organizo mejor mis tareas?"
Asistente: "Te recomiendo organizar por prioridad:
           - Urgente e Importante: Hazlo primero
           - Importante pero no urgente: Programa tiempo..."

Usuario: "Ayúdame a crear un plan para mañana"
Asistente: "Claro! Veo que tienes 5 tareas pendientes.
           Aquí está tu plan sugerido para mañana..."
```

#### ❌ **Preguntas NO permitidas**:

```
Usuario: "¿Cuánto es 2+2?"
Asistente: "Lo siento, solo puedo ayudarte con la gestión de tareas en TaskFlow."

Usuario: "¿Quién ganó el mundial 2022?"
Asistente: "Eso está fuera de mi ámbito. Pregúntame sobre tus tareas o productividad."

Usuario: "Escribe un poema"
Asistente: "Me especializo en organización de tareas, no en escritura creativa."
```

##  **Funcionalidades del Asistente**

1. **Sugerencia de Tareas**:
   - Analiza tus tareas existentes
   - Sugiere nuevas tareas basadas en patrones
   - Considera tus categorías y logros

2. **Organización Inteligente**:
   - Consejos para priorizar tareas
   - Sugerencias de categorización
   - Estrategias de productividad personalizadas

3. **Planificación**:
   - Ayuda a crear planes diarios/semanales
   - Distribuye tareas de forma equilibrada
   - Considera fechas de vencimiento

4. **Análisis de Productividad**:
   - Identifica patrones en tu trabajo
   - Sugiere mejoras basadas en tu historial
   - Motivación basada en logros

##  **Personalización**

### **Cambiar Modelo de IA**

Edita `appsettings.Development.json`:

```json
{
  "Ollama": {
    "ModelName": "llama3:latest"  // Cambiar aquí
  }
}
```

### **Ajustar Temperatura (Creatividad)**

En `OllamaProvider.cs`, línea ~70:

```csharp
options = new
{
    temperature = 0.7,  // 0.0 = preciso, 1.0 = creativo
    top_p = 0.9,
    num_predict = 500  // Máximo tokens de respuesta
}
```

### **Modificar System Prompt**

En `AIAssistantService.cs`, línea ~24:

```csharp
private const string SYSTEM_PROMPT = @"You are TaskFlow Assistant...";
```

Personaliza las instrucciones para cambiar el comportamiento del asistente.

##  **Troubleshooting**

### **Problema: "AI Assistant is not available"**

**Soluciones**:
1. Verifica que Ollama esté ejecutándose:
   ```bash
   ollama serve
   ```

2. Verifica que el modelo esté descargado:
   ```bash
   ollama list
   ```

3. Prueba la conexión manualmente:
   ```bash
   curl http://localhost:11434/api/tags
   ```

4. Revisa los logs del backend (.NET):
   - Busca errores relacionados con "Ollama"
   - Verifica la URL: `http://localhost:11434`

### **Problema: Respuestas lentas**

**Causas comunes**:
- Primera ejecución (Ollama carga el modelo en memoria)
- Modelo muy grande para tu hardware
- Muchas tareas en contexto

**Soluciones**:
1. Usa un modelo más pequeño:
   ```bash
   ollama pull phi3:latest
   ```

2. Reduce el contexto en `AIAssistantService.cs`:
   ```csharp
   .Take(20)  // Cantidad de tareas que agarra el contexto
   ```

### **Problema: Respuestas en idioma incorrecto**

El asistente detecta automáticamente el idioma del mensaje del usuario. Si responde en el idioma incorrecto, escribe tu siguiente mensaje en el idioma deseado y el asistente se adaptará automáticamente

### **Problema: El asistente responde sobre temas no relacionados**

Si el system prompt no está funcionando correctamente:

1. Verifica que estás usando `llama3.2` o superior (modelos más antiguos pueden ignorar restricciones)
2. Considera ajustar el system prompt para ser más estricto

##  **Seguridad y Privacidad**

-  **Sin almacenamiento persistente**: Las conversaciones no se guardan en base de datos
-  **Local**: Todo corre en tu máquina, no se envía nada a internet
-  **Autenticación requerida**: Solo usuarios autenticados pueden usar el asistente
-  **Contexto limitado**: Solo se envían resúmenes de tareas, no datos sensibles completos
-  **Sin tracking**: No se rastrean ni analizan las conversaciones


##  **Referencias**

- [Ollama Documentation](https://github.com/ollama/ollama)
- [Llama 3.2 Model Card](https://ollama.com/library/llama3.2)

---
