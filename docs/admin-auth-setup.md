# Preparación manual del acceso administrativo

Esta tarea conecta `/admin/login`. **El login no protege por sí solo el acceso directo a `/admin` ni a `/admin/proyectos`.** La protección general de rutas y la renovación automática de sesión quedan pendientes. El botón general «Cerrar sesión» sigue inactivo. Las políticas RLS existentes no se modifican.

## Configuración de Auth

En el proyecto correcto del Dashboard de Supabase, abre Authentication → Sign In / Providers:

- Desactiva **Allow new users to sign up**: el acceso queda disponible para usuarios existentes.
- Mantén habilitado el proveedor **Email**, con acceso por correo y contraseña. Mantén **Confirm Email** habilitado.
- Mantén **Allow anonymous sign-ins** desactivado.

Consulta la [configuración oficial de Auth](https://supabase.com/docs/guides/auth/general-configuration). La aplicación reutiliza exclusivamente `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; no necesita nuevas variables.

## Una sola cuenta administrativa

El propietario debe realizar estas operaciones manualmente, fuera de la aplicación:

1. Revisa Authentication → Users y verifica si la cuenta del propietario ya existe. Con la API administrativa puedes usar `auth.admin.listUsers({ page, perPage })`, recorriendo **todas** las páginas, y `auth.admin.getUserById(userId)` para verificar la cuenta seleccionada. No crees un duplicado. Comprueba también que no haya otra cuenta con `app_metadata.role === "admin"`. Véase [listUsers](https://supabase.com/docs/reference/javascript/auth-admin-listusers).
2. Si no existe, créala mediante la operación administrativa Add user → Create new user del Dashboard, con correo y contraseña privados; confirma el correo únicamente tras verificar que pertenece al propietario. La alternativa soportada es `auth.admin.createUser({ email, password, email_confirm: true })` en un entorno administrativo privado. Esta llamada no envía un correo de confirmación. Véase [createUser](https://supabase.com/docs/reference/javascript/auth-admin-createuser).
3. Para una cuenta existente sin confirmar, después de verificar la propiedad del correo, usa `auth.admin.updateUserById(userId, { email_confirm: true })`. No cambies su contraseña ni otros datos innecesariamente.
4. Obtén el usuario actual con `getUserById` y comprueba su resultado antes de actualizar. Asigna el marcador con `auth.admin.updateUserById(userId, { app_metadata: { ...user.app_metadata, role: "admin" } })`. Esto conserva los demás metadatos, incluidos los del proveedor. Comprueba el error de la actualización y vuelve a leer el usuario: debe tener correo confirmado y el marcador exacto. Véase [updateUserById](https://supabase.com/docs/reference/javascript/auth-admin-updateuserbyid).
5. Repite la revisión completa de usuarios y confirma que **exactamente una cuenta** tenga ese marcador. El chequeo de rol y las RLS no imponen unicidad. Si hay otra, resuelve manualmente el marcador incorrecto mediante una operación administrativa, conservando sus demás metadatos, antes de habilitar el uso del panel. Inicia una sesión nueva después de cambiar metadatos.

`app_metadata` lo administra una autoridad privilegiada. `user_metadata` puede ser editado por el usuario y no sirve para autorizar este acceso. El rol PostgreSQL `authenticated` identifica usuarios autenticados, no administradores de este portafolio. Véase [usuarios de Supabase](https://supabase.com/docs/guides/auth/users).

Si eliges la API administrativa, ejecútala en una herramienta privada fuera del repositorio, del navegador y del despliegue de la aplicación. Obtén la credencial privilegiada desde el gestor privado de secretos del propietario; úsala solo en ese proceso, con persistencia y renovación de sesión desactivadas. No la pegues en el chat, código, historial de comandos, logs, archivos `.env` de la aplicación ni migraciones. No imprimas respuestas completas, contraseñas o sesiones. Comprueba los errores sin volcarlos y retira la credencial del proceso al terminar. Esta guía no ejecuta operaciones remotas ni contiene credenciales o identificadores reales.

## Pruebas manuales pendientes con Supabase

- Administrador válido: iniciar sesión desde `/admin/login` y llegar exclusivamente a `/admin`.
- Contraseña incorrecta: permanecer en el login con un mensaje genérico de credenciales/permisos.
- Usuario autenticado sin marcador admin: permanecer en el login con el mismo mensaje genérico y verificar que se eliminan las cookies de su sesión local. Usar una cuenta de prueba ya disponible en un entorno de pruebas; las pruebas automáticas no crean cuentas. El cierre usa `scope: "local"` y comprueba su resultado; si falla, se informa que no se pudo completar, sin redirigir. Véase [cierre de sesión](https://supabase.com/docs/guides/auth/signout).
- Envío: comprobar «Iniciando sesión…», controles deshabilitados y ausencia de envíos duplicados; tras un error, recuperar controles y poder reintentar. Comprobar mensajes por campo y foco en el primer campo inválido.
- Simular desconexión y límite de intentos en un entorno de pruebas, sin provocar bloqueos en producción: mensajes comprensibles, sin detalles internos.

Las pruebas locales con dobles de Supabase validan decisiones y llamadas, pero no prueban las credenciales, la configuración remota ni la persistencia real de cookies SSR. La renovación de sesión y la autorización de cada futura ruta/operación necesitan su propia implementación.
