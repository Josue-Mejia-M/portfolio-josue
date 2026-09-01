# Diccionario de campos de proyectos

## 1. Propósito y alcance

Este documento define el contrato conceptual de los campos principales de cada proyecto que se administrará desde el futuro panel privado y que podrá alimentar la card destacada de Inicio y la futura página pública `/proyectos`.

Su alcance se limita a nombres, significado, obligatoriedad, validaciones, representaciones técnicas previstas y uso esperado de los datos. No define una implementación de persistencia, formularios, componentes ni rutas dinámicas. Los tipos TypeScript incluidos al final son ejemplos conceptuales para una implementación futura, no código creado en esta tarea. Actualmente `/proyectos` contiene texto provisional y no existe una fuente persistente de proyectos; por tanto, este diccionario describe el comportamiento futuro.

## 2. Contenido, control y datos automáticos

- **Contenido:** información que describe el proyecto y que el usuario administrador redacta o selecciona, como el título, la descripción, el aprendizaje, las capturas, las tecnologías, la clasificación y los enlaces.
- **Control:** información que determina el flujo editorial o la presentación del proyecto, como su estado de publicación, su orden y si puede aparecer como destacado. No describe por sí sola el contenido del proyecto.
- **Datos automáticos:** identificadores y marcas de tiempo administrados por el sistema o la base de datos. El usuario puede consultarlos cuando sea útil, pero no editarlos directamente.

`development_status` es contenido descriptivo porque expresa la situación real del desarrollo. `publication_status`, `is_featured` y `display_order` son campos de control editorial o de presentación. Esta distinción evita deducir la visibilidad pública a partir del avance técnico o del orden del proyecto.

No se añadirán campos llamados `published` ni `featured`. `publication_status` ya cumple la responsabilidad que podría atribuirse a `published`: el valor `published` indica que el proyecto está publicado y `draft` que es borrador. `is_featured` ya cumple la responsabilidad que podría atribuirse a `featured`: `true` indica la selección como destacado y `false` su ausencia. Mantener un único campo para cada responsabilidad evita datos duplicados y estados contradictorios.

## 3. Tabla principal

