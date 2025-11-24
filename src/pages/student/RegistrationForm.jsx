import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Save } from 'lucide-react';

export default function RegistrationForm({ registration, onUpdate }) {
    const [formData, setFormData] = useState(registration.form_data || {});
    const [config, setConfig] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const { data, error } = await supabase
                .from('form_config')
                .select('*')
                .order('order_index', { ascending: true });

            if (error) throw error;

            // Fallback if no config exists
            if (!data || data.length === 0) {
                setConfig([
                    { field_name: 'nisn', field_label: 'NISN', field_type: 'number', is_required: true },
                    { field_name: 'full_name', field_label: 'Nama Lengkap', field_type: 'text', is_required: true },
                    { field_name: 'birth_place', field_label: 'Tempat Lahir', field_type: 'text', is_required: true },
                    { field_name: 'birth_date', field_label: 'Tanggal Lahir', field_type: 'date', is_required: true },
                    { field_name: 'gender', field_label: 'Jenis Kelamin', field_type: 'select', options: ['Laki-laki', 'Perempuan'], is_required: true },
                    { field_name: 'origin_school', field_label: 'Asal Sekolah', field_type: 'text', is_required: true },
                    { field_name: 'address', field_label: 'Alamat Lengkap', field_type: 'textarea', is_required: true },
                    { field_name: 'parent_name', field_label: 'Nama Orang Tua/Wali', field_type: 'text', is_required: true },
                    { field_name: 'parent_phone', field_label: 'No HP Orang Tua', field_type: 'tel', is_required: true },
                ]);
            } else {
                setConfig(data);
            }
        } catch (err) {
            console.error('Error fetching form config:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase
                .from('registrations')
                .update({
                    form_data: formData,
                    // If we want to auto-advance status, we can do it here or let admin verify.
                    // Usually form filling doesn't change status unless it's the first time.
                    // Let's assume status advances to 'documents_submitted' only after docs are uploaded.
                    // Or maybe we have a separate 'form_submitted' status? 
                    // For now, let's keep status as is, or maybe update updated_at.
                    updated_at: new Date().toISOString()
                })
                .eq('id', registration.id);

            if (error) throw error;
            alert('Data berhasil disimpan!');
            onUpdate();
        } catch (err) {
            console.error('Error saving form:', err);
            alert('Gagal menyimpan data.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading form...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Formulir Pendaftaran</h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                {config.map((field) => (
                    <div key={field.field_name}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                            {field.field_label} {field.is_required && <span style={{ color: 'red' }}>*</span>}
                        </label>

                        {field.field_type === 'textarea' ? (
                            <textarea
                                name={field.field_name}
                                value={formData[field.field_name] || ''}
                                onChange={handleChange}
                                required={field.is_required}
                                className="input"
                                rows={4}
                            />
                        ) : field.field_type === 'select' ? (
                            <select
                                name={field.field_name}
                                value={formData[field.field_name] || ''}
                                onChange={handleChange}
                                required={field.is_required}
                                className="input"
                            >
                                <option value="">Pilih {field.field_label}</option>
                                {field.options?.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type={field.field_type}
                                name={field.field_name}
                                value={formData[field.field_name] || ''}
                                onChange={handleChange}
                                required={field.is_required}
                                className="input"
                            />
                        )}
                    </div>
                ))}

                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        <Save size={18} />
                        {saving ? 'Menyimpan...' : 'Simpan Data'}
                    </button>
                </div>
            </form>
        </div>
    );
}
