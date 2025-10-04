# TaskFlow Environment Management Guide

<details>
<summary>English version</summary>

---

# TaskFlow Environment Management Guide (English)

This document explains how to manage environment variables across different environments (development, production) in TaskFlow without manual file changes.

## 📋 Overview

TaskFlow uses environment-specific configuration files that are automatically selected based on the current environment:

### Frontend (Vite)
- **Development**: `.env.development` (automatically loaded with `npm run dev`)
- **Production**: `.env.production` (automatically loaded with `npm run build`)

### Backend (ASP.NET Core)
- **Development**: `TaskFlow.Api/.env` + `appsettings.Development.json`
- **Production**: Environment variables (Railway/Render/Azure) + `appsettings.Production.json`

## 🎯 How It Works

### Frontend Environment Detection

Vite automatically detects which `.env` file to load based on the command you run:

| Command | Environment | File Loaded |
|---------|-------------|-------------|
| `npm run dev` | development | `.env.development` |
| `npm run build` | production | `.env.production` |
| `npm run preview` | production | `.env.production` |

**No manual changes needed!** Vite handles everything automatically.

### Backend Environment Detection

ASP.NET Core uses a hierarchy of configuration sources (later sources override earlier ones):

1. `appsettings.json` (base configuration)
2. `appsettings.{Environment}.json` (environment-specific overrides)
3. Environment variables
4. `.env` file (loaded via DotNetEnv library)

The environment is determined by the `ASPNETCORE_ENVIRONMENT` variable:
- **Development**: Set automatically by Visual Studio / `dotnet run`
- **Production**: Set by hosting platform (Railway, Render, Azure)

## 📁 File Structure

```
taskflow/
├── taskflow-frontend/
│   ├── .env.development          # Development config (localhost:5149)
│   ├── .env.production           # Production config (your domain)
│   └── .env.example              # Template with empty values
│
├── TaskFlow.Api/
│   ├── .env                      # Local development secrets
│   ├── appsettings.json          # Base configuration
│   ├── appsettings.Development.json  # Dev overrides (optional)
│   └── appsettings.Production.json   # Production config template
```

## ⚙️ Configuration Files

### Frontend `.env.development`

Used when running `npm run dev`:

```env
# Development environment - Backend running on localhost
VITE_ROOT_URL=http://localhost:5149
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Frontend `.env.production`

Used when running `npm run build`:

```env
# Production environment - Replace with your actual domain
VITE_ROOT_URL=https://your-domain.com
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Backend `.env`

Used for local development secrets (not committed to git):

```env
ConnectionStrings__DefaultConnection=Server=localhost\SQLEXPRESS;Database=TaskFlowDb;Trusted_Connection=True;TrustServerCertificate=True;
Smtp__Host=smtp.gmail.com
Smtp__Port=587
Smtp__User=your-email@gmail.com
Smtp__Pass=your-app-password
Smtp__From=your-email@gmail.com
Jwt__Key=your-secret-key-minimum-32-characters
FRONTEND_URL=http://localhost:5149
```

### Backend `appsettings.Production.json`

Template for production configuration (credentials filled by hosting platform):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": ""
  },
  "Smtp": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "User": "",
    "Pass": "",
    "From": "TaskFlow <your-email@gmail.com>"
  },
  "Jwt": {
    "Key": "",
    "Issuer": "TaskFlowApi",
    "Audience": "TaskFlowClient",
    "ExpiresInMinutes": 60
  },
  "Ollama": {
    "BaseUrl": "http://localhost:11434",
    "Model": "llama3.2"
  }
}
```

## 🔄 Workflows

### Workflow 1: Development (Hot-Reload)

**Use case**: Active development with automatic reloading

**Frontend**:
```bash
cd taskflow-frontend
npm run dev
# Automatically loads .env.development
# Backend URL: http://localhost:5149
```

**Backend**:
```bash
cd TaskFlow.Api
dotnet run
# Automatically loads .env file
# ASPNETCORE_ENVIRONMENT=Development (default)
```

**Result**: Frontend on `http://localhost:5173`, Backend on `http://localhost:5149`

