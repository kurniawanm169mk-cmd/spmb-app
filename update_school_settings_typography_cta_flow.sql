-- Create registration_steps table
CREATE TABLE IF NOT EXISTS registration_steps (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    icon text DEFAULT 'FileText',
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for registration_steps
ALTER TABLE registration_steps ENABLE ROW LEVEL SECURITY;

-- Policies for registration_steps
CREATE POLICY "Public can view registration steps" ON registration_steps
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage registration steps" ON registration_steps
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- Add CTA and Typography columns to school_settings
ALTER TABLE school_settings
-- CTA
ADD COLUMN IF NOT EXISTS cta_image_url text,
ADD COLUMN IF NOT EXISTS cta_overlay_opacity integer DEFAULT 80,

-- Header (Navbar Brand)
ADD COLUMN IF NOT EXISTS header_font_size_pc text DEFAULT '1.5rem',
ADD COLUMN IF NOT EXISTS header_font_size_mobile text DEFAULT '1.25rem',
ADD COLUMN IF NOT EXISTS header_letter_spacing_pc text DEFAULT '0em',
ADD COLUMN IF NOT EXISTS header_letter_spacing_mobile text DEFAULT '0em',

-- Hero Title
ADD COLUMN IF NOT EXISTS hero_title_size_pc text DEFAULT '3.5rem',
ADD COLUMN IF NOT EXISTS hero_title_size_mobile text DEFAULT '2rem',
ADD COLUMN IF NOT EXISTS hero_title_spacing_pc text DEFAULT '-0.02em',
ADD COLUMN IF NOT EXISTS hero_title_spacing_mobile text DEFAULT '-0.01em',

-- Schedule (Registration Period)
ADD COLUMN IF NOT EXISTS schedule_size_pc text DEFAULT '1rem',
ADD COLUMN IF NOT EXISTS schedule_size_mobile text DEFAULT '0.875rem',
ADD COLUMN IF NOT EXISTS schedule_spacing_pc text DEFAULT '0em',
ADD COLUMN IF NOT EXISTS schedule_spacing_mobile text DEFAULT '0em',

-- CTA Title
ADD COLUMN IF NOT EXISTS cta_title_size_pc text DEFAULT '2.5rem',
ADD COLUMN IF NOT EXISTS cta_title_size_mobile text DEFAULT '1.75rem',
ADD COLUMN IF NOT EXISTS cta_title_spacing_pc text DEFAULT '0em',
ADD COLUMN IF NOT EXISTS cta_title_spacing_mobile text DEFAULT '0em';

-- Insert default registration steps if empty
INSERT INTO registration_steps (title, description, icon, order_index)
SELECT 'Daftar Akun', 'Buat akun calon siswa dan login ke dashboard.', 'FileText', 1
WHERE NOT EXISTS (SELECT 1 FROM registration_steps);

INSERT INTO registration_steps (title, description, icon, order_index)
SELECT 'Lengkapi Data', 'Isi formulir biodata dan upload dokumen persyaratan.', 'Upload', 2
WHERE NOT EXISTS (SELECT 1 FROM registration_steps WHERE title = 'Lengkapi Data');

INSERT INTO registration_steps (title, description, icon, order_index)
SELECT 'Verifikasi', 'Admin akan memverifikasi data dan dokumen Anda.', 'CheckCircle', 3
WHERE NOT EXISTS (SELECT 1 FROM registration_steps WHERE title = 'Verifikasi');

INSERT INTO registration_steps (title, description, icon, order_index)
SELECT 'Pengumuman', 'Cek status kelulusan pada tanggal pengumuman.', 'Calendar', 4
WHERE NOT EXISTS (SELECT 1 FROM registration_steps WHERE title = 'Pengumuman');
