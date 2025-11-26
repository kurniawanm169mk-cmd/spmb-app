-- Migration: Add file_name and file_size columns to documents table
-- This allows storing metadata about uploaded files

DO $$
BEGIN
  -- Add file_name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'file_name'
  ) THEN
    ALTER TABLE documents ADD COLUMN file_name TEXT;
  END IF;

  -- Add file_size column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'file_size'
  ) THEN
    ALTER TABLE documents ADD COLUMN file_size BIGINT;
  END IF;
END $$;
