import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, Trash2, FileText, CheckCircle, Eye, File, Image, Edit, Download } from 'lucide-react';
import { toast } from 'sonner';
import imageCompression from 'browser-image-compression';
import SmartDocViewer from '../../components/SmartDocViewer';

export default function DocumentUpload({ registration, onUpdate }) {
    const [documents, setDocuments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [requiredDocs, setRequiredDocs] = useState([]);
    const [smartTemplates, setSmartTemplates] = useState([]);
    const [viewingTemplate, setViewingTemplate] = useState(null);
    const [settings, setSettings] = useState(null); // [NEW]

    // File validation constants
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    const ALLOWED_TYPES = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/pdf',
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
    ];
    const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'];

    useEffect(() => {
        fetchConfig();
        fetchDocuments();
        fetchSmartTemplates();
        fetchSettings(); // [NEW]
    }, []);

    const fetchSettings = async () => {
        const { data } = await supabase.from('school_settings').select('smart_doc_label, smart_doc_description').maybeSingle();
        if (data) setSettings(data);
    };

    const fetchConfig = async () => {
        const { data: configData } = await supabase
            .from('document_config')
            .select('*')
            .order('order_index', { ascending: true });

        if (configData && configData.length > 0) {
            setRequiredDocs(configData.map(d => ({ id: d.document_type, label: d.label, is_required: d.is_required })));
        } else {
            setRequiredDocs([
                { id: 'kk', label: 'Kartu Keluarga (KK)', is_required: true },
                { id: 'akta', label: 'Akta Kelahiran', is_required: true },
                { id: 'ijazah', label: 'Ijazah / SKL (Jika ada)', is_required: false },
                { id: 'foto', label: 'Pas Foto 3x4', is_required: true }
            ]);
        }
    };

    const fetchDocuments = async () => {
        const { data } = await supabase
            .from('documents')
            .select('*')
            .eq('registration_id', registration.id);
        if (data) setDocuments(data);
    };

    const fetchSmartTemplates = async () => {
        if (!registration?.track) return;

        const { data, error } = await supabase
            .from('document_templates')
            .select('*')
            .eq('is_active', true);

        if (error) {
            console.error('Error fetching templates:', error);
            return;
        }

        // Filter templates matching user's track (or NULL = all tracks)
        const filtered = data.filter(t =>
            !t.target_tracks ||
            t.target_tracks.length === 0 ||
            t.target_tracks.includes(registration.track)
        );

        setSmartTemplates(filtered);
    };

    const validateFile = (file) => {
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            return { valid: false, error: 'Ukuran file maksimal 2MB' };
        }

        // Check file type
        const fileExt = file.name.split('.').pop().toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
            return { valid: false, error: 'Format file harus JPG, PNG, PDF, DOC, atau DOCX' };
        }

        // Additional MIME type check
        if (!ALLOWED_TYPES.includes(file.type)) {
            // Some browsers might not set the correct MIME type, so we rely more on extension
            console.warn('MIME type mismatch, but extension is valid');
        }

        return { valid: true };
    };

    const handleUpload = async (e, docType) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
            toast.error(validation.error);
            e.target.value = ''; // Reset input
            return;
        }

        setUploading(true);
        const toastId = toast.loading('Sedang mengunggah dokumen...');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not found');

            let fileToUpload = file;
            const isImage = file.type.startsWith('image/');

            // Compress if image
            if (isImage) {
                try {
                    const options = {
                        maxSizeMB: 1, // Max 1MB
                        maxWidthOrHeight: 1920,
                        useWebWorker: true,
                        initialQuality: 0.8
                    };
                    const compressedFile = await imageCompression(file, options);
                    fileToUpload = compressedFile;
                    console.log('Original size:', file.size / 1024 / 1024, 'MB');
                    console.log('Compressed size:', compressedFile.size / 1024 / 1024, 'MB');
                } catch (compressionError) {
                    console.error('Compression failed:', compressionError);
                }
            }

            // Check file size again (post-compression)
            if (fileToUpload.size > MAX_FILE_SIZE) {
                throw new Error('Ukuran file terlalu besar (Maksimal 2MB).');
            }

            const fileExt = fileToUpload.name.split('.').pop();
            const fileName = `${user.id}/${docType}_${Date.now()}.${fileExt}`;

            // Upload
            const { error: uploadError } = await supabase.storage
                .from('private-docs')
                .upload(fileName, fileToUpload);

            if (uploadError) throw uploadError;

            // Save record
            const { error: dbError } = await supabase
                .from('documents')
                .insert([{
                    registration_id: registration.id,
                    document_type: docType,
                    file_url: fileName,
                    file_name: fileToUpload.name,
                    file_size: fileToUpload.size
                }]);

            if (dbError) throw dbError;

            // If all required docs are uploaded, update status
            await fetchDocuments();
            checkCompletion();

            toast.success('Dokumen berhasil diunggah!', { id: toastId });

        } catch (err) {
            console.error('Error uploading:', err);
            toast.error('Gagal upload: ' + err.message, { id: toastId });
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    const checkCompletion = async () => {
        // Update status to 'documents_submitted' if not yet
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
            toast.success('Dokumen berhasil dihapus');
        } catch (err) {
            console.error('Error deleting:', err);
            toast.error('Gagal menghapus dokumen');
        }
    };

    const handleViewDocument = async (filePath) => {
        try {
            const { data, error } = await supabase.storage
                .from('private-docs')
                .createSignedUrl(filePath, 3600); // Valid for 1 hour

            if (error) throw error;

            // Open in new tab
            window.open(data.signedUrl, '_blank');
        } catch (err) {
            console.error('Error viewing document:', err);
            toast.error('Gagal membuka dokumen');
        }
    };

    const getFileIcon = (fileName) => {
        if (!fileName) return <File size={24} />;
        const ext = fileName.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png'].includes(ext)) {
            return <Image size={24} />;
        }
        return <File size={24} />;
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '-';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '1rem' }}>Upload Berkas</h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Format: JPG, PNG, PDF, DOC, DOCX | Maksimal: 2MB per file
            </p>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {requiredDocs.map((doc) => {
                    const uploadedDoc = documents.find(d => d.document_type === doc.id);

                    return (
                        <div key={doc.id} className="card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: uploadedDoc ? '1rem' : 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ padding: '0.75rem', backgroundColor: uploadedDoc ? '#ecfdf5' : '#f1f5f9', borderRadius: '50%', color: uploadedDoc ? 'var(--success)' : 'var(--text-secondary)' }}>
                                        {uploadedDoc ? <CheckCircle size={24} /> : getFileIcon(uploadedDoc?.file_name)}
                                    </div>
                                    <div>
                                        <h4 style={{ marginBottom: '0.25rem' }}>{doc.label}</h4>
                                        {uploadedDoc ? (
                                            <p style={{ fontSize: '0.875rem', color: 'var(--success)' }}>✓ Terupload</p>
                                        ) : (
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Belum diupload</p>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {uploadedDoc ? (
                                        <>
                                            <button
                                                onClick={() => handleViewDocument(uploadedDoc.file_url)}
                                                className="btn btn-outline"
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                title="Lihat Berkas"
                                            >
                                                <Eye size={18} />
                                                <span style={{ display: 'inline-block' }}>Lihat</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(uploadedDoc.id, uploadedDoc.file_url)}
                                                className="btn btn-outline"
                                                style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                                                title="Hapus Berkas"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </>
                                    ) : (
                                        <div>
                                            <input
                                                type="file"
                                                id={`upload-${doc.id}`}
                                                style={{ display: 'none' }}
                                                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                                onChange={(e) => handleUpload(e, doc.id)}
                                                disabled={uploading}
                                            />
                                            <label htmlFor={`upload-${doc.id}`} className="btn btn-primary" style={{ cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1 }}>
                                                <Upload size={18} /> {uploading ? 'Sedang mengunggah...' : 'Upload'}
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {uploadedDoc && (
                                <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>File: {uploadedDoc.file_name || 'N/A'}</span>
                                        <span>Ukuran: {formatFileSize(uploadedDoc.file_size)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* SMART DOCUMENTS SECTION */}
            {smartTemplates.length > 0 && (
                <div style={{ marginTop: '3rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>{settings?.smart_doc_label || 'Dokumen Pintar (Smart Docs)'}</h2>
                    <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {settings?.smart_doc_description || 'Anda dapat mengisi dokumen secara online atau mengunduh template untuk diisi manual.'}
                    </p>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {smartTemplates.map((template) => {
                            const uploadedDoc = documents.find(d => d.document_type === `smart_${template.id}`);

                            return (
                                <div key={template.id} className="card" style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: uploadedDoc ? '1rem' : 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ padding: '0.75rem', backgroundColor: uploadedDoc ? '#ecfdf5' : '#f1f5f9', borderRadius: '50%', color: uploadedDoc ? 'var(--success)' : 'var(--primary-color)' }}>
                                                {uploadedDoc ? <CheckCircle size={24} /> : <FileText size={24} />}
                                            </div>
                                            <div>
                                                <h4 style={{ marginBottom: '0.25rem' }}>{template.title}</h4>
                                                {uploadedDoc ? (
                                                    <p style={{ fontSize: '0.875rem', color: 'var(--success)' }}>✓ Sudah diisi</p>
                                                ) : (
                                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Belum diisi</p>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {uploadedDoc ? (
                                                <>
                                                    <button
                                                        onClick={() => handleViewDocument(uploadedDoc.file_url)}
                                                        className="btn btn-outline btn-sm"
                                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                    >
                                                        <Eye size={16} /> Lihat
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(uploadedDoc.id, uploadedDoc.file_url)}
                                                        className="btn btn-outline btn-sm"
                                                        style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    {template.template_url && (
                                                        <a
                                                            href={template.template_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-outline btn-sm"
                                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                        >
                                                            <Download size={16} /> Download Format
                                                        </a>
                                                    )}
                                                    <input
                                                        type="file"
                                                        id={`upload-smart-${template.id}`}
                                                        style={{ display: 'none' }}
                                                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                                        onChange={(e) => handleUpload(e, `smart_${template.id}`)}
                                                        disabled={uploading}
                                                    />
                                                    <label
                                                        htmlFor={`upload-smart-${template.id}`}
                                                        className="btn btn-primary btn-sm"
                                                        style={{ cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                    >
                                                        <Upload size={16} /> Upload Berkas
                                                    </label>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {uploadedDoc && (
                                        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>File: {uploadedDoc.file_name || 'N/A'}</span>
                                                <span>Ukuran: {formatFileSize(uploadedDoc.file_size)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
