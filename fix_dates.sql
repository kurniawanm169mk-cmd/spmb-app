-- Update school_settings with default registration dates if they are missing
UPDATE school_settings
SET 
  registration_start_date = NOW(),
  registration_end_date = NOW() + INTERVAL '30 days',
  registration_open = true
WHERE registration_start_date IS NULL OR registration_end_date IS NULL;

-- Verify the data
SELECT registration_start_date, registration_end_date FROM school_settings;
