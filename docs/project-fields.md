# Diccionario de campos de proyectos

## 1. Propósito y alcance

Este documento define el contrato conceptual de los campos principales de cada proyecto que se administrará desde el futuro panel privado y que podrá alimentar la card destacada de Inicio y la futura página pública `/proyectos`.

Su alcance se limita a nombres, significado, obligatoriedad, validaciones y uso esperado de los datos. No define una implementación de persistencia, formularios, componentes, tipos de TypeScript ni rutas dinámicas. Actualmente `/proyectos` contiene texto provisional y no existe una fuente persistente de proyectos; por tanto, este diccionario describe el comportamiento futuro.

## 2. Contenido, control y datos automáticos

- **Contenido:** información que describe el proyecto y que el usuario administrador redacta o selecciona, como el título, la descripción, el aprendizaje, la clasificación y los enlaces.
- **Control:** información que determina el flujo editorial o la presentación del proyecto, como su estado de publicación y si puede aparecer como destacado. No describe por sí sola el contenido del proyecto.
- **Datos automáticos:** identificadores y marcas de tiempo administrados por el sistema o la base de datos. El usuario puede consultarlos cuando sea útil, pero no editarlos directamente.

`development_status` es contenido descriptivo porque expresa la situación real del desarrollo. `publication_status` e `is_featured` son campos de control editorial. Esta distinción evita deducir la visibilidad pública a partir del avance técnico del proyecto.

## 3. Tabla principal

| Nombre visible | Nombre técnico | Tipo conceptual | Requisito | Longitud o valores permitidos | Valor inicial | Uso |
| --- | --- | --- | --- | --- | --- | --- |
| Título | `title` | Contenido: texto corto | Obligatorio | 3 a 80 caracteres | Sin valor predeterminado | Nombre visible del proyecto. |
| Slug | `slug` | Contenido: identificador legible | Obligatorio | 3 a 100 caracteres; minúsculas, números y guiones | Generado inicialmente desde `title` | Identificación legible y única; preparado para usos futuros. |
| Descripción | `description` | Contenido: texto corto | Obligatorio | 40 a 300 caracteres; sin HTML | Sin valor predeterminado | Resumen público para cards y listados. |
| Tipo de proyecto | `project_type` | Contenido: selección cerrada | Obligatorio | `personal`, `academic`, `professional` | Sin valor predeterminado | Clasificación del contexto del proyecto. |
| Estado de desarrollo | `development_status` | Contenido: selección cerrada | Obligatorio | `in_progress`, `completed`, `paused` | Sin valor predeterminado | Comunica la situación real del desarrollo. |
| Estado de publicación | `publication_status` | Control: selección cerrada | Obligatorio | `draft`, `published` | `draft` | Controla la visibilidad dentro del portafolio. |
| Aprendizaje | `learning` | Contenido: texto | Obligatorio | 30 a 600 caracteres; sin HTML | Sin valor predeterminado | Explica conocimientos o experiencia obtenidos. |
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

### 4.7 `learning`

Explica los conocimientos, decisiones o experiencia que dejó el proyecto. Es obligatorio, debe contener entre 30 y 600 caracteres y debe almacenarse como texto plano, sin HTML. Podrá utilizarse en la futura página `/proyectos`, aunque la card destacada no tiene que mostrarlo completo.

### 4.8 `repository_url`

Enlace opcional al repositorio, ya sea GitHub u otro proveedor. Cuando exista debe ser una URL HTTPS válida. La ausencia del valor permite representar proyectos con código privado y obliga a la interfaz pública a omitir el botón “Ver código”.

### 4.9 `live_url`

Enlace opcional al despliegue accesible del proyecto. Cuando exista debe ser una URL HTTPS válida. Si está ausente, la interfaz pública debe omitir el botón destinado a visitar el sitio.

### 4.10 `id`

Identificador interno obligatorio, estable y generado automáticamente por la base de datos. El usuario no lo editará. Su formato concreto se decidirá al diseñar el modelo de datos.

### 4.11 `is_featured`

Booleano obligatorio con valor inicial `false`. Indica si el proyecto puede aparecer en la sección destacada de Inicio, pero no lo publica. Para aparecer públicamente debe cumplirse también `publication_status: published`.

Durante la primera versión podrá existir como máximo un proyecto con `is_featured: true`. Esta es una regla de negocio documentada, no una restricción implementada en esta tarea.

### 4.12 `created_at`

Fecha y hora obligatoria de creación del registro, generada automáticamente. No será editable desde el formulario administrativo.

### 4.13 `updated_at`

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

## 8. Reglas para seleccionar el proyecto destacado

Para que un proyecto aparezca en la sección destacada de Inicio debe cumplir simultáneamente:

1. `is_featured` debe ser `true`.
2. `publication_status` debe ser `published`.

En la primera versión solo podrá haber un proyecto destacado a la vez. Al seleccionar uno nuevo, la futura lógica de administración deberá evitar que otro permanezca con `is_featured: true`. Esta operación y la forma de garantizar su consistencia se definirán al implementar el modelo y las escrituras.

