
# TaskFlow

<details>
<summary>English version</summary>

---

# TaskFlow (English)
Task management application built with a .NET 8 backend (Entity Framework Core, Dapper, Stored Procedures) and a React, TypeScript, Vite, and Material UI frontend.

## Main Features

- **User Authentication & Authorization**: Registration, login, email confirmation with JWT tokens
- **Task Management**: Full CRUD operations with intuitive and responsive UI
- **Location Support**: Geolocation with Google Maps integration for physical task locations
- **AI Assistant**: Intelligent task companion powered by Ollama for suggestions, organization, and productivity insights
- **Category Management**: Create, edit, and organize tasks by categories
- **Dashboard & Analytics**: Visual metrics and charts for task progress tracking
- **Drag & Drop**: Reorder tasks with hello-pangea/dnd
- **Multilanguage Support**: Spanish/English with react-i18next
- **Light/Dark Mode**: Theme switching with Material UI
- **Date Handling**: Robust local edit/view with UTC storage
- **Visual Indicators**: Color-coded task urgency and status
- **Contextual Actions**: Quick edit, delete, and info options
- **Notifications**: Bottom-left positioned, non-intrusive alerts

## Prerequisites

- **Frontend**: Node.js 18+ and npm
- **Backend**: .NET 8 SDK, SQL Server (local or remote)
- **AI Assistant**: Ollama (optional, for AI-powered features)
- **Optional**: SQL Server Management Studio (SSMS)

## Installation & Setup

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd taskflow-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set:
   ```env
   VITE_ROOT_URL=http://localhost:5149
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```
   
   **Getting Google Maps API Key**:
   1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   2. Create or select a project
   3. Enable these APIs:
      - Maps JavaScript API
      - Places API (New)
   4. Create an API Key and copy it

