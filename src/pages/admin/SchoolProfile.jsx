import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Plus, Trash2, Upload, Facebook, Instagram, Youtube, Twitter, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function SchoolProfile() {
    const [settings, setSettings] = useState({});
    const [carouselImages, setCarouselImages] = useState([]);
    const [socials, setSocials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch Settings - Handle duplicates by keeping the most recent one
            const { data: allSettings, error: settingsError } = await supabase
                .from('school_settings')
                .select('*')
                .order('created_at', { ascending: false }); // Get latest first (if created_at exists, otherwise just order by id)

            if (allSettings && allSettings.length > 0) {
                const latestSettings = allSettings[0];
                setSettings(latestSettings);

                // If duplicates exist, delete them to clean up DB
                if (allSettings.length > 1) {
                    const idsToDelete = allSettings.slice(1).map(s => s.id);
                    await supabase.from('school_settings').delete().in('id', idsToDelete);
                    console.log('Cleaned up duplicate settings:', idsToDelete);
                }
            } else if (settingsError) {
                console.error('Error fetching settings:', settingsError);
            } else {
                // No settings found
                setSettings({});
            }

            // Fetch Carousel
            const { data: imagesData, error: imagesError } = await supabase.from('carousel_images').select('*').order('order_index');
            if (imagesData) setCarouselImages(imagesData);
            if (imagesError) console.error('Error fetching carousel:', imagesError);

            // Fetch Socials
            const { data: socialData, error: socialError } = await supabase.from('social_media').select('*');
            if (socialData) setSocials(socialData);
            if (socialError) console.error('Error fetching socials:', socialError);

        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSettingsChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            // If ID exists, update. If not, insert.
            let error;
            if (settings.id) {
                const { error: updateError } = await supabase
                    .from('school_settings')
                    .update(settings)
                    .eq('id', settings.id);
                error = updateError;
            } else {
                // Insert new row
                const { data, error: insertError } = await supabase
                    .from('school_settings')
                    .insert([settings])
                    .select()
                    .single();
                if (data) setSettings(data);
                error = insertError;
            }

            if (error) throw error;

            // Update CSS variables live
            const root = document.documentElement;
            if (settings.primary_color) root.style.setProperty('--primary-color', settings.primary_color);
            if (settings.secondary_color) root.style.setProperty('--secondary-color', settings.secondary_color);

            toast.success('Pengaturan berhasil disimpan!');
        } catch (err) {
            console.error('Error saving settings:', err);
            alert(`Gagal menyimpan pengaturan: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const fileName = `logo/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage.from('public-assets').upload(fileName, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('public-assets').getPublicUrl(fileName);

            // Update local state
            const newSettings = { ...settings, logo_url: publicUrl };
            setSettings(newSettings);

            // Auto save if ID exists, else just wait for manual save? 
            // Better to try auto-save or just let user click save.
            // Let's try to auto-upsert.
            if (settings.id) {
                await supabase.from('school_settings').update({ logo_url: publicUrl }).eq('id', settings.id);
            } else {
                // If no ID, we can't update. We could insert, but maybe user hasn't filled other fields.
                // Just let them click "Simpan".
                toast.success('Logo diupload. Jangan lupa klik "Simpan Perubahan" untuk menyimpan ke database.');
            }
        } catch (err) {
            console.error('Error uploading logo:', err);
            alert(`Gagal upload logo: ${err.message}`);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const fileName = `carousel/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage.from('public-assets').upload(fileName, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('public-assets').getPublicUrl(fileName);

            const { error: dbError } = await supabase.from('carousel_images').insert([{
                image_url: publicUrl,
                caption: '',
                order_index: carouselImages.length
            }]);

            if (dbError) throw dbError;
            fetchData();
        } catch (err) {
            console.error('Error uploading image:', err);
            alert(`Gagal upload gambar: ${err.message}`);
        }
    };

    const deleteImage = async (id) => {
        if (!confirm('Hapus gambar ini?')) return;
        try {
            await supabase.from('carousel_images').delete().eq('id', id);
            fetchData();
        } catch (err) {
            console.error('Error deleting image:', err);
        }
    };

    // Social Media Logic
    const addSocial = async () => {
        const platform = prompt('Nama Platform (Facebook, Instagram, Youtube, Twitter, Website):');
        if (!platform) return;
        const url = prompt('Link URL:');
        if (!url) return;

        try {
            const { error } = await supabase.from('social_media').insert([{ platform_name: platform, platform_url: url }]);
            if (error) throw error;
            fetchData();
        } catch (err) {
            console.error('Error adding social:', err);
            toast.error('Gagal menambah sosial media.');
        }
    };

    const deleteSocial = async (id) => {
        if (!confirm('Hapus sosial media ini?')) return;
        try {
            await supabase.from('social_media').delete().eq('id', id);
            fetchData();
        } catch (err) {
            console.error('Error deleting social:', err);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ maxWidth: '800px' }}>
            <h1 style={{ marginBottom: '2rem' }}>Profil Sekolah & Tampilan</h1>

            {/* General Settings */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Informasi Dasar</h3>

                <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
                        {settings.logo_url ? (
                            <img src={settings.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>No Logo</span>
                        )}
                    </div>
                    <div>
                        <input type="file" id="logo-upload" style={{ display: 'none' }} onChange={handleLogoUpload} accept="image/*" />
                        <label htmlFor="logo-upload" className="btn btn-outline" style={{ cursor: 'pointer' }}>
                            <Upload size={18} /> Upload Logo
                        </label>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Format: PNG, JPG (Max 2MB)</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nama Sekolah</label>
                        <input type="text" name="school_name" value={settings.school_name || ''} onChange={handleSettingsChange} className="input" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Slogan</label>
                        <input type="text" name="slogan" value={settings.slogan || ''} onChange={handleSettingsChange} className="input" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Alamat</label>
                        <textarea name="address" value={settings.address || ''} onChange={handleSettingsChange} className="input" rows={3} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>No Telepon</label>
                        <input type="text" name="contact_phone" value={settings.contact_phone || ''} onChange={handleSettingsChange} className="input" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Google Maps URL (Embed)</label>
                        <input type="text" name="google_maps_url" value={settings.google_maps_url || ''} onChange={handleSettingsChange} className="input" placeholder="https://www.google.com/maps/embed?..." />
                    </div>

                    <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Judul CTA (Halaman Depan)</label>
                        <input type="text" name="cta_title" value={settings.cta_title || ''} onChange={handleSettingsChange} className="input" placeholder="Siap Bergabung Bersama Kami?" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Deskripsi CTA (Halaman Depan)</label>
                        <textarea name="cta_description" value={settings.cta_description || ''} onChange={handleSettingsChange} className="input" rows={3} placeholder="Pendaftaran Tahun Ajaran Baru Telah Dibuka..." />
                    </div>
                </div>
            </div>

            {/* Social Media Settings */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Sosial Media</h3>
                    <button onClick={addSocial} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem' }}>
                        <Plus size={16} /> Tambah
                    </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {socials.map(social => (
                        <div key={social.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {social.platform_name.toLowerCase().includes('facebook') ? <Facebook size={20} /> :
                                    social.platform_name.toLowerCase().includes('instagram') ? <Instagram size={20} /> :
                                        social.platform_name.toLowerCase().includes('youtube') ? <Youtube size={20} /> :
                                            social.platform_name.toLowerCase().includes('twitter') ? <Twitter size={20} /> :
                                                <Globe size={20} />}
                                <div>
                                    <p style={{ fontWeight: 500 }}>{social.platform_name}</p>
                                    <a href={social.platform_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.875rem', color: 'var(--primary-color)' }}>{social.platform_url}</a>
                                </div>
                            </div>
                            <button onClick={() => deleteSocial(social.id)} style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    {socials.length === 0 && <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Belum ada sosial media.</p>}
                </div>
            </div>

            {/* Theme Settings */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Tema Warna</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Warna Utama</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="color" name="primary_color" value={settings.primary_color || '#10b981'} onChange={handleSettingsChange} style={{ height: '40px', width: '60px' }} />
                            <input type="text" name="primary_color" value={settings.primary_color || '#10b981'} onChange={handleSettingsChange} className="input" />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Warna Sekunder</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="color" name="secondary_color" value={settings.secondary_color || '#059669'} onChange={handleSettingsChange} style={{ height: '40px', width: '60px' }} />
                            <input type="text" name="secondary_color" value={settings.secondary_color || '#059669'} onChange={handleSettingsChange} className="input" />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={saveSettings} className="btn btn-primary" disabled={saving}>
                    <Save size={18} /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
            </div>

            {/* Carousel Management */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3>Foto Carousel</h3>
                    <div>
                        <input type="file" id="carousel-upload" style={{ display: 'none' }} onChange={handleImageUpload} accept="image/*" />
                        <label htmlFor="carousel-upload" className="btn btn-outline" style={{ cursor: 'pointer' }}>
                            <Plus size={18} /> Tambah Foto
                        </label>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                    {carouselImages.map((img) => (
                        <div key={img.id} style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                            <img src={img.image_url} alt="Carousel" style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                            <button
                                onClick={() => deleteImage(img.id)}
                                style={{
                                    position: 'absolute',
                                    top: '0.25rem',
                                    right: '0.25rem',
                                    backgroundColor: 'rgba(255,0,0,0.8)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    padding: '0.25rem',
                                    cursor: 'pointer'
                                }}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    {carouselImages.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>Belum ada foto.</p>}
                </div>
            </div>
        </div>
    );
}
