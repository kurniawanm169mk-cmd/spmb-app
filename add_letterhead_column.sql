-- Add letterhead_url column to document_templates table
ALTER TABLE document_templates 
ADD COLUMN IF NOT EXISTS letterhead_url TEXT;

COMMENT ON COLUMN document_templates.letterhead_url IS 'URL of the uploaded letterhead image for this template';
