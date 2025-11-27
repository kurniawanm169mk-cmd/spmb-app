-- Add Typography, CTA, and Registration Flow columns to school_settings
-- Run this in Supabase SQL Editor

-- 1. Add new columns to school_settings table
ALTER TABLE school_settings
ADD COLUMN IF NOT EXISTS hero_title_size_pc TEXT DEFAULT '3.5rem',
ADD COLUMN IF NOT EXISTS hero_title_size_mobile TEXT DEFAULT '2rem',
ADD COLUMN IF NOT EXISTS hero_title_spacing_pc TEXT DEFAULT '-0.02em',
ADD COLUMN IF NOT EXISTS hero_title_spacing_mobile TEXT DEFAULT '-0.01em',
ADD COLUMN IF NOT EXISTS schedule_size_pc TEXT DEFAULT '1rem',
ADD COLUMN IF NOT EXISTS schedule_size_mobile TEXT DEFAULT '0.875rem',
ADD COLUMN IF NOT EXISTS schedule_spacing_pc TEXT DEFAULT '0em',
ADD COLUMN IF NOT EXISTS schedule_spacing_mobile TEXT DEFAULT '0em',
ADD COLUMN IF NOT EXISTS cta_title_size_pc TEXT DEFAULT '2.5rem',
ADD COLUMN IF NOT EXISTS cta_title_size_mobile TEXT DEFAULT '1.75rem',
ADD COLUMN IF NOT EXISTS cta_title_spacing_pc TEXT DEFAULT '-0.01em',
ADD COLUMN IF NOT EXISTS cta_title_spacing_mobile TEXT DEFAULT '0em',
ADD COLUMN IF NOT EXISTS cta_image_url TEXT,
ADD COLUMN IF NOT EXISTS cta_overlay_opacity INTEGER DEFAULT 80;

-- 2. Create registration_steps table
CREATE TABLE IF NOT EXISTS registration_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'FileText',
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS on registration_steps
ALTER TABLE registration_steps ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for registration_steps
-- Allow public to view
CREATE POLICY "Anyone can view registration steps"
ON registration_steps FOR SELECT
TO public
USING (true);

-- Allow admin to manage
CREATE POLICY "Admin can insert registration steps"
ON registration_steps FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

CREATE POLICY "Admin can update registration steps"
ON registration_steps FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

CREATE POLICY "Admin can delete registration steps"
ON registration_steps FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- 5. Insert default registration steps (if table is empty)
INSERT INTO registration_steps (title, description, icon, order_index)
SELECT * FROM (VALUES
    ('Daftar Akun', 'Buat akun calon siswa dan login ke dashboard.', 'FileText', 0),
    ('Lengkapi Data', 'Isi formulir biodata dan upload dokumen persyaratan.', 'Upload', 1),
    ('Verifikasi', 'Admin akan memverifikasi data dan dokumen Anda.', 'CheckCircle', 2),
    ('Pengumuman', 'Cek status kelulusan pada tanggal pengumuman.', 'Calendar', 3)
) AS default_steps(title, description, icon, order_index)
WHERE NOT EXISTS (SELECT 1 FROM registration_steps LIMIT 1);

-- Done! 
-- The new columns and table are ready to use.
