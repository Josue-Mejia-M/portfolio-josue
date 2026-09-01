# Arquitectura futura del portafolio y panel administrativo

## 1. Propósito y alcance

Este documento define la arquitectura objetivo para mantener, dentro de una sola aplicación Next.js, tres ámbitos claramente separados:

- el portafolio público;
- un panel administrativo privado;
- módulos de dominio e infraestructura compartidos por ambos.

Es una guía para cambios futuros. No describe un panel ya implementado ni autoriza por sí misma una migración. La prioridad es conservar una solución sencilla, adecuada para un portafolio personal y con límites suficientes para que la interfaz pública no dependa de detalles administrativos.

La plataforma general ya está decidida: se utilizará Supabase para autenticación, persistencia y almacenamiento de capturas. Permanecen por definir los detalles de modelado, seguridad, sesiones y operación descritos al final del documento.

## 2. Estado actual

La referencia para este análisis es el estado del repositorio al 31 de agosto de 2026. El proyecto usa Next.js 16.3.1 con App Router, React 19, TypeScript estricto, CSS Modules y Lucide React.

### 2.1 Rutas y layout

`src/app` contiene actualmente estas rutas públicas:

| Archivo | URL | Estado actual |
| :--- | :--- | :--- |
| `src/app/page.tsx` | `/` | Renderiza `Hero`. |
| `src/app/sobre-mi/page.tsx` | `/sobre-mi` | Contenido provisional. |
| `src/app/experiencia/page.tsx` | `/experiencia` | Contenido provisional. |
| `src/app/proyectos/page.tsx` | `/proyectos` | Contenido provisional. |
| `src/app/formacion/page.tsx` | `/formacion` | Contenido provisional. |
| `src/app/contacto/page.tsx` | `/contacto` | Contenido provisional. |

`src/app/layout.tsx` es el único layout. Define el documento HTML, idioma, fuentes, metadatos, inicialización del tema y, además, envuelve todas las rutas con `AppShell`. Esa última responsabilidad funciona mientras todas las rutas son públicas, pero haría que cualquier ruta administrativa futura heredara el shell público.

### 2.2 Presentación y estado del cliente

- `AppShell` compone el `Sidebar` público y el área principal.
- `Sidebar` es un Client Component porque usa `usePathname`; consume `navigationItems` y contiene `ThemeToggle`.
- `Hero` es un Server Component de presentación y enlaza a `/proyectos` y al CV estático.
- `ThemeToggle` es un Client Component aislado. Mantiene el tema en `localStorage` con la clave `portfolio-theme` y sincroniza `data-theme` en el elemento `html`.
- Los estilos globales contienen reset, tipografías, tokens de color, espaciado y dimensiones del shell público. Los estilos concretos viven en CSS Modules junto a cada componente.

### 2.3 Datos y tipos

- `src/data/navigation.ts` solo contiene configuración estática de la navegación pública.
- `src/types/navigation.ts` define `NavigationItem`, cuyo `href` es actualmente una unión cerrada de las seis URLs públicas.
- No existe aún una fuente persistente de contenido, una capa de acceso a datos, autenticación, autorización, Server Actions, Route Handlers ni módulos de dominio.

### 2.4 Restricción arquitectónica detectada

El principal acoplamiento actual está en el layout raíz: combina responsabilidades verdaderamente globales con el shell exclusivo del portafolio. La evolución debe separar esas responsabilidades antes de introducir `/admin`, sin cambiar las URLs públicas.

## 3. Decisiones principales

