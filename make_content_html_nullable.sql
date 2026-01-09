-- Remove the NOT NULL constraint from content_html
ALTER TABLE document_templates 
ALTER COLUMN content_html DROP NOT NULL;
