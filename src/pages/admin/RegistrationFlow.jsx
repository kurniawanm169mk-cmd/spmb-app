import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Edit2, Save, X, FileText, Upload, CheckCircle, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';

const ICON_OPTIONS = [
    { name: 'FileText', icon: FileText, label: 'Dokumen' },
    { name: 'Upload', icon: Upload, label: 'Upload' },
    { name: 'CheckCircle', icon: CheckCircle, label: 'Checklist' },
    { name: 'Calendar', icon: Calendar, label: 'Kalender' },
    { name: 'User', icon: User, label: 'User' },
];

export default function RegistrationFlow() {
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
        } catch (error) {
            console.error('Error fetching steps:', error);
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

    const handleCancel = () => {
        setEditingStep(null);
        setFormData({ title: '', description: '', icon: 'FileText' });
    };

    const handleSave = async () => {
        if (!formData.title) {
            toast.error('Judul harus diisi!');
            return;
        }

        try {
            if (editingStep?.id) {
                // Update
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
                // Insert
                const { error } = await supabase
                    .from('registration_steps')
                    .insert([{
                        ...formData,
                        order_index: steps.length
                    }]);

                if (error) throw error;
                toast.success('Langkah berhasil ditambahkan!');
            }

            handleCancel();
            fetchSteps();
        } catch (error) {
            console.error('Error saving:', error);
            toast.error('Gagal menyimpan langkah');
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
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error('Gagal menghapus langkah');
        }
    };

    const getIconComponent = (iconName) => {
        const iconOption = ICON_OPTIONS.find(opt => opt.name === iconName);
        return iconOption ? iconOption.icon : FileText;
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ maxWidth: '900px' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>Alur Pendaftaran</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Kelola langkah-langkah dalam proses pendaftaran siswa baru
                    </p>
                </div>
                <button onClick={handleAdd} className="btn btn-primary">
                    <Plus size={18} /> Tambah Langkah
                </button>
            </div>

            {/* Edit/Add Form */}
            {editingStep !== null && (
                <div className="card" style={{
                    marginBottom: '2rem',
                    backgroundColor: '#f0f9ff',
                    border: '2px solid var(--primary-color)'
                }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>
                        {editingStep.id ? 'Edit Langkah' : 'Tambah Langkah Baru'}
                    </h3>

                    <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Judul</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="input"
                                placeholder="Contoh: Daftar Akun"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Deskripsi</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="input"
                                rows={2}
                                placeholder="Penjelasan singkat langkah ini..."
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Icon</label>
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
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={handleSave} className="btn btn-primary">
                            <Save size={18} /> Simpan
                        </button>
                        <button onClick={handleCancel} className="btn btn-outline">
                            <X size={18} /> Batal
                        </button>
                    </div>
                </div>
            )}

            {/* Steps List */}
            <div className="card">
                <h3 style={{ marginBottom: '1.5rem' }}>Daftar Langkah ({steps.length})</h3>

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
                                        color: 'var(--primary-color)',
                                        flexShrink: 0
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
                                        className="btn btn-outline"
                                        style={{ padding: '0.5rem' }}
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(step.id)}
                                        style={{
                                            padding: '0.5rem',
                                            background: 'none',
                                            border: '1px solid #ef4444',
                                            borderRadius: 'var(--radius-md)',
                                            color: '#ef4444',
                                            cursor: 'pointer'
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
        </div>
    );
}
