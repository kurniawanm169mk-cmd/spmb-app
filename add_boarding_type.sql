-- Add boarding_type field to registrations table
ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS boarding_type TEXT CHECK (boarding_type IN ('Boarding', 'Fullday')) DEFAULT 'Fullday';

-- Update existing records to have default value
UPDATE registrations 
SET boarding_type = 'Fullday' 
WHERE boarding_type IS NULL;
