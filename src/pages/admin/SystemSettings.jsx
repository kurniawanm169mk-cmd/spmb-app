import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';

export default function SystemSettings() {
    const [dates, setDates] = useState({});
    const [formFields, setFormFields] = useState([]);
    const [videos, setVideos] = useState([]); // [NEW] Video state
    const [loading, setLoading] = useState(true);
    const [savingDates, setSavingDates] = useState(false);
    const [savingForm, setSavingForm] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch Dates & Bank Info
            const { data: settings } = await supabase.from('school_settings').select('id, registration_start_date, registration_end_date, announcement_date, bank_name, bank_account_number, bank_account_holder, registration_fee, fullday_description, boarding_description, online_description, offline_description, offline_message, header_bg_color, header_text_color, header_font_family, header_font_size, header_blur, header_font_weight, header_letter_spacing, header_bg_opacity, google_maps_url, offline_images, smart_doc_label, smart_doc_description, allow_fullday_ikhwan, allow_fullday_akhwat, allow_boarding_ikhwan, allow_boarding_akhwat, hide_program_in_dashboard').maybeSingle();
            if (settings) {
                // Format dates for input type="datetime-local"
                const format = (d) => d ? new Date(d).toISOString().slice(0, 16) : '';
                setDates({
                    ...settings,
                    registration_start_date: format(settings.registration_start_date),
                    registration_end_date: format(settings.registration_end_date),
                    announcement_date: format(settings.announcement_date)
                });
            }

            // Fetch Form Config
            const { data: fields } = await supabase.from('form_config').select('*').order('order_index');
            if (fields) setFormFields(fields);

            // Fetch Videos
            const { data: vids } = await supabase.from('landing_page_videos').select('*').order('order_index');
            if (vids) setVideos(vids);

        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDates(prev => ({ ...prev, [name]: value }));
    };

    const saveDates = async () => {
        setSavingDates(true);
        try {
            const { error } = await supabase
                .from('school_settings')
                .update({
                    registration_start_date: dates.registration_start_date || null,
                    registration_end_date: dates.registration_end_date || null,
                    announcement_date: dates.announcement_date || null,
                    bank_name: dates.bank_name,
                    bank_account_number: dates.bank_account_number,
                    bank_account_holder: dates.bank_account_holder,
                    registration_fee: dates.registration_fee,
                    fullday_description: dates.fullday_description,
                    boarding_description: dates.boarding_description,
                    online_description: dates.online_description,
                    offline_description: dates.offline_description,
                    offline_description: dates.offline_description,
                    offline_message: dates.offline_message,
                    header_bg_color: dates.header_bg_color,
                    header_text_color: dates.header_text_color,
                    header_font_family: dates.header_font_family,
                    header_font_size: dates.header_font_size,
                    header_blur: dates.header_blur,
                    header_font_weight: dates.header_font_weight,
                    header_letter_spacing: dates.header_letter_spacing,
                    header_bg_opacity: dates.header_bg_opacity,
                    google_maps_url: dates.google_maps_url,
                    offline_images: dates.offline_images,
                    smart_doc_label: dates.smart_doc_label,
                    smart_doc_description: dates.smart_doc_description,
                    smart_doc_label: dates.smart_doc_label,
                    smart_doc_description: dates.smart_doc_description,
                    allow_fullday_ikhwan: dates.allow_fullday_ikhwan,
                    allow_fullday_akhwat: dates.allow_fullday_akhwat,
                    allow_boarding_ikhwan: dates.allow_boarding_ikhwan,
                    allow_boarding_akhwat: dates.allow_boarding_akhwat,
                    hide_program_in_dashboard: dates.hide_program_in_dashboard
                })
                .eq('id', dates.id);

            if (error) throw error;
            toast.success('Tanggal berhasil disimpan!');
        } catch (err) {
            console.error('Error saving dates:', err);
            toast.error('Gagal menyimpan tanggal.');
        } finally {
            setSavingDates(false);
        }
    };

    // Form Builder Logic
    const addField = () => {
        setFormFields([...formFields, {
            id: `temp-${Date.now()}`,
            field_name: `field_${Date.now()}`,
            field_label: 'Field Baru',
            field_type: 'text',
            is_required: false,
            order_index: formFields.length
        }]);
    };

    const updateField = (index, key, value) => {
        const newFields = [...formFields];
        newFields[index][key] = value;
        setFormFields(newFields);
    };

    const removeField = async (index) => {
        const field = formFields[index];
        if (field.id && !field.id.toString().startsWith('temp')) {
            if (!confirm('Hapus field ini dari database? Data yang sudah diisi siswa mungkin akan hilang tampilannya.')) return;
            await supabase.from('form_config').delete().eq('id', field.id);
        }
        const newFields = formFields.filter((_, i) => i !== index);
        setFormFields(newFields);
    };

    const saveFormConfig = async () => {
        setSavingForm(true);
        try {
            // Upsert all fields
            const updates = formFields.map((field, index) => ({
                id: field.id.toString().startsWith('temp') ? undefined : field.id,
                field_name: field.field_name,
                field_label: field.field_label,
                field_type: field.field_type,
                is_required: field.is_required,
                order_index: index,
                options: field.field_type === 'select' && typeof field.options === 'string' ? field.options.split(',') : field.options
            }));

            const { error } = await supabase.from('form_config').upsert(updates);
            if (error) throw error;

            toast.success('Konfigurasi form berhasil disimpan!');
            fetchData(); // Refresh IDs
        } catch (err) {
            console.error('Error saving form config:', err);
            toast.error('Gagal menyimpan konfigurasi form.');
        } finally {
            setSavingForm(false);
        }
    };

    // Video Manager Logic
    const addVideo = async () => {
        const title = prompt('Judul Video:');
        if (!title) return;
        const url = prompt('URL YouTube (Contoh: https://www.youtube.com/watch?v=...):');
        if (!url) return;

        try {
            const { error } = await supabase.from('landing_page_videos').insert([{
                title,
                video_url: url,
                order_index: videos.length
            }]);
            if (error) throw error;
            fetchData();
            toast.success('Video berhasil ditambahkan!');
        } catch (err) {
            console.error('Error adding video:', err);
            toast.error('Gagal menambah video.');
        }
    };

    const deleteVideo = async (id) => {
        if (!confirm('Hapus item ini?')) return;
        try {
            await supabase.from('landing_page_videos').delete().eq('id', id);
            fetchData();
            toast.success('Item dihapus.');
        } catch (err) {
            console.error('Error deleting item:', err);
            toast.error('Gagal menghapus item.');
        }
    };

    const editGalleryItem = async (item) => {
        const newTitle = prompt('Edit Judul:', item.title);
        if (newTitle === null) return; // Cancelled

        let newUrl = item.video_url;
        if (item.type === 'video') {
            const urlInput = prompt('Edit URL Video (YouTube, TikTok, Instagram, Facebook):', item.video_url);
            if (urlInput === null) return; // Cancelled
            newUrl = urlInput;
        }

        try {
            const { error } = await supabase
                .from('landing_page_videos')
                .update({
                    title: newTitle,
                    video_url: newUrl
                })
                .eq('id', item.id);

            if (error) throw error;
            fetchData();
            toast.success('Item berhasil diupdate!');
        } catch (err) {
            console.error('Error updating item:', err);
            toast.error('Gagal update item.');
        }
    };

    // Offline Image Logic
    const handleOfflineImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `offline_${Date.now()}.${fileExt}`;
            const filePath = `offline/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('public-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('public-images').getPublicUrl(filePath);

            const currentImages = dates.offline_images || [];
            if (currentImages.length >= 4) {
                alert('Maksimal 4 gambar.');
                return;
            }

            const newImages = [...currentImages, publicUrl];
            setDates(prev => ({ ...prev, offline_images: newImages }));

            // Auto save to update DB immediately or wait for manual save?
            // Let's modify local state, user must click Save.
            toast.success('Gambar berhasil diupload. Jangan lupa klik Simpan.');
        } catch (err) {
            console.error('Error uploading offline image:', err);
            toast.error('Gagal upload gambar.');
        }
    };

    const removeOfflineImage = (index) => {
        const newImages = (dates.offline_images || []).filter((_, i) => i !== index);
        setDates(prev => ({ ...prev, offline_images: newImages }));
    };

    // Gallery Logic (Replaces addVideo)
    const addGalleryItem = async (type) => {
        const title = prompt('Judul Item:');
        if (!title) return;

        let url = '';
        let image_url = null;

        if (type === 'video') {
            url = prompt('URL Video (YouTube, TikTok, Instagram, Facebook):');
            if (!url) return;
        } else {
            // For image, we need an upload input. But using prompt is hard.
            // Simplified: Prompt for Image URL (or user can upload elsewhere).
            // BETTER: Use a hidden file input or just use prompt for URL for now to keep it simple, 
            // OR strictly perform upload.
            // Let's trigger a hidden file input click? No, React state is easier.
            // Let's keep it simple: "Input Image URL" (User can upload to a hosting site or we implement a proper modal... 
            // Modal is too complex for this single-file edit).
            // Compromise: Prompt for URL. User can use external URL or we add a separate "Upload to Gallery" button.
            // Let's try separate buttons in the UI: "Add Video" "Upload Image".
            return; // Handled in UI
        }

        try {
            const { error } = await supabase.from('landing_page_videos').insert([{
                title,
                video_url: url,
                type: 'video',
                order_index: videos.length
            }]);
            if (error) throw error;
            fetchData();
            toast.success('Video ditambahkan!');
        } catch (err) {
            console.error('Error adding video:', err);
            toast.error('Gagal menambah video.');
        }
    };

    const addGalleryImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const title = prompt('Judul Gambar:');
        if (!title) return; // Cancelled

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `gallery_${Date.now()}.${fileExt}`;
            const filePath = `gallery/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('public-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('public-images').getPublicUrl(filePath);

            const { error } = await supabase.from('landing_page_videos').insert([{
                title,
                image_url: publicUrl,
                type: 'image',
                video_url: '', // Empty for image
                order_index: videos.length
            }]);

            if (error) throw error;
            fetchData();
            toast.success('Gambar ditambahkan!');
        } catch (err) {
            console.error('Error adding image:', err);
            toast.error('Gagal menambah image.');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ maxWidth: '800px' }}>
            <h1 style={{ marginBottom: '2rem' }}>Pengaturan Sistem</h1>

            {/* Date Management */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Jadwal Pendaftaran</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tanggal Buka Pendaftaran</label>
                        <input type="datetime-local" name="registration_start_date" value={dates.registration_start_date || ''} onChange={handleDateChange} className="input" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tanggal Tutup Pendaftaran</label>
                        <input type="datetime-local" name="registration_end_date" value={dates.registration_end_date || ''} onChange={handleDateChange} className="input" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tanggal Pengumuman</label>
                        <input type="datetime-local" name="announcement_date" value={dates.announcement_date || ''} onChange={handleDateChange} className="input" />
                    </div>
                </div>
            </div>

            {/* Bank & Payment Settings */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Informasi Pembayaran</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nama Bank</label>
                        <input type="text" name="bank_name" value={dates.bank_name || ''} onChange={handleDateChange} className="input" placeholder="Contoh: Bank Syariah Indonesia (BSI)" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nomor Rekening</label>
                        <input type="text" name="bank_account_number" value={dates.bank_account_number || ''} onChange={handleDateChange} className="input" placeholder="Contoh: 1234567890" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Atas Nama</label>
                        <input type="text" name="bank_account_holder" value={dates.bank_account_holder || ''} onChange={handleDateChange} className="input" placeholder="Contoh: Yayasan Ibnu Sina" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Biaya Pendaftaran (Rp)</label>
                        <input type="number" name="registration_fee" value={dates.registration_fee || ''} onChange={handleDateChange} className="input" placeholder="Contoh: 150000" />
                    </div>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={saveDates} className="btn btn-primary" disabled={savingDates}>
                        <Save size={18} /> Simpan Pengaturan
                    </button>
                </div>
            </div>

            {/* Program Availability Settings */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Pengaturan Program & Kuota</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                    {/* Fullday Settings */}
                    <div>
                        <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Program Fullday</h4>
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="allow_fullday_ikhwan"
                                    checked={dates.allow_fullday_ikhwan !== false}
                                    onChange={(e) => setDates(prev => ({ ...prev, allow_fullday_ikhwan: e.target.checked }))}
                                />
                                Buka untuk Ikhwan (Laki-laki)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="allow_fullday_akhwat"
                                    checked={dates.allow_fullday_akhwat !== false}
                                    onChange={(e) => setDates(prev => ({ ...prev, allow_fullday_akhwat: e.target.checked }))}
                                />
                                Buka untuk Akhwat (Perempuan)
                            </label>
                        </div>
                    </div>

                    {/* Boarding Settings */}
                    <div>
                        <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Program Boarding</h4>
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="allow_boarding_ikhwan"
                                    checked={dates.allow_boarding_ikhwan !== false}
                                    onChange={(e) => setDates(prev => ({ ...prev, allow_boarding_ikhwan: e.target.checked }))}
                                />
                                Buka untuk Ikhwan (Laki-laki)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="allow_boarding_akhwat"
                                    checked={dates.allow_boarding_akhwat !== false}
                                    onChange={(e) => setDates(prev => ({ ...prev, allow_boarding_akhwat: e.target.checked }))}
                                />
                                Buka untuk Akhwat (Perempuan)
                            </label>
                        </div>
                    </div>
                </div>

                {/* Dashboard Visibility */}
                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
                        <input
                            type="checkbox"
                            name="hide_program_in_dashboard"
                            checked={dates.hide_program_in_dashboard || false}
                            onChange={(e) => setDates(prev => ({ ...prev, hide_program_in_dashboard: e.target.checked }))}
                        />
                        Sembunyikan Pilihan 'Program Pilihan' (Jalur Pendaftaran) di Dashboard Siswa
                    </label>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '1.5rem', marginTop: '0.25rem' }}>
                        Centang ini untuk menyembunyikan dropdown Fullday/Boarding di formulir biodata siswa (Dashboard), sehingga hanya muncul saat pendaftaran awal.
                    </p>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={saveDates} className="btn btn-primary" disabled={savingDates}>
                        <Save size={18} /> Simpan Pengaturan
                    </button>
                </div>
            </div>

            {/* Header / Styling Settings */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Kustomisasi Header & Tampilan</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Font Family</label>
                        <select name="header_font_family" value={dates.header_font_family || 'Inter'} onChange={handleDateChange} className="input">
                            <option value="Inter">Inter</option>
                            <option value="Poppins">Poppins</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Open Sans">Open Sans</option>
                            <option value="Montserrat">Montserrat</option>
                            <option value="Playfair Display">Playfair Display (Serif)</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Background Color</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="color" name="header_bg_color" value={dates.header_bg_color || '#ffffff'} onChange={handleDateChange} style={{ height: '42px', width: '60px', padding: '0', border: '1px solid #e2e8f0' }} />
                            <input type="text" name="header_bg_color" value={dates.header_bg_color || '#ffffff'} onChange={handleDateChange} className="input" />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Text Color</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="color" name="header_text_color" value={dates.header_text_color || '#000000'} onChange={handleDateChange} style={{ height: '42px', width: '60px', padding: '0', border: '1px solid #e2e8f0' }} />
                            <input type="text" name="header_text_color" value={dates.header_text_color || '#000000'} onChange={handleDateChange} className="input" />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Glass Blur (px)</label>
                        <input type="range" name="header_blur" min="0" max="20" value={dates.header_blur || 10} onChange={handleDateChange} style={{ width: '100%' }} />
                        <div style={{ textAlign: 'center', fontSize: '0.8rem' }}>{dates.header_blur || 10}px</div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Opacity (0-100%)</label>
                        <input type="range" name="header_bg_opacity" min="0" max="1" step="0.05" value={dates.header_bg_opacity || 0.8} onChange={handleDateChange} style={{ width: '100%' }} />
                        <div style={{ textAlign: 'center', fontSize: '0.8rem' }}>{Math.round((dates.header_bg_opacity || 0.8) * 100)}%</div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Font Weight</label>
                        <select name="header_font_weight" value={dates.header_font_weight || 'bold'} onChange={handleDateChange} className="input">
                            <option value="normal">Normal</option>
                            <option value="500">Medium</option>
                            <option value="600">Semi Bold</option>
                            <option value="bold">Bold</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Font Size (e.g. 1.25rem)</label>
                        <input type="text" name="header_font_size" value={dates.header_font_size || '1.25rem'} onChange={handleDateChange} className="input" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Letter Spacing</label>
                        <select name="header_letter_spacing" value={dates.header_letter_spacing || 'normal'} onChange={handleDateChange} className="input">
                            <option value="-0.05em">Tight (-0.05em)</option>
                            <option value="normal">Normal</option>
                            <option value="0.05em">Wide (0.05em)</option>
                            <option value="0.1em">Widest (0.1em)</option>
                        </select>
                    </div>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={saveDates} className="btn btn-primary" disabled={savingDates}>
                        <Save size={18} /> Simpan Pengaturan
                    </button>
                </div>
            </div>

            {/* Descriptions Settings */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Keterangan & Informasi</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Deskripsi Program Fullday</label>
                        <textarea
                            name="fullday_description"
                            value={dates.fullday_description || ''}
                            onChange={handleDateChange}
                            className="input"
                            rows={2}
                            placeholder="Contoh: Program sekolah sehari penuh..."
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Deskripsi Program Boarding</label>
                        <textarea
                            name="boarding_description"
                            value={dates.boarding_description || ''}
                            onChange={handleDateChange}
                            className="input"
                            rows={2}
                            placeholder="Contoh: Program sekolah dengan asrama..."
                        />
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Keterangan Daftar Online</label>
                        <textarea
                            name="online_description"
                            value={dates.online_description || ''}
                            onChange={handleDateChange}
                            className="input"
                            rows={2}
                            placeholder="Contoh: Khusus siswa luar pulau..."
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Keterangan Daftar Offline (Di Toggle)</label>
                        <textarea
                            name="offline_description"
                            value={dates.offline_description || ''}
                            onChange={handleDateChange}
                            className="input"
                            rows={2}
                            placeholder="Contoh: Khusus siswa domisili lokal..."
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Pesan/Instruksi Mode Offline (Full Page)</label>
                        <textarea
                            name="offline_message"
                            value={dates.offline_message || ''}
                            onChange={handleDateChange}
                            className="input"
                            rows={4}
                            placeholder="Pesang yang muncul saat siswa memilih offline..."
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>URL Google Maps Embed (src="...")</label>
                        <input
                            type="text"
                            name="google_maps_url"
                            value={dates.google_maps_url || ''}
                            onChange={handleDateChange}
                            className="input"
                            placeholder="https://www.google.com/maps/embed?..."
                        />
                        <small style={{ color: 'var(--text-secondary)' }}>Copy dari Google Maps > Share > Embed a map > Copy HTML (ambil isi src-nya saja)</small>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Gambar Panduan Offline (Max 4)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                            {(dates.offline_images || []).map((img, idx) => (
                                <div key={idx} style={{ position: 'relative', height: '100px', backgroundColor: '#eee', borderRadius: '8px', overflow: 'hidden' }}>
                                    <img src={img} alt="Offline" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button onClick={() => removeOfflineImage(idx)} style={{ position: 'absolute', top: 2, right: 2, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}>&times;</button>
                                </div>
                            ))}
                            {(dates.offline_images?.length || 0) < 4 && (
                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', border: '2px dashed #ccc', borderRadius: '8px', cursor: 'pointer' }}>
                                    <input type="file" accept="image/*" onChange={handleOfflineImageUpload} style={{ display: 'none' }} />
                                    <Plus size={24} color="#ccc" />
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                {/* SMART DOC LABELS */}
                <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                    <h4 style={{ marginBottom: '1rem' }}>Label Dokumen Pintar</h4>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Judul / Label</label>
                            <input
                                type="text"
                                name="smart_doc_label"
                                value={dates.smart_doc_label || ''}
                                onChange={handleDateChange}
                                className="input"
                                placeholder="Default: Dokumen Pintar / Smart Docs"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Deskripsi / Instruksi</label>
                            <textarea
                                name="smart_doc_description"
                                value={dates.smart_doc_description || ''}
                                onChange={handleDateChange}
                                className="input"
                                rows={2}
                                placeholder="Default: Anda dapat mengisi dokumen secara online..."
                            />
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={saveDates} className="btn btn-primary" disabled={savingDates}>
                        <Save size={18} /> Simpan Keterangan
                    </button>
                </div>
            </div>

            {/* Gallery Manager */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3>Manajemen Galeri (Video & Gambar)</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => addGalleryItem('video')} className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <Plus size={16} /> Video YouTube
                        </button>
                        <label className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer' }}>
                            <input type="file" accept="image/*" onChange={addGalleryImage} style={{ display: 'none' }} />
                            <Plus size={16} /> Upload Gambar
                        </label>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {videos.map(item => (
                        <div key={item.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                            {item.type === 'image' ? (
                                <div style={{ height: '100px', backgroundColor: '#f0f0f0', marginBottom: '0.5rem', borderRadius: '4px', overflow: 'hidden' }}>
                                    <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ) : (
                                <div style={{ height: '100px', backgroundColor: '#fee2e2', marginBottom: '0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontSize: '0.75rem' }}>
                                    VIDEO
                                </div>
                            )}
                            <p style={{ fontWeight: 500, marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.9rem' }}>{item.title}</p>
                            <p style={{ fontWeight: 500, marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.9rem' }}>{item.title}</p>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => deleteVideo(item.id)} style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Trash2 size={14} /> Hapus
                                </button>
                                <button onClick={() => editGalleryItem(item)} style={{ color: 'var(--primary-color)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))}
                    {videos.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>Belum ada item galeri.</p>}
                </div>
            </div>

            {/* Form Builder */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3>Konfigurasi Formulir Pendaftaran</h3>
                    <button onClick={addField} className="btn btn-outline">
                        <Plus size={18} /> Tambah Field
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {formFields.map((field, index) => (
                        <div key={field.id || index} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: '#f8fafc' }}>
                            <div style={{ flex: 1, display: 'grid', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.75rem' }}>Label</label>
                                        <input type="text" value={field.field_label} onChange={(e) => updateField(index, 'field_label', e.target.value)} className="input" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.75rem' }}>Variable Name (Unique)</label>
                                        <input type="text" value={field.field_name} onChange={(e) => updateField(index, 'field_name', e.target.value)} className="input" />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.75rem' }}>Tipe Input</label>
                                        <select value={field.field_type} onChange={(e) => updateField(index, 'field_type', e.target.value)} className="input">
                                            <option value="text">Text</option>
                                            <option value="number">Number</option>
                                            <option value="date">Date</option>
                                            <option value="textarea">Textarea</option>
                                            <option value="select">Select (Dropdown)</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={field.is_required} onChange={(e) => updateField(index, 'is_required', e.target.checked)} />
                                            Wajib Diisi
                                        </label>
                                    </div>
                                </div>
                                {field.field_type === 'select' && (
                                    <div>
                                        <label style={{ fontSize: '0.75rem' }}>Opsi (Pisahkan dengan koma)</label>
                                        <input
                                            type="text"
                                            value={Array.isArray(field.options) ? field.options.join(',') : field.options || ''}
                                            onChange={(e) => updateField(index, 'options', e.target.value.split(','))}
                                            className="input"
                                            placeholder="Contoh: Laki-laki,Perempuan"
                                        />
                                    </div>
                                )}
                            </div>
                            <button onClick={() => removeField(index)} className="btn btn-outline" style={{ color: 'var(--error)', borderColor: 'var(--error)', marginTop: '1.5rem' }}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={saveFormConfig} className="btn btn-primary" disabled={savingForm}>
                        <Save size={18} /> Simpan Konfigurasi Form
                    </button>
                </div>
            </div>
        </div >
    );
}
