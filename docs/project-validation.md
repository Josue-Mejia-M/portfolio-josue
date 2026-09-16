# Validación administrativa de proyectos

La ruta privada `/admin/proyectos/nuevo` valida los datos antes de que exista
una operación de creación. Esta documentación describe el contrato actual de
la Tarea 23; no describe una API de persistencia ni habilita la Tarea 24.

## Flujo

```text
Formulario cliente → Server Action validateNewProject → requireAdmin
                                         ↓
                              validateProjectForm(FormData)
                                         ↓
                 estado con values + fieldErrors, sin acceso a Supabase
```

`validateNewProject` vuelve a comprobar el rol administrativo. El layout y la
página también están protegidos, pero esas protecciones no sustituyen la
autorización dentro de una Server Action invocable directamente.

El módulo `actions.ts` usa `"use server"` y exporta exclusivamente la función
asíncrona `validateNewProject`. Los tipos y el estado inicial de `useActionState`
viven en `src/features/projects/form-state.ts`, un módulo sin esa directiva que
se puede importar desde el componente cliente. Esta separación es obligatoria:
exportar objetos o constantes desde `actions.ts` produciría el error de ejecución
de Next.js: `A "use server" file can only export async functions`.

## Contrato de resultado

La interfaz recibe un estado serializable con esta forma:

```ts
{
  success: boolean;
  message: string;
  values: ProjectFormValues;
  fieldErrors?: Partial<Record<keyof ProjectFormValues, string>>;
}
```

Los valores textuales se conservan recortando únicamente los espacios iniciales
y finales. Los errores se indexan con el mismo `name` del control HTML, se
anuncian junto al control y, tras la respuesta, el foco se mueve al primer
campo con error.

## Reglas de dominio

La fuente funcional es [project-fields.md](project-fields.md), reforzada por la
migración `20260901204447_create_projects.sql`.

- `title`: 3–80 caracteres; `description`: 40–300; `learning`: 30–600. Los
  tres son obligatorios y texto plano.
- `slug`: 3–100 caracteres y expresión `^[a-z0-9]+(-[a-z0-9]+)*$`.
- Los enlaces son opcionales, pero, si se informan, deben ser URL absolutas
  HTTPS válidas.
- Los enums son `personal|academic|professional`,
  `in_progress|completed|paused` y `draft|published`.
- `display_order` es un entero de 0 a 2,147,483,647.
- `is_featured` solo acepta la codificación real de un checkbox HTML: `on` o
  la ausencia del campo para `false`.
- Cada tecnología se recorta, debe tener 1–30 caracteres, no puede repetirse
  ignorando mayúsculas/minúsculas y la lista no puede superar 12 elementos.

Los borradores pueden no tener tecnologías. Un estado `published` se rechaza
temporalmente: el esquema exige tecnologías y tres rutas de captura, pero las
capturas siguen siendo visuales y no existen inputs ni Storage en esta tarea.

## Límites explícitos

No hay llamadas a `insert`, `update`, `delete`, Supabase Storage ni consultas
para verificar la unicidad del slug. Un resultado exitoso solo significa que
los datos actuales son válidos; no crea ni modifica un proyecto.

## Pruebas

`tests/project-validation.test.mjs` ejecuta el validador y la Server Action
real con dependencias aisladas. Cubre datos válidos, campos vacíos, slug, URLs,
tecnologías, enums, orden, checkbox manipulado, publicación incompleta,
conservación de valores y reautorización sin importaciones de persistencia.
