-- Create gallery table
create table if not exists gallery (
  id uuid primary key default uuid_generate_v4(),
  image_url text not null,
  caption text,
  category text default 'Kegiatan',
  order_index int default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Insert sample gallery items
insert into gallery (image_url, caption, category, order_index) values
('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400', 'Kegiatan Belajar di Kelas', 'Kegiatan', 1),
('https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400', 'Olahraga Pagi', 'Kegiatan', 2),
('https://images.unsplash.com/photo-1588072432836-e10032774350?w=400', 'Lab Komputer Modern', 'Fasilitas', 3),
('https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400', 'Perpustakaan Digital', 'Fasilitas', 4),
('https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400', 'Ruang Kelas Ber-AC', 'Fasilitas', 5),
('https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400', 'Diskusi Kelompok', 'Kegiatan', 6);
