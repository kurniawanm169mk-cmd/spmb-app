ALTER TABLE school_settings 
ADD COLUMN IF NOT EXISTS smart_doc_label TEXT DEFAULT 'Dokumen Pintar / Smart Docs',
ADD COLUMN IF NOT EXISTS smart_doc_description TEXT DEFAULT 'Anda dapat mengisi dokumen secara online atau mengunduh template untuk diisi manual.';
