import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function CTASettings() {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await supabase
                .from('school_settings')
                .select('*')
                .limit(1)
                .maybeSingle();

            if (data) setSettings(data);
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const fileName = `cta/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from('public-assets')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('public-assets')
                .getPublicUrl(fileName);

            setSettings(prev => ({ ...prev, cta_image_url: publicUrl }));
            toast.success('Gambar berhasil diupload!');
        } catch (error) {
            console.error('Error uploading:', error);
            toast.error('Gagal upload gambar');
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('school_settings')
                .update({
                    cta_image_url: settings.cta_image_url,
                    cta_overlay_opacity: settings.cta_overlay_opacity
                })
                .eq('id', settings.id);

            if (error) throw error;
            toast.success('Pengaturan CTA berhasil disimpan!');
        } catch (error) {
            console.error('Error saving:', error);
            toast.error('Gagal menyimpan pengaturan');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ maxWidth: '800px' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>CTA Section Settings</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Atur background image dan overlay untuk section Call-to-Action
                    </p>
                </div>
                <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                    <Save size={18} /> {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Background Image</h3>

                {settings.cta_image_url && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <img
                            src={settings.cta_image_url}
                            alt="CTA Background"
                            style={{
                                width: '100%',
                                maxHeight: '300px',
                                objectFit: 'cover',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)'
                            }}
                        />
                    </div>
                )}

                <input
                    type="file"
                    id="cta-image"
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleImageUpload}
                />
                <label htmlFor="cta-image" className="btn btn-outline" style={{ cursor: 'pointer' }}>
                    <Upload size={18} /> {settings.cta_image_url ? 'Ganti Gambar' : 'Upload Gambar'}
                </label>
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Recommended: 1920x600px, format JPG/PNG
                </p>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1.5rem' }}>Overlay Settings</h3>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                        Kegelapan Overlay: {settings.cta_overlay_opacity || 80}%
                    </label>
                    <input
                        type="range"
                        name="cta_overlay_opacity"
                        min="0"
                        max="100"
                        value={settings.cta_overlay_opacity || 80}
                        onChange={handleChange}
                        style={{ width: '100%', accentColor: 'var(--primary-color)' }}
                    />
                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Semakin tinggi nilai, semakin gelap overlay-nya (untuk memastikan teks tetap terbaca)
                    </p>
                </div>
            </div>
        </div>
    );
}
