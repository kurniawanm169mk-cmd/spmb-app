ALTER TABLE school_settings 
ADD COLUMN IF NOT EXISTS allow_fullday_ikhwan BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_fullday_akhwat BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_boarding_ikhwan BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_boarding_akhwat BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS hide_program_in_dashboard BOOLEAN DEFAULT false;