---

### Workflow 2: Testing Local Production Build

**Use case**: Test production build locally before deploying

**Frontend**:
```bash
cd taskflow-frontend
npm run build
# Automatically uses .env.production
# Creates dist/ folder with production build
```

**Backend** (using integrated deployment):
```powershell
# From project root
.\copy-frontend-to-wwwroot.ps1
cd TaskFlow.Api
dotnet run
# Serves frontend from wwwroot/
# Access at http://localhost:5149
```

**Result**: Full production-like environment on `http://localhost:5149`

---

### Workflow 3: Cloud Production Deployment

**Use case**: Deploy to Railway, Render, or Azure

**Frontend Build**:
```bash
cd taskflow-frontend
npm run build
# Uses .env.production automatically
```

**Backend Configuration**:
- Configure environment variables in hosting platform dashboard
- Platform sets `ASPNETCORE_ENVIRONMENT=Production`
- Backend reads from `appsettings.Production.json` + environment variables

**Railway Example**:
```bash
# Environment variables configured in Railway dashboard:
ConnectionStrings__DefaultConnection=postgresql://user:pass@host:5432/db
Smtp__Host=smtp.gmail.com
Smtp__User=your-email@gmail.com
Smtp__Pass=your-app-password
Jwt__Key=your-production-jwt-key
FRONTEND_URL=https://your-app.up.railway.app
```

**Result**: App running on Railway with PostgreSQL database

## 🚀 Switching Environments

### No Manual Changes Needed!

The beauty of this setup is that you **never** need to manually edit environment files to switch between development and production.

| Task | Command | Files Used |
|------|---------|------------|
| Start dev server | `npm run dev` | `.env.development` |
| Build for production | `npm run build` | `.env.production` |
| Test production locally | `.\copy-frontend-to-wwwroot.ps1` + `dotnet run` | `.env.production` (frontend), `.env` (backend) |
| Deploy to cloud | Push to git | Platform environment variables |

### When to Update Each File

**Update `.env.development`**:
- When your local backend port changes
- When you get a new Google Maps API key
- Never commit this if it contains secrets

**Update `.env.production`**:
- Before first production deployment (set your domain)
- When deploying to a new domain
- When production API keys change

**Update `TaskFlow.Api/.env`**:
- When local database connection changes
- When you rotate local SMTP credentials
- When you generate new JWT keys for testing
- **Never commit this file** (already in .gitignore)

**Update `appsettings.Production.json`**:
- When you add new configuration sections
- To set production-specific defaults
- Can commit this (should not contain secrets)

## 🔒 Security Best Practices

### ✅ DO:
- ✅ Use `.env.example` files as templates
- ✅ Keep secrets in `.env` files (ignored by git)
- ✅ Use environment variables in production
- ✅ Rotate JWT keys regularly
- ✅ Use different keys for dev/prod

### ❌ DON'T:
- ❌ Commit `.env` files with secrets
- ❌ Hardcode secrets in source code
- ❌ Use production secrets in development
- ❌ Share `.env` files via chat/email
- ❌ Use weak JWT keys (< 32 characters)

## 🐛 Troubleshooting

### Problem: Frontend can't connect to backend

**Symptoms**: API calls fail, CORS errors, network errors

**Solutions**:
1. Check `VITE_ROOT_URL` in current environment file:
   ```bash
   # Development
   cat taskflow-frontend/.env.development
   
   # Production
   cat taskflow-frontend/.env.production
   ```

2. Verify backend is running on expected port:
   ```bash
   # Should show "Now listening on: http://localhost:5149"
   cd TaskFlow.Api
   dotnet run
   ```

3. Rebuild frontend if you changed `.env` files:
   ```bash
   # Vite only reads .env files at build time
   npm run dev  # For development
   npm run build  # For production
   ```

---

### Problem: Backend can't connect to database

