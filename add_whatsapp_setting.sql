-- Add WhatsApp number column if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'school_settings' and column_name = 'whatsapp_number') then
    alter table school_settings add column whatsapp_number text;
  end if;
end $$;
