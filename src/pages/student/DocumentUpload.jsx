import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, Trash2, FileText, CheckCircle } from 'lucide-react';

export default function DocumentUpload({ registration, onUpdate }) {
    const [documents, setDocuments] = useState([]);
    const [uploading, setUploading] = useState(false);

    // Define required documents
    const requiredDocs = [
        { id: 'kk', label: 'Kartu Keluarga (KK)' },
        { id: 'akta', label: 'Akta Kelahiran' },
        { id: 'ijazah', label: 'Ijazah / SKL (Jika ada)' },
        { id: 'foto', label: 'Pas Foto 3x4' }
    ];

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        const { data } = await supabase
            .from('documents')
            .select('*')
            .eq('registration_id', registration.id);
        if (data) setDocuments(data);
    };

    const handleUpload = async (e, docType) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not found');

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${docType}_${Date.now()}.${fileExt}`;

            // Upload
            const { error: uploadError } = await supabase.storage
                .from('private-docs')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Save record
            const { error: dbError } = await supabase
                .from('documents')
                .insert([{
                    registration_id: registration.id,
                    document_type: docType,
                    file_url: fileName
                }]);

            if (dbError) throw dbError;

            // If all required docs are uploaded, update status
            // We'll check this after fetching updated docs
            await fetchDocuments();
            checkCompletion();

        } catch (err) {
            console.error('Error uploading:', err);
            alert('Gagal upload: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const checkCompletion = async () => {
        // Simple check: if we have at least 3 docs (assuming ijazah optional)
        // Or just update status to 'documents_submitted' if it's not yet.
        if (registration.status === 'payment_verified') {
            await supabase.from('registrations').update({ status: 'documents_submitted' }).eq('id', registration.id);
            onUpdate();
        }
    };

    const handleDelete = async (docId, filePath) => {
        if (!confirm('Hapus dokumen ini?')) return;
        try {
            await supabase.storage.from('private-docs').remove([filePath]);
            await supabase.from('documents').delete().eq('id', docId);
            fetchDocuments();
        } catch (err) {
            console.error('Error deleting:', err);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Upload Berkas</h2>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {requiredDocs.map((doc) => {
                    const uploadedDoc = documents.find(d => d.document_type === doc.id);

                    return (
                        <div key={doc.id} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ padding: '0.75rem', backgroundColor: uploadedDoc ? '#ecfdf5' : '#f1f5f9', borderRadius: '50%', color: uploadedDoc ? 'var(--success)' : 'var(--text-secondary)' }}>
                                    {uploadedDoc ? <CheckCircle size={24} /> : <FileText size={24} />}
                                </div>
                                <div>
                                    <h4 style={{ marginBottom: '0.25rem' }}>{doc.label}</h4>
                                    {uploadedDoc ? (
                                        <p style={{ fontSize: '0.875rem', color: 'var(--success)' }}>Terupload</p>
                                    ) : (
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Belum diupload</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                {uploadedDoc ? (
                                    <button onClick={() => handleDelete(uploadedDoc.id, uploadedDoc.file_url)} className="btn btn-outline" style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>
                                        <Trash2 size={18} />
                                    </button>
                                ) : (
                                    <div>
                                        <input
                                            type="file"
                                            id={`upload-${doc.id}`}
                                            style={{ display: 'none' }}
                                            onChange={(e) => handleUpload(e, doc.id)}
                                            disabled={uploading}
                                        />
                                        <label htmlFor={`upload-${doc.id}`} className="btn btn-primary" style={{ cursor: 'pointer' }}>
                                            <Upload size={18} /> Upload
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
