ALTER TABLE school_settings 
ADD COLUMN IF NOT EXISTS header_bg_color VARCHAR(20) DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS header_text_color VARCHAR(20) DEFAULT '#1e293b',
ADD COLUMN IF NOT EXISTS header_font_family VARCHAR(50) DEFAULT 'Inter';

-- Update existing rows to have defaults if null
UPDATE school_settings 
SET 
  header_bg_color = COALESCE(header_bg_color, '#ffffff'),
  header_text_color = COALESCE(header_text_color, '#1e293b'),
  header_font_family = COALESCE(header_font_family, 'Inter');
