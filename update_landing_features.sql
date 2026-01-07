-- Create table for storing YouTube videos
CREATE TABLE IF NOT EXISTS landing_page_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_url TEXT NOT NULL,
    caption TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS just in case, though public read is needed
ALTER TABLE landing_page_videos ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public videos are viewable by everyone" ON landing_page_videos
    FOR SELECT USING (true);

-- Allow admins (authenticated) to manage videos
CREATE POLICY "Admins can manage videos" ON landing_page_videos
    FOR ALL USING (auth.role() = 'authenticated');

-- Add section_order to school_settings
ALTER TABLE school_settings
ADD COLUMN IF NOT EXISTS section_order JSONB DEFAULT '["hero", "features", "dates", "videos", "cta", "footer"]'::jsonb;
