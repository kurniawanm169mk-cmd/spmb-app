ALTER TABLE document_templates 
ADD COLUMN IF NOT EXISTS form_schema JSONB DEFAULT '[]'::jsonb;

-- Also add orientation just in case
ALTER TABLE document_templates 
ADD COLUMN IF NOT EXISTS orientation VARCHAR(10) DEFAULT 'portrait';
