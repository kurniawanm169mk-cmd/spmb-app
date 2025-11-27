import React from 'react';
import { supabase } from '../../lib/supabase';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function CTASettings({ settings, setSettings, handleSettingsChange }) {
    const handleCTAImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const fileName = `cta/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage.from('public-assets').upload(fileName, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('public-assets').getPublicUrl(fileName);
            setSettings(prev => ({ ...prev, cta_image_url: publicUrl }));
            toast.success('Gambar CTA berhasil diupload!');
        } catch (err) {
            console.error('Error uploading CTA image:', err);
            alert('Gagal mengupload gambar CTA');
        }
    };

    return (
        <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>CTA Background & Overlay</h3>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Gambar Background (Opsional)</label>
                {settings.cta_image_url && (
                    <img
                        src={settings.cta_image_url}
                        alt="CTA Background"
                        style={{
                            width: '100%',
                            maxHeight: '200px',
                            objectFit: 'cover',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '1rem'
                        }}
                    />
                )}
                <input
                    type="file"
                    id="cta-image-upload"
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleCTAImageUpload}
                />
                <label htmlFor="cta-image-upload" className="btn btn-outline" style={{ cursor: 'pointer' }}>
                    <Upload size={18} /> Upload Gambar CTA
                </label>
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Upload gambar untuk background section CTA (opsional).
                </p>
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Kegelapan Overlay ({settings.cta_overlay_opacity || 80}%)
                </label>
                <input
                    type="range"
                    name="cta_overlay_opacity"
                    min="0"
                    max="100"
                    value={settings.cta_overlay_opacity || 80}
                    onChange={handleSettingsChange}
                    style={{ width: '100%', accentColor: 'var(--primary-color)' }}
                />
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Atur kegelapan overlay agar teks tetap terbaca di atas gambar.
                </p>
            </div>
        </div>
    );
}