| Nombre visible | Nombre técnico | Tipo conceptual | Requisito | Longitud o valores permitidos | Valor inicial | Uso |
| --- | --- | --- | --- | --- | --- | --- |
| Título | `title` | Contenido: texto corto | Obligatorio | 3 a 80 caracteres | Sin valor predeterminado | Nombre visible del proyecto. |
| Slug | `slug` | Contenido: identificador legible | Obligatorio | 3 a 100 caracteres; minúsculas, números y guiones | Generado inicialmente desde `title` | Identificación legible y única; preparado para usos futuros. |
| Descripción | `description` | Contenido: texto corto | Obligatorio | 40 a 300 caracteres; sin HTML | Sin valor predeterminado | Resumen público para cards y listados. |
| Tipo de proyecto | `project_type` | Contenido: selección cerrada | Obligatorio | `personal`, `academic`, `professional` | Sin valor predeterminado | Clasificación del contexto del proyecto. |
| Estado de desarrollo | `development_status` | Contenido: selección cerrada | Obligatorio | `in_progress`, `completed`, `paused` | Sin valor predeterminado | Comunica la situación real del desarrollo. |
| Estado de publicación | `publication_status` | Control: selección cerrada | Obligatorio | `draft`, `published` | `draft` | Controla la visibilidad dentro del portafolio. |
| Orden de presentación | `display_order` | Control: número entero | Obligatorio | Entero mayor o igual que `0` | `0` | Ordena los listados; los números menores aparecen primero. |
| Aprendizaje | `learning` | Contenido: texto | Obligatorio | 30 a 600 caracteres; sin HTML | Sin valor predeterminado | Explica conocimientos o experiencia obtenidos. |
| Captura de escritorio | `desktop_image_path` | Contenido: ruta de archivo | Condicional para publicar | Texto; puede estar ausente en borradores | Sin valor (`null` o equivalente por definir) | Identifica el objeto de la captura para escritorio. |
| Captura de tablet | `tablet_image_path` | Contenido: ruta de archivo | Condicional para publicar | Texto; puede estar ausente en borradores | Sin valor (`null` o equivalente por definir) | Identifica el objeto de la captura para tablet. |
| Captura de teléfono | `mobile_image_path` | Contenido: ruta de archivo | Condicional para publicar | Texto; puede estar ausente en borradores | Sin valor (`null` o equivalente por definir) | Identifica el objeto de la captura para teléfono. |
| Tecnologías | `technologies` | Contenido: lista ordenada de textos | Condicional para publicar | De 1 a 12 elementos válidos al publicar | Lista vacía | Tecnologías utilizadas en su orden de presentación. |
| URL del repositorio | `repository_url` | Contenido: URL | Opcional | URL HTTPS válida | Sin valor (`null` o equivalente por definir) | Destino de “Ver código”, si existe. |
| URL del sitio | `live_url` | Contenido: URL | Opcional | URL HTTPS válida | Sin valor (`null` o equivalente por definir) | Destino para visitar el proyecto, si existe. |
| Identificador | `id` | Dato automático: identificador interno | Obligatorio | Formato por definir en el modelo de datos | Generado automáticamente | Identidad estable del registro. |
| Proyecto destacado | `is_featured` | Control: booleano | Obligatorio | `true` o `false` | `false` | Habilita su selección para la sección destacada de Inicio. |
| Fecha de creación | `created_at` | Dato automático: fecha y hora | Obligatorio | Fecha y hora | Generada automáticamente | Auditoría de creación del registro. |
| Fecha de actualización | `updated_at` | Dato automático: fecha y hora | Obligatorio | Fecha y hora | Generada y actualizada automáticamente | Auditoría de la última modificación. |

## 4. Detalle de cada campo

### 4.1 `title`

Nombre visible del proyecto. Es obligatorio y debe contener entre 3 y 80 caracteres después de eliminar los espacios innecesarios al inicio y al final. El valor normalizado es el que debe validarse y conservarse.

### 4.2 `slug`

Identificador legible y único. Es obligatorio, debe contener entre 3 y 100 caracteres y seguirá las reglas específicas de la sección 6. Se generará inicialmente desde `title`, pero será un dato independiente: un cambio posterior en el título no debe modificar automáticamente un slug ya conservado.

El slug queda preparado como identificador estable para usos futuros. En esta etapa no se implementarán rutas dinámicas que lo utilicen.

### 4.3 `description`

Resumen corto que explica qué es el proyecto y cuál es su propósito. Es obligatorio, debe contener entre 40 y 300 caracteres y debe almacenarse como texto plano, sin HTML. Es el texto principal previsto para las cards públicas.

### 4.4 `project_type`

Clasifica el contexto en el que se desarrolló el proyecto. Es obligatorio y solo admite los valores técnicos definidos en la sección 5. La interfaz pública mostrará su etiqueta en español, no necesariamente el valor técnico.

### 4.5 `development_status`

Representa el estado real del trabajo de desarrollo. Es obligatorio y solo admite los valores de la sección 5. El valor `completed` produce la etiqueta pública “Finalizado”, incluida la que podrá mostrarse en la card destacada.

Este campo no controla si el registro es visible. Por ejemplo, un proyecto finalizado puede continuar como borrador mientras se revisa su contenido.

### 4.6 `publication_status`

Controla la visibilidad del proyecto dentro del portafolio. Es obligatorio, comienza en `draft` y solo admite `draft` o `published`.

- Un proyecto `draft` solo podrá consultarse desde el panel administrativo.
- El portafolio público solo podrá consultar proyectos `published`.

Su responsabilidad es diferente de `development_status`: publicación expresa una decisión editorial; desarrollo expresa el avance real del proyecto. En consecuencia, `development_status: completed` junto con `publication_status: draft` es una combinación válida.

