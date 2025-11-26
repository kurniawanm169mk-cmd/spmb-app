-- Create features table for "Mengapa Memilih Kami" section
create table if not exists features (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  icon_name text default 'School', -- Lucide icon name
  color text default '#10b981',
  order_index int default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Insert default features
insert into features (title, description, icon_name, color, order_index) values
('Fasilitas Modern', 'Lab komputer, perpustakaan digital, ruang kelas ber-AC, dan fasilitas olahraga lengkap untuk mendukung pembelajaran.', 'School', '#10b981', 1),
('Guru Berkualitas', 'Tenaga pengajar profesional dan berpengalaman dengan metode pembelajaran yang inovatif dan menyenangkan.', 'Users', '#3b82f6', 2),
('Prestasi Gemilang', 'Berbagai penghargaan tingkat nasional dan internasional dalam bidang akademik maupun non-akademik.', 'Award', '#f59e0b', 3),
('Kurikulum Terkini', 'Kombinasi kurikulum nasional dengan pendekatan islami modern untuk membentuk karakter unggul.', 'BookOpen', '#8b5cf6', 4);
