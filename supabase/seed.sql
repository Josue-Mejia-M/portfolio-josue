-- Registro inicial de la página de cafetería: comienza como borrador; las capturas y los enlaces se agregarán posteriormente; el slug impide crear repetidamente el mismo proyecto.
begin;

insert into public.projects (
  title,
  slug,
  description,
  project_type,
  development_status,
  publication_status,
  learning,
  desktop_image_path,
  tablet_image_path,
  mobile_image_path,
  technologies,
  repository_url,
  live_url,
  display_order,
  is_featured
)
values (
  'Página de cafetería',
  'pagina-de-cafeteria',
  'Sitio web estático creado para practicar la estructura, organización y diseño visual de una cafetería.',
  'personal',
  'completed',
  'draft',
  'Este proyecto me permitió practicar la estructura semántica con HTML, la creación de estilos con CSS y la implementación de interacciones sencillas con JavaScript, además de mejorar la organización visual de una página web.',
  null,
  null,
  null,
  array['HTML', 'CSS', 'JavaScript']::text[],
  null,
  null,
  0,
  false
)
on conflict (slug) do nothing;

commit;