**Symptoms**: Migration errors, "Cannot open database" errors

**Solutions**:
1. Check connection string in `.env` file:
   ```bash
   cat TaskFlow.Api/.env | grep ConnectionStrings
   ```

2. Verify SQL Server is running:
   ```bash
   # Windows
   Get-Service MSSQL*
   
   # Or check in SQL Server Configuration Manager
   ```

3. Test connection string format:
   ```
   # Local SQL Server Express
   Server=localhost\SQLEXPRESS;Database=TaskFlowDb;Trusted_Connection=True;TrustServerCertificate=True;
   
   # SQL Server with credentials
   Server=localhost;Database=TaskFlowDb;User Id=sa;Password=YourPassword;TrustServerCertificate=True;
   ```

---

### Problem: Email confirmation links go to wrong URL

**Symptoms**: Email links point to localhost in production, or wrong port

**Solutions**:
1. Check `FRONTEND_URL` environment variable:
   ```bash
   # Development (.env file)
   FRONTEND_URL=http://localhost:5149
   
   # Production (platform environment variable)
   FRONTEND_URL=https://your-domain.com
   ```

2. Verify backend is reading the variable:
   ```csharp
   // In AuthService.cs, the link is generated like:
   var confirmationLink = $"{_configuration["FRONTEND_URL"]}/confirm-email?token={token}";
   ```

3. Restart backend after changing environment variables

---

### Problem: Changes to `.env` files not taking effect

**Symptoms**: App still uses old values after editing `.env`

**Solutions**:
1. **Frontend**: Restart dev server or rebuild:
   ```bash
   # Stop dev server (Ctrl+C)
   npm run dev  # Start again
   
   # Or for production build:
   npm run build
   ```

2. **Backend**: Restart application:
   ```bash
   # Stop backend (Ctrl+C)
   dotnet run  # Start again
   ```

3. **Clear build cache** if problems persist:
   ```bash
   # Frontend
   rm -rf node_modules/.vite
   npm run dev
   
   # Backend
   dotnet clean
   dotnet build
   ```

---

### Problem: Production build works locally but fails on cloud

**Symptoms**: App works with `dotnet run` but fails on Railway/Render

**Solutions**:
1. Check environment variables are set in platform dashboard

2. Verify `appsettings.Production.json` exists and is valid JSON

3. Check logs in platform dashboard for specific errors

4. Ensure PostgreSQL connection string format for cloud:
   ```
   # Railway/Render PostgreSQL format
   postgresql://user:password@hostname:5432/database?sslmode=require
   ```

5. Verify migrations are applied (Railway runs migrations automatically if configured)

