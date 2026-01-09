import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { sendRegistrationEmail } from '../lib/email';
import { UserPlus, ArrowLeft, Upload, CreditCard, MessageCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import imageCompression from 'browser-image-compression';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [boardingType, setBoardingType] = useState('Fullday');
    const [paymentFile, setPaymentFile] = useState(null);

    const [schoolSettings, setSchoolSettings] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState(null); // Store data for success view

    const { register } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        const { data } = await supabase.from('school_settings').select('*').maybeSingle();
        if (data) {
            setSchoolSettings(data);

            // Check Availability for auto-selection
            const fulldayAvailable = data.allow_fullday_ikhwan !== false || data.allow_fullday_akhwat !== false;
            const boardingAvailable = data.allow_boarding_ikhwan !== false || data.allow_boarding_akhwat !== false;

            if (!fulldayAvailable && boardingAvailable) {
                setBoardingType('Boarding');
            } else if (fulldayAvailable && !boardingAvailable) {
                setBoardingType('Fullday');
            }

            // Check Dates
            const now = new Date();
            const start = data.registration_start_date ? new Date(data.registration_start_date) : null;
            const end = data.registration_end_date ? new Date(data.registration_end_date) : null;

            if (start && now < start) {
                setError(`Pendaftaran belum dibuka. Dimulai pada ${start.toLocaleDateString('id-ID')}.`);
            } else if (end && now > end) {
                setError(`Pendaftaran sudah ditutup pada ${end.toLocaleDateString('id-ID')}.`);
            } else if (data.registration_open === false) {
                setError('Pendaftaran saat ini sedang ditutup.');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!paymentFile) {
                throw new Error('Mohon unggah bukti pembayaran terlebih dahulu.');
            }

            // Generate Random Password (8 chars guaranteed)
            const randomPassword = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
            const finalPassword = randomPassword.slice(0, 8);

            // 1. Register User
            const { user, session } = await register(email.trim(), finalPassword, fullName, phone);

            if (!user) throw new Error('Gagal membuat akun.');

            // 2. Upload Payment Proof (if session exists)
            let filePath = null;
            if (session) {
                let fileToUpload = paymentFile;
                const isImage = paymentFile.type.startsWith('image/');

                // Compress if image
                if (isImage) {
                    try {
                        const options = {
                            maxSizeMB: 1, // Max 1MB
                            maxWidthOrHeight: 1920,
                            useWebWorker: true,
                            initialQuality: 0.8
                        };
                        fileToUpload = await imageCompression(paymentFile, options);
                        console.log('Original size:', paymentFile.size / 1024 / 1024, 'MB');
                        console.log('Compressed size:', fileToUpload.size / 1024 / 1024, 'MB');
                    } catch (compressionError) {
                        console.error('Compression failed:', compressionError);
                        // Continue with original file if compression fails, but warn?
                    }
                }

                // Strict Size Validation (2MB)
                if (fileToUpload.size > 2 * 1024 * 1024) {
                    // Delete user if upload validation fails to prevent orphaned users? 
                    //Ideally we should check this BEFORE creating user, but Supabase auth is flexible.
                    // For now just throw error.
                    throw new Error('Ukuran file terlalu besar (Maksimal 2MB). Silakan kompress terlebih dahulu.');
                }

                const fileExt = fileToUpload.name.split('.').pop();
                const fileName = `${user.id}/payment_proof_${Date.now()}.${fileExt}`;

                const { error: uploadErr } = await supabase.storage
                    .from('payment_proofs')
                    .upload(fileName, fileToUpload);

                if (uploadErr) throw uploadErr;
                filePath = fileName;
            }

            // 3. Create Registration Record
            const { error: regError } = await supabase.from('registrations').insert([{
                user_id: user.id,
                status: 'payment_submitted',
                payment_proof_url: filePath,
                payment_submitted_at: new Date(),
                boarding_type: boardingType,
                form_data: {
                    parent_phone: phone,
                    initial_password: finalPassword
                }
            }]);

            if (regError) throw regError;

            // 4. Send Email Notification (Fire and forget)
            sendRegistrationEmail({
                fullName,
                email,
                phone,
                password: finalPassword
            });

            // 5. Show Success View instead of Alert
            setSuccessData({
                password: finalPassword,
                phone: phone,
                name: fullName
            });

        } catch (err) {
            console.error(err);
            setError(err.message || 'Terjadi kesalahan saat mendaftar.');
        } finally {
            setLoading(false);
        }
    };

    if (successData) {
        const adminPhone = schoolSettings?.contact_phone || '';
        // Format phone for WhatsApp (remove leading 0, add 62)
        const formattedAdminPhone = adminPhone.startsWith('0') ? '62' + adminPhone.slice(1) : adminPhone;

        const waMessage = `Halo Admin, saya siswa baru telah mendaftar.
Nama: ${successData.name}
Email: ${email}
Mohon dicek. Terima kasih.`;

        const waLink = `https://wa.me/${formattedAdminPhone}?text=${encodeURIComponent(waMessage)}`;

        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)', padding: '2rem 1rem' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card glass"
                    style={{ width: '100%', maxWidth: '500px', textAlign: 'center', padding: '2rem' }}
                >
                    <div style={{ width: '80px', height: '80px', backgroundColor: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#10b981' }}>
                        <UserPlus size={40} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-primary)' }}>Pendaftaran Berhasil!</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Akun Anda telah dibuat. Silakan simpan password di bawah ini untuk login.
                    </p>

                    <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', border: '1px dashed var(--border-color)' }}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Password Anda:</p>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', letterSpacing: '2px', color: 'var(--primary-color)' }}>{successData.password}</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {adminPhone && (
                            <a
                                href={waLink}
                                target="_blank"
                                rel="noreferrer"
                                className="btn"
                                style={{ backgroundColor: '#25D366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: 'none' }}
                            >
                                <MessageCircle size={20} /> Konfirmasi ke WhatsApp Admin
                            </a>
                        )}

                        <Link to="/login" className="btn btn-primary">
                            Masuk ke Aplikasi
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)', padding: '2rem 1rem' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="card glass"
                style={{ width: '100%', maxWidth: '500px', border: '1px solid rgba(255,255,255,0.5)' }}
            >
                <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        style={{ width: '64px', height: '64px', backgroundColor: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--primary-color)' }}
                    >
                        <UserPlus size={32} />
                    </motion.div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Formulir Pendaftaran</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Isi data diri dan lakukan pembayaran</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        style={{ backgroundColor: '#fef2f2', color: 'var(--error)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Nama Lengkap Siswa</label>
                        <input
                            type="text"
                            required
                            className="input"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Sesuai Ijazah / Akta Kelahiran"
                        />
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>No. WhatsApp / HP</label>
                        <input
                            type="tel"
                            required
                            className="input"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Contoh: 081234567890"
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            Digunakan untuk pengiriman informasi akun dan pengumuman.
                        </p>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Email</label>
                        <input
                            type="email"
                            required
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nama@email.com"
                        />
                    </div>

                    {/* Program Pilihan - Only show if available options exist */}
                    {(schoolSettings?.allow_fullday_ikhwan !== false || schoolSettings?.allow_fullday_akhwat !== false || schoolSettings?.allow_boarding_ikhwan !== false || schoolSettings?.allow_boarding_akhwat !== false) && (
                        <div style={{ marginTop: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Program Pilihan (Jalur Pendaftaran)</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {(schoolSettings?.allow_fullday_ikhwan !== false || schoolSettings?.allow_fullday_akhwat !== false) && (
                                    <div
                                        onClick={() => setBoardingType('Fullday')}
                                        style={{
                                            border: `2px solid ${boardingType === 'Fullday' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                            borderRadius: 'var(--radius-md)',
                                            padding: '1rem',
                                            cursor: 'pointer',
                                            backgroundColor: boardingType === 'Fullday' ? '#ecfdf5' : 'white',
                                            transition: 'all 0.2s',
                                            opacity: boardingType === 'Fullday' ? 1 : 0.7
                                        }}
                                    >
                                        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: boardingType === 'Fullday' ? 'var(--primary-color)' : 'inherit' }}>Fullday</div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {schoolSettings?.fullday_description || 'Program sekolah sehari penuh.'}
                                        </p>
                                    </div>
                                )}

                                {(schoolSettings?.allow_boarding_ikhwan !== false || schoolSettings?.allow_boarding_akhwat !== false) && (
                                    <div
                                        onClick={() => setBoardingType('Boarding')}
                                        style={{
                                            border: `2px solid ${boardingType === 'Boarding' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                            borderRadius: 'var(--radius-md)',
                                            padding: '1rem',
                                            cursor: 'pointer',
                                            backgroundColor: boardingType === 'Boarding' ? '#ecfdf5' : 'white',
                                            transition: 'all 0.2s',
                                            opacity: boardingType === 'Boarding' ? 1 : 0.7
                                        }}
                                    >
                                        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: boardingType === 'Boarding' ? 'var(--primary-color)' : 'inherit' }}>Boarding</div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {schoolSettings?.boarding_description || 'Program sekolah dengan asrama.'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />

                    {/* Payment Info */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CreditCard size={18} /> Informasi Pembayaran
                        </h3>

                        <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Biaya Pendaftaran:</span>
                                <span style={{ fontWeight: 'bold' }}>Rp {parseInt(schoolSettings?.registration_fee || 0).toLocaleString('id-ID')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Bank:</span>
                                <span style={{ fontWeight: 'bold' }}>{schoolSettings?.bank_name || '-'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>No. Rekening:</span>
                                <span style={{ fontWeight: 'bold' }}>{schoolSettings?.bank_account_number || '-'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Atas Nama:</span>
                                <span style={{ fontWeight: 'bold' }}>{schoolSettings?.bank_account_holder || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Upload Proof */}
                    <div style={{ marginTop: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Upload Bukti Transfer</label>
                        <div style={{ border: '2px dashed var(--border-color)', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center', cursor: 'pointer', backgroundColor: 'white' }} onClick={() => document.getElementById('proof-upload').click()}>
                            <Upload size={24} style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }} />
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                                {paymentFile ? paymentFile.name : 'Klik untuk upload bukti transfer'}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Format: JPG, PNG, PDF (Max 2MB)</p>
                        </div>
                        <input
                            type="file"
                            id="proof-upload"
                            style={{ display: 'none' }}
                            accept="image/*,application/pdf"
                            onChange={(e) => setPaymentFile(e.target.files[0])}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading || !!error} style={{ marginTop: '1.5rem', width: '100%', opacity: (loading || !!error) ? 0.7 : 1 }}>
                        {loading ? 'Sedang memproses...' : 'Daftar & Kirim Bukti'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Sudah punya akun? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 500 }}>Masuk disini</Link>
                    </p>
                    <div style={{ marginTop: '1rem' }}>
                        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                            <ArrowLeft size={16} /> Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Floating WhatsApp Help Button */}
            <a
                href={`https://wa.me/${(schoolSettings?.contact_phone || '').replace(/^0/, '62')}?text=${encodeURIComponent('Halo Admin, saya butuh bantuan pendaftaran.')}`}
                target="_blank"
                rel="noreferrer"
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    backgroundColor: '#25D366',
                    color: 'white',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 50,
                    transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                title="Bantuan? Chat Admin"
            >
                <MessageCircle size={32} />
            </a>
        </div>
    );

}
