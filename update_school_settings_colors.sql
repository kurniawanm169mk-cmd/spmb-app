-- Add color customization columns to school_settings
do $$
begin
  -- Hero background colors
  if not exists (select 1 from information_schema.columns where table_name = 'school_settings' and column_name = 'hero_bg_color_1') then
    alter table school_settings add column hero_bg_color_1 text default '#10b981';
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name = 'school_settings' and column_name = 'hero_bg_color_2') then
    alter table school_settings add column hero_bg_color_2 text default '#06b6d4';
  end if;
  
  -- CTA background colors
  if not exists (select 1 from information_schema.columns where table_name = 'school_settings' and column_name = 'cta_bg_color_1') then
    alter table school_settings add column cta_bg_color_1 text default '#10b981';
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name = 'school_settings' and column_name = 'cta_bg_color_2') then
    alter table school_settings add column cta_bg_color_2 text default '#06b6d4';
  end if;
end $$;