## 📚 Additional Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [ASP.NET Core Configuration](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/)
- [DotNetEnv Library](https://github.com/tonerdo/dotnet-env)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)

---

**Last Updated**: January 2025  
**TaskFlow Version**: 1.0

</details>

---

# Guía de Gestión de Entornos de TaskFlow (Español)

Este documento explica cómo gestionar variables de entorno en diferentes entornos (desarrollo, producción) en TaskFlow sin cambios manuales en los archivos.

## 📋 Resumen

TaskFlow usa archivos de configuración específicos por entorno que se seleccionan automáticamente basándose en el entorno actual:

### Frontend (Vite)
- **Desarrollo**: `.env.development` (se carga automáticamente con `npm run dev`)
- **Producción**: `.env.production` (se carga automáticamente con `npm run build`)

### Backend (ASP.NET Core)
- **Desarrollo**: `TaskFlow.Api/.env` + `appsettings.Development.json`
- **Producción**: Variables de entorno (Railway/Render/Azure) + `appsettings.Production.json`

## 🎯 Cómo Funciona

### Detección de Entorno en Frontend

Vite detecta automáticamente qué archivo `.env` cargar basándose en el comando que ejecutás:

| Comando | Entorno | Archivo Cargado |
|---------|---------|-----------------|
| `npm run dev` | development | `.env.development` |
| `npm run build` | production | `.env.production` |
| `npm run preview` | production | `.env.production` |

**¡No se necesitan cambios manuales!** Vite maneja todo automáticamente.

### Detección de Entorno en Backend

ASP.NET Core usa una jerarquía de fuentes de configuración (las fuentes posteriores sobrescriben las anteriores):

1. `appsettings.json` (configuración base)
2. `appsettings.{Environment}.json` (sobrescrituras específicas del entorno)
3. Variables de entorno
4. Archivo `.env` (cargado vía biblioteca DotNetEnv)

El entorno se determina por la variable `ASPNETCORE_ENVIRONMENT`:
- **Development**: Configurado automáticamente por Visual Studio / `dotnet run`
- **Production**: Configurado por la plataforma de hosting (Railway, Render, Azure)

## 📁 Estructura de Archivos

```
taskflow/
├── taskflow-frontend/
│   ├── .env.development          # Config de desarrollo (localhost:5149)
│   ├── .env.production           # Config de producción (tu dominio)
│   └── .env.example              # Plantilla con valores vacíos
│
├── TaskFlow.Api/
│   ├── .env                      # Secretos de desarrollo local
│   ├── appsettings.json          # Configuración base
│   ├── appsettings.Development.json  # Sobrescrituras dev (opcional)
│   └── appsettings.Production.json   # Plantilla config producción
```

## ⚙️ Archivos de Configuración

### Frontend `.env.development`

Usado al ejecutar `npm run dev`:

```env
# Entorno de desarrollo - Backend corriendo en localhost
VITE_ROOT_URL=http://localhost:5149
VITE_GOOGLE_MAPS_API_KEY=tu_clave_api_aqui
```

### Frontend `.env.production`

Usado al ejecutar `npm run build`:

```env
# Entorno de producción - Reemplazá con tu dominio real
VITE_ROOT_URL=https://tu-dominio.com
VITE_GOOGLE_MAPS_API_KEY=tu_clave_api_aqui
```

### Backend `.env`

Usado para secretos de desarrollo local (no commiteado a git):

```env
ConnectionStrings__DefaultConnection=Server=localhost\SQLEXPRESS;Database=TaskFlowDb;Trusted_Connection=True;TrustServerCertificate=True;
Smtp__Host=smtp.gmail.com
Smtp__Port=587
Smtp__User=tu-email@gmail.com
Smtp__Pass=tu-contraseña-de-aplicación
Smtp__From=tu-email@gmail.com
Jwt__Key=tu-clave-secreta-minimo-32-caracteres
FRONTEND_URL=http://localhost:5149
```

### Backend `appsettings.Production.json`

Plantilla para configuración de producción (credenciales completadas por la plataforma de hosting):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": ""
  },
  "Smtp": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "User": "",
    "Pass": "",
    "From": "TaskFlow <tu-email@gmail.com>"
  },
  "Jwt": {
    "Key": "",
    "Issuer": "TaskFlowApi",
    "Audience": "TaskFlowClient",
    "ExpiresInMinutes": 60
  },
  "Ollama": {
    "BaseUrl": "http://localhost:11434",
    "Model": "llama3.2"
  }
}
```

## 🔄 Flujos de Trabajo

### Flujo 1: Desarrollo (Hot-Reload)

**Caso de uso**: Desarrollo activo con recarga automática

**Frontend**:
```bash
cd taskflow-frontend
npm run dev
# Carga automáticamente .env.development
# URL del Backend: http://localhost:5149
```

**Backend**:
```bash
cd TaskFlow.Api
dotnet run
# Carga automáticamente archivo .env
# ASPNETCORE_ENVIRONMENT=Development (por defecto)
```

**Resultado**: Frontend en `http://localhost:5173`, Backend en `http://localhost:5149`

---

### Flujo 2: Testing de Build de Producción Local

**Caso de uso**: Probar build de producción localmente antes de desplegar

**Frontend**:
```bash
cd taskflow-frontend
npm run build
# Usa automáticamente .env.production
# Crea carpeta dist/ con build de producción
```

