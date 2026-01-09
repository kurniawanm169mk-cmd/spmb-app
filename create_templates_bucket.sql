-- Create a new private bucket 'document-templates'
insert into storage.buckets (id, name, public)
values ('document-templates', 'document-templates', true);

-- Allow public access to view files (so students can download)
create policy "Public Access to Templates"
  on storage.objects for select
  using ( bucket_id = 'document-templates' );

-- Allow authenticated users (admins) to upload
create policy "Authenticated Admin Upload"
  on storage.objects for insert
  with check ( bucket_id = 'document-templates' AND auth.role() = 'authenticated' );

-- Allow authenticated users (admins) to update/delete
create policy "Authenticated Admin Update"
  on storage.objects for update
  using ( bucket_id = 'document-templates' AND auth.role() = 'authenticated' );

create policy "Authenticated Admin Delete"
  on storage.objects for delete
  using ( bucket_id = 'document-templates' AND auth.role() = 'authenticated' );
