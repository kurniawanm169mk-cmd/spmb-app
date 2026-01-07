ALTER TABLE school_settings 
ADD COLUMN IF NOT EXISTS header_font_weight VARCHAR(20) DEFAULT 'bold',
ADD COLUMN IF NOT EXISTS header_letter_spacing VARCHAR(20) DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS header_bg_opacity NUMERIC DEFAULT 0.8;

-- Update defaults
UPDATE school_settings
SET
  header_font_weight = COALESCE(header_font_weight, 'bold'),
  header_letter_spacing = COALESCE(header_letter_spacing, 'normal'),
  header_bg_opacity = COALESCE(header_bg_opacity, 0.8);