**Backend** (usando deployment integrado):
```powershell
# Desde la raíz del proyecto
.\copy-frontend-to-wwwroot.ps1
cd TaskFlow.Api
dotnet run
# Sirve el frontend desde wwwroot/
# Acceder en http://localhost:5149
```

**Resultado**: Entorno completo similar a producción en `http://localhost:5149`

---

### Flujo 3: Deployment en Nube (Producción)

**Caso de uso**: Desplegar a Railway, Render o Azure

**Build del Frontend**:
```bash
cd taskflow-frontend
npm run build
# Usa .env.production automáticamente
```

**Configuración del Backend**:
- Configurar variables de entorno en el dashboard de la plataforma de hosting
- La plataforma configura `ASPNETCORE_ENVIRONMENT=Production`
- Backend lee desde `appsettings.Production.json` + variables de entorno

**Ejemplo con Railway**:
```bash
# Variables de entorno configuradas en el dashboard de Railway:
ConnectionStrings__DefaultConnection=postgresql://user:pass@host:5432/db
Smtp__Host=smtp.gmail.com
Smtp__User=tu-email@gmail.com
Smtp__Pass=tu-contraseña-de-aplicación
Jwt__Key=tu-clave-jwt-de-produccion
FRONTEND_URL=https://tu-app.up.railway.app
```

**Resultado**: App corriendo en Railway con base de datos PostgreSQL

## 🚀 Cambio Entre Entornos

### ¡No Se Necesitan Cambios Manuales!

La belleza de esta configuración es que **nunca** necesitás editar manualmente archivos de entorno para cambiar entre desarrollo y producción.

| Tarea | Comando | Archivos Usados |
|-------|---------|-----------------|
| Iniciar servidor dev | `npm run dev` | `.env.development` |
| Build para producción | `npm run build` | `.env.production` |
| Probar producción localmente | `.\copy-frontend-to-wwwroot.ps1` + `dotnet run` | `.env.production` (frontend), `.env` (backend) |
| Desplegar a nube | Push a git | Variables de entorno de la plataforma |

### Cuándo Actualizar Cada Archivo

**Actualizar `.env.development`**:
- Cuando cambia el puerto local del backend
- Cuando obtenés una nueva API key de Google Maps
- Nunca commitear esto si contiene secretos

**Actualizar `.env.production`**:
- Antes del primer deployment a producción (configurar tu dominio)
- Cuando desplegás a un nuevo dominio
- Cuando cambian las API keys de producción

**Actualizar `TaskFlow.Api/.env`**:
- Cuando cambia la conexión local a la base de datos
- Cuando rotás credenciales SMTP locales
- Cuando generás nuevas claves JWT para testing
- **Nunca commitear este archivo** (ya está en .gitignore)

**Actualizar `appsettings.Production.json`**:
- Cuando agregás nuevas secciones de configuración
- Para configurar valores por defecto específicos de producción
- Podés commitear esto (no debería contener secretos)

## 🔒 Mejores Prácticas de Seguridad

### ✅ HACER:
- ✅ Usar archivos `.env.example` como plantillas
- ✅ Mantener secretos en archivos `.env` (ignorados por git)
- ✅ Usar variables de entorno en producción
- ✅ Rotar claves JWT regularmente
- ✅ Usar claves diferentes para dev/prod

### ❌ NO HACER:
- ❌ Commitear archivos `.env` con secretos
- ❌ Hardcodear secretos en código fuente
- ❌ Usar secretos de producción en desarrollo
- ❌ Compartir archivos `.env` por chat/email
- ❌ Usar claves JWT débiles (< 32 caracteres)

## 🐛 Solución de Problemas

### Problema: Frontend no puede conectarse al backend

**Síntomas**: Llamadas a API fallan, errores CORS, errores de red

**Soluciones**:
1. Verificar `VITE_ROOT_URL` en el archivo de entorno actual:
   ```bash
   # Desarrollo
   cat taskflow-frontend/.env.development
   
   # Producción
   cat taskflow-frontend/.env.production
   ```