Este campo representa por sí solo la publicación. No debe coexistir con otro campo `published`, porque hacerlo permitiría expresar estados contradictorios.

### 4.7 `display_order`

Número entero obligatorio con valor inicial `0`. Debe ser mayor o igual que cero. Los valores menores aparecen primero y un mismo valor puede repetirse entre proyectos.

Cuando dos proyectos tengan el mismo `display_order`, el orden se resolverá de forma estable mediante `created_at` descendente y después `id`. Este campo solo influye en el orden de los listados: no publica un proyecto, no lo convierte en destacado y no decide cuál aparece en la sección destacada de Inicio.

### 4.8 `learning`

Explica los conocimientos, decisiones o experiencia que dejó el proyecto. Es obligatorio, debe contener entre 30 y 600 caracteres y debe almacenarse como texto plano, sin HTML. Podrá utilizarse en la futura página `/proyectos`, aunque la card destacada no tiene que mostrarlo completo.

### 4.9 `desktop_image_path`

Ruta del archivo de la captura para escritorio. Es texto y puede estar ausente mientras el proyecto sea `draft`, pero debe tener valor para cambiarlo a `published`.

### 4.10 `tablet_image_path`

Ruta del archivo de la captura para tablet. Es texto y puede estar ausente mientras el proyecto sea `draft`, pero debe tener valor para cambiarlo a `published`.

### 4.11 `mobile_image_path`

Ruta del archivo de la captura para teléfono. Es texto y puede estar ausente mientras el proyecto sea `draft`, pero debe tener valor para cambiarlo a `published`.

Los tres campos de captura serán persistentes e independientes. Los archivos se almacenarán posteriormente en Supabase Storage; la base de datos conservará las rutas de los objetos, no el contenido binario ni necesariamente sus URLs públicas completas. La futura capa de acceso a datos convertirá esas rutas en `desktopUrl`, `tabletUrl` y `mobileUrl`, tres URLs utilizables por la interfaz.

El nombre del bucket, las políticas de Storage, los límites de peso, las dimensiones exactas, los formatos definitivos y el código de carga o eliminación se decidirán en una tarea posterior dedicada a Supabase Storage.

### 4.12 `technologies`

Lista ordenada de textos que representa las tecnologías utilizadas. Su forma conceptual en TypeScript es `string[]` y su representación prevista en PostgreSQL/Supabase es `text[]`. Puede estar vacía mientras el proyecto sea `draft`; para cambiar a `published` debe contener entre 1 y 12 tecnologías.

Cada elemento debe cumplir todas estas reglas después de eliminar sus espacios exteriores:

- contener entre 1 y 30 caracteres;
- no ser un valor vacío;
- no duplicar otro elemento de la lista al comparar sin distinguir mayúsculas y minúsculas.

El orden de los elementos será su orden de presentación. Por ejemplo:

1. `HTML`
2. `CSS`
3. `JavaScript`

Para el alcance actual del portafolio, una lista de textos es suficiente y no se creará una tabla independiente de tecnologías. Una tabla normalizada solo se evaluará en el futuro si se necesitan iconos administrables, filtros complejos, estadísticas o metadatos propios por tecnología.

### 4.13 `repository_url`

Enlace opcional al repositorio, ya sea GitHub u otro proveedor. Cuando exista debe ser una URL HTTPS válida. La ausencia del valor permite representar proyectos con código privado y obliga a la interfaz pública a omitir el botón “Ver código”.

### 4.14 `live_url`

Enlace opcional al despliegue accesible del proyecto. Cuando exista debe ser una URL HTTPS válida. Si está ausente, la interfaz pública debe omitir el botón destinado a visitar el sitio.

### 4.15 `id`

Identificador interno obligatorio, estable y generado automáticamente por la base de datos. El usuario no lo editará. Su formato concreto se decidirá al diseñar el modelo de datos.

### 4.16 `is_featured`