1. **Una sola aplicación y un solo despliegue.** No se crearán un segundo frontend, un monorepo ni un servicio API independiente mientras el tamaño del portafolio no lo justifique.
2. **URLs públicas estables.** Las seis URLs existentes se conservan. Los grupos de rutas de Next.js sirven para organización y layouts, no añaden segmentos a la URL.
3. **El layout raíz será neutral.** Solo será responsable del documento HTML y de recursos compartidos por toda la aplicación.
4. **Cada área tendrá su propio shell.** El portafolio conservará `AppShell`/`Sidebar`; el panel tendrá un shell y navegación administrativos independientes.
5. **La sesión no define el límite de dominio.** Ocultar UI o redirigir desde un layout no sustituye la autorización cerca de los datos y de cada mutación.
6. **Server Components por defecto.** La interactividad se limitará a componentes cliente pequeños, como controles de tema, navegación activa y formularios que realmente la requieran.
7. **Acceso a datos centralizado y solo del servidor.** Las páginas no consultarán directamente una base de datos y los Client Components nunca importarán módulos de acceso a datos.
8. **Sin API interna por costumbre.** Las lecturas se harán desde Server Components mediante la capa de datos y las mutaciones de formularios mediante Server Actions. Se usarán Route Handlers solo cuando exista un consumidor HTTP real, como un webhook o una integración externa.
9. **Separación por responsabilidad, no duplicación indiscriminada.** Se comparte el dominio y la infraestructura; se separan los shells, navegación y componentes específicos de cada experiencia.
10. **Supabase como plataforma.** Supabase Auth gestionará la autenticación, Supabase Database persistirá los proyectos, Supabase Storage almacenará sus capturas y Row Level Security (RLS) controlará el acceso a los datos como una capa adicional de seguridad.
11. **Panel inicial limitado a proyectos.** El panel privado solo cubrirá acceso, inicio administrativo y creación, listado y edición de proyectos. Perfil, experiencia y formación no forman parte del plan actual.

## 4. Estructura objetivo

La siguiente estructura expresa los límites deseados. Los nombres de módulos futuros son ilustrativos; solo deben crearse cuando haya una funcionalidad que los necesite.

```text
src/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── sobre-mi/page.tsx
│   │   ├── experiencia/page.tsx
│   │   ├── proyectos/page.tsx
│   │   ├── formacion/page.tsx
│   │   └── contacto/page.tsx
│   └── admin/
│       ├── login/page.tsx
│       └── (protected)/
│           ├── layout.tsx
│           ├── page.tsx
│           └── proyectos/
│               ├── page.tsx
│               ├── nuevo/page.tsx
│               └── [id]/editar/page.tsx
├── components/
│   ├── layout/
│   │   ├── public/
│   │   └── admin/
│   └── ui/
├── features/
│   └── projects/
├── lib/
│   ├── auth/
│   ├── supabase/
│   └── validation/
├── data/
│   └── navigation/
└── types/
```

### 4.1 Árbol de layouts y URLs

```text
RootLayout (documento, fuentes, tema y estilos globales)
├── (public)/layout.tsx → Public AppShell
│   ├── /
│   ├── /sobre-mi
│   ├── /experiencia
│   ├── /proyectos
│   ├── /formacion
│   └── /contacto
└── /admin
    ├── /admin/login → layout raíz, sin shell privado
    └── (protected)/layout.tsx → verificación + AdminShell
        ├── /admin
        ├── /admin/proyectos
        ├── /admin/proyectos/nuevo
        └── /admin/proyectos/[id]/editar
```

`(public)` y `(protected)` no forman parte de las URLs. Se conserva un único `RootLayout` superior para evitar layouts raíz múltiples y recargas completas al navegar entre áreas. La ruta de login queda fuera del grupo protegido para no heredar el shell del panel ni crear un ciclo de redirección.

No debe existir una ruta equivalente en dos grupos diferentes. Por ejemplo, `app/(public)/proyectos/page.tsx` y otra página que también resuelva a `/proyectos` entrarían en conflicto.

### 4.2 Conservación de URLs públicas

Mover las páginas al grupo `(public)` es una reorganización interna y no agrega ese nombre a la URL.

