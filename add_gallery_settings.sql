-- Add Gallery Settings columns if they don't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'school_settings' and column_name = 'gallery_title') then
    alter table school_settings add column gallery_title text default 'Galeri Kegiatan';
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'school_settings' and column_name = 'gallery_description') then
    alter table school_settings add column gallery_description text default 'Dokumentasi kegiatan dan profil sekolah kami';
  end if;
end $$;
