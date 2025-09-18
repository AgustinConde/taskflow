
# TaskFlow

<details>
<summary>English version</summary>

---

# TaskFlow (English)
Task management application built with a .NET 8 backend (Entity Framework Core, Dapper, Stored Procedures) and a React, TypeScript, Vite, and Material UI frontend.

## Main Features

- **User Authentication & Authorization**: Registration, login, email confirmation with JWT tokens
- **Task Management**: Full CRUD operations with intuitive and responsive UI
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
   ```

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

## Environment Variables

### Frontend (.env)

- `VITE_ROOT_URL` — Backend API URL (e.g., `http://localhost:5149`)

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
- `src/contexts/` — React contexts (Auth, Notifications)
- `src/services/` — API communication services
- `src/config/` — Centralized API configuration and endpoints
- `src/locales/` — Translation files (es/en)
- `src/types/` — TypeScript type definitions

### Backend
- `Controllers/` — API endpoints
- `Services/` — Business logic
- `Models/` — Entity models
- `DTOs/` — Data transfer objects
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

## Usage

1. **Register a new account** or log in with existing credentials
2. **Create categories** to organize your tasks
3. **Add tasks** with titles, descriptions, due dates, and categories
4. **Use the dashboard** to view analytics and progress
5. **Switch themes and languages** from the app navigation
6. **Drag and drop tasks** to reorder them
7. **Use contextual menus** for quick actions on tasks

</details>

# TaskFlow (Español)
Aplicación de gestión de tareas construida con backend en .NET 8 (Entity Framework Core, Dapper, Stored Procedures) y frontend en React, TypeScript, Vite y Material UI.

## Características principales

- **Autenticación y Autorización**: Registro, login, confirmación por email con tokens JWT
- **Gestión de Tareas**: Operaciones CRUD completas con interfaz intuitiva y responsiva
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
   ```

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

## Variables de entorno

### Frontend (.env)

- `VITE_ROOT_URL` — URL de la API del backend (ej., `http://localhost:5149`)

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

## Uso

1. **Registrá una nueva cuenta** o iniciá sesión con credenciales existentes
2. **Creá categorías** para organizar tus tareas
3. **Agregá tareas** con títulos, descripciones, fechas de vencimiento y categorías
4. **Usá el dashboard** para ver analíticas y progreso
5. **Cambiá temas e idiomas** desde la navegación de la app
6. **Arrastrá y soltá tareas** para reordenarlas
7. **Usá menús contextuales** para acciones rápidas en las tareas