2. Verificar que el backend esté corriendo en el puerto esperado:
   ```bash
   # Debería mostrar "Now listening on: http://localhost:5149"
   cd TaskFlow.Api
   dotnet run
   ```

3. Recompilar frontend si cambiaste archivos `.env`:
   ```bash
   # Vite solo lee archivos .env en tiempo de build
   npm run dev  # Para desarrollo
   npm run build  # Para producción
   ```

---

### Problema: Backend no puede conectarse a la base de datos

**Síntomas**: Errores de migración, errores "Cannot open database"

**Soluciones**:
1. Verificar cadena de conexión en archivo `.env`:
   ```bash
   cat TaskFlow.Api/.env | grep ConnectionStrings
   ```

2. Verificar que SQL Server esté corriendo:
   ```bash
   # Windows
   Get-Service MSSQL*
   
   # O verificar en SQL Server Configuration Manager
   ```

3. Probar formato de cadena de conexión:
   ```
   # SQL Server Express local
   Server=localhost\SQLEXPRESS;Database=TaskFlowDb;Trusted_Connection=True;TrustServerCertificate=True;
   
   # SQL Server con credenciales
   Server=localhost;Database=TaskFlowDb;User Id=sa;Password=TuContraseña;TrustServerCertificate=True;
   ```

---

### Problema: Links de confirmación de email van a URL incorrecta

**Síntomas**: Links de email apuntan a localhost en producción, o puerto incorrecto

**Soluciones**:
1. Verificar variable de entorno `FRONTEND_URL`:
   ```bash
   # Desarrollo (archivo .env)
   FRONTEND_URL=http://localhost:5149
   
   # Producción (variable de entorno de la plataforma)
   FRONTEND_URL=https://tu-dominio.com
   ```

2. Verificar que el backend esté leyendo la variable:
   ```csharp
   // En AuthService.cs, el link se genera así:
   var confirmationLink = $"{_configuration["FRONTEND_URL"]}/confirm-email?token={token}";
   ```

3. Reiniciar backend después de cambiar variables de entorno

---

### Problema: Cambios a archivos `.env` no tienen efecto

**Síntomas**: La app sigue usando valores viejos después de editar `.env`

**Soluciones**:
1. **Frontend**: Reiniciar servidor dev o recompilar:
   ```bash
   # Detener servidor dev (Ctrl+C)
   npm run dev  # Iniciar nuevamente
   
   # O para build de producción:
   npm run build
   ```

2. **Backend**: Reiniciar aplicación:
   ```bash
   # Detener backend (Ctrl+C)
   dotnet run  # Iniciar nuevamente
   ```

3. **Limpiar caché de build** si los problemas persisten:
   ```bash
   # Frontend
   rm -rf node_modules/.vite
   npm run dev
   
   # Backend
   dotnet clean
   dotnet build
   ```

---

### Problema: Build de producción funciona localmente pero falla en la nube

**Síntomas**: La app funciona con `dotnet run` pero falla en Railway/Render

**Soluciones**:
1. Verificar que las variables de entorno estén configuradas en el dashboard de la plataforma

2. Verificar que `appsettings.Production.json` exista y sea JSON válido

3. Verificar logs en el dashboard de la plataforma para errores específicos

4. Asegurar formato correcto de cadena de conexión PostgreSQL para la nube:
   ```
   # Formato PostgreSQL de Railway/Render
   postgresql://user:password@hostname:5432/database?sslmode=require
   ```

5. Verificar que las migraciones estén aplicadas (Railway ejecuta migraciones automáticamente si está configurado)

## 📚 Recursos Adicionales

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [ASP.NET Core Configuration](https://learn.microsoft.com/es-es/aspnet/core/fundamentals/configuration/)
- [DotNetEnv Library](https://github.com/tonerdo/dotnet-env)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)

---

**Última Actualización**: Enero 2025  
**Versión de TaskFlow**: 1.0
