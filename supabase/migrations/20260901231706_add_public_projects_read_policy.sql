-- Habilita RLS y permite el listado público exclusivamente de proyectos ya
-- publicados. Los usuarios administrativos reciben una política adicional.
begin;

alter table public.projects enable row level security;

grant select on table public.projects to anon, authenticated;

drop policy if exists public_read_published_projects on public.projects;

create policy public_read_published_projects
on public.projects
for select
to anon, authenticated
using (publication_status = 'published');

commit;
