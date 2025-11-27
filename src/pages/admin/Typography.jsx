import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

export default function Typography() {
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

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('school_settings')
                .update(settings)
                .eq('id', settings.id);

            if (error) throw error;

            // Apply to CSS variables
            const root = document.documentElement;
            if (settings.hero_title_size_pc) root.style.setProperty('--hero-title-size-pc', settings.hero_title_size_pc);
            if (settings.hero_title_size_mobile) root.style.setProperty('--hero-title-size-mobile', settings.hero_title_size_mobile);
            // Add more CSS variable updates as needed

            toast.success('Pengaturan tipografi berhasil disimpan!');
        } catch (error) {
            console.error('Error saving:', error);
            toast.error('Gagal menyimpan pengaturan');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ maxWidth: '900px' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>Pengaturan Tipografi</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Atur ukuran dan kerapatan teks untuk PC dan Mobile
                    </p>
                </div>
                <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                    <Save size={18} /> {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
            </div>

            {/* Header Title (Navbar) */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Header Title (Nama Sekolah di Navbar)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Ukuran Font PC</label>
                        <input
                            type="text"
                            name="header_title_size_pc"
                            value={settings.header_title_size_pc || '1.5rem'}
                            onChange={handleChange}
                            className="input"
                            placeholder="1.5rem"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Ukuran Font Mobile</label>
                        <input
                            type="text"
                            name="header_title_size_mobile"
                            value={settings.header_title_size_mobile || '1.25rem'}
                            onChange={handleChange}
                            className="input"
                            placeholder="1.25rem"
                        />
                    </div>
                </div>
            </div>

            {/* Hero Title */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Hero Title (Judul Utama)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-secondary)' }}>PC / Desktop</h4>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Ukuran Font</label>
                                <input
                                    type="text"
                                    name="hero_title_size_pc"
                                    value={settings.hero_title_size_pc || '3.5rem'}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="3.5rem"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Kerapatan Huruf</label>
                                <input
                                    type="text"
                                    name="hero_title_spacing_pc"
                                    value={settings.hero_title_spacing_pc || '-0.02em'}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="-0.02em"
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Mobile</h4>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Ukuran Font</label>
                                <input
                                    type="text"
                                    name="hero_title_size_mobile"
                                    value={settings.hero_title_size_mobile || '2rem'}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="2rem"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Kerapatan Huruf</label>
                                <input
                                    type="text"
                                    name="hero_title_spacing_mobile"
                                    value={settings.hero_title_spacing_mobile || '-0.01em'}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="-0.01em"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Schedule */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Jadwal Pendaftaran</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Ukuran Font PC</label>
                        <input
                            type="text"
                            name="schedule_size_pc"
                            value={settings.schedule_size_pc || '1rem'}
                            onChange={handleChange}
                            className="input"
                            placeholder="1rem"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Ukuran Font Mobile</label>
                        <input
                            type="text"
                            name="schedule_size_mobile"
                            value={settings.schedule_size_mobile || '0.875rem'}
                            onChange={handleChange}
                            className="input"
                            placeholder="0.875rem"
                        />
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>CTA Section</h3>

                {/* CTA Title */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>Judul CTA</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Ukuran Font PC</label>
                            <input
                                type="text"
                                name="cta_title_size_pc"
                                value={settings.cta_title_size_pc || '2.5rem'}
                                onChange={handleChange}
                                className="input"
                                placeholder="2.5rem"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Ukuran Font Mobile</label>
                            <input
                                type="text"
                                name="cta_title_size_mobile"
                                value={settings.cta_title_size_mobile || '1.75rem'}
                                onChange={handleChange}
                                className="input"
                                placeholder="1.75rem"
                            />
                        </div>
                    </div>

                    {/* CTA Title Styling */}
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                name="cta_title_bold"
                                checked={settings.cta_title_bold || false}
                                onChange={(e) => setSettings(prev => ({ ...prev, cta_title_bold: e.target.checked }))}
                            />
                            Bold
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                name="cta_title_italic"
                                checked={settings.cta_title_italic || false}
                                onChange={(e) => setSettings(prev => ({ ...prev, cta_title_italic: e.target.checked }))}
                            />
                            Italic
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                name="cta_title_underline"
                                checked={settings.cta_title_underline || false}
                                onChange={(e) => setSettings(prev => ({ ...prev, cta_title_underline: e.target.checked }))}
                            />
                            Underline
                        </label>
                    </div>
                </div>

                <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />

                {/* CTA Description */}
                <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>Teks Pendukung (Deskripsi)</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Ukuran Font PC</label>
                            <input
                                type="text"
                                name="cta_description_size_pc"
                                value={settings.cta_description_size_pc || '1.25rem'}
                                onChange={handleChange}
                                className="input"
                                placeholder="1.25rem"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Ukuran Font Mobile</label>
                            <input
                                type="text"
                                name="cta_description_size_mobile"
                                value={settings.cta_description_size_mobile || '1rem'}
                                onChange={handleChange}
                                className="input"
                                placeholder="1rem"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
