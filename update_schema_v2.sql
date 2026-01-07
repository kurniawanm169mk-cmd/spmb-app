-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Update school_settings for Offline Info
ALTER TABLE school_settings ADD COLUMN IF NOT EXISTS google_maps_url TEXT;
ALTER TABLE school_settings ADD COLUMN IF NOT EXISTS offline_images JSONB DEFAULT '[]'::jsonb;

-- 2. Update landing_page_videos for Mixed Gallery
-- Rename table conceptually? No, just add columns to avoid breaking existing code
ALTER TABLE landing_page_videos ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'video'; -- 'video' or 'image'
ALTER TABLE landing_page_videos ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE landing_page_videos ADD COLUMN IF NOT EXISTS description TEXT; -- Optional: for news/caption

-- 3. Storage Bucket for Gallery & Offline Images
-- (Assuming 'public-images' bucket exists, if not create it)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('public-images', 'public-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for public-images
CREATE POLICY "Public Images are viewable by everyone" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'public-images');

CREATE POLICY "Admins can upload public images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'public-images' AND auth.role() = 'authenticated');
