# API Message Keys

This document lists all message keys that the backend may return in the `message` field of API responses. The frontend should use these keys to map to localized user-facing messages via i18n.

**How to use:**
- The backend always returns a machine-readable key in the `message` property (e.g., `auth.login.invalid`).
- The frontend translates this key using the appropriate language file (e.g., `en.json`, `es.json`).
- This approach ensures consistency, maintainability, and full support for internationalization.

| Key                               | English Reference Message                  | Context / Endpoint                |
|-----------------------------------|--------------------------------------------|-----------------------------------|
| auth.register.exists              | Username or email already exists           | POST /api/auth/register           |
| auth.login.invalid                | Invalid username or password               | POST /api/auth/login              |
| category.get.error                | Error retrieving categories                | GET /api/categories               |
| category.create.exists            | A category with this name already exists   | POST /api/categories              |
| category.update.exists            | A category with this name already exists   | PUT /api/categories/{id}          |
| task.get.error                    | Error retrieving tasks                     | GET /api/tasks                    |
| user.photo.no_file                | No file uploaded                           | POST /api/users/photo             |
| user.photo.invalid_type           | Invalid file type                          | POST /api/users/photo             |
| user.profile.username_exists      | Username already exists                    | PUT /api/users/profile            |
| user.profile.email_exists         | Email already exists                       | PUT /api/users/profile            |
| user.profile.current_password_incorrect | Current password is incorrect        | PUT /api/users/profile            |
| user.profile.updated              | Profile updated                            | PUT /api/users/profile            |


# Claves de Mensaje de la API (Español)

Este documento lista todas las claves de mensaje que el backend puede devolver en el campo `message` de las respuestas de la API. El frontend debe usar estas claves para mapear a mensajes traducidos usando i18n.

**Cómo usar:**
- El backend siempre devuelve una clave en la propiedad `message` (por ejemplo, `auth.login.invalid`).
- El frontend traduce esta clave usando el archivo de idioma correspondiente (por ejemplo, `en.json` o `es.json`).
- Este enfoque asegura consistencia, mantenibilidad y soporte completo para internacionalización.

| Clave                          | Mensaje de referencia en español             | Contexto / Endpoint              |
|--------------------------------|----------------------------------------------|----------------------------------|
| auth.register.exists           | El usuario o email ya existen                | POST /api/auth/register          |
| auth.login.invalid             | Usuario o contraseña incorrectos             | POST /api/auth/login             |
| category.get.error             | Error al obtener las categorías              | GET /api/categories              |
| category.create.exists         | Ya existe una categoría con ese nombre       | POST /api/categories             |
| category.update.exists         | Ya existe una categoría con ese nombre       | PUT /api/categories/{id}         |
| task.get.error                 | Error al obtener las tareas                  | GET /api/tasks                   |
| user.photo.no_file             | No se subió ningún archivo                   | POST /api/users/photo            |
| user.photo.invalid_type        | Tipo de archivo inválido                     | POST /api/users/photo            |
| user.profile.username_exists   | El nombre de usuario ya existe               | PUT /api/users/profile           |
| user.profile.email_exists      | El email ya existe                           | PUT /api/users/profile           |
| user.profile.current_password_incorrect | La contraseña actual es incorrecta   | PUT /api/users/profile           |
| user.profile.updated           | Perfil actualizado                           | PUT /api/users/profile           |