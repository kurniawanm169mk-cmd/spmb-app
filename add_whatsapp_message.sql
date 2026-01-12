-- Add WhatsApp message column if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'school_settings' and column_name = 'whatsapp_message') then
    alter table school_settings add column whatsapp_message text default 'Halo, saya ingin menanyakan informasi lebih lanjut tentang pendaftaran.';
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'school_settings' and column_name = 'whatsapp_button_text') then
    alter table school_settings add column whatsapp_button_text text default 'Informasi lebih lanjut, hubungi panitia';
  end if;
end $$;