| URL actual | Ubicación futura | URL resultante | ¿Se conserva? |
| --- | --- | --- | --- |
| `/` | `src/app/(public)/page.tsx` | `/` | Sí, sin cambios. |
| `/sobre-mi` | `src/app/(public)/sobre-mi/page.tsx` | `/sobre-mi` | Sí, sin cambios. |
| `/experiencia` | `src/app/(public)/experiencia/page.tsx` | `/experiencia` | Sí, sin cambios. |
| `/proyectos` | `src/app/(public)/proyectos/page.tsx` | `/proyectos` | Sí, sin cambios. |
| `/formacion` | `src/app/(public)/formacion/page.tsx` | `/formacion` | Sí, sin cambios. |
| `/contacto` | `src/app/(public)/contacto/page.tsx` | `/contacto` | Sí, sin cambios. |

## 5. Responsabilidades por capa

### 5.1 `src/app`: enrutamiento y composición

Los archivos de `app` deben ser delgados. Sus responsabilidades son:

- definir URL, layout, metadata, estados de carga y errores;
- leer parámetros de ruta o búsqueda y validarlos antes de usarlos;
- solicitar DTOs a un módulo de dominio;
- componer componentes de presentación;
- conectar formularios con acciones del servidor.

No deben contener consultas directas a la base de datos, credenciales, reglas de autorización dispersas ni componentes reutilizables grandes.

El futuro `src/app/(public)/layout.tsx` será el único consumidor del shell público. `src/app/admin/(protected)/layout.tsx` compondrá el shell administrativo, pero su verificación no se considerará la única defensa de seguridad.

### 5.2 `src/components/layout`: shells separados

- `layout/public` será propietario de `AppShell`, `Sidebar` y cualquier navegación pública.
- `layout/admin` será propietario de `AdminShell`, navegación administrativa, encabezado de sesión y salida.
- Ningún shell importará al otro.
- Ambos podrán usar primitivas visuales de `components/ui`, pero una primitiva compartida no debe conocer rutas, permisos ni entidades del portafolio.

Los componentes actuales pueden migrarse a `layout/public` cuando se haga la separación de rutas. No es necesario moverlos antes ni reorganizarlos solo por simetría.

### 5.3 `src/components/ui`: primitivas compartidas

Aquí pertenecen elementos genéricos como botones, campos, diálogos o el control de tema cuando sirven a ambas áreas. Deben configurarse mediante props y permanecer ajenos a navegación, persistencia y permisos.

`ThemeToggle` puede seguir siendo compartido porque su estado describe una preferencia global de presentación. Su límite cliente debe permanecer pequeño; no es razón para convertir layouts o páginas completas en Client Components.

### 5.4 `src/features`: módulo de proyectos

El alcance inicial requiere un único módulo vertical para proyectos:

```text
features/projects/
├── model.ts          # Entidades, estados y contratos del módulo
├── dto.ts            # Formas públicas y administrativas mínimas
├── queries.ts        # Lecturas server-only
├── commands.ts       # Escrituras server-only y reglas de negocio
├── validation.ts     # Esquemas o validadores de entrada
├── public/           # Presentación exclusiva del portafolio
└── admin/            # Formularios y tablas exclusivos del panel
```

No todos esos archivos deben existir desde el primer día. Para un módulo pequeño pueden combinarse mientras se mantenga evidente qué código es de servidor y qué DTO puede exponerse al cliente.

El dominio de proyectos es el punto de encuentro entre las dos áreas: el portafolio solicita proyectos publicados y el panel administra esos mismos proyectos. Compartir el dominio no significa compartir sus componentes visuales: la tarjeta pública de proyecto y el formulario administrativo deben permanecer separados. Los componentes públicos no importan componentes administrativos, y viceversa.

### 5.5 `src/lib`: capacidades transversales

- `lib/auth` encapsulará Supabase Auth, sesión, `requireAdmin` y cierre de sesión.
- `lib/supabase` encapsulará los clientes de servidor para Supabase Database y Supabase Storage.
- `lib/validation` contendrá únicamente utilidades realmente compartidas; las reglas específicas permanecen dentro de cada feature.

