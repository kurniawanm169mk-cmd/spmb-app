-- Allow students to UPDATE their own registration (needed for saving form data)
CREATE POLICY "Students Update Own" ON registrations
FOR UPDATE
USING ( auth.uid() = user_id )
WITH CHECK ( auth.uid() = user_id );

-- Ensure the policy is applied
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
