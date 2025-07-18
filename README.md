
# TaskFlow

<details>
<summary>English version below</summary>

---

# TaskFlow (English)
Task management application built with a .NET 8 backend (Entity Framework Core, Dapper, Stored Procedures) and a React, TypeScript, Vite, and Material UI frontend.

## Main Features

- Task CRUD with intuitive and responsive UI
- Drag & Drop to reorder tasks (hello-pangea/dnd)
- Multilanguage support (i18n: Spanish/English) with react-i18next
- Light/Dark mode
- Robust date handling: local edit/view, UTC storage
- Urgency coloring for due dates
- Quick actions (edit, delete, info) in contextual menu
- Detailed info modal

## Installation & Usage

1. Install dependencies:
  ```bash
  npm install
  ```
2. Start the development server:
  ```bash
  npm run dev
  ```
3. Access the app at [http://localhost:5173](http://localhost:5173) (or the port shown by Vite)

## Available Scripts

- `npm run dev` — Development server
- `npm run build` — Production build
- `npm run preview` — Preview production build
- `npm run lint` — Linter

## Main Structure

- `src/components/TaskList.tsx` — Task list and management
- `src/components/TaskItem.tsx` — Task item, edit, menu, modal
- `src/locales/` — Translation files (es/en)
- `src/i18n.ts` — i18n configuration
- `public/favicon.ico` — Custom favicon

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

### Requirements

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- SQL Server (local or remote)
- (Optional) SQL Server Management Studio (SSMS) to manage the database

### Initial Setup

1. **Configure the connection string**  
  Edit `TaskFlow.Api/appsettings.json` if you need to change the server, user, or database:
  ```json
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=TaskFlowDb;Trusted_Connection=True;TrustServerCertificate=True;"
  }
  ```

2. **Apply migrations and create the database**  
  From the `TaskFlow.Api` folder:
  ```bash
  dotnet ef database update
  ```

3. **Run the API**  
  From the `TaskFlow.Api` folder:
  ```bash
  dotnet run
  ```
  The API will be available at `https://localhost:5001` or the port shown in the console.

### Main Endpoints

- `GET    /api/tasks` — List tasks
- `POST   /api/tasks` — Create task
- `PUT    /api/tasks/{id}` — Edit task
- `DELETE /api/tasks/{id}` — Delete task

> The frontend is configured to consume the API at `http://localhost:5149/api/tasks` by default. If you change the port, update the URL in the frontend.

</details>

# TaskFlow (Español)
Aplicación de gestión de tareas construida con backend en .NET 8 (Entity Framework Core, Dapper, Stored Procedures) y frontend en React, TypeScript, Vite y Material UI.

## Características principales

- CRUD de tareas con interfaz intuitiva y responsiva
- Drag & Drop para ordenar tareas (hello-pangea/dnd)
- Soporte multilenguaje (i18n: Español/Inglés) con react-i18next
- Modo claro/oscuro
- Fechas robustas: edición y visualización local, almacenamiento UTC
- Colores de urgencia para vencimientos
- Acciones rápidas (editar, eliminar, info) en menú contextual
- Modal de información detallada

## Instalación y uso

1. Instalá dependencias:
  ```bash
  npm install
  ```
2. Iniciá el servidor de desarrollo:
  ```bash
  npm run dev
  ```
3. Accede a la app en [http://localhost:5173](http://localhost:5173) (o el puerto que indique Vite)

## Scripts disponibles

- `npm run dev` — Servidor de desarrollo
- `npm run build` — Build de producción
- `npm run preview` — Previsualización del build
- `npm run lint` — Linter

## Estructura principal

- `src/components/TaskList.tsx` — Listado y gestión de tareas
- `src/components/TaskItem.tsx` — Ítem de tarea, edición, menú, modal
- `src/locales/` — Archivos de traducción (es/en)
- `src/i18n.ts` — Configuración de i18n
- `public/favicon.ico` — Favicon personalizado


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

### Requisitos

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- SQL Server (local o remoto)
- (Opcional) SQL Server Management Studio (SSMS) para administrar la base de datos

### Configuración inicial

1. **Configura la cadena de conexión**  
  Edita `TaskFlow.Api/appsettings.json` si necesitas cambiar el servidor, usuario o base de datos:
  ```json
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=TaskFlowDb;Trusted_Connection=True;TrustServerCertificate=True;"
  }
  ```

2. **Aplica las migraciones y crea la base de datos**  
  Desde la carpeta `TaskFlow.Api`:
  ```bash
  dotnet ef database update
  ```

3. **Levanta la API**  
  Desde la carpeta `TaskFlow.Api`:
  ```bash
  dotnet run
  ```
  La API estará disponible en `https://localhost:5001` o el puerto que indique la consola.

### Endpoints principales

- `GET    /api/tasks` — Listar tareas
- `POST   /api/tasks` — Crear tarea
- `PUT    /api/tasks/{id}` — Editar tarea
- `DELETE /api/tasks/{id}` — Eliminar tarea

> El frontend está configurado para consumir la API en `http://localhost:5149/api/tasks` por defecto. Si cambias el puerto, actualiza la URL en el frontend.