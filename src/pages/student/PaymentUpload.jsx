import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, Check } from 'lucide-react';

export default function PaymentUpload({ registration, onUpdate }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not found');

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${registration.id}_payment_proof.${fileExt}`;
            const filePath = fileName;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('private-docs') // Ensure this bucket exists!
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get Public URL (or signed URL if private)
            // For private docs, we usually store the path and generate signed URLs on read.
            // But for simplicity let's assume we store the path.

            // Update registration status
            const { error: updateError } = await supabase
                .from('registrations')
                .update({
                    payment_proof_url: filePath,
                    status: 'payment_submitted',
                    payment_submitted_at: new Date().toISOString()
                })
                .eq('id', registration.id);

            if (updateError) throw updateError;

            alert('Bukti pembayaran berhasil diupload!');
            onUpdate(); // Refresh dashboard
        } catch (error) {
            console.error('Error uploading payment:', error);
            alert('Gagal mengupload bukti pembayaran: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    if (registration.status !== 'registered' && registration.status !== 'payment_submitted') {
        return (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Check size={48} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
                <h3>Pembayaran Selesai</h3>
                <p>Bukti pembayaran anda sudah diterima/diverifikasi.</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '1rem' }}>Upload Bukti Pembayaran</h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                Silahkan transfer ke rekening <strong>BSI 1234567890 a.n SMPIT Ibnu Sina</strong> sebesar <strong>Rp 200.000</strong>.
                Upload foto bukti transfer di bawah ini.
            </p>

            <div style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="payment-upload"
                />
                <label htmlFor="payment-upload" style={{ cursor: 'pointer', display: 'block' }}>
                    <Upload size={32} style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }} />
                    <p style={{ fontWeight: 500 }}>
                        {file ? file.name : 'Klik untuk memilih file'}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>JPG, PNG (Max 2MB)</p>
                </label>
            </div>

            <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="btn btn-primary"
                style={{ width: '100%' }}
            >
                {uploading ? 'Mengupload...' : 'Kirim Bukti Pembayaran'}
            </button>
        </div>
    );
}
