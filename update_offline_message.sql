-- Add offline_message to school_settings
ALTER TABLE school_settings
ADD COLUMN IF NOT EXISTS offline_message TEXT DEFAULT 'Anda memilih metode pendaftaran Offline. Silahkan datang langsung ke sekretariat sekolah untuk mengisi formulir dan menyerahkan berkas fisik.

Jam Operasional:
Senin - Jumat: 08.00 - 14.00 WITA';

-- Refresh schema cache
NOTIFY pgrst, 'reload config';