Marcar un borrador como destacado no lo hace visible: mientras conserve `publication_status: draft`, seguirá disponible únicamente en el panel. Si no existe un proyecto que cumpla ambas condiciones, la interfaz de Inicio deberá tratar la sección como no disponible en vez de mostrar datos de un borrador.

## 9. Ejemplo conceptual: “Página de cafetería”

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
| `learning` | `Permitió practicar la organización de contenido, el diseño adaptable y la construcción de una experiencia clara para consultar productos y datos del negocio.` |
| `repository_url` | Sin valor; el botón “Ver código” no se mostraría |
| `live_url` | `https://example.com/pagina-de-cafeteria` (URL reservada, solo ilustrativa) |
| `is_featured` | `true` |
| `created_at` | Generada automáticamente al crear el registro |
| `updated_at` | Actualizada automáticamente con la última modificación |

Con estos valores, el proyecto podría aparecer públicamente y ser el destacado de Inicio. Su estado visible de desarrollo sería “Finalizado”.

## 10. Relación de campos con cada superficie

| Campo | Card destacada de Inicio | Futura página `/proyectos` | Panel administrativo |
| --- | --- | --- | --- |
| `title` | Sí, nombre principal | Sí | Sí, editable |
| `slug` | No es necesario para la primera versión | Podrá usarse como identificador futuro, sin ruta dinámica en esta tarea | Sí, consultable y editable bajo validación |
| `description` | Sí, resumen principal | Sí | Sí, editable |
| `project_type` | Puede mostrar la etiqueta pública | Sí, como clasificación | Sí, editable |
| `development_status` | Sí; `completed` muestra “Finalizado” | Sí, con etiqueta pública | Sí, editable |
| `publication_status` | Filtro obligatorio: solo `published` | Filtro obligatorio: solo `published` | Sí, editable y visible para borradores |
| `learning` | Opcional o resumido en la presentación | Sí, podrá mostrarse | Sí, editable |
| `repository_url` | Botón condicional “Ver código” | Enlace condicional | Sí, editable y opcional |
| `live_url` | Botón condicional para visitar el sitio | Enlace condicional | Sí, editable y opcional |
| `id` | No | No es necesario exponerlo | Sí, como referencia no editable cuando sea útil |
| `is_featured` | Criterio obligatorio de selección | No controla su presencia en el listado | Sí, editable con la regla de un único destacado |
| `created_at` | No | No previsto inicialmente | Sí, consultable y no editable cuando sea útil |
| `updated_at` | No | No previsto inicialmente | Sí, consultable y no editable cuando sea útil |

La card destacada y `/proyectos` solo consumirán registros publicados. La card, además, requiere que el registro esté marcado como destacado. Así, el conjunto de campos cubre tanto la información pública principal como el control necesario para decidir qué proyecto puede verse en cada superficie.

## 11. Campos expresamente fuera de esta tarea

No forman parte de esta versión del diccionario:

- tecnologías o herramientas utilizadas;
- capturas para PC, tablet o teléfono;
- orden manual de presentación;
- fecha de publicación;
- contenido extendido o cuerpo con formato;
- cliente, organización, autor o colaboradores;
- etiquetas adicionales o categorías distintas de `project_type`;
- métricas, analítica o contador de visitas;
- metadatos SEO específicos por proyecto.

Tampoco se definen tablas SQL, migraciones, buckets de Storage, políticas RLS, formularios, componentes React, tipos TypeScript, Server Actions, rutas dinámicas ni dependencias.

## 12. Decisiones para trasladar posteriormente al modelo de datos

Cuando se diseñe el modelo de datos y su implementación deberán trasladarse, sin perderse, las siguientes decisiones:

- la obligatoriedad, longitudes y normalización descritas para cada texto;
- la unicidad del `slug`, su generación inicial y su conservación ante cambios de título;
- la representación cerrada de los valores de `project_type`, `development_status` y `publication_status`;
- `draft` como valor inicial de `publication_status` y la exclusión de borradores en todas las consultas públicas;
- `false` como valor inicial de `is_featured` y la condición adicional de estar publicado para aparecer en Inicio;
- la regla de que exista como máximo un proyecto destacado en la primera versión, junto con una estrategia consistente para cambiar la selección;
- el formato del `id` generado por la base de datos;
- la generación de `created_at` y la actualización automática de `updated_at`;
- la representación de enlaces ausentes y la validación de HTTPS para enlaces presentes;
- la validación en el límite administrativo y también en el servidor, sin confiar únicamente en la interfaz;
- la estrategia para resolver colisiones durante la generación inicial del slug;
- la definición de DTOs públicos mínimos que no expongan campos internos innecesarios.

La forma técnica de aplicar estas decisiones —incluidas restricciones, políticas y automatismos de base de datos— permanece fuera del alcance de este documento.