4. **Start development server**:
   ```bash
   npm run dev
   ```
   Access at [http://localhost:5173](http://localhost:5173)

### Backend Setup

1. **Navigate to API directory**:
   ```bash
   cd TaskFlow.Api
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure your database, SMTP, and JWT settings.

3. **Apply database migrations**:
   ```bash
   dotnet ef database update
   ```

4. **Start the API**:
   ```bash
   dotnet run
   ```
   API available at the port shown in console (typically `https://localhost:5149`)

### Ollama Setup (Optional - For AI Assistant)

1. **Install Ollama**:
   - Windows: Download from [ollama.com](https://ollama.com)
   - Linux/Mac: `curl -fsSL https://ollama.com/install.sh | sh`

2. **Download the AI model**:
   ```bash
   ollama pull llama3.2
   ```

3. **Verify Ollama is running**:
   - Ollama runs automatically on `http://localhost:11434`
   - Test with: `curl http://localhost:11434/api/version`

4. **Use the AI Assistant**:
   - Click the chat button in the bottom-right corner
   - Ask about task organization, suggestions, or productivity tips
   - The AI only responds to TaskFlow-related questions

> 💡 **Note**: The AI Assistant requires Ollama to be running. If Ollama is not installed, the feature will show as "Offline" but the rest of the app works normally.

## Environment Variables

### Frontend (.env)

- `VITE_ROOT_URL` — Backend API URL (e.g., `http://localhost:5149`)
- `VITE_GOOGLE_MAPS_API_KEY` — Google Maps API Key for geolocation features (optional but recommended)

### Backend (.env)

- `ConnectionStrings__DefaultConnection` — SQL Server connection string
- `Smtp__Host` — SMTP server host (e.g., `smtp.gmail.com`)
- `Smtp__Port` — SMTP port (e.g., `587`)
- `Smtp__User` — SMTP username
- `Smtp__Pass` — SMTP password/app password
- `Smtp__From` — From email address
- `Jwt__Key` — JWT secret key (minimum 32 characters)

## Available Scripts

### Frontend
- `npm run dev` — Development server
- `npm run build` — Production build
- `npm run preview` — Preview production build
- `npm run lint` — ESLint
- `npm run test` — Run tests
- `npm run test:coverage` — Test coverage

### Backend
- `dotnet run` — Development server
- `dotnet build` — Build project
- `dotnet test` — Run tests
- `dotnet publish -c Release` — Production build

## Production Deployment

### Frontend

1. **Build for production**:
   ```bash
   npm run build
   ```

2. **Deploy the `dist/` folder** to your static file server (Nginx, Apache, IIS, etc.)

3. **Configure your web server** to serve `index.html` for all routes (SPA routing)

### Backend

1. **Publish the application**:
   ```bash
   dotnet publish -c Release -o ./publish
   ```

2. **Deploy to your server** (IIS, Linux with reverse proxy, etc.)

3. **Configure environment variables** in your production environment

4. **Set up HTTPS** and configure CORS for your frontend domain

## Project Structure

### Frontend
- `src/components/app/` — Main app components and navigation
- `src/components/auth-dialog/` — Authentication forms and dialogs
- `src/components/task-item/` — Task item display and management
- `src/components/task-list/` — Task listing and filtering
- `src/components/category-manager/` — Category CRUD operations
- `src/components/dashboard/` — Analytics and metrics
- `src/components/location/` — Location picker and map display for tasks
- `src/components/ai-assistant/` — AI chat interface and assistant features
- `src/contexts/` — React contexts (Auth, Notifications)
- `src/services/` — API communication services
- `src/config/` — Centralized API configuration and endpoints
- `src/locales/` — Translation files (es/en)
- `src/types/` — TypeScript type definitions

### Backend
- `Controllers/` — API endpoints
- `Services/` — Business logic
  - `Services/AIAssistant/` — AI provider implementations and assistant logic
- `Models/` — Entity models
- `DTOs/` — Data transfer objects
  - `DTOs/AIAssistant/` — AI chat request/response DTOs
- `Migrations/` — Entity Framework migrations

## Key Dependencies

- React, ReactDOM
- TypeScript
- Vite
- Material UI v5
- @hello-pangea/dnd
- react-i18next, i18next
- react-country-flag

---

## Backend (.NET 8 API)

### API Endpoints

#### Authentication
- `POST /api/auth/register` — User registration
- `POST /api/auth/login` — User login
- `POST /api/auth/forgot-password` — Password recovery
- `POST /api/auth/resend-confirmation` — Resend email confirmation
- `GET  /api/auth/me` — Get current user info

#### Tasks
- `GET    /api/tasks` — List user tasks
- `POST   /api/tasks` — Create new task
- `PUT    /api/tasks/{id}` — Update task
- `DELETE /api/tasks/{id}` — Delete task

#### Categories
- `GET    /api/categories` — List user categories
- `POST   /api/categories` — Create new category
- `PUT    /api/categories/{id}` — Update category
- `DELETE /api/categories/{id}` — Delete category

#### AI Assistant
- `POST /api/ai-assistant/chat` — Send message to AI assistant (requires authentication)
- `GET  /api/ai-assistant/status` — Check Ollama availability

## Usage

1. **Register a new account** or log in with existing credentials
2. **Create categories** to organize your tasks
3. **Add tasks** with titles, descriptions, due dates, categories, and locations
4. **Search and select locations** using Google Places autocomplete or GPS location
5. **View task locations** on interactive maps in task details
6. **Use the dashboard** to view analytics and progress
7. **Switch themes and languages** from the app navigation
8. **Drag and drop tasks** to reorder them
9. **Use contextual menus** for quick actions on tasks
10. **Chat with the AI Assistant** for task suggestions, organization tips, and productivity insights

## AI Assistant

TaskFlow includes an intelligent AI assistant powered by Ollama that helps you manage your tasks more effectively. The assistant can:

- **Suggest new tasks** based on your current workload and goals
- **Organize existing tasks** by priority, category, or deadline
- **Create completion plans** with step-by-step breakdowns
- **Suggest new categories** to better organize your work

The AI assistant is **context-aware**, meaning it knows about your tasks, categories, and progress. It's also **topic-restricted** to only discuss task management and productivity topics related to TaskFlow.

### Quick Start

1. **Install Ollama** (see Ollama Setup section above)
2. **Click the chat icon** in the bottom-right corner of the app
3. **Start chatting** - try asking:
   - "Help me organize my tasks for this week"
   - "What should I work on next?"
   - "Suggest some categories for my tasks"
   - "Create a plan to complete my urgent tasks"

For detailed documentation, see [AI Assistant Documentation](docs/AI_ASSISTANT.md).

</details>

# TaskFlow (Español)
Aplicación de gestión de tareas construida con backend en .NET 8 (Entity Framework Core, Dapper, Stored Procedures) y frontend en React, TypeScript, Vite y Material UI.

## Características principales

- **Autenticación y Autorización**: Registro, login, confirmación por email con tokens JWT
- **Gestión de Tareas**: Operaciones CRUD completas con interfaz intuitiva y responsiva
- **Soporte de Ubicación**: Geolocalización opcional con integración de Google Maps para ubicaciones físicas de tareas
- **Asistente de IA**: Compañero inteligente impulsado por Ollama para sugerencias, organización y análisis de productividad
- **Gestión de Categorías**: Crear, editar y organizar tareas por categorías
- **Dashboard y Analíticas**: Métricas visuales y gráficos para seguimiento de progreso
- **Drag & Drop**: Reordenar tareas con hello-pangea/dnd
- **Soporte Multilenguaje**: Español/Inglés con react-i18next
- **Modo Claro/Oscuro**: Cambio de tema con Material UI
- **Manejo de Fechas**: Edición y visualización local robusta con almacenamiento UTC
- **Indicadores Visuales**: Colores para urgencia y estado de tareas
- **Acciones Contextuales**: Opciones rápidas de editar, eliminar e info
- **Notificaciones**: Alertas no intrusivas posicionadas abajo a la izquierda

## Requisitos previos

- **Frontend**: Node.js 18+ y npm
- **Backend**: .NET 8 SDK, SQL Server (local o remoto)
- **Asistente de IA**: Ollama (opcional, para funcionalidades impulsadas por IA)
- **Opcional**: SQL Server Management Studio (SSMS)

## Instalación y configuración

### Configuración del Frontend

1. **Navegar al directorio del frontend**:
   ```bash
   cd taskflow-frontend
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   ```
   Editá `.env` y configurá:
   ```env
   VITE_ROOT_URL=http://localhost:5149
   VITE_GOOGLE_MAPS_API_KEY=tu_clave_api_google_maps_aqui
   ```
   
   **Obtener API Key de Google Maps**:
   1. Andá a [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   2. Creá o seleccioná un proyecto
   3. Habilitá estas APIs:
      - Maps JavaScript API
      - Places API (New)
   4. Creá una API Key y copiala

4. **Iniciar servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   Accede en [http://localhost:5173](http://localhost:5173)

### Configuración del Backend

1. **Navegar al directorio de la API**:
   ```bash
   cd TaskFlow.Api
   ```

2. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   ```
   Editá `.env` y configurá tu base de datos, SMTP y JWT.

3. **Aplicar migraciones de base de datos**:
   ```bash
   dotnet ef database update
   ```

4. **Iniciar la API**:
   ```bash
   dotnet run
   ```
   API disponible en el puerto mostrado en consola (típicamente `https://localhost:5149`)

### Configuración de Ollama (Opcional - Para Asistente de IA)

1. **Instalar Ollama**:
   - Windows: Descargar desde [ollama.com](https://ollama.com)
   - Linux/Mac: `curl -fsSL https://ollama.com/install.sh | sh`

2. **Descargar el modelo de IA**:
   ```bash
   ollama pull llama3.2
   ```

3. **Verificar que Ollama está corriendo**:
   - Ollama se ejecuta automáticamente en `http://localhost:11434`
   - Probá con: `curl http://localhost:11434/api/version`

4. **Usar el Asistente de IA**:
   - Hacé clic en el botón de chat en la esquina inferior derecha
   - Preguntá sobre organización de tareas, sugerencias o tips de productividad
   - La IA solo responde preguntas relacionadas con TaskFlow

> 💡 **Nota**: El Asistente de IA requiere que Ollama esté en ejecución. Si Ollama no está instalado, la función se mostrará como "Sin conexión" pero el resto de la app funciona normalmente.

## Variables de entorno

### Frontend (.env)

- `VITE_ROOT_URL` — URL de la API del backend (ej., `http://localhost:5149`)
- `VITE_GOOGLE_MAPS_API_KEY` — API Key de Google Maps para funcionalidades de geolocalización (opcional pero recomendado)

### Backend (.env)

- `ConnectionStrings__DefaultConnection` — Cadena de conexión de SQL Server
- `Smtp__Host` — Host del servidor SMTP (ej., `smtp.gmail.com`)
- `Smtp__Port` — Puerto SMTP (ej., `587`)
- `Smtp__User` — Usuario SMTP
- `Smtp__Pass` — Contraseña SMTP/contraseña de aplicación
- `Smtp__From` — Dirección de email remitente
- `Jwt__Key` — Clave secreta JWT (mínimo 32 caracteres)

## Scripts disponibles

### Frontend
- `npm run dev` — Servidor de desarrollo
- `npm run build` — Build de producción
- `npm run preview` — Previsualización del build
- `npm run lint` — ESLint
- `npm run test` — Ejecutar tests
- `npm run test:coverage` — Cobertura de tests

### Backend
- `dotnet run` — Servidor de desarrollo
- `dotnet build` — Compilar proyecto
- `dotnet test` — Ejecutar tests
- `dotnet publish -c Release` — Build de producción

## Despliegue en producción

### Frontend

1. **Compilar para producción**:
   ```bash
   npm run build
   ```

2. **Desplegar la carpeta `dist/`** en tu servidor de archivos estáticos (Nginx, Apache, IIS, etc.)

3. **Configurar tu servidor web** para servir `index.html` en todas las rutas (routing SPA)

### Backend

1. **Publicar la aplicación**:
   ```bash
   dotnet publish -c Release -o ./publish
   ```

2. **Desplegar en tu servidor** (IIS, Linux con reverse proxy, etc.)

3. **Configurar variables de entorno** en tu entorno de producción

4. **Configurar HTTPS** y CORS para tu dominio del frontend

## Estructura del proyecto

### Frontend
- `src/components/app/` — Componentes principales de la app y navegación
- `src/components/auth-dialog/` — Formularios y diálogos de autenticación
- `src/components/task-item/` — Visualización y gestión de ítems de tarea
- `src/components/task-list/` — Listado y filtrado de tareas
- `src/components/category-manager/` — Operaciones CRUD de categorías
- `src/components/dashboard/` — Analíticas y métricas
- `src/components/location/` — Selector de ubicación y visualización de mapas para tareas
- `src/components/ai-assistant/` — Interfaz de chat de IA y funciones del asistente
- `src/contexts/` — Contextos de React (Auth, Notificaciones)
- `src/services/` — Servicios de comunicación con API
- `src/config/` — Configuración centralizada de API y endpoints
- `src/locales/` — Archivos de traducción (es/en)
- `src/types/` — Definiciones de tipos TypeScript

### Backend
- `Controllers/` — Endpoints de la API
- `Services/` — Lógica de negocio
- `Models/` — Modelos de entidad
- `DTOs/` — Objetos de transferencia de datos
- `Migrations/` — Migraciones de Entity Framework


## Dependencias clave

- React, ReactDOM
- TypeScript
- Vite
- Material UI v5
- @hello-pangea/dnd
- react-i18next, i18next
- react-country-flag

---

## Backend (.NET 8 API)

### Endpoints de la API

#### Autenticación
- `POST /api/auth/register` — Registro de usuario
- `POST /api/auth/login` — Login de usuario
- `POST /api/auth/forgot-password` — Recuperación de contraseña
- `POST /api/auth/resend-confirmation` — Reenviar confirmación de email
- `GET  /api/auth/me` — Obtener información del usuario actual

#### Tareas
- `GET    /api/tasks` — Listar tareas del usuario
- `POST   /api/tasks` — Crear nueva tarea
- `PUT    /api/tasks/{id}` — Actualizar tarea
- `DELETE /api/tasks/{id}` — Eliminar tarea

#### Categorías
- `GET    /api/categories` — Listar categorías del usuario
- `POST   /api/categories` — Crear nueva categoría
- `PUT    /api/categories/{id}` — Actualizar categoría
- `DELETE /api/categories/{id}` — Eliminar categoría

#### Asistente de IA
- `POST /api/ai-assistant/chat` — Enviar mensaje al asistente de IA (requiere autenticación)
- `GET  /api/ai-assistant/status` — Verificar disponibilidad de Ollama

## Uso

1. **Registrá una nueva cuenta** o iniciá sesión con credenciales existentes
2. **Creá categorías** para organizar tus tareas
3. **Agregá tareas** con títulos, descripciones, fechas de vencimiento, categorías y ubicaciones
4. **Buscá y seleccioná ubicaciones** usando el autocompletado de Google Places o ubicación GPS
5. **Visualizá ubicaciones de tareas** en mapas interactivos en los detalles de la tarea
6. **Usá el dashboard** para ver analíticas y progreso
7. **Cambiá temas e idiomas** desde la navegación de la app
8. **Arrastrá y soltá tareas** para reordenarlas
9. **Usá menús contextuales** para acciones rápidas en las tareas
10. **Chateá con el Asistente de IA** para sugerencias de tareas, tips de organización y análisis de productividad

## Asistente de IA

TaskFlow incluye un asistente de IA inteligente impulsado por Ollama que te ayuda a gestionar tus tareas de manera más efectiva. El asistente puede:

- **Sugerir nuevas tareas** basándose en tu carga de trabajo actual y objetivos
- **Organizar tareas existentes** por prioridad, categoría o fecha límite
- **Crear planes de completitud** con desgloses paso a paso
- **Sugerir nuevas categorías** para organizar mejor tu trabajo

El asistente de IA es **consciente del contexto**, lo que significa que conoce tus tareas, categorías y progreso. También está **restringido por tema** para discutir solo gestión de tareas y temas de productividad relacionados con TaskFlow.

### Inicio Rápido

1. **Instalá Ollama** (ver sección Configuración de Ollama arriba)
2. **Hacé clic en el ícono de chat** en la esquina inferior derecha de la app
3. **Comenzá a chatear** - probá preguntar:
   - "Ayudame a organizar mis tareas para esta semana"
   - "¿En qué debería trabajar ahora?"
   - "Sugerí algunas categorías para mis tareas"
   - "Creá un plan para completar mis tareas urgentes"

Para documentación detallada, ver [Documentación del Asistente de IA](docs/AI_ASSISTANT.md).