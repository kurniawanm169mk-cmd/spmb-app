-- Add font_family column to school_settings
ALTER TABLE school_settings 
ADD COLUMN IF NOT EXISTS font_family text DEFAULT 'Inter';
