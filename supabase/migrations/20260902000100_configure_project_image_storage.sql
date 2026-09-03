begin;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'project-images',
  'project-images',
  true,
  5242880,
  array[
    'image/webp',
    'image/png',
    'image/jpeg'
  ]::text[]
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists project_images_public_read on storage.objects;
drop policy if exists project_images_admin_insert on storage.objects;
drop policy if exists project_images_admin_update on storage.objects;
drop policy if exists project_images_admin_delete on storage.objects;

create policy project_images_public_read
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'project-images');

create policy project_images_admin_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'project-images'
  and name ~ '^[a-z0-9]+(-[a-z0-9]+)*/(desktop|tablet|mobile)[.](webp|png|jpg|jpeg)$'
  and coalesce(
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  )
);

create policy project_images_admin_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'project-images'
  and name ~ '^[a-z0-9]+(-[a-z0-9]+)*/(desktop|tablet|mobile)[.](webp|png|jpg|jpeg)$'
  and coalesce(
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  )
)
with check (
  bucket_id = 'project-images'
  and name ~ '^[a-z0-9]+(-[a-z0-9]+)*/(desktop|tablet|mobile)[.](webp|png|jpg|jpeg)$'
  and coalesce(
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  )
);

create policy project_images_admin_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'project-images'
  and name ~ '^[a-z0-9]+(-[a-z0-9]+)*/(desktop|tablet|mobile)[.](webp|png|jpg|jpeg)$'
  and coalesce(
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  )
);

commit;