Booleano obligatorio con valor inicial `false`. Indica si el proyecto puede aparecer en la sección destacada de Inicio, pero no lo publica. Para aparecer públicamente debe cumplirse también `publication_status: published`.

Solo puede existir un proyecto con `is_featured: true`, y ese proyecto debe tener `publication_status: published`. Este campo representa por sí solo la selección como destacado y no debe coexistir con otro campo `featured`.

### 4.17 `created_at`

Fecha y hora obligatoria de creación del registro, generada automáticamente. No será editable desde el formulario administrativo.

### 4.18 `updated_at`

Fecha y hora obligatoria de la última modificación, generada y actualizada automáticamente. No será editable directamente desde el formulario administrativo.

## 5. Valores permitidos para tipo y estados

### 5.1 Tipo de proyecto

| Valor técnico | Etiqueta pública | Significado |
| --- | --- | --- |
| `personal` | Proyecto personal | Iniciativa desarrollada por interés, práctica o necesidad propia. |
| `academic` | Proyecto académico | Trabajo realizado en un contexto educativo. |
| `professional` | Proyecto profesional | Trabajo realizado en un contexto laboral o para un cliente. |

### 5.2 Estado de desarrollo

| Valor técnico | Etiqueta pública | Significado |
| --- | --- | --- |
| `in_progress` | En desarrollo | El proyecto continúa en construcción. |
| `completed` | Finalizado | El alcance previsto se considera terminado. |
| `paused` | Pausado | El desarrollo está detenido temporalmente. |

### 5.3 Estado de publicación

| Valor técnico | Visibilidad | Significado |
| --- | --- | --- |
| `draft` | Solo panel administrativo | El contenido todavía no forma parte del portafolio público. |
| `published` | Portafolio público y panel | El proyecto puede ser consultado por las vistas públicas. |

Los estados de publicación no reemplazan los estados de desarrollo y no deben compartir etiquetas ni lógica.

## 6. Reglas del slug

El slug deberá cumplir todas estas condiciones:

- ser obligatorio y único entre proyectos;
- contener entre 3 y 100 caracteres;
- usar exclusivamente letras minúsculas de `a` a `z`, números de `0` a `9` y guiones (`-`);
- no comenzar ni terminar con guion;
- no contener espacios, mayúsculas, tildes, eñes ni otros símbolos en su forma final;
- generarse inicialmente a partir del título mediante una normalización cuya estrategia exacta se definirá al implementar;
- conservarse cuando el título cambie, salvo que el administrador decida modificarlo explícitamente y el nuevo valor sea válido y único.

Ejemplo válido: `pagina-de-cafeteria`.

La resolución de colisiones al generar dos slugs iguales queda pendiente para la implementación. No se crearán todavía rutas como `/proyectos/[slug]`.

## 7. Reglas de los enlaces

- `repository_url` y `live_url` son independientes y opcionales.
- Cuando se informe alguno, debe ser una URL absoluta y válida cuyo esquema sea `https`.
- No se aceptarán rutas relativas ni URLs con `http`.
- Los espacios al inicio o al final deben eliminarse antes de validar.
- La ausencia debe representarse como falta de valor, no como una cadena vacía destinada a una URL.
- Si `repository_url` no existe, no se renderizará “Ver código”.
- Si `live_url` no existe, no se renderizará el botón para visitar el sitio.
- La visibilidad de cada botón depende únicamente de que su URL correspondiente exista y sea válida; un enlace no sustituye al otro.

## 8. Reglas para guardar borradores

Un proyecto con `publication_status: draft` podrá guardarse aunque todavía no tenga:

- `desktop_image_path`, `tablet_image_path` o `mobile_image_path`;
- elementos en `technologies`;
- `repository_url`;
- `live_url`.

Esta flexibilidad no elimina las reglas de los campos principales aprobadas previamente. `title`, `slug`, `description`, `project_type`, `development_status` y `learning` continúan siendo obligatorios y conservan sus longitudes, valores permitidos y reglas de normalización actuales. `display_order` también es obligatorio desde el borrador y debe ser un entero mayor o igual que cero.

