import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Edit, Save, X, GripVertical, CheckSquare, FileText, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';

export default function FormCustomization() {
    const [activeTab, setActiveTab] = useState('fields'); // 'fields' | 'documents'
    const [loading, setLoading] = useState(true);
    const [fields, setFields] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null); // Item to edit, or null for add

    // Form states for modal
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [fieldsRes, docsRes] = await Promise.all([
                supabase.from('form_config').select('*').order('order_index', { ascending: true }),
                supabase.from('document_config').select('*').order('order_index', { ascending: true })
            ]);

            if (fieldsRes.error) throw fieldsRes.error;
            if (docsRes.error) throw docsRes.error;

            setFields(fieldsRes.data || []);
            setDocuments(docsRes.data || []);
        } catch (err) {
            console.error('Error fetching config:', err);
            toast.error('Gagal memuat konfigurasi form.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (table, id) => {
        if (!confirm('Hapus item ini? Data yang sudah tersimpan pada siswa tidak akan hilang, tapi field ini tidak akan muncul lagi.')) return;
        try {
            const { error } = await supabase.from(table).delete().eq('id', id);
            if (error) throw error;
            toast.success('Berhasil dihapus!');
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error('Gagal menghapus item.');
        }
    };

    const openModal = (item = null) => {
        setEditingItem(item);
        if (activeTab === 'fields') {
            setFormData(item || {
                field_name: '',
                field_label: '',
                field_type: 'text',
                options: '', // converted to string for input
                is_required: true,
                order_index: fields.length + 1
            });
            if (item && item.options) {
                setFormData(prev => ({ ...prev, options: item.options.join(', ') }));
            }
        } else {
            setFormData(item || {
                document_type: '',
                label: '',
                is_required: true,
                order_index: documents.length + 1
            });
        }
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const table = activeTab === 'fields' ? 'form_config' : 'document_config';
            const dataToSave = { ...formData };

            // Process options for fields
            if (activeTab === 'fields' && dataToSave.field_type === 'select') {
                dataToSave.options = dataToSave.options.split(',').map(s => s.trim()).filter(s => s);
            } else if (activeTab === 'fields') {
                dataToSave.options = null;
            }

            // Remove ID from insert data if adding
            if (!editingItem) {
                delete dataToSave.id;
            }

            let error;
            if (editingItem) {
                const { error: err } = await supabase.from(table).update(dataToSave).eq('id', editingItem.id);
                error = err;
            } else {
                const { error: err } = await supabase.from(table).insert([dataToSave]);
                error = err;
            }

            if (error) throw error;

            toast.success('Berhasil disimpan!');
            setModalOpen(false);
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error('Gagal menyimpan: ' + err.message);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Kustomisasi Formulir</h1>
                <button onClick={() => openModal()} className="btn btn-primary">
                    <Plus size={18} /> Tambah {activeTab === 'fields' ? 'Field' : 'Dokumen'}
                </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <button
                    onClick={() => setActiveTab('fields')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderBottom: activeTab === 'fields' ? '2px solid var(--primary-color)' : 'none',
                        color: activeTab === 'fields' ? 'var(--primary-color)' : 'var(--text-secondary)',
                        fontWeight: activeTab === 'fields' ? 'bold' : 'normal',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}
                >
                    <CheckSquare size={18} /> Data Siswa
                </button>
                <button
                    onClick={() => setActiveTab('documents')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderBottom: activeTab === 'documents' ? '2px solid var(--primary-color)' : 'none',
                        color: activeTab === 'documents' ? 'var(--primary-color)' : 'var(--text-secondary)',
                        fontWeight: activeTab === 'documents' ? 'bold' : 'normal',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}
                >
                    <FileText size={18} /> Upload Dokumen
                </button>
            </div>

            {activeTab === 'fields' ? (
                <div className="card">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Label</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Variable Name</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Tipe</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Wajib?</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Urutan</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map((field) => (
                                <tr key={field.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem' }}>{field.field_label}</td>
                                    <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{field.field_name}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className="badge">{field.field_type}</span>
                                        {field.field_type === 'select' && field.options && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                                {field.options.join(', ')}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        {field.is_required ? <span style={{ color: 'var(--success)' }}>Ya</span> : <span style={{ color: 'var(--text-secondary)' }}>Tidak</span>}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>{field.order_index}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button onClick={() => openModal(field)} className="btn btn-outline" style={{ padding: '0.5rem' }}><Edit size={16} /></button>
                                            <button onClick={() => handleDelete('form_config', field.id)} className="btn btn-outline" style={{ padding: '0.5rem', color: 'var(--error)', borderColor: 'var(--error)' }}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="card">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Label Dokumen</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Tipe ID</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Wajib?</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Urutan</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.map((doc) => (
                                <tr key={doc.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem' }}>{doc.label}</td>
                                    <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{doc.document_type}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        {doc.is_required ? <span style={{ color: 'var(--success)' }}>Ya</span> : <span style={{ color: 'var(--text-secondary)' }}>Tidak</span>}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>{doc.order_index}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button onClick={() => openModal(doc)} className="btn btn-outline" style={{ padding: '0.5rem' }}><Edit size={16} /></button>
                                            <button onClick={() => handleDelete('document_config', doc.id)} className="btn btn-outline" style={{ padding: '0.5rem', color: 'var(--error)', borderColor: 'var(--error)' }}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {modalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="card" style={{ maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>
                            {editingItem ? 'Edit' : 'Tambah'} {activeTab === 'fields' ? 'Field' : 'Dokumen'}
                        </h3>
                        <form onSubmit={handleSave} style={{ display: 'grid', gap: '1rem' }}>
                            {activeTab === 'fields' ? (
                                <>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Label</label>
                                        <input className="input" required value={formData.field_label} onChange={e => setFormData({ ...formData, field_label: e.target.value })} placeholder="Contoh: Nama Lengkap" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Variable Name (Unique, tanpa spasi)</label>
                                        <input className="input" required value={formData.field_name} onChange={e => setFormData({ ...formData, field_name: e.target.value.toLowerCase().replace(/\s/g, '_') })} placeholder="Contoh: full_name" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tipe Input</label>
                                        <select className="input" value={formData.field_type} onChange={e => setFormData({ ...formData, field_type: e.target.value })}>
                                            <option value="text">Text</option>
                                            <option value="number">Number</option>
                                            <option value="tel">Telephone</option>
                                            <option value="date">Date</option>
                                            <option value="textarea">Text Area (Panjang)</option>
                                            <option value="select">Select (Pilihan)</option>
                                        </select>
                                    </div>
                                    {formData.field_type === 'select' && (
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Opsi (Pisahkan dengan koma)</label>
                                            <input className="input" required value={formData.options} onChange={e => setFormData({ ...formData, options: e.target.value })} placeholder="Laki-laki, Perempuan" />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Label Dokumen</label>
                                        <input className="input" required value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} placeholder="Contoh: Kartu Keluarga" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>ID Tipe (Unique, tanpa spasi)</label>
                                        <input className="input" required value={formData.document_type} onChange={e => setFormData({ ...formData, document_type: e.target.value.toLowerCase().replace(/\s/g, '_') })} placeholder="Contoh: kk" />
                                    </div>
                                </>
                            )}

                            <div style={{ display: 'flex', gap: '2rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={formData.is_required} onChange={e => setFormData({ ...formData, is_required: e.target.checked })} />
                                    Wajib Diisi?
                                </label>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Urutan</label>
                                <input type="number" className="input" value={formData.order_index} onChange={e => setFormData({ ...formData, order_index: parseInt(e.target.value) })} />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline" style={{ flex: 1 }}>Batal</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
