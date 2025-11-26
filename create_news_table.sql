-- Create news table for berita & pengumuman
create table if not exists news (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  category text default 'Pengumuman', -- Prestasi, Kegiatan, Pengumuman
  excerpt text,
  content text, -- Full content
  image_url text,
  published_date date default current_date,
  is_published boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Insert sample news
insert into news (title, category, excerpt, content, image_url, published_date) values
(
  'Juara 1 Olimpiade Matematika Nasional',
  'Prestasi',
  'Siswa kami berhasil meraih medali emas dalam Olimpiade Matematika tingkat nasional yang diselenggarakan di Jakarta.',
  'Dengan bangga kami umumkan bahwa siswa kelas 9, Ahmad Fauzi, berhasil meraih medali emas dalam Olimpiade Matematika Nasional 2024. Kompetisi yang diikuti oleh lebih dari 500 peserta dari seluruh Indonesia ini membuktikan dedikasi dan kerja keras Ahmad serta dukungan penuh dari guru-guru kami. Prestasi ini merupakan yang ketiga kalinya sekolah kami meraih medali emas di ajang bergengsi ini.',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600',
  '2024-11-20'
),
(
  'Pekan Olahraga Sekolah 2024',
  'Kegiatan',
  'Rangkaian kegiatan olahraga diikuti oleh seluruh siswa dengan antusias. Berbagai cabang olahraga dipertandingkan.',
  'Pekan Olahraga Sekolah (POS) tahun 2024 telah sukses dilaksanakan pada tanggal 11-15 November. Acara ini diikuti oleh seluruh siswa dari kelas 7 hingga 9 dengan berbagai cabang olahraga seperti futsal, basket, voli, badminton, dan atletik. Selain meningkatkan sportivitas, kegiatan ini juga mempererat tali persaudaraan antar siswa. Puncak acara ditutup dengan pembagian piala dan medali untuk para juara.',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600',
  '2024-11-18'
);