## 9. Reglas para publicar

Para cambiar un proyecto a `publication_status: published` deberá cumplir simultáneamente:

1. Todos los campos textuales obligatorios aprobados previamente son válidos.
2. `desktop_image_path` tiene valor.
3. `tablet_image_path` tiene valor.
4. `mobile_image_path` tiene valor.
5. `technologies` contiene entre 1 y 12 elementos válidos conforme a la sección 4.12.
6. `display_order` es un entero mayor o igual que cero.

`repository_url` y `live_url` continúan siendo opcionales incluso para un proyecto publicado. Estas condiciones son reglas conceptuales; las validaciones y restricciones concretas se implementarán en una tarea posterior.

## 10. Orden de la consulta pública

La futura consulta pública seguirá conceptualmente estos criterios, en este orden:

1. incluir solo registros con `publication_status = published`;
2. ordenar por `display_order` ascendente;
3. ordenar después por `created_at` descendente;
4. usar `id` como desempate estable final.

`display_order` puede repetirse y solo controla la posición en las listas. Esta tarea no incluye consultas ni SQL.

## 11. Reglas para seleccionar el proyecto destacado

Para que un proyecto sea destacado debe cumplir simultáneamente:

1. `is_featured` debe ser `true`.
2. `publication_status` debe ser `published`.

Se aplican además estas reglas:

- solo un proyecto puede tener `is_featured: true`;
- un borrador no puede convertirse en destacado;
- al seleccionar un nuevo destacado, el anterior debe cambiar a `is_featured: false` dentro de una operación consistente;
- si un proyecto destacado vuelve a `publication_status: draft`, `is_featured` debe cambiar a `false` dentro de la misma operación consistente;
- si no existe un proyecto destacado publicado, Inicio no debe mostrar datos de un borrador;
- `display_order` no decide cuál es el proyecto destacado.

La futura base de datos deberá reforzar la regla de un solo destacado, por ejemplo mediante una restricción o un índice único parcial. La elección técnica y su implementación, incluido cualquier SQL, quedan fuera de esta tarea.

## 12. Ejemplo conceptual: “Página de cafetería”

El siguiente ejemplo ilustra el contrato; no representa un registro real ni crea enlaces reales:

| Campo | Valor conceptual |
| --- | --- |
| `id` | Generado automáticamente por la base de datos |
| `title` | `Página de cafetería` |
| `slug` | `pagina-de-cafeteria` |
| `description` | `Sitio web para presentar el menú, la ubicación y la propuesta de una cafetería local.` |
| `project_type` | `personal` |
| `development_status` | `completed` |
| `publication_status` | `published` |
| `display_order` | `0` |
| `learning` | `Permitió practicar la organización de contenido, el diseño adaptable y la construcción de una experiencia clara para consultar productos y datos del negocio.` |
| `desktop_image_path` | `projects/pagina-de-cafeteria/desktop.webp` (ruta ilustrativa) |
| `tablet_image_path` | `projects/pagina-de-cafeteria/tablet.webp` (ruta ilustrativa) |
| `mobile_image_path` | `projects/pagina-de-cafeteria/mobile.webp` (ruta ilustrativa) |
| `technologies` | `HTML`, `CSS`, `JavaScript`, en ese orden |
| `repository_url` | Sin valor; el botón “Ver código” no se mostraría |
| `live_url` | `https://example.com/pagina-de-cafeteria` (URL reservada, solo ilustrativa) |
| `is_featured` | `true` |
| `created_at` | Generada automáticamente al crear el registro |
| `updated_at` | Actualizada automáticamente con la última modificación |

Con estos valores, el proyecto podría aparecer públicamente y ser el destacado de Inicio. Su estado visible de desarrollo sería “Finalizado”.

## 13. Relación de campos con cada superficie