Los módulos que accedan a secretos, sesión o persistencia deben marcarse como `server-only`. Solo esta capa y los módulos server-only de features podrán leer variables privadas de entorno.

### 5.6 `src/data` y `src/types`

El `src/data` actual es configuración estática, no una capa de persistencia. La navegación pública y la administrativa deben convertirse en configuraciones distintas, aunque compartan un tipo base. El menú administrativo nunca debe añadirse a `navigationItems` público.

La unión de URLs de `NavigationItem` es útil hoy para el menú público. Cuando exista el panel, no debe crecer hasta mezclar todas las rutas. Se definirán contratos separados para navegación pública y administrativa o un tipo base genérico con valores específicos en cada configuración.

`src/types` se reserva para contratos verdaderamente transversales. Los tipos de proyecto vivirán junto a `features/projects` para evitar un directorio global sin dueño.

### 5.7 Elementos compartidos entre áreas

La siguiente tabla distingue lo que ambas áreas pueden compartir de lo que debe mantener contratos o presentaciones diferentes:

| Elemento | Ubicación propuesta | Área pública | Área administrativa | Responsabilidad |
| --- | --- | --- | --- | --- |
| Tokens globales y sistema de tema | `src/app/globals.css` y `src/components/ui/ThemeToggle` | Sí | Sí | Mantener colores base, tipografías, espaciado y preferencia de tema comunes, sin acoplar los shells. |
| Componentes UI genéricos | `src/components/ui` | Sí | Sí | Proveer primitivas configurables y sin conocimiento de rutas, permisos o persistencia. |
| Modelo y tipos de proyecto | `src/features/projects/model.ts` | Sí | Sí | Definir la entidad, estado de publicación y contratos comunes del dominio. |
| DTO público de proyecto | `src/features/projects/dto.ts` | Sí | No | Exponer únicamente los campos publicados necesarios para las páginas y tarjetas públicas. |
| DTO administrativo de proyecto | `src/features/projects/dto.ts` | No | Sí | Exponer los campos editables y metadatos que necesita el panel, sin datos de sesión ni secretos. |
| Validaciones | `src/features/projects/validation.ts` | Lectura de contratos seguros cuando aplique | Sí | Validar en el servidor identificadores, parámetros y entradas de creación o edición. |
| Acceso server-only a Supabase | `src/lib/supabase/server.ts` y módulos server-only de `src/features/projects` | Indirecto | Indirecto | Centralizar Supabase Database, Storage y Auth en el servidor; aplicar autorización, RLS y DTOs mínimos. |

Las dos áreas comparten el modelo y las reglas del proyecto, no su interfaz. `features/projects/public` será propietario de la tarjeta o listado público y `features/projects/admin` será propietario de formularios, tablas y controles privados.

## 6. Reglas de dependencia

La dirección permitida será:

```text
app público ────────┐
                    ├──> features ──> lib/supabase
app administrativo ┘          └─────> lib/auth (solo operaciones privadas)

layouts público/admin ──> components/ui
features/*/public  ─────> components/ui
features/*/admin   ─────> components/ui
```

Reglas concretas:

- `components/ui` no importa de `app`, `features`, `data` ni `auth`.
- el código público no importa componentes de `features/*/admin` ni navegación administrativa;
- el código administrativo no reutiliza `AppShell` o `Sidebar` públicos;
- los Client Components no importan `queries`, `commands`, el cliente de base de datos ni secretos;
- `queries` y `commands` no dependen de componentes React;
- ninguna página o componente omite los módulos server-only para consultar directamente Supabase;
- no se crean archivos índice globales que reexporten accidentalmente módulos server-only hacia el grafo cliente.

## 7. Modelo de contenido y flujo de publicación

Para evitar que un borrador administrativo aparezca en el sitio público, los proyectos deben representar explícitamente su estado de publicación. El contrato mínimo recomendado es:

