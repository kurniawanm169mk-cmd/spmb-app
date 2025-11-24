-- Enable RLS
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Admins can do everything on registrations" ON registrations;
DROP POLICY IF EXISTS "Students can view own registration" ON registrations;
DROP POLICY IF EXISTS "Students can insert own registration" ON registrations;
DROP POLICY IF EXISTS "Students can update own registration" ON registrations;
DROP POLICY IF EXISTS "Admins All Access" ON registrations;
DROP POLICY IF EXISTS "Students View Own" ON registrations;
DROP POLICY IF EXISTS "Students Insert Own" ON registrations;
DROP POLICY IF EXISTS "Students Update Own" ON registrations;

-- 1. Admin Policy (ALL Access)
CREATE POLICY "Admins All Access" ON registrations
FOR ALL
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- 2. Student INSERT Policy
-- Allows authenticated users to insert a record if the user_id matches their own ID
CREATE POLICY "Students Insert Own" ON registrations
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

-- 3. Student SELECT Policy
-- Allows users to view their own registration
CREATE POLICY "Students View Own" ON registrations
FOR SELECT
USING (
  auth.uid() = user_id
);

-- 4. Student UPDATE Policy
-- Allows users to update their own registration (e.g. form data)
CREATE POLICY "Students Update Own" ON registrations
FOR UPDATE
USING (
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = user_id
);