| Campo | Card destacada de Inicio | Futura página `/proyectos` | Panel administrativo |
| --- | --- | --- | --- |
| `title` | Sí, nombre principal | Sí | Sí, editable |
| `slug` | No es necesario para la primera versión | Podrá usarse como identificador futuro, sin ruta dinámica en esta tarea | Sí, consultable y editable bajo validación |
| `description` | Sí, resumen principal | Sí | Sí, editable |
| `project_type` | Puede mostrar la etiqueta pública | Sí, como clasificación | Sí, editable |
| `development_status` | Sí; `completed` muestra “Finalizado” | Sí, con etiqueta pública | Sí, editable |
| `publication_status` | Filtro obligatorio: solo `published` | Filtro obligatorio: solo `published` | Sí, editable y visible para borradores |
| `display_order` | No selecciona el destacado | Sí, determina el orden del listado | Sí, editable |
| `learning` | Opcional o resumido en la presentación | Sí, podrá mostrarse | Sí, editable |
| `desktop_image_path` | Disponible como `desktopUrl` mediante la capa de datos | Disponible como `desktopUrl` mediante la capa de datos | Sí, editable y exigido para publicar |
| `tablet_image_path` | Disponible como `tabletUrl` mediante la capa de datos | Disponible como `tabletUrl` mediante la capa de datos | Sí, editable y exigido para publicar |
| `mobile_image_path` | Disponible como `mobileUrl` mediante la capa de datos | Disponible como `mobileUrl` mediante la capa de datos | Sí, editable y exigido para publicar |
| `technologies` | Puede usar la lista ordenada | Sí, en el orden almacenado | Sí, editable y exigido para publicar |
| `repository_url` | Botón condicional “Ver código” | Enlace condicional | Sí, editable y opcional |
| `live_url` | Botón condicional para visitar el sitio | Enlace condicional | Sí, editable y opcional |
| `id` | No | No es necesario exponerlo | Sí, como referencia no editable cuando sea útil |
| `is_featured` | Criterio obligatorio de selección | No controla su presencia en el listado | Sí, editable con la regla de un único destacado |
| `created_at` | No | No previsto inicialmente | Sí, consultable y no editable cuando sea útil |
| `updated_at` | No | No previsto inicialmente | Sí, consultable y no editable cuando sea útil |

La card destacada y `/proyectos` solo consumirán registros publicados. La card, además, requiere que el registro esté marcado como destacado. Así, el conjunto de campos cubre tanto la información pública principal como el control necesario para decidir qué proyecto puede verse en cada superficie.

## 14. Decisiones expresamente fuera de esta tarea

No forman parte de esta versión del diccionario:

- fecha de publicación;
- contenido extendido o cuerpo con formato;
- cliente, organización, autor o colaboradores;
- etiquetas adicionales o categorías distintas de `project_type`;
- métricas, analítica o contador de visitas;
- metadatos SEO específicos por proyecto.

Tampoco se decide el diseño visual de las cards ni se definen tablas SQL, migraciones, buckets de Storage, políticas RLS, formularios, componentes React, tipos TypeScript reales, Server Actions, rutas dinámicas o dependencias. En particular, los detalles operativos de las capturas enumerados en la sección 4 se resolverán en una tarea posterior de Supabase Storage.

## 15. Tipos TypeScript previstos

Los siguientes tipos son ejemplos conceptuales para trasladar posteriormente al módulo de proyectos. No constituyen todavía archivos ni una implementación TypeScript:

```ts
type ProjectType = "personal" | "academic" | "professional";

type DevelopmentStatus =
  | "in_progress"
  | "completed"
  | "paused";

type PublicationStatus = "draft" | "published";

type ProjectScreenshotPaths = {
  desktop: string | null;
  tablet: string | null;
  mobile: string | null;
};

type ProjectScreenshotUrls = {
  desktop: string;
  tablet: string;
  mobile: string;
};

type ProjectRecord = {
  id: string;
  title: string;
  slug: string;
  description: string;
  projectType: ProjectType;
  developmentStatus: DevelopmentStatus;
  publicationStatus: PublicationStatus;
  displayOrder: number;
  learning: string;
  technologies: string[];
  screenshotPaths: ProjectScreenshotPaths;
  repositoryUrl: string | null;
  liveUrl: string | null;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
};

type PublicProject = {
  id: string;
  title: string;
  slug: string;
  description: string;
  projectType: ProjectType;
  developmentStatus: DevelopmentStatus;
  learning: string;
  technologies: string[];
  screenshots: ProjectScreenshotUrls;
  repositoryUrl: string | null;
  liveUrl: string | null;
};
```

`ProjectScreenshotPaths` representa las tres rutas persistentes, que pueden estar ausentes en un borrador. Por ello, `ProjectRecord` conserva capturas nulas cuando el registro interno todavía está incompleto. `ProjectScreenshotUrls` representa el resultado utilizable por la interfaz después de que la capa de acceso a datos convierta las rutas de un proyecto publicado en URLs. `technologies` se representará como `string[]`.

`PublicProject` es el DTO seguro para el portafolio público. No incluye `publicationStatus` porque la consulta ya garantiza que el proyecto está publicado; tampoco incluye `displayOrder`, porque la interfaz no necesita conocerlo después de ordenar, ni `isFeatured`, porque la consulta destacada ya realiza esa selección. No expone `screenshotPaths`, `createdAt` o `updatedAt`: entrega las capturas como URLs y las fechas no se muestran actualmente.

Estos tipos conceptuales usan camelCase. La futura capa de datos transformará los nombres persistentes en snake_case —por ejemplo, `project_type`, `display_order` y las tres rutas `*_image_path`— a los nombres camelCase del DTO de la aplicación.

## 16. Decisiones para trasladar posteriormente al modelo de datos

Cuando se diseñe el modelo de datos y su implementación deberán trasladarse, sin perderse, las siguientes decisiones:

- la obligatoriedad, longitudes y normalización descritas para cada texto;
- la unicidad del `slug`, su generación inicial y su conservación ante cambios de título;
- la representación cerrada de los valores de `project_type`, `development_status` y `publication_status`;
- `draft` como valor inicial de `publication_status` y la exclusión de borradores en todas las consultas públicas;
- la ausencia de campos duplicados `published` y `featured`, porque sus responsabilidades corresponden respectivamente a `publication_status` e `is_featured`;
- las tres rutas de capturas independientes, su ausencia permitida en borradores, su obligatoriedad al publicar y su conversión en `desktopUrl`, `tabletUrl` y `mobileUrl` desde la capa de datos;
- la lista ordenada `technologies`, prevista como `string[]` y `text[]`, junto con sus límites, normalización, prohibición de vacíos y unicidad sin distinguir mayúsculas y minúsculas;
- `0` como valor inicial de `display_order`, su dominio de enteros no negativos y el orden público estable por `display_order`, `created_at` e `id`;
- `false` como valor inicial de `is_featured` y la obligación de estar publicado para poder ser destacado;
- la regla de que exista como máximo un proyecto destacado, junto con una estrategia consistente para cambiar la selección o devolverlo a borrador;
- las diferencias entre las reglas de guardado de borradores y los requisitos adicionales para publicar;
- el formato del `id` generado por la base de datos;
- la generación de `created_at` y la actualización automática de `updated_at`;
- la representación de enlaces ausentes y la validación de HTTPS para enlaces presentes;
- la validación en el límite administrativo y también en el servidor, sin confiar únicamente en la interfaz;
- la estrategia para resolver colisiones durante la generación inicial del slug;
- la definición de DTOs públicos mínimos que no expongan campos internos innecesarios.

La forma técnica de aplicar estas decisiones —incluidas restricciones, políticas, automatismos de base de datos y detalles de Supabase Storage— permanece fuera del alcance de este documento.
