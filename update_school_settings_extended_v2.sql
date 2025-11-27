-- Add new columns for extended typography and CTA settings
ALTER TABLE school_settings
ADD COLUMN IF NOT EXISTS header_title_size_pc TEXT DEFAULT '1.5rem',
ADD COLUMN IF NOT EXISTS header_title_size_mobile TEXT DEFAULT '1.25rem',
ADD COLUMN IF NOT EXISTS cta_title_bold BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cta_title_italic BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cta_title_underline BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cta_description_size_pc TEXT DEFAULT '1.25rem',
ADD COLUMN IF NOT EXISTS cta_description_size_mobile TEXT DEFAULT '1rem';
