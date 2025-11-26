-- Add CTA fields to school_settings
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'school_settings' and column_name = 'cta_title') then
    alter table school_settings add column cta_title text default 'Siap Bergabung Bersama Kami?';
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'school_settings' and column_name = 'cta_description') then
    alter table school_settings add column cta_description text default 'Pendaftaran Tahun Ajaran Baru Telah Dibuka. Segera daftarkan putra-putri Anda untuk masa depan yang gemilang.';
  end if;
end $$;
