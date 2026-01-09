ALTER TABLE document_templates 
ADD COLUMN IF NOT EXISTS template_url TEXT;
