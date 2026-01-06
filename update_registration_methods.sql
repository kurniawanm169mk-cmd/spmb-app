-- Add registration_method to registrations
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS registration_method TEXT DEFAULT 'online'; -- 'online' or 'offline'

-- Add descriptions to school_settings
ALTER TABLE school_settings
ADD COLUMN IF NOT EXISTS fullday_description TEXT DEFAULT 'Program sekolah sehari penuh dari pagi hingga sore.',
ADD COLUMN IF NOT EXISTS boarding_description TEXT DEFAULT 'Program sekolah dengan asrama (menginap).',
ADD COLUMN IF NOT EXISTS online_description TEXT DEFAULT 'Khusus calon siswa di luar pulau Nunukan.',
ADD COLUMN IF NOT EXISTS offline_description TEXT DEFAULT 'Khusus calon siswa domisili Nunukan.';

-- Refresh the schema cache in Supabase (sometimes needed)
NOTIFY pgrst, 'reload config';
