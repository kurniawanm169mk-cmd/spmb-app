import React from 'react';

export default function TypographySettings({ settings, handleSettingsChange }) {
    return (
        <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Pengaturan Tipografi (PC & Mobile)</h3>
            <p style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Atur ukuran dan kerapatan teks untuk berbagai bagian website. Pisah untuk PC dan Mobile.
            </p>

            {/* Hero Title Typography */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
                <h5 style={{ marginBottom: '1rem', fontWeight: '600' }}>Hero Title (Judul Utama)</h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Ukuran PC</label>
                        <input
                            type="text"
                            name="hero_title_size_pc"
                            value={settings.hero_title_size_pc || '3.5rem'}
                            onChange={handleSettingsChange}
                            className="input"
                            placeholder="3.5rem"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Ukuran Mobile</label>
                        <input
                            type="text"
                            name="hero_title_size_mobile"
                            value={settings.hero_title_size_mobile || '2rem'}
                            onChange={handleSettingsChange}
                            className="input"
                            placeholder="2rem"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Kerapatan PC</label>
                        <input
                            type="text"
                            name="hero_title_spacing_pc"
                            value={settings.hero_title_spacing_pc || '-0.02em'}
                            onChange={handleSettingsChange}
                            className="input"
                            placeholder="-0.02em"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Kerapatan Mobile</label>
                        <input
                            type="text"
                            name="hero_title_spacing_mobile"
                            value={settings.hero_title_spacing_mobile || '-0.01em'}
                            onChange={handleSettingsChange}
                            className="input"
                            placeholder="-0.01em"
                        />
                    </div>
                </div>
            </div>

            {/* Schedule Typography */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
                <h5 style={{ marginBottom: '1rem', fontWeight: '600' }}>Jadwal Pendaftaran</h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Ukuran PC</label>
                        <input
                            type="text"
                            name="schedule_size_pc"
                            value={settings.schedule_size_pc || '1rem'}
                            onChange={handleSettingsChange}
                            className="input"
                            placeholder="1rem"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Ukuran Mobile</label>
                        <input
                            type="text"
                            name="schedule_size_mobile"
                            value={settings.schedule_size_mobile || '0.875rem'}
                            onChange={handleSettingsChange}
                            className="input"
                            placeholder="0.875rem"
                        />
                    </div>
                </div>
            </div>

            {/* CTA Title Typography */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
                <h5 style={{ marginBottom: '1rem', fontWeight: '600' }}>CTA Title</h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Ukuran PC</label>
                        <input
                            type="text"
                            name="cta_title_size_pc"
                            value={settings.cta_title_size_pc || '2.5rem'}
                            onChange={handleSettingsChange}
                            className="input"
                            placeholder="2.5rem"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Ukuran Mobile</label>
                        <input
                            type="text"
                            name="cta_title_size_mobile"
                            value={settings.cta_title_size_mobile || '1.75rem'}
                            onChange={handleSettingsChange}
                            className="input"
                            placeholder="1.75rem"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
