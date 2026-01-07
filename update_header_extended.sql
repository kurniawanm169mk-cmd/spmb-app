ALTER TABLE school_settings 
ADD COLUMN IF NOT EXISTS header_font_size VARCHAR(20) DEFAULT '1.25rem',
ADD COLUMN IF NOT EXISTS header_blur INTEGER DEFAULT 10;

-- Update defaults
UPDATE school_settings
SET
  header_font_size = COALESCE(header_font_size, '1.25rem'),
  header_blur = COALESCE(header_blur, 10);
