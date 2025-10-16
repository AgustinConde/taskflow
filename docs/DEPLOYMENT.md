# TaskFlow Deployment Guide

<details>
<summary>English version</summary>

---

# TaskFlow Deployment Guide (English)

This document provides comprehensive instructions for deploying TaskFlow to production.

## 🚀 Pre-Deployment Checklist

### 1. Build Frontend for Production

Run the PowerShell script to build and copy the frontend to the backend's wwwroot folder:

```powershell
.\copy-frontend-to-wwwroot.ps1
```

This script will:
- ✅ Check if npm is installed
- ✅ Navigate to taskflow-frontend directory
- ✅ Run `npm run build`
- ✅ Clean the TaskFlow.Api/wwwroot directory
- ✅ Copy all files from dist/ to wwwroot/
- ✅ Verify the copy operation

### 2. Configure appsettings.json

The `TaskFlow.Api/appsettings.json` file requires the following values to be configured before deployment:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=TaskFlowDB;User Id=YOUR_USER;Password=YOUR_PASSWORD;TrustServerCertificate=True"
  },
  "Smtp": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "User": "your-email@gmail.com",
    "Pass": "your-app-specific-password",
    "From": "TaskFlow <your-email@gmail.com>"
  },
  "Jwt": {
    "Key": "YOUR-SECURE-256-BIT-SECRET-KEY-HERE-MAKE-IT-LONG-ENOUGH",
    "Issuer": "TaskFlowApi",
    "Audience": "TaskFlowClient",
    "ExpiresInMinutes": 60
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

#### Connection String
- **Format**: SQL Server connection string
- **Example**: `Server=localhost;Database=TaskFlowDB;User Id=sa;Password=YourPassword123;TrustServerCertificate=True`
- **Production**: Replace with your actual database server details

#### SMTP Configuration
For Gmail:
1. Create an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
2. Use the generated password in the `Pass` field

For other providers:
- **Host**: Your SMTP server (e.g., `smtp.sendgrid.net`, `smtp-mail.outlook.com`)
- **Port**: Usually 587 (TLS) or 465 (SSL)
- **User**: Your SMTP username
- **Pass**: Your SMTP password

#### JWT Key
- **Requirement**: Minimum 256 bits (32 characters)
- **Generate**: Use a cryptographically secure random string
- **Example**: 
  ```bash
  # PowerShell
  [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
  
  # Linux/Mac
  openssl rand -base64 32
  ```

### 3. Configure Environment Variables

Set the `FRONTEND_URL` environment variable to point to your production frontend URL:

#### Development
```bash
# .env file or system environment
FRONTEND_URL=http://localhost:5173
```

#### Production
```bash
# Windows
set FRONTEND_URL=https://your-domain.com

# Linux/Mac
export FRONTEND_URL=https://your-domain.com
```

This variable is used by the backend to generate email confirmation and password reset links that point to the correct frontend URL.

### 4. Apply Database Migrations

Before running the application, ensure all migrations are applied:

```bash
cd TaskFlow.Api
dotnet ef database update
```

This will create/update the database schema with all required tables and columns.

### 5. Configure CORS (if needed)

If you're hosting the frontend on a different domain than the backend, update the CORS policy in `Program.cs`:

**Current (Development)**: Allows all origins
```csharp
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
```

**Production**: Restrict to specific origins
```csharp
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("https://your-domain.com")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
```

### 6. Optional: Configure Ollama AI (if using AI Assistant)

If you want to use the AI Assistant feature, configure Ollama in `appsettings.Development.json` or `appsettings.json`:

```json
{
  "Ollama": {
    "BaseUrl": "http://localhost:11434",
    "Model": "llama3.2"
  }
}
```

**Requirements**:
- Install Ollama from https://ollama.ai
- Pull the model: `ollama pull llama3.2`
- Ensure Ollama service is running

**Note**: AI features will be disabled if Ollama is not configured or unavailable.

## 🔧 Deployment Options

### Option 1: Self-Hosted (IIS, Kestrel)

1. Build the backend:
   ```bash
   cd TaskFlow.Api
   dotnet publish -c Release -o ./publish
   ```

2. Copy the publish folder to your server

3. Configure IIS or run with Kestrel:
   ```bash
   cd publish
   dotnet TaskFlow.Api.dll
   ```

### Option 2: Docker

Create a `Dockerfile` in the root directory:

```dockerfile
# Build frontend
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY taskflow-frontend/package*.json ./
RUN npm install
COPY taskflow-frontend/ ./
RUN npm run build

# Build backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /app
COPY TaskFlow.Api/*.csproj ./TaskFlow.Api/
RUN dotnet restore ./TaskFlow.Api/TaskFlow.Api.csproj
COPY TaskFlow.Api/ ./TaskFlow.Api/
RUN dotnet publish ./TaskFlow.Api/TaskFlow.Api.csproj -c Release -o /app/publish

# Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=backend-build /app/publish .
COPY --from=frontend-build /app/frontend/dist ./wwwroot/
ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80
ENTRYPOINT ["dotnet", "TaskFlow.Api.dll"]
```

Build and run:
```bash
docker build -t taskflow .
docker run -p 80:80 -e ConnectionStrings__DefaultConnection="YOUR_CONNECTION_STRING" taskflow
```

### Option 3: Azure App Service (Recommended)

TaskFlow includes automated CI/CD deployment to Azure via GitHub Actions.

#### Prerequisites
- Azure subscription (Azure for Students supported)
- GitHub repository with TaskFlow code

#### Step 1: Create Azure Resources

**SQL Database**:
- Service: Azure SQL Database
- Tier: Basic (sufficient for testing/small production)
- Region: Choose available region (e.g., Canada Central)
- Note firewall rules: Allow Azure services + your IP

**App Service**:
- Runtime: .NET 9
- Plan: Basic B1 or higher
- Same region as database for best performance

#### Step 2: Configure GitHub Secrets

Repository Settings → Secrets and variables → Actions:

| Secret | How to Get | Example |
|--------|-----------|---------|
| `AZUREAPPSERVICE_PUBLISHPROFILE` | Azure Portal → App Service → Get publish profile | (XML) |
| `DB_CONNECTION_STRING` | Azure SQL connection string with credentials | `Server=tcp:...` |
| `SMTP_USER` | Your Gmail address | `you@gmail.com` |
| `SMTP_PASSWORD` | **Gmail App Password** (NOT regular password) | `abcd efgh ijkl mnop` |
| `SMTP_FROM` | Same as SMTP_USER | `you@gmail.com` |
| `JWT_KEY` | Generate: `openssl rand -base64 32` | (32+ chars) |
| `GOOGLE_MAPS_API_KEY` | Google Cloud Console | `AIza...` |

**⚠️ CRITICAL - Gmail App Password Setup**:
```
Regular Gmail passwords WON'T WORK with SMTP!
Error: "5.7.0 Authentication Required"

Solution:
1. Google Account → Security
2. Enable 2-Step Verification
3. Search "App Passwords"
4. Generate for "Mail"
5. Use 16-char code in SMTP_PASSWORD secret
6. If still fails, delete and regenerate App Password
```

#### Step 3: Deploy via GitHub Actions

The `.github/workflows/main_taskflow-app.yml` workflow automatically:
1. Builds frontend with production config
2. Creates `.env.production` from secrets
3. Builds .NET backend
4. Deploys to Azure
5. Attempts restart

**To deploy**:
```bash
git push origin main
```

**After first deploy**:
- Manually restart App Service in Azure Portal
- GitHub Actions restart may not fully apply changes
- Wait 2-3 minutes after restart

#### Step 4: Apply Database Migrations

**Via Azure CLI**:
```bash
az webapp ssh --resource-group your-rg --name your-app
cd site/wwwroot
dotnet TaskFlow.Api.dll ef database update
```

**Or use connection string locally**:
```bash
# In TaskFlow.Api directory
dotnet ef database update --connection "Server=tcp:..."
```

#### Troubleshooting Azure Deployment

**Problem: 500.30 - App failed to start**
- Check Application Settings in Azure Portal contain all secrets
- Verify .NET 9 runtime is selected
- Check logs: Azure Portal → Log Stream

**Problem: Email confirmation returns 409 Conflict**
- SMTP authentication is failing
- Check SMTP_PASSWORD is App Password, not regular password
- Regenerate Gmail App Password
- Verify 2-Step Verification is enabled

**Problem: Blank screen on mobile**
- Service Worker caching issue
- Clear browser cache or use incognito
- Check browser console for errors
- Verify all assets loaded (F12 → Network tab)

## 📋 Post-Deployment Verification

### Feature Checklist

After deployment, verify all features work correctly:

#### ✅ Authentication & Authorization
- [ ] User registration with email confirmation
- [ ] Email confirmation links work (check FRONTEND_URL is correct)
- [ ] Login with valid credentials
- [ ] Password reset request sends email
- [ ] Password reset links work (check FRONTEND_URL is correct)
- [ ] JWT token authentication works
- [ ] Session persistence across page refreshes

#### ✅ Task Management
- [ ] Create new task with all fields (title, description, priority, due date, category, location)
- [ ] View tasks in list view
- [ ] Edit task details
- [ ] Delete task
- [ ] Mark task as complete/incomplete
- [ ] Drag-drop reorder tasks
- [ ] Filter tasks by status, priority, category

#### ✅ Category Management
- [ ] Create new category with color picker
- [ ] Edit category name and color
- [ ] Delete category (check orphaned tasks)
- [ ] View tasks grouped by category

#### ✅ Calendar View
- [ ] View tasks on calendar by due date
- [ ] Navigate between months
- [ ] Click on date to view/add tasks
- [ ] Drag task to different date (updates due date)
- [ ] Tasks appear on correct local date (not UTC shifted)

#### ✅ Dashboard
- [ ] View task completion statistics
- [ ] View category distribution chart
- [ ] View priority breakdown
- [ ] View upcoming tasks

#### ✅ Achievement System
- [ ] Achievements unlock when conditions met
- [ ] Achievement notifications appear with correct translation
- [ ] Achievement progress tracked correctly
- [ ] Streak tracking works (consecutive days)
- [ ] No duplicate achievement events
- [ ] Achievement stats display correctly

#### ✅ AI Assistant (Optional)
- [ ] Open AI assistant panel
- [ ] Send message and receive response
- [ ] AI understands task context
- [ ] AI detects user's language (English/Spanish)
- [ ] Response time < 5 seconds
- [ ] Error handling if Ollama unavailable

#### ✅ Location Services
- [ ] Google Places search works
- [ ] Select location from search results
- [ ] Use current GPS location
- [ ] Clear location button works
- [ ] Map preview displays correctly
- [ ] Tasks with locations shown on map

#### ✅ Internationalization (i18n)
- [ ] Switch language between English/Spanish
- [ ] All UI elements translated correctly
- [ ] Achievement notifications localized
- [ ] Date/time formats correct for locale
- [ ] Language preference persists

#### ✅ Theme & UI
- [ ] Switch between light/dark theme
- [ ] Theme preference persists
- [ ] All components visible in both themes
- [ ] Responsive design works on mobile
- [ ] No layout issues or overlapping elements

#### ✅ PWA Features
- [ ] Install app prompt appears (on supported browsers)
- [ ] App installs successfully
- [ ] Offline functionality works
- [ ] Service worker registers correctly
- [ ] App manifest loads correctly
- [ ] Icons display in installed app

## 🐛 Common Issues

### Issue: User registration returns 409 Conflict (Email sending fails)
**Symptoms**: Users can't register, getting "auth.register.exists" error even with new credentials

**Root Cause**: SMTP authentication failure - backend can't send confirmation emails

**Solutions**:
1. **Verify you're using Gmail App Password** (NOT regular password):
   ```
   Regular password → "5.7.0 Authentication Required" error
   App Password → Works correctly
   ```

2. **Generate Gmail App Password**:
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification (required)
   - Search "App Passwords"
   - Create one for "Mail"
   - Copy 16-character code (e.g., `abcd efgh ijkl mnop`)
   - Use in `SMTP_PASSWORD` secret / `Smtp__Pass` setting

3. **Test locally first**:
   ```bash
   # Set production config locally
   cd TaskFlow.Api
   dotnet run --launch-profile production
   ```
   - Try registering a test user
   - Check console for detailed error logs
   - If you see "5.7.0 Authentication Required", regenerate App Password

4. **Azure specific**: After updating `SMTP_PASSWORD` secret in GitHub:
   - Make a new commit to trigger deployment
   - Manually restart App Service after deployment
   - Wait 2-3 minutes for full restart

### Issue: Email confirmation page shows blank screen (mobile)
**Symptoms**: User clicks email link, page loads infinitely with blank white screen

**Root Cause**: Fetch request timing out or Service Worker blocking

**Solutions**:
1. **Already fixed in code** - Timeout added to fetch:
   ```typescript
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), 15000);
   fetch(url, { signal: controller.signal })
   ```

2. **User workarounds**:
   - Open link in incognito/private mode
   - Clear browser cache and reload
   - Try on desktop browser
   - Copy link and paste in browser manually

3. **Developer fixes if still occurring**:
   - Increment Service Worker cache version in `public/sw.js`
   - Check browser console (F12) for specific errors
   - Verify API responds: `curl https://your-app.azurewebsites.net/api/auth/confirm?token=test`

### Issue: Email confirmation links return 404
**Solution**: Check `FRONTEND_URL` environment variable is set correctly (should be `https://your-app.azurewebsites.net`)

### Issue: Database connection fails
**Solution**: Verify connection string in appsettings.json and ensure SQL Server is accessible

### Issue: JWT token validation fails
**Solution**: Ensure `Jwt:Key` in appsettings.json is at least 32 characters

### Issue: AI Assistant not working
**Solution**: 
- Check Ollama is running: `curl http://localhost:11434/api/tags`
- Verify model is downloaded: `ollama list`
- Check `appsettings.json` has correct Ollama configuration

### Issue: Achievements triggering multiple times
**Solution**: Ensure `AddIsProcessedToAchievementEvents` migration has been applied

### Issue: Calendar showing tasks on wrong date
**Solution**: Verify frontend is using `getLocalDateString()` helper (already fixed in code)

## 📝 Environment Variables Summary

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `FRONTEND_URL` | Yes | `http://localhost:5173` | Frontend URL for email links |
| `ASPNETCORE_ENVIRONMENT` | No | `Production` | Environment name |
| `ConnectionStrings__DefaultConnection` | Yes | None | Database connection string |
| `Smtp__Host` | Yes | None | SMTP server hostname |
| `Smtp__Port` | Yes | `587` | SMTP server port |
| `Smtp__User` | Yes | None | SMTP username |
| `Smtp__Pass` | Yes | None | SMTP password |
| `Jwt__Key` | Yes | None | JWT signing key (min 32 chars) |

## 🔒 Security Best Practices

1. **Never commit secrets**: Use environment variables or Azure Key Vault
2. **Use HTTPS in production**: Configure SSL certificates
3. **Rotate JWT keys regularly**: Update `Jwt:Key` periodically
4. **Restrict CORS**: Only allow your frontend domain
5. **Use strong database credentials**: Avoid default passwords
6. **Enable rate limiting**: Prevent brute force attacks
7. **Keep dependencies updated**: Regularly update NuGet and npm packages

## 📚 Additional Resources

- [ASP.NET Core Deployment](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/)
- [Vite Production Build](https://vitejs.dev/guide/build.html)
- [Entity Framework Migrations](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Last Updated**: January 2025  
**TaskFlow Version**: 1.0

</details>

---

# Guía de Deployment de TaskFlow (Español)

Este documento proporciona instrucciones completas para desplegar TaskFlow a producción.

## 🚀 Checklist Pre-Deployment

### 1. Build del Frontend para Producción

Ejecutá el script de PowerShell para compilar y copiar el frontend a la carpeta wwwroot del backend:

```powershell
.\copy-frontend-to-wwwroot.ps1
```

Este script va a:
- ✅ Verificar si npm está instalado
- ✅ Navegar al directorio taskflow-frontend
- ✅ Ejecutar `npm run build`
- ✅ Limpiar el directorio TaskFlow.Api/wwwroot
- ✅ Copiar todos los archivos de dist/ a wwwroot/
- ✅ Verificar la operación de copia

### 2. Configurar appsettings.json

El archivo `TaskFlow.Api/appsettings.json` requiere que los siguientes valores estén configurados antes del deployment:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=TU_SERVIDOR;Database=TaskFlowDB;User Id=TU_USUARIO;Password=TU_CONTRASEÑA;TrustServerCertificate=True"
  },
  "Smtp": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "User": "tu-email@gmail.com",
    "Pass": "tu-contraseña-de-aplicación",
    "From": "TaskFlow <tu-email@gmail.com>"
  },
  "Jwt": {
    "Key": "TU-CLAVE-SECRETA-DE-256-BITS-AQUI-HACELA-LO-SUFICIENTEMENTE-LARGA",
    "Issuer": "TaskFlowApi",
    "Audience": "TaskFlowClient",
    "ExpiresInMinutes": 60
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

#### Connection String
- **Formato**: Cadena de conexión de SQL Server
- **Ejemplo**: `Server=localhost;Database=TaskFlowDB;User Id=sa;Password=TuContraseña123;TrustServerCertificate=True`
- **Producción**: Reemplazá con los detalles reales de tu servidor de base de datos

#### Configuración SMTP
Para Gmail:
1. Creá una Contraseña de Aplicación:
   - Andá a Cuenta de Google → Seguridad → Verificación en 2 pasos → Contraseñas de aplicaciones
   - Generá una nueva contraseña de aplicación para "Correo"
2. Usá la contraseña generada en el campo `Pass`

Para otros proveedores:
- **Host**: Tu servidor SMTP (ej., `smtp.sendgrid.net`, `smtp-mail.outlook.com`)
- **Port**: Usualmente 587 (TLS) o 465 (SSL)
- **User**: Tu nombre de usuario SMTP
- **Pass**: Tu contraseña SMTP

#### Clave JWT
- **Requisito**: Mínimo 256 bits (32 caracteres)
- **Generar**: Usá una cadena aleatoria criptográficamente segura
- **Ejemplo**: 
  ```bash
  # PowerShell
  [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
  
  # Linux/Mac
  openssl rand -base64 32
  ```

### 3. Configurar Variables de Entorno

Configurá la variable de entorno `FRONTEND_URL` para que apunte a la URL de producción de tu frontend:

#### Desarrollo
```bash
# archivo .env o variable de entorno del sistema
FRONTEND_URL=http://localhost:5173
```

#### Producción
```bash
# Windows
set FRONTEND_URL=https://tu-dominio.com

# Linux/Mac
export FRONTEND_URL=https://tu-dominio.com
```

Esta variable es usada por el backend para generar links de confirmación de email y reseteo de contraseña que apunten a la URL correcta del frontend.

### 4. Aplicar Migraciones de Base de Datos

Antes de ejecutar la aplicación, asegurate de que todas las migraciones estén aplicadas:

```bash
cd TaskFlow.Api
dotnet ef database update
```

Esto va a crear/actualizar el esquema de la base de datos con todas las tablas y columnas requeridas.

### 5. Configurar CORS (si es necesario)

Si estás alojando el frontend en un dominio diferente al backend, actualizá la política CORS en `Program.cs`:

**Actual (Desarrollo)**: Permite todos los orígenes
```csharp
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
```

**Producción**: Restringir a orígenes específicos
```csharp
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("https://tu-dominio.com")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
```

### 6. Opcional: Configurar Ollama AI (si usás el Asistente de IA)

Si querés usar la función de Asistente de IA, configurá Ollama en `appsettings.Development.json` o `appsettings.json`:

```json
{
  "Ollama": {
    "BaseUrl": "http://localhost:11434",
    "Model": "llama3.2"
  }
}
```

**Requisitos**:
- Instalar Ollama desde https://ollama.ai
- Descargar el modelo: `ollama pull llama3.2`
- Asegurate de que el servicio Ollama esté corriendo

**Nota**: Las funciones de IA estarán deshabilitadas si Ollama no está configurado o disponible.

## 🔧 Opciones de Deployment

### Opción 1: Self-Hosted (IIS, Kestrel)

1. Compilá el backend:
   ```bash
   cd TaskFlow.Api
   dotnet publish -c Release -o ./publish
   ```

2. Copiá la carpeta publish a tu servidor

3. Configurá IIS o ejecutá con Kestrel:
   ```bash
   cd publish
   dotnet TaskFlow.Api.dll
   ```

### Opción 2: Docker

Creá un `Dockerfile` en el directorio raíz:

```dockerfile
# Build frontend
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY taskflow-frontend/package*.json ./
RUN npm install
COPY taskflow-frontend/ ./
RUN npm run build

# Build backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /app
COPY TaskFlow.Api/*.csproj ./TaskFlow.Api/
RUN dotnet restore ./TaskFlow.Api/TaskFlow.Api.csproj
COPY TaskFlow.Api/ ./TaskFlow.Api/
RUN dotnet publish ./TaskFlow.Api/TaskFlow.Api.csproj -c Release -o /app/publish

# Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=backend-build /app/publish .
COPY --from=frontend-build /app/frontend/dist ./wwwroot/
ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80
ENTRYPOINT ["dotnet", "TaskFlow.Api.dll"]
```

Compilar y ejecutar:
```bash
docker build -t taskflow .
docker run -p 80:80 -e ConnectionStrings__DefaultConnection="TU_CONNECTION_STRING" taskflow
```

### Opción 3: Azure App Service

1. Creá un Azure App Service (ASP.NET Core 8.0)
2. Configurá Application Settings:
   - Agregá todos los valores de appsettings.json como App Settings
   - Agregá la variable de entorno `FRONTEND_URL`
3. Desplegá usando:
   - Visual Studio (clic derecho, publicar)
   - Pipeline de Azure DevOps
   - GitHub Actions

## 📋 Verificación Post-Deployment

### Checklist de Funcionalidades

Después del deployment, verificá que todas las funcionalidades funcionen correctamente:

#### ✅ Autenticación y Autorización
- [ ] Registro de usuario con confirmación por email
- [ ] Links de confirmación de email funcionan (verificá que FRONTEND_URL esté correcto)
- [ ] Login con credenciales válidas
- [ ] Solicitud de reseteo de contraseña envía email
- [ ] Links de reseteo de contraseña funcionan (verificá que FRONTEND_URL esté correcto)
- [ ] Autenticación con token JWT funciona
- [ ] Persistencia de sesión entre refrescos de página

#### ✅ Gestión de Tareas
- [ ] Crear nueva tarea con todos los campos (título, descripción, prioridad, fecha de vencimiento, categoría, ubicación)
- [ ] Ver tareas en vista de lista
- [ ] Editar detalles de tarea
- [ ] Eliminar tarea
- [ ] Marcar tarea como completada/incompleta
- [ ] Reordenar tareas con drag-drop
- [ ] Filtrar tareas por estado, prioridad, categoría

#### ✅ Gestión de Categorías
- [ ] Crear nueva categoría con selector de color
- [ ] Editar nombre y color de categoría
- [ ] Eliminar categoría (verificar tareas huérfanas)
- [ ] Ver tareas agrupadas por categoría

#### ✅ Vista de Calendario
- [ ] Ver tareas en calendario por fecha de vencimiento
- [ ] Navegar entre meses
- [ ] Hacer clic en fecha para ver/agregar tareas
- [ ] Arrastrar tarea a fecha diferente (actualiza fecha de vencimiento)
- [ ] Tareas aparecen en fecha local correcta (no desplazadas por UTC)

#### ✅ Dashboard
- [ ] Ver estadísticas de completitud de tareas
- [ ] Ver gráfico de distribución de categorías
- [ ] Ver desglose por prioridad
- [ ] Ver tareas próximas

#### ✅ Sistema de Logros
- [ ] Logros se desbloquean cuando se cumplen las condiciones
- [ ] Notificaciones de logros aparecen con traducción correcta
- [ ] Progreso de logros se rastrea correctamente
- [ ] Racha funciona (días consecutivos)
- [ ] No hay eventos de logros duplicados
- [ ] Estadísticas de logros se muestran correctamente

#### ✅ Asistente de IA (Opcional)
- [ ] Abrir panel de asistente de IA
- [ ] Enviar mensaje y recibir respuesta
- [ ] IA entiende contexto de tareas
- [ ] IA detecta idioma del usuario (Inglés/Español)
- [ ] Tiempo de respuesta < 5 segundos
- [ ] Manejo de errores si Ollama no está disponible

#### ✅ Servicios de Ubicación
- [ ] Búsqueda de Google Places funciona
- [ ] Seleccionar ubicación de resultados de búsqueda
- [ ] Usar ubicación GPS actual
- [ ] Botón limpiar ubicación funciona
- [ ] Vista previa del mapa se muestra correctamente
- [ ] Tareas con ubicaciones mostradas en mapa

#### ✅ Internacionalización (i18n)
- [ ] Cambiar idioma entre Inglés/Español
- [ ] Todos los elementos de UI traducidos correctamente
- [ ] Notificaciones de logros localizadas
- [ ] Formatos de fecha/hora correctos para el locale
- [ ] Preferencia de idioma persiste

#### ✅ Tema y UI
- [ ] Cambiar entre tema claro/oscuro
- [ ] Preferencia de tema persiste
- [ ] Todos los componentes visibles en ambos temas
- [ ] Diseño responsivo funciona en móvil
- [ ] Sin problemas de layout o elementos superpuestos

#### ✅ Funcionalidades PWA
- [ ] Aparece prompt para instalar app (en navegadores compatibles)
- [ ] App se instala exitosamente
- [ ] Funcionalidad offline funciona
- [ ] Service worker se registra correctamente
- [ ] Manifiesto de app carga correctamente
- [ ] Íconos se muestran en app instalada

## 🐛 Problemas Comunes

### Problema: Registro de usuario retorna 409 Conflict (Falla envío de email)
**Síntomas**: Los usuarios no pueden registrarse, reciben error "auth.register.exists" incluso con credenciales nuevas

**Causa Raíz**: Falla de autenticación SMTP - el backend no puede enviar emails de confirmación

**Soluciones**:
1. **Verificar que estés usando Gmail App Password** (NO contraseña regular):
   ```
   Contraseña regular → Error "5.7.0 Authentication Required"
   App Password → Funciona correctamente
   ```

2. **Generar Gmail App Password**:
   - Ir a: https://myaccount.google.com/security
   - Habilitar Verificación en 2 pasos (requerido)
   - Buscar "Contraseñas de aplicaciones"
   - Crear una para "Correo"
   - Copiar código de 16 caracteres (ej., `abcd efgh ijkl mnop`)
   - Usar en secret `SMTP_PASSWORD` / setting `Smtp__Pass`

3. **Testear localmente primero**:
   ```bash
   # Configurar producción localmente
   cd TaskFlow.Api
   dotnet run --launch-profile production
   ```
   - Intentar registrar un usuario de prueba
   - Verificar consola para logs de error detallados
   - Si ves "5.7.0 Authentication Required", regenerar App Password

4. **Específico de Azure**: Después de actualizar secret `SMTP_PASSWORD` en GitHub:
   - Hacer un nuevo commit para disparar deployment
   - Reiniciar manualmente App Service después del deployment
   - Esperar 2-3 minutos para reinicio completo

### Problema: Página de confirmación de email muestra pantalla en blanco (móvil)
**Síntomas**: Usuario hace clic en link de email, página carga infinitamente con pantalla blanca

**Causa Raíz**: Request fetch timeout o Service Worker bloqueando

**Soluciones**:
1. **Ya corregido en código** - Timeout agregado al fetch:
   ```typescript
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), 15000);
   fetch(url, { signal: controller.signal })
   ```

2. **Workarounds para usuario**:
   - Abrir link en modo incógnito/privado
   - Limpiar caché del navegador y recargar
   - Probar en navegador de escritorio
   - Copiar link y pegar en navegador manualmente

3. **Fixes para desarrollador si sigue ocurriendo**:
   - Incrementar versión de caché del Service Worker en `public/sw.js`
   - Verificar consola del navegador (F12) para errores específicos
   - Verificar que API responda: `curl https://tu-app.azurewebsites.net/api/auth/confirm?token=test`

### Problema: Links de confirmación de email retornan 404
**Solución**: Verificá que la variable de entorno `FRONTEND_URL` esté configurada correctamente (debe ser `https://tu-app.azurewebsites.net`)

### Problema: Falla conexión a base de datos
**Solución**: Verificá la cadena de conexión en appsettings.json y asegurate de que SQL Server sea accesible

### Problema: Falla validación de token JWT
**Solución**: Asegurate de que `Jwt:Key` en appsettings.json tenga al menos 32 caracteres

### Problema: Asistente de IA no funciona
**Solución**: 
- Verificá que Ollama esté corriendo: `curl http://localhost:11434/api/tags`
- Verificá que el modelo esté descargado: `ollama list`
- Verificá que `appsettings.json` tenga la configuración correcta de Ollama

### Problema: Logros se disparan múltiples veces
**Solución**: Asegurate de que la migración `AddIsProcessedToAchievementEvents` haya sido aplicada

### Problema: Calendario muestra tareas en fecha incorrecta
**Solución**: Verificá que el frontend esté usando el helper `getLocalDateString()` (ya corregido en el código)

## 📝 Resumen de Variables de Entorno

| Variable | Requerido | Por Defecto | Descripción |
|----------|-----------|-------------|-------------|
| `FRONTEND_URL` | Sí | `http://localhost:5173` | URL del frontend para links de email |
| `ASPNETCORE_ENVIRONMENT` | No | `Production` | Nombre del entorno |
| `ConnectionStrings__DefaultConnection` | Sí | Ninguno | Cadena de conexión a base de datos |
| `Smtp__Host` | Sí | Ninguno | Hostname del servidor SMTP |
| `Smtp__Port` | Sí | `587` | Puerto del servidor SMTP |
| `Smtp__User` | Sí | Ninguno | Usuario SMTP |
| `Smtp__Pass` | Sí | Ninguno | Contraseña SMTP |
| `Jwt__Key` | Sí | Ninguno | Clave de firma JWT (mín 32 chars) |

## 🔒 Mejores Prácticas de Seguridad

1. **Nunca commitear secretos**: Usá variables de entorno o Azure Key Vault
2. **Usar HTTPS en producción**: Configurá certificados SSL
3. **Rotar claves JWT regularmente**: Actualizá `Jwt:Key` periódicamente
4. **Restringir CORS**: Solo permitir tu dominio del frontend
5. **Usar credenciales fuertes de base de datos**: Evitá contraseñas por defecto
6. **Habilitar rate limiting**: Prevenir ataques de fuerza bruta
7. **Mantener dependencias actualizadas**: Actualizá regularmente paquetes NuGet y npm

## 📚 Recursos Adicionales

- [ASP.NET Core Deployment](https://learn.microsoft.com/es-es/aspnet/core/host-and-deploy/)
- [Vite Production Build](https://vitejs.dev/guide/build.html)
- [Entity Framework Migrations](https://learn.microsoft.com/es-es/ef/core/managing-schemas/migrations/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Última Actualización**: Enero 2025  
**Versión de TaskFlow**: 1.0
