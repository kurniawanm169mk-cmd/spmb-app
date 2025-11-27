-- Add advanced customization columns to school_settings
ALTER TABLE school_settings 
ADD COLUMN IF NOT EXISTS border_radius text DEFAULT '1rem',
ADD COLUMN IF NOT EXISTS hero_overlay_opacity integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS hero_blur integer DEFAULT 0;