- identificador estable;
- datos propios de la entidad;
- `status`: `draft` o `published`;
- orden de presentación cuando aplique;
- fechas de creación y actualización;
- fecha de publicación opcional.

El flujo será:

```text
Formulario admin
    → Server Action
    → validación de entrada
    → autenticación y autorización
    → command server-only
    → Supabase Database y, para capturas, Supabase Storage
    → invalidación/revalidación
    → consulta pública devuelve solo published
```

Las consultas públicas devolverán DTOs mínimos sin campos internos. Las consultas administrativas podrán devolver más información, pero tampoco expondrán secretos, datos de sesión ni registros completos si la interfaz no los necesita.

Supabase Database será la fuente persistente de los proyectos y Supabase Storage almacenará sus capturas. La estrategia exacta de caché se decidirá al implementar el módulo. Como regla, una escritura exitosa debe invalidar únicamente las rutas o etiquetas afectadas; no se añadirá caché antes de tener una necesidad medible.

## 8. Autenticación y seguridad

El panel está pensado para un único propietario, por lo que no necesita inicialmente organizaciones ni un sistema complejo de roles. Sí necesita autenticación robusta y una autorización explícita equivalente a `ADMIN`.

### 8.1 Capas de protección

1. **Proveedor y sesión.** Supabase Auth será el proveedor de autenticación. La configuración exacta de sesiones queda pendiente y deberá ser compatible con Next.js 16.3.1, usar cookies seguras y mantener la validación del lado del servidor.
2. **Redirección temprana opcional.** Un futuro `src/proxy.ts` puede realizar una comprobación optimista y barata para redirigir `/admin/:path*`. En Next.js 16 la convención se llama Proxy, no Middleware. No debe consultar la base de datos ni ser la defensa principal.
3. **DAL y operaciones.** `requireAdmin` debe verificarse cerca de cada lectura privada y dentro de cada escritura. Una comprobación en el layout no protege por sí sola páginas anidadas, Server Actions o Route Handlers.
4. **Entradas públicas.** Cada Server Action se tratará como un endpoint invocable directamente: validará datos no confiables, reautorizará al usuario y devolverá solo el resultado mínimo que la UI necesite.
5. **Route Handlers.** Si se añaden, verificarán sesión y permiso por sí mismos y usarán códigos HTTP coherentes. No heredarán la protección visual de un layout.
6. **Row Level Security.** RLS se habilitará sobre las tablas y operaciones expuestas de Supabase. Las políticas concretas deben permitir lectura pública únicamente de proyectos publicados y reservar las escrituras al administrador autenticado. RLS complementa, pero no sustituye, las comprobaciones de autorización de la aplicación.

También deben contemplarse limitación de intentos de acceso, mensajes de error que no filtren credenciales, protección de secretos mediante variables de entorno no públicas y auditoría de operaciones destructivas. Las acciones destructivas deben requerir una intención inequívoca en la interfaz y conservar una vía de recuperación cuando el modelo de datos lo permita.

### 8.2 Límites de datos cliente/servidor

- Las páginas y layouts permanecen como Server Components salvo necesidad concreta.
- `use client` se coloca en la hoja más pequeña que necesite estado, eventos o APIs del navegador.
- Todo valor enviado a un Client Component se considera visible para el usuario.
- Los DTOs enviados al cliente deben ser serializables y contener únicamente los campos requeridos.
- Las variables privadas de entorno nunca usan el prefijo `NEXT_PUBLIC_`.

## 9. Estilos y tema

`globals.css` seguirá siendo el punto de entrada global para reset, fuentes, accesibilidad y tokens realmente compartidos. Los estilos de un shell o feature permanecerán en CSS Modules junto a su componente.

Los tokens actuales mezclan fundamentos globales (`--background`, espaciado, radios) con decisiones del shell público (`--sidebar-width`, `--sidebar-background`). Durante la futura migración:

