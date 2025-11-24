-- 1. Reset RLS on registrations
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies to clear conflicts
DROP POLICY IF EXISTS "Admins can view all registrations" ON registrations;
DROP POLICY IF EXISTS "Admins can update all registrations" ON registrations;
DROP POLICY IF EXISTS "Admins can delete all registrations" ON registrations;
DROP POLICY IF EXISTS "Students can insert own registration" ON registrations;
DROP POLICY IF EXISTS "Students can view own registration" ON registrations;
DROP POLICY IF EXISTS "Students can update own registration" ON registrations;
DROP POLICY IF EXISTS "Admins All Access" ON registrations;
DROP POLICY IF EXISTS "Students View Own" ON registrations;
DROP POLICY IF EXISTS "Students Insert Own" ON registrations;

-- 3. Create a Simple Admin ALL Access Policy
-- This allows Admins to Select, Insert, Update, and Delete ANY registration
CREATE POLICY "Admins All Access" ON registrations
FOR ALL
USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' )
WITH CHECK ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );

-- 4. Create Student View Policy
CREATE POLICY "Students View Own" ON registrations
FOR SELECT
USING ( auth.uid() = user_id );

-- 5. Create Student Insert Policy
CREATE POLICY "Students Insert Own" ON registrations
FOR INSERT
WITH CHECK ( auth.uid() = user_id );

-- 6. Manually fix the specific record (Just in case the UI is still stuck)
-- This forces the status to 'payment_verified' for the student in your screenshot
UPDATE registrations
SET status = 'payment_verified'
WHERE id = '04e60018-166b-4554-a963-3a51d6787f5d';
