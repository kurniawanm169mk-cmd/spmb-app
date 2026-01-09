import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { ArrowLeft, Trash2, Edit, Save, Upload, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DocumentBuilder() {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);

    // Form State
    const [title, setTitle] = useState('');
    const [tracks, setTracks] = useState([]); // Array of strings e.g. ['fullday_ikhwan']
    const [templateFile, setTemplateFile] = useState(null); // File object for upload
    const [templateUrl, setTemplateUrl] = useState(null); // Existing URL if editing
    const [uploading, setUploading] = useState(false);

    const availableTracks = [
        { id: 'fullday_ikhwan', label: 'Fullday Ikhwan' },
        { id: 'fullday_akhwat', label: 'Fullday Akhwat' },
        { id: 'boarding_ikhwan', label: 'Boarding Ikhwan' },
        { id: 'boarding_akhwat', label: 'Boarding Akhwat' },
    ];

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('document_templates')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching templates:', error);
            toast.error('Gagal mengambil data template.');
        } else {
            setTemplates(data || []);
        }
        setLoading(false);
    };

    const resetForm = () => {
        setEditingId(null);
        setTitle('');
        setTracks([]);
        setTemplateFile(null);
        setTemplateUrl(null);
    };

    const handleEdit = (template) => {
        setEditingId(template.id);
        setTitle(template.title);
        setTracks(template.target_tracks || []);
        setTemplateUrl(template.template_url || null);
        setTemplateFile(null); // Reset file input
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus template ini?')) return;
        const { error } = await supabase.from('document_templates').delete().eq('id', id);
        if (error) {
            toast.error('Gagal menghapus template');
        } else {
            toast.success('Template dihapus');
            fetchTemplates();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                toast.error('Hanya file PDF yang diperbolehkan');
                return;
            }
            setTemplateFile(file);
        }
    };

    const handleSave = async () => {
        if (!title) {
            toast.error('Judul wajib diisi!');
            return;
        }

        if (!editingId && !templateFile && !templateUrl) {
            toast.error('Wajib mengunggah file template PDF untuk template baru!');
            return;
        }

        setUploading(true);
        try {
            let currentTemplateUrl = templateUrl;

            // Upload File if new file selected
            if (templateFile) {
                const fileName = `templates/${Date.now()}_${templateFile.name}`;
                const { error: uploadError } = await supabase.storage
                    .from('document-templates')
                    .upload(fileName, templateFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('document-templates')
                    .getPublicUrl(fileName);

                currentTemplateUrl = publicUrl;
            }

            const payload = {
                title,
                target_tracks: tracks.length > 0 ? tracks : null,
                template_url: currentTemplateUrl,
                // Set legacy fields to null
                content_html: null,
                letterhead_url: null,
                form_schema: null,
                is_active: true
            };

            if (editingId) {
                const { error } = await supabase
                    .from('document_templates')
                    .update(payload)
                    .eq('id', editingId);
                if (error) throw error;
                toast.success('Template berhasil diperbarui');
            } else {
                const { error } = await supabase
                    .from('document_templates')
                    .insert([payload]);
                if (error) throw error;
                toast.success('Template baru berhasil dibuat');
            }

            resetForm();
            fetchTemplates();

        } catch (error) {
            console.error('Error saving:', error);
            toast.error('Gagal menyimpan template: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const toggleTrack = (trackId) => {
        setTracks(prev =>
            prev.includes(trackId)
                ? prev.filter(t => t !== trackId)
                : [...prev, trackId]
        );
    };

    return (
        <div className="container" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => navigate('/admin')} className="btn btn-outline">
                    <ArrowLeft size={20} /> Kembali
                </button>
                <h1 style={{ margin: 0 }}>Kelola Dokumen (Manual Download)</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '2rem', alignItems: 'start' }}>
                {/* EDITOR FORM */}
                <div className="card" style={{ padding: '2rem' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>{editingId ? 'Edit Template' : 'Buat Template Baru'}</h2>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Judul Dokumen</label>
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Contoh: Surat Pernyataan Orang Tua"
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Upload Format PDF (Blanko)</label>
                        {templateUrl && !templateFile && (
                            <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'green', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FileText size={16} /> File saat ini tersimpan. Upload baru untuk mengganti.
                            </div>
                        )}
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            className="file-input file-input-bordered w-full"
                            style={{ width: '100%' }}
                        />
                        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                            Unggah file PDF kosong yang akan didownload oleh siswa untuk diisi manual.
                        </p>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Target Jalur (Opsional)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            {availableTracks.map(track => (
                                <label key={track.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem', border: '1px solid #eee', borderRadius: '4px' }}>
                                    <input
                                        type="checkbox"
                                        checked={tracks.includes(track.id)}
                                        onChange={() => toggleTrack(track.id)}
                                    />
                                    <span style={{ fontSize: '0.9rem' }}>{track.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={handleSave}
                            className="btn btn-primary"
                            disabled={uploading}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Save size={18} />
                            {uploading ? 'Menyimpan...' : 'Simpan Template'}
                        </button>
                        {editingId && (
                            <button onClick={resetForm} className="btn btn-outline">
                                Batal
                            </button>
                        )}
                    </div>
                </div>

                {/* TEMPLATE LIST */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Daftar Template
                        <span className="badge badge-neutral" style={{ padding: '0.25rem 0.5rem', borderRadius: '1rem', backgroundColor: '#eee' }}>{templates.length}</span>
                    </h3>

                    {loading ? (
                        <p>Memuat...</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {templates.map(t => (
                                <div key={t.id} style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px', backgroundColor: editingId === t.id ? '#f0f9ff' : 'white' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>{t.title}</h4>
                                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
                                        {t.target_tracks ? `Jalur: ${t.target_tracks.join(', ')}` : 'Semua Jalur'}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button onClick={() => handleEdit(t)} className="btn btn-xs btn-outline" title="Edit" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Edit size={14} /> Edit
                                        </button>
                                        <button onClick={() => handleDelete(t.id)} className="btn btn-xs btn-outline" title="Hapus" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: 'red', borderColor: 'red', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Trash2 size={14} /> Hapus
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {templates.length === 0 && (
                                <p style={{ textAlign: 'center', color: '#888' }}>Belum ada template</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
