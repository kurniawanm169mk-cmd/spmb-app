-- Create table for Landing Page Videos
CREATE TABLE IF NOT EXISTS landing_page_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE landing_page_videos ENABLE ROW LEVEL SECURITY;

-- Policy for reading (public)
CREATE POLICY "Public videos are viewable by everyone" 
ON landing_page_videos FOR SELECT 
USING (true);

-- Policy for modifying (admin only - assuming auth)
-- For simplicity in this step, we allow authenticated inserts/updates
CREATE POLICY "Admins can insert videos" 
ON landing_page_videos FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update videos" 
ON landing_page_videos FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete videos" 
ON landing_page_videos FOR DELETE 
USING (auth.role() = 'authenticated');
