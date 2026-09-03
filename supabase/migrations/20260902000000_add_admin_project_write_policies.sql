begin;

alter table public.projects enable row level security;

revoke insert, update, delete on table public.projects from anon;

grant select, insert, update, delete on table public.projects to authenticated;

drop policy if exists admin_read_all_projects on public.projects;
drop policy if exists admin_insert_projects on public.projects;
drop policy if exists admin_update_projects on public.projects;
drop policy if exists admin_delete_projects on public.projects;

create policy admin_read_all_projects
on public.projects
for select
to authenticated
using (
  coalesce(
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  )
);

create policy admin_insert_projects
on public.projects
for insert
to authenticated
with check (
  coalesce(
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  )
);

create policy admin_update_projects
on public.projects
for update
to authenticated
using (
  coalesce(
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  )
)
with check (
  coalesce(
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  )
);

create policy admin_delete_projects
on public.projects
for delete
to authenticated
using (
  coalesce(
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  )
);

commit;
