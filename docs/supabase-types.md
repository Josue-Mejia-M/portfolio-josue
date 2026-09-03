# Tipos de Supabase

`src/types/database.ts` representa el esquema conocido de Supabase para el portafolio. `src/types/project.ts` deriva de ese esquema los alias `Project`, `ProjectInsert` y `ProjectUpdate`, que resultan más cómodos para el código de la aplicación.

Las migraciones SQL son la fuente de verdad del esquema. Los tipos deben actualizarse después de cambiar tablas, columnas o funciones. Supabase permite generarlos desde el Dashboard y también regenerarlos mediante Supabase CLI. La CLI no está instalada como dependencia de este proyecto y no debe instalarse ni ejecutarse como parte de esta tarea.

El comando oficial de referencia es:

```bash
npx supabase@latest gen types typescript --project-id YOUR_PROJECT_REF --schema public > src/types/database.ts
```

En PowerShell, la redirección puede variar según la versión y su codificación. Una alternativa equivalente es:

```powershell
npx supabase@latest gen types typescript --project-id YOUR_PROJECT_REF --schema public |
  Set-Content -Encoding utf8 src/types/database.ts
```

`YOUR_PROJECT_REF` debe obtenerse desde el panel de Supabase. Es la referencia del proyecto, no la contraseña de la base de datos.

Antes de sobrescribir el archivo actual, hay que revisar el resultado generado. Después de regenerar los tipos:

1. Revisar el diff.
2. Confirmar que `Project`, `ProjectInsert` y `ProjectUpdate` siguen compilando.
3. Ejecutar lint.
4. Ejecutar build.
5. Guardar juntos la migración y los tipos actualizados.
