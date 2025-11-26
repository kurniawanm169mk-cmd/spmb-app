import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';

export default function SystemSettings() {
    const [dates, setDates] = useState({});
    const [formFields, setFormFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingDates, setSavingDates] = useState(false);
    const [savingForm, setSavingForm] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch Dates & Bank Info
            const { data: settings } = await supabase.from('school_settings').select('id, registration_start_date, registration_end_date, announcement_date, bank_name, bank_account_number, bank_account_holder, registration_fee').maybeSingle();
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
                    registration_fee: dates.registration_fee
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
        </div>
    );
}
