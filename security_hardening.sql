-- SECURITY HARDENING SCRIPT
-- This script enables RLS on all public-facing tables and sets up proper policies.

-- 1. School Settings
ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view school settings" ON school_settings;
CREATE POLICY "Public can view school settings" ON school_settings
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update school settings" ON school_settings;
CREATE POLICY "Admins can update school settings" ON school_settings
FOR UPDATE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
) WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- 2. Features (Mengapa Memilih Kami)
ALTER TABLE features ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view features" ON features;
CREATE POLICY "Public can view features" ON features
FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage features" ON features;
CREATE POLICY "Admins can manage features" ON features
FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- 3. News (Berita & Pengumuman)
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published news" ON news;
CREATE POLICY "Public can view published news" ON news
FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage news" ON news;
CREATE POLICY "Admins can manage news" ON news
FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- 4. Gallery
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active gallery" ON gallery;
CREATE POLICY "Public can view active gallery" ON gallery
FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage gallery" ON gallery;
CREATE POLICY "Admins can manage gallery" ON gallery
FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- 5. Social Media
ALTER TABLE social_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view social media" ON social_media;
CREATE POLICY "Public can view social media" ON social_media
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage social media" ON social_media;
CREATE POLICY "Admins can manage social media" ON social_media
FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- 6. Carousel Images
ALTER TABLE carousel_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view carousel images" ON carousel_images;
CREATE POLICY "Public can view carousel images" ON carousel_images
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage carousel images" ON carousel_images;
CREATE POLICY "Admins can manage carousel images" ON carousel_images
FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- 7. Storage Policies
-- Ensure 'public-assets' bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-assets', 'public-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow Public Read on 'public-assets' bucket
DROP POLICY IF EXISTS "Public Access Assets" ON storage.objects;
CREATE POLICY "Public Access Assets" ON storage.objects
FOR SELECT USING ( bucket_id = 'public-assets' );

-- Allow Admins Full Access to 'public-assets' bucket
DROP POLICY IF EXISTS "Admin Full Access Assets" ON storage.objects;
CREATE POLICY "Admin Full Access Assets" ON storage.objects
FOR ALL USING (
  bucket_id = 'public-assets' AND
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Ensure 'private-docs' bucket exists and is PRIVATE
INSERT INTO storage.buckets (id, name, public)
VALUES ('private-docs', 'private-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Allow Students to Upload/View their OWN files in 'private-docs'
-- Enforce folder structure: uid/filename
DROP POLICY IF EXISTS "Students Manage Own Docs" ON storage.objects;
CREATE POLICY "Students Manage Own Docs" ON storage.objects
FOR ALL USING (
  bucket_id = 'private-docs' AND
  (storage.foldername(name))[1] = auth.uid()::text
) WITH CHECK (
  bucket_id = 'private-docs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow Admins to View All Private Docs
DROP POLICY IF EXISTS "Admins View All Private Docs" ON storage.objects;
CREATE POLICY "Admins View All Private Docs" ON storage.objects
FOR SELECT USING (
  bucket_id = 'private-docs' AND
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
