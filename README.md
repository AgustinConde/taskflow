
# TaskFlow

**A modern, full-stack task management application built with .NET 9 and React.**

🌐 **Live Application**: [https://taskflow-app.azurewebsites.net](https://taskflow-app.azurewebsites.net)

<details>
<summary>English version</summary>

---

# TaskFlow (English)

**Enterprise-grade task management platform featuring a robust .NET 9 backend (Entity Framework Core, Dapper, Stored Procedures) and a modern React, TypeScript, Vite, and Material UI frontend.**

🌐 **Access the application**: [https://taskflow-app.azurewebsites.net](https://taskflow-app.azurewebsites.net)

## Main Features

- **User Authentication & Authorization**: Registration, login, email confirmation with JWT tokens
- **Task Management**: Full CRUD operations with intuitive and responsive UI
- **Location Support**: Geolocation with Google Maps integration for physical task locations
- **AI Assistant**: Intelligent task companion powered by the Hugging Face router with optional Ollama fallback for offline scenarios
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
- **Backend**: .NET 9 SDK, SQL Server (local or remote)
- **Email Worker**: Azure Functions Core Tools v4 and Azurite (or an Azure Storage account) for the background email queue
- **AI Assistant**: Hugging Face router credentials (Write token); Ollama optional for offline fallback
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

### Email Worker Setup (Azure Functions)

The background email worker consumes queue messages and sends transactional emails.

1. **Install tooling** (one-time):
   - [Azure Functions Core Tools v4](https://learn.microsoft.com/azure/azure-functions/functions-run-local)
   - [Azurite](https://learn.microsoft.com/azure/storage/common/storage-use-azurite) (`npm install -g azurite`) or connect to an Azure Storage account
2. **Start Azurite** for local development:
   ```bash
   npx azurite --silent --location ./azurite --debug ./azurite/azurite.log
   ```
3. **Configure the worker**:
   ```bash
   cd TaskFlow.Functions
   cp local.settings.json.example local.settings.json
   ```
   Update `local.settings.json` with your SQL Server connection string and SMTP credentials. Set `Email__UseSmtp=true` and `Email__AllowSmtpInDevelopment=true` only when you want to send real emails while running locally.
4. **Run the worker**:
   ```bash
   func start
   ```
   The worker listens to the `email-queue` queue and dispatches emails using your SMTP settings.

### AI Assistant Setup

1. **Configure Hugging Face (default provider)**:
   - Create or reuse a Hugging Face account and generate a token with **Write** permission at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens).
   - Update `TaskFlow.Api/appsettings.Local.json` (or environment variables) with:
     ```json
     "AI": {
       "Provider": "huggingface",
       "ApiKey": "hf_your_write_token",
       "Model": "HuggingFaceTB/SmolLM3-3B",
       "BaseUrl": "https://router.huggingface.co"
     }
     ```
   - Optional: test the token with
     ```bash
     curl -H "Authorization: Bearer <token>" https://router.huggingface.co/v1/models
     ```

2. **Optional: Enable Ollama fallback (offline use)**:
   - Install [Ollama](https://ollama.com) if you need a fully local mode (Windows installer or `curl -fsSL https://ollama.com/install.sh | sh`).
   - Pull a compatible model:
     ```bash
     ollama pull llama3.2
     ```
   - Run Ollama (defaults to `http://localhost:11434`) and switch providers with `AI__PROVIDER=ollama` only when Hugging Face is unavailable.

> 💡 **Note**: Without a valid Hugging Face token the assistant appears "Offline". Ollama support is kept solely for intentional offline or air-gapped deployments.

## Environment Variables

The easiest way to switch environments locally is to run the helper script:

```powershell
scripts\use-env.ps1 <profile>
```

Profiles live in `config/environments/*.ps1` (ignored by git — copy the corresponding `*.ps1.example` file and fill in your secret file paths). The script sets process-level variables and copies the config files listed in the profile.

### Frontend (`.env.local` via profile script)

- `VITE_ROOT_URL` — Backend API URL (e.g., `http://localhost:5149`)
- `VITE_GOOGLE_MAPS_API_KEY` — Google Maps API Key for geolocation features (optional but recommended)

### Backend (`appsettings.Local.json` via profile script)

- `ConnectionStrings:DefaultConnection` — SQL Server connection string
- `Smtp:Host` — SMTP server host (e.g., `smtp.gmail.com`)
- `Smtp:Port` — SMTP port (e.g., `587`)
- `Smtp:User` — SMTP username
- `Smtp:Pass` — SMTP password/app password
- `Smtp:From` — From email address
- `Jwt:Key` — JWT secret key (minimum 32 characters)
- `AzureStorage:ConnectionString` — Storage account / Azurite connection string
- `Frontend:Url` — Base URL used for email links

### Email Worker (`TaskFlow.Functions/local.settings.json` via profile script)

- `AzureWebJobsStorage` — Azure Storage connection string for queues (use `UseDevelopmentStorage=true` with Azurite)
- `Email__UseSmtp` — `true` to send real emails instead of dropping them locally
- `Email__AllowSmtpInDevelopment` — enable SMTP while the worker runs in development mode
- The same `Smtp__*` keys as the API — forwarded to the worker when sending mail
- `ConnectionStrings__DefaultConnection` — reused so the worker can access the application database when needed

## Available Scripts

### Frontend
- `npm run dev` — Development server
- `npm run build` — Production build
- `npm run preview` — Preview production build
- `npm run lint` — ESLint
- `npm run test` — Run tests
- `npm run test:coverage` — Test coverage

### Backend
- `dotnet run` — Development server (`ASPNETCORE_ENVIRONMENT` provided by `scripts\use-env.ps1` or launchSettings)
- `dotnet run --launch-profile production` — Local production mode (remembers applied profile variables)
- `dotnet build` — Build project
- `dotnet test` — Run tests
- `dotnet publish -c Release` — Production build

### Deployment Scripts (run from project root)
- `.\copy-frontend-to-wwwroot.ps1` — Build frontend and copy to wwwroot to serve from backend
- `.\verify-deployment.ps1` — Verify deployment configuration (DB, SMTP, JWT, environment variables)

## Production Deployment

### Option 1: Azure App Service (Recommended for Production)

TaskFlow is optimized for deployment to Azure with automated CI/CD via GitHub Actions.

**Prerequisites**:
- Azure subscription (Azure for Students supported)
- Azure SQL Database
- GitHub repository

**Quick Start**:
1. Create Azure SQL Database and App Service (any available region)
2. Configure GitHub Secrets: `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `JWT_KEY`, `DB_CONNECTION_STRING`, `GOOGLE_MAPS_API_KEY`
3. Push to main branch → GitHub Actions deploys automatically
4. **Manually restart App Service** in Azure Portal after first deployment

**Important SMTP Configuration**:
- ⚠️ **Use Gmail App Passwords** - Regular passwords don't work with SMTP
- Go to Google Account → Security → 2-Step Verification → App Passwords
- Generate password specifically for TaskFlow
- If getting "5.7.0 Authentication Required", regenerate the App Password

📚 **Complete Azure deployment guide**: `docs/DEPLOYMENT.md`

---

### Option 2: Integrated Local Deployment (Testing)

Serve frontend and backend together for local testing in production mode.

1. **Build and deploy frontend**:
   ```powershell
   .\copy-frontend-to-wwwroot.ps1
   ```

2. **Prepare the environment profile**:
   - Copy `config/environments/azure.ps1.example` to `config/environments/azure.ps1` (or any name you prefer)
   - Point the `Files` entries to the secret files you keep under `config/secrets/azure/`
   - Run `scripts\use-env.ps1 azure` to copy those files into `TaskFlow.Api/appsettings.Local.json`, `TaskFlow.Functions/local.settings.json`, and `taskflow-frontend/.env.local`

3. **Apply migrations**:
   ```bash
   cd TaskFlow.Api
   dotnet ef database update
   ```

4. **Run in production mode**:
   ```bash
   dotnet run --launch-profile production
   ```

5. **Access**: `http://localhost:5149`

> 💡 **Tip**: Run `scripts\use-env.ps1 <profile>` before launching the API so the right secrets are in place. For hot-reload development, keep separate terminals for `npm run dev` (frontend) and `dotnet run` (backend).

### Option 2: Separate Deployment (Development)

For active development with hot-reload:

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

## Backend (.NET 9 API)

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
- `GET  /api/ai-assistant/status` — Check configured AI provider availability

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

TaskFlow includes an intelligent AI assistant powered by the Hugging Face router (with optional Ollama fallback) that helps you manage your tasks more effectively. The assistant can:

- **Suggest new tasks** based on your current workload and goals
- **Organize existing tasks** by priority, category, or deadline
- **Create completion plans** with step-by-step breakdowns
- **Suggest new categories** to better organize your work

The AI assistant is **context-aware**, meaning it knows about your tasks, categories, and progress. It's also **topic-restricted** to only discuss task management and productivity topics related to TaskFlow.

### Quick Start

1. **Configure Hugging Face** (see AI Assistant Setup above) and, if you need offline mode, start Ollama.
2. **Click the chat icon** in the bottom-right corner of the app
3. **Start chatting** - try asking:
   - "Help me organize my tasks for this week"
   - "What should I work on next?"
   - "Suggest some categories for my tasks"
   - "Create a plan to complete my urgent tasks"

For detailed documentation, see [AI Assistant Documentation](docs/AI_ASSISTANT.md).

</details>

---

# TaskFlow (Español)

**Plataforma profesional de gestión de tareas con un backend robusto en .NET 9 (Entity Framework Core, Dapper, Stored Procedures) y un frontend moderno en React, TypeScript, Vite y Material UI.**

🌐 **Acceder a la aplicación**: [https://taskflow-app.azurewebsites.net](https://taskflow-app.azurewebsites.net)

## Características principales

- **Autenticación y Autorización**: Registro, login, confirmación por email con tokens JWT
- **Gestión de Tareas**: Operaciones CRUD completas con interfaz intuitiva y responsiva
- **Soporte de Ubicación**: Geolocalización opcional con integración de Google Maps para ubicaciones físicas de tareas
- **Asistente de IA**: Compañero inteligente impulsado por el router de Hugging Face, con fallback opcional en Ollama para operar sin conexión
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
- **Backend**: .NET 9 SDK, SQL Server (local o remoto)
- **Worker de emails**: Azure Functions Core Tools v4 y Azurite (o una cuenta de Azure Storage) para la cola de correos
- **Asistente de IA**: Credenciales del router de Hugging Face (token con permiso Write); Ollama opcional como fallback offline
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

### Configuración del worker de emails (Azure Functions)

El worker de segundo plano consume la cola `email-queue` y envía los correos transaccionales.

1. **Instalá las herramientas** (una sola vez):
   - [Azure Functions Core Tools v4](https://learn.microsoft.com/azure/azure-functions/functions-run-local)
   - [Azurite](https://learn.microsoft.com/azure/storage/common/storage-use-azurite) (`npm install -g azurite`) o conectate a una cuenta de Azure Storage
2. **Levantá Azurite** para desarrollo local:
   ```bash
   npx azurite --silent --location ./azurite --debug ./azurite/azurite.log
   ```
3. **Configurá el worker**:
   ```bash
   cd TaskFlow.Functions
   cp local.settings.json.example local.settings.json
   ```
   Completá `local.settings.json` con tu cadena de conexión de SQL Server y credenciales SMTP. Activá `Email__UseSmtp=true` y `Email__AllowSmtpInDevelopment=true` solo cuando quieras enviar correos reales desde tu entorno local.
4. **Ejecutá el worker**:
   ```bash
   func start
   ```
   El worker escuchará la cola `email-queue` y despachará los correos usando tu configuración SMTP.

### Configuración del Asistente de IA

1. **Configurar Hugging Face (proveedor predeterminado)**:
   - Creá o reutilizá una cuenta de Hugging Face y generá un token con permiso **Write** en [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens).
   - Actualizá `TaskFlow.Api/appsettings.Local.json` (o las variables de entorno) con:
     ```json
     "AI": {
       "Provider": "huggingface",
       "ApiKey": "hf_tu_token",
       "Model": "HuggingFaceTB/SmolLM3-3B",
       "BaseUrl": "https://router.huggingface.co"
     }
     ```
   - Opcional: probá el token con
     ```bash
     curl -H "Authorization: Bearer <token>" https://router.huggingface.co/v1/models
     ```

2. **Opcional: habilitar fallback en Ollama (modo sin conexión)**:
   - Instalá [Ollama](https://ollama.com) solo si necesitás operar totalmente offline (instalador para Windows o `curl -fsSL https://ollama.com/install.sh | sh`).
   - Descargá un modelo compatible:
     ```bash
     ollama pull llama3.2
     ```
   - Ejecutá Ollama (por defecto en `http://localhost:11434`) y cambiá el proveedor con `AI__PROVIDER=ollama` únicamente cuando Hugging Face no sea viable.

> 💡 **Nota**: Sin un token válido de Hugging Face el asistente se mostrará "Sin conexión". Ollama queda disponible solo para despliegues offline o aislados.

## Variables de entorno

### Frontend (.env)

- `VITE_ROOT_URL` — URL de la API del backend (ej., `http://localhost:5149`)
- `VITE_GOOGLE_MAPS_API_KEY` — API Key de Google Maps para funcionalidades de geolocalización (opcional pero recomendado)

### Backend (.env)

- `ConnectionStrings__DefaultConnection` — Cadena de conexión de SQL Server
- `Smtp__Host` — Host del servidor SMTP (ej., `smtp.gmail.com`)
- `Smtp__Port` — Puerto SMTP (ej., `587`)
- `Smtp__User` — Usuario SMTP
- `Smtp__Pass` — Contraseña SMTP/contraseña de aplicación (usar App Password de Gmail, no contraseña normal)
- `Smtp__From` — Dirección de email remitente
- `Jwt__Key` — Clave secreta JWT (mínimo 32 caracteres)
- `FRONTEND_URL` — URL del frontend para links de confirmación de email (ej., `http://localhost:5173` en desarrollo)

### Worker de emails (`TaskFlow.Functions/local.settings.json`)

- `AzureWebJobsStorage` — Cadena de conexión de Azure Storage para las colas (usá `UseDevelopmentStorage=true` con Azurite)
- `Email__UseSmtp` — Ponelo en `true` para enviar correos reales en lugar de guardarlos localmente
- `Email__AllowSmtpInDevelopment` — Permite SMTP mientras el worker corre en modo Development
- Las mismas claves `Smtp__*` que la API — reutilizadas por el worker para enviar correos
- `ConnectionStrings__DefaultConnection` — reutilizada si el worker necesita acceder a la base de datos

## Scripts disponibles

### Frontend
- `npm run dev` — Servidor de desarrollo
- `npm run build` — Build de producción
- `npm run preview` — Previsualización del build
- `npm run lint` — ESLint
- `npm run test` — Ejecutar tests
- `npm run test:coverage` — Cobertura de tests

### Backend
- `dotnet run` — Servidor de desarrollo (modo Development)
- `dotnet run --launch-profile production` — Servidor con configuración de producción
- `dotnet build` — Compilar proyecto
- `dotnet test` — Ejecutar tests
- `dotnet publish -c Release` — Build de producción

### Deployment Scripts (desde raíz del proyecto)
- `.\copy-frontend-to-wwwroot.ps1` — Build del frontend y copia a wwwroot para servir desde backend
- `.\verify-deployment.ps1` — Verificar configuración de deployment (DB, SMTP, JWT, variables de entorno)

## Despliegue en producción

### Opción 1: Deployment Integrado (Recomendado para localhost)

Esta opción sirve el frontend directamente desde el backend, ideal para testing local o deployment simple.

1. **Ejecutar el script de deployment**:
   ```powershell
   .\copy-frontend-to-wwwroot.ps1
   ```
   Este script automáticamente:
   - Instala dependencias si es necesario (`npm install`)
   - Compila el frontend para producción (`npm run build`)
   - Copia los archivos compilados a `TaskFlow.Api/wwwroot/`

2. **Verificar la configuración**:
   ```powershell
   .\verify-deployment.ps1
   ```
   Esto verificará:
   - Build del frontend existe
   - Archivos copiados a wwwroot
   - Variables de entorno configuradas (ConnectionString, SMTP, JWT, FRONTEND_URL)
   - Migraciones de base de datos

3. **Configurar variables de entorno** en `TaskFlow.Api/.env`:
   ```env
   ConnectionStrings__DefaultConnection=Server=localhost\SQLEXPRESS;Database=TaskFlowDb;Trusted_Connection=True;TrustServerCertificate=True;
   Smtp__Host=smtp.gmail.com
   Smtp__Port=587
   Smtp__User=tu-email@gmail.com
   Smtp__Pass=tu-app-password  # Usar App Password de Gmail, no contraseña regular
   Smtp__From=tu-email@gmail.com
   Jwt__Key=tu-clave-secreta-de-minimo-32-caracteres
   FRONTEND_URL=http://localhost:5149
   ```
   
   **Importante sobre SMTP**:
   - Para Gmail, necesitás un **App Password**, no tu contraseña regular
   - Generalo en: [Google Account → Security → 2-Step Verification → App passwords](https://myaccount.google.com/apppasswords)
   - La verificación en 2 pasos debe estar activada primero

4. **Aplicar migraciones**:
   ```bash
   cd TaskFlow.Api
   dotnet ef database update
   ```

5. **Iniciar el backend**:
   ```bash
   dotnet run --project TaskFlow.Api/TaskFlow.Api.csproj
   ```

6. **Acceder a la aplicación**: `http://localhost:5149`

El backend servirá tanto la API como el frontend desde el mismo puerto.

> 💡 **Nota**: Para deployment en producción con dominio real, seguir las instrucciones en `docs/DEPLOYMENT.md`.

### Opción 2: Deployment Separado (Desarrollo)

### Opción 2: Deployment Separado (Desarrollo)

Para desarrollo activo con hot-reload:

### Frontend

1. **Build para producción**:
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

## Backend (.NET 9 API)

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