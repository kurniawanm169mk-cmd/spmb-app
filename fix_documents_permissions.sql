-- Enable RLS on documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 1. Student Insert Policy
-- Allows students to insert documents ONLY for their own registration
DROP POLICY IF EXISTS "Students can upload own documents" ON documents;
CREATE POLICY "Students can upload own documents" ON documents
FOR INSERT
WITH CHECK (
  registration_id IN (
    SELECT id FROM registrations WHERE user_id = auth.uid()
  )
);

-- 2. Student View Policy
-- Allows students to view documents linked to their registration
DROP POLICY IF EXISTS "Students can view own documents" ON documents;
CREATE POLICY "Students can view own documents" ON documents
FOR SELECT
USING (
  registration_id IN (
    SELECT id FROM registrations WHERE user_id = auth.uid()
  )
);

-- 3. Student Delete Policy
-- Allows students to delete their own documents
DROP POLICY IF EXISTS "Students can delete own documents" ON documents;
CREATE POLICY "Students can delete own documents" ON documents
FOR DELETE
USING (
  registration_id IN (
    SELECT id FROM registrations WHERE user_id = auth.uid()
  )
);

-- 4. Admin View Policy
-- Allows admins to view ALL documents
DROP POLICY IF EXISTS "Admins can view all documents" ON documents;
CREATE POLICY "Admins can view all documents" ON documents
FOR SELECT
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
