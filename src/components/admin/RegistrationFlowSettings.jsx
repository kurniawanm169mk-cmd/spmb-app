import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Edit2, FileText, Upload, CheckCircle, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';

const ICON_OPTIONS = [
    { name: 'FileText', icon: FileText, label: 'Dokumen' },
    { name: 'Upload', icon: Upload, label: 'Upload' },
    { name: 'CheckCircle', icon: CheckCircle, label: 'Checklist' },
    { name: 'Calendar', icon: Calendar, label: 'Kalender' },
    { name: 'User', icon: User, label: 'User' },
];

export default function RegistrationFlowSettings() {
    const [steps, setSteps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingStep, setEditingStep] = useState(null);
    const [formData, setFormData] = useState({ title: '', description: '', icon: 'FileText' });

    useEffect(() => {
        fetchSteps();
    }, []);

    const fetchSteps = async () => {
        try {
            const { data, error } = await supabase
                .from('registration_steps')
                .select('*')
                .order('order_index');

            if (error) throw error;
            setSteps(data || []);
        } catch (err) {
            console.error('Error fetching steps:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingStep({ title: '', description: '', icon: 'FileText' });
        setFormData({ title: '', description: '', icon: 'FileText' });
    };

    const handleEdit = (step) => {
        setEditingStep(step);
        setFormData({ title: step.title, description: step.description, icon: step.icon });
    };

    const handleSave = async () => {
        if (!formData.title) {
            alert('Judul harus diisi!');
            return;
        }

        try {
            if (editingStep?.id) {
                // Update existing
                const { error } = await supabase
                    .from('registration_steps')
                    .update({
                        title: formData.title,
                        description: formData.description,
                        icon: formData.icon
                    })
                    .eq('id', editingStep.id);

                if (error) throw error;
                toast.success('Langkah berhasil diperbarui!');
            } else {
                // Insert new
                const { error } = await supabase
                    .from('registration_steps')
                    .insert([{
                        ...formData,
                        order_index: steps.length
                    }]);

                if (error) throw error;
                toast.success('Langkah berhasil ditambahkan!');
            }

            setEditingStep(null);
            setFormData({ title: '', description: '', icon: 'FileText' });
            fetchSteps();
        } catch (err) {
            console.error('Error saving step:', err);
            alert('Gagal menyimpan langkah');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus langkah ini?')) return;

        try {
            const { error } = await supabase
                .from('registration_steps')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Langkah berhasil dihapus!');
            fetchSteps();
        } catch (err) {
            console.error('Error deleting step:', err);
            alert('Gagal menghapus langkah');
        }
    };

    const getIconComponent = (iconName) => {
        const iconOption = ICON_OPTIONS.find(opt => opt.name === iconName);
        return iconOption ? iconOption.icon : FileText;
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Alur Pendaftaran</h3>
                <button onClick={handleAdd} className="btn btn-outline">
                    <Plus size={18} /> Tambah Langkah
                </button>
            </div>

            {/* Edit/Add Form */}
            {editingStep !== null && (
                <div style={{
                    padding: '1.5rem',
                    backgroundColor: '#f0f9ff',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.5rem',
                    border: '2px solid var(--primary-color)'
                }}>
                    <h4 style={{ marginBottom: '1rem' }}>{editingStep.id ? 'Edit Langkah' : 'Tambah Langkah Baru'}</h4>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Judul</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="input"
                                placeholder="Contoh: Daftar Akun"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Deskripsi</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="input"
                                rows={2}
                                placeholder="Penjelasan singkat langkah ini..."
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Icon</label>
                            <select
                                value={formData.icon}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                className="input"
                            >
                                {ICON_OPTIONS.map(opt => (
                                    <option key={opt.name} value={opt.name}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={handleSave} className="btn btn-primary">
                                Simpan
                            </button>
                            <button
                                onClick={() => {
                                    setEditingStep(null);
                                    setFormData({ title: '', description: '', icon: 'FileText' });
                                }}
                                className="btn btn-outline"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Steps List */}
            <div style={{ display: 'grid', gap: '0.75rem' }}>
                {steps.map((step, index) => {
                    const IconComponent = getIconComponent(step.icon);
                    return (
                        <div
                            key={step.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem',
                                backgroundColor: '#f8fafc',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    backgroundColor: '#ecfdf5',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--primary-color)'
                                }}>
                                    <IconComponent size={24} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                        {index + 1}. {step.title}
                                    </p>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        {step.description}
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => handleEdit(step)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--primary-color)',
                                        padding: '0.5rem'
                                    }}
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(step.id)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#ef4444',
                                        padding: '0.5rem'
                                    }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {steps.length === 0 && (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                        Belum ada langkah pendaftaran. Klik "Tambah Langkah" untuk memulai.
                    </p>
                )}
            </div>
        </div>
    );
}
