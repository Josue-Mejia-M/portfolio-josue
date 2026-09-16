-- Crea `projects` y sus invariantes de dominio. Las restricciones mantienen
-- datos válidos incluso si una futura interfaz omite validaciones de cliente.
-- Las rutas de imágenes se validan aquí; las reglas de acceso a sus objetos se
-- definen por separado en la migración de Storage.
begin;

-- Valida tamaño, contenido y unicidad normalizada de las tecnologías.
create function public.are_project_technologies_valid(technologies_value text[])
returns boolean
language sql
immutable
strict
set search_path = pg_catalog, pg_temp
as $$
  select
    cardinality(technologies_value) <= 12
    and not exists (
      select 1
      from unnest(technologies_value) as technology(value)
      where technology.value is null
        or char_length(btrim(technology.value)) not between 1 and 30
    )
    and cardinality(technologies_value) = (
      select count(distinct lower(btrim(technology.value)))
      from unnest(technologies_value) as technology(value)
    );
$$;

-- Centraliza la actualización de `updated_at` para toda modificación de fila.
create function public.set_projects_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  description text not null,
  project_type text not null,
  development_status text not null,
  publication_status text not null default 'draft',
  learning text not null,
  desktop_image_path text,
  tablet_image_path text,
  mobile_image_path text,
  technologies text[] not null default '{}'::text[],
  repository_url text,
  live_url text,
  display_order integer not null default 0,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint projects_title_length_check
    check (char_length(btrim(title)) between 3 and 80),
  constraint projects_slug_unique unique (slug),
  constraint projects_slug_format_check
    check (
      char_length(slug) between 3 and 100
      and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    ),
  constraint projects_description_length_check
    check (char_length(btrim(description)) between 40 and 300),
  constraint projects_project_type_check
    check (project_type in ('personal', 'academic', 'professional')),
  constraint projects_development_status_check
    check (development_status in ('in_progress', 'completed', 'paused')),
  constraint projects_publication_status_check
    check (publication_status in ('draft', 'published')),
  constraint projects_learning_length_check
    check (char_length(btrim(learning)) between 30 and 600),
  constraint projects_desktop_image_path_check
    check (desktop_image_path is null or char_length(btrim(desktop_image_path)) > 0),
  constraint projects_tablet_image_path_check
    check (tablet_image_path is null or char_length(btrim(tablet_image_path)) > 0),
  constraint projects_mobile_image_path_check
    check (mobile_image_path is null or char_length(btrim(mobile_image_path)) > 0),
  constraint projects_technologies_check
    check (public.are_project_technologies_valid(technologies)),
  constraint projects_repository_url_check
    check (repository_url is null or repository_url ~ '^https://[^[:space:]]+$'),
  constraint projects_live_url_check
    check (live_url is null or live_url ~ '^https://[^[:space:]]+$'),
  constraint projects_display_order_check
    check (display_order >= 0),
  -- Un destacado no puede ocultar un borrador de la lista pública.
  constraint projects_featured_requires_published_check
    check (not is_featured or publication_status = 'published'),
  -- Publicar exige las tres variantes de imagen y tecnologías para que la
  -- presentación pública no dependa de datos incompletos.
  constraint projects_published_content_check
    check (
      publication_status = 'draft'
      or (
        desktop_image_path is not null
        and char_length(btrim(desktop_image_path)) > 0
        and tablet_image_path is not null
        and char_length(btrim(tablet_image_path)) > 0
        and mobile_image_path is not null
        and char_length(btrim(mobile_image_path)) > 0
        and cardinality(technologies) between 1 and 12
      )
    )
);

-- Solo puede existir un proyecto destacado a la vez.
create unique index projects_single_featured_idx
  on public.projects (is_featured)
  where is_featured;

create index projects_public_listing_idx
  on public.projects (publication_status, display_order asc, created_at desc, id);

create trigger projects_set_updated_at
before update on public.projects
for each row
execute function public.set_projects_updated_at();

commit;
