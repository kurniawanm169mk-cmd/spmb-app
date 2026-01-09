-- Add overlay_fields column to document_templates table for storing input field positions
ALTER TABLE document_templates 
ADD COLUMN IF NOT EXISTS overlay_fields TEXT;

COMMENT ON COLUMN document_templates.overlay_fields IS 'JSON array of overlay field configurations with positions (for image templates)';
