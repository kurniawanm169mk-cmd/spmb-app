-- Add template_image_url column to document_templates table
ALTER TABLE document_templates 
ADD COLUMN IF NOT EXISTS template_image_url TEXT;

COMMENT ON COLUMN document_templates.template_image_url IS 'URL of an uploaded pre-formatted template image/PDF';