- los tokens neutrales y de tema se mantienen globales;
- los tokens exclusivos del shell público se acercan a `layout/public` o se delimitan bajo un atributo de área;
- el panel define sus propios tokens de shell sin sobrescribir accidentalmente los del portafolio;
- se conserva `data-theme` en `html` si ambas áreas comparten la misma preferencia de tema.

No se introducirá un segundo sistema de estilos solo para el panel. CSS Modules y los tokens existentes cubren el tamaño previsto del proyecto.

## 10. Estrategia de evolución

La implementación futura debe avanzar en cambios pequeños y verificables:

### Fase 1: separar layouts sin alterar comportamiento

- crear `(public)` y mover allí las páginas conservando exactamente sus URLs;
- mantener `app/layout.tsx` como layout raíz neutral;
- colocar `AppShell` únicamente en el layout público;
- comprobar navegación, metadata, tema, CV y estilos antes y después.

### Fase 2: introducir el límite administrativo

- añadir `/admin/login` fuera del grupo protegido;
- integrar Supabase Auth con una configuración de sesión compatible con Next.js 16.3.1;
- añadir `admin/(protected)` con su propio shell;
- implementar `requireAdmin` y pruebas de acceso no autorizado antes de formularios o CRUD.

### Fase 3: implementar el módulo de proyectos

- configurar Supabase Database, Storage y las políticas RLS necesarias para proyectos;
- crear el acceso server-only y los DTOs público y administrativo;
- implementar `/admin`, `/admin/proyectos`, `/admin/proyectos/nuevo` y `/admin/proyectos/[id]/editar`;
- comprobar borrador, publicación, edición, revalidación y exposición pública.

### Fase 4: endurecimiento y limpieza

- probar autorización en páginas, acciones y handlers;
- probar las políticas RLS para lectura pública y escritura administrativa;
- revisar que los bundles cliente no incluyan módulos server-only;
- comprobar accesibilidad, estados vacíos, errores y operaciones destructivas;
- actualizar este documento si la implementación final difiere de las decisiones descritas.

Cada fase debe poder desplegarse sin exigir la siguiente. No se crearán carpetas, abstracciones o módulos vacíos por adelantado.

La administración de perfil, experiencia o formación podrá evaluarse como ampliación futura, pero no forma parte del alcance ni del plan de implementación actuales.

## 11. Criterios de aceptación de la arquitectura implementada

La evolución se considerará alineada con este documento cuando:

- las URLs públicas actuales sigan funcionando sin redirecciones innecesarias;
- el portafolio use exclusivamente su shell y navegación públicos;
- `/admin/login` sea accesible sin el shell privado;
- `/admin`, `/admin/proyectos`, `/admin/proyectos/nuevo` y `/admin/proyectos/[id]/editar` requieran una sesión administrativa válida;
- el panel inicial no incluya módulos administrativos de perfil, experiencia o formación;
- las comprobaciones de autorización existan también dentro de lecturas privadas y mutaciones;
- el contenido público solo pueda leer registros publicados mediante DTOs públicos;
- Supabase Auth, Database, Storage y RLS cumplan las responsabilidades definidas en este documento;
- ninguna dependencia de persistencia o secreto entre en el grafo cliente;
- los componentes compartidos sean neutrales respecto del área;
- el tema y los estilos globales no acoplen los dos shells;
- la solución permanezca en una sola aplicación, sin capas de red o servicios que no respondan a un requisito real.

## 12. Detalles pendientes de Supabase

La plataforma ya no es una decisión pendiente: la solución utilizará Supabase. Antes de implementar las fases 2 y 3 todavía se deberán definir y documentar:

- el modelo de datos exacto de los proyectos;
- las políticas RLS concretas;
- la estructura de los buckets de Supabase Storage;
- la configuración de sesiones de Supabase Auth;
- las variables de entorno por ambiente;
- el proceso de respaldo y migraciones.

Estas definiciones pendientes no cambian la decisión de utilizar Supabase Auth, Supabase Database, Supabase Storage y Row Level Security.
