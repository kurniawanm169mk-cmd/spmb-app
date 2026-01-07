import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, FileText, Upload, CheckCircle, AlertCircle, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import PaymentUpload from './PaymentUpload';
import RegistrationForm from './RegistrationForm';
import DocumentUpload from './DocumentUpload';

export default function StudentDashboard() {
    const { user, logout } = useAuth();
    const [registration, setRegistration] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const [settings, setSettings] = useState(null);
    const [method, setMethod] = useState('online'); // 'online' | 'offline'

    useEffect(() => {
        if (user) {
            fetchRegistration();
            fetchSettings();
        }
    }, [user]);

    const fetchSettings = async () => {
        const { data } = await supabase.from('school_settings').select('*').maybeSingle();
        if (data) setSettings(data);
    };

    const fetchRegistration = async () => {
        try {
            const { data, error } = await supabase
                .from('registrations')
                .select('*, profiles:user_id (full_name, email)')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
                console.error('Error fetching registration:', error);
            } else {
                setRegistration(data);
                if (data.registration_method) setMethod(data.registration_method);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateMethod = async (newMethod) => {
        setMethod(newMethod);
        if (registration) {
            await supabase.from('registrations').update({ registration_method: newMethod }).eq('id', registration.id);
            // If switching to offline, maybe we don't need to change status?
            // If switching to online, we might need to ensure status is appropriate?
            // For now just update the method preference.
            fetchRegistration();
        }
    };

    const startRegistration = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('registrations')
                .insert([{ user_id: user.id, status: 'registered' }])
                .select()
                .single();

            if (error) throw error;
            setRegistration(data);
        } catch (err) {
            console.error('Error starting registration:', err);
            toast.error('Gagal memulai pendaftaran. Silahkan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading...</div>;

    if (!registration) {
        return (
            <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h1 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Selamat Datang, Calon Siswa!</h1>
                    <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                        Silahkan mulai pendaftaran anda dengan menekan tombol di bawah ini.
                    </p>
                    <button onClick={startRegistration} className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}>
                        Mulai Pendaftaran
                    </button>
                </div>
            </div>
        );
    }

    const steps = [
        { id: 'payment', label: 'Pembayaran', icon: CreditCard, path: '/student/payment', status: ['registered', 'payment_submitted', 'payment_verified'] },
        { id: 'form', label: 'Formulir', icon: FileText, path: '/student/form', status: ['payment_verified', 'documents_submitted', 'verified', 'passed', 'failed'] },
        { id: 'docs', label: 'Berkas', icon: Upload, path: '/student/documents', status: ['payment_verified', 'documents_submitted', 'verified', 'passed', 'failed'] },
        { id: 'status', label: 'Status', icon: CheckCircle, path: '/student', status: ['all'] } // Always visible
    ];

    // Helper to check if step is accessible
    const isAccessible = (stepStatus) => {
        if (stepStatus.includes('all')) return true;
        // Simple logic: if current status is in the list or later. 
        // Actually, we should check if the *previous* step is done.
        // For simplicity, let's rely on the status list provided in the step definition.
        // If the current registration.status is in the step.status array, it's accessible.
        // Wait, 'form' is accessible only after 'payment_verified'.
        return stepStatus.includes(registration.status) ||
            (registration.status === 'documents_submitted' && stepStatus.includes('payment_verified')) || // Allow going back?
            (registration.status === 'verified' && stepStatus.includes('payment_verified'));
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Dashboard Pendaftaran</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Status: <span style={{ fontWeight: 'bold', color: 'var(--primary-color)', textTransform: 'uppercase' }}>{registration.status.replace('_', ' ')}</span></p>
                </div>
                <button onClick={logout} className="btn btn-outline" style={{ fontSize: '0.875rem' }}>
                    Keluar
                </button>
            </div>

            {/* Registration Method Toggle */}
            <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Pilih Metode Pendaftaran</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div
                        onClick={() => updateMethod('online')}
                        style={{
                            border: `2px solid ${method === 'online' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                            borderRadius: 'var(--radius-md)',
                            padding: '1rem',
                            cursor: 'pointer',
                            backgroundColor: method === 'online' ? '#ecfdf5' : 'white',
                            transition: 'all 0.2s',
                            opacity: method === 'online' ? 1 : 0.6
                        }}
                    >
                        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: method === 'online' ? 'var(--primary-color)' : 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Upload size={18} /> Daftar Online
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {settings?.online_description || 'Isi formulir dan upload berkas secara digital.'}
                        </p>
                    </div>
                    <div
                        onClick={() => updateMethod('offline')}
                        style={{
                            border: `2px solid ${method === 'offline' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                            borderRadius: 'var(--radius-md)',
                            padding: '1rem',
                            cursor: 'pointer',
                            backgroundColor: method === 'offline' ? '#ecfdf5' : 'white',
                            transition: 'all 0.2s',
                            opacity: method === 'offline' ? 1 : 0.6
                        }}
                    >
                        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: method === 'offline' ? 'var(--primary-color)' : 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={18} /> Daftar Offline (Datang Langsung)
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {settings?.offline_description || 'Datang ke sekolah untuk pengisian berkas manual.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Floating WhatsApp Help Button */}
            <a
                href={`https://wa.me/${(settings?.contact_phone || '').replace(/^0/, '62')}?text=${encodeURIComponent('Halo Admin, saya butuh bantuan seputar pendaftaran siswa baru.')}`}
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
                    zIndex: 50
                }}
                title="Hubungi Admin"
            >
                <MessageCircle size={32} />
            </a>

            {/* Stepper Navigation */}
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem' }}>
                {steps.map((step) => {
                    // Custom logic for active/disabled
                    const isActive = location.pathname === step.path || (step.path === '/student' && location.pathname === '/student');
                    // Basic check: 
                    // Payment: always accessible if registered.
                    // Form: accessible if payment_verified or later.
                    // Docs: accessible if payment_verified or later.
                    let disabled = false;
                    if (step.id === 'form' || step.id === 'docs') {
                        if (registration.status === 'registered' || registration.status === 'payment_submitted') disabled = true;
                    }

                    return (
                        <button
                            key={step.id}
                            onClick={() => !disabled && navigate(step.path)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.5rem',
                                borderRadius: 'var(--radius-full)',
                                border: isActive ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                                backgroundColor: isActive ? '#ecfdf5' : 'white',
                                color: isActive ? 'var(--primary-color)' : (disabled ? 'var(--text-secondary)' : 'var(--text-primary)'),
                                opacity: disabled ? 0.5 : 1,
                                cursor: disabled ? 'not-allowed' : 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <step.icon size={18} />
                            {step.label}
                        </button>
                    );
                })}
            </div>

            <div className="card">
                {method === 'offline' && location.pathname !== '/student' ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--text-secondary)' }}>
                            <FileText size={32} />
                        </div>
                        <h2 style={{ marginBottom: '1rem' }}>Pendaftaran Offline Dipilih</h2>
                        <div style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                            {settings?.offline_message || 'Anda memilih metode pendaftaran Offline. Silahkan datang langsung ke sekretariat sekolah.'}
                        </div>

                        {/* Offline Maps & Images */}
                        {/* Offline Maps & Images */}
                        {(settings?.google_maps_url || (settings?.offline_images && settings.offline_images.length > 0)) && (() => {
                            // Helper to extract src from iframe if user pasted the whole tag
                            const getMapSrc = (input) => {
                                if (!input) return null;
                                if (input.includes('<iframe')) {
                                    const match = input.match(/src="([^"]+)"/);
                                    return match ? match[1] : null;
                                }
                                return input;
                            };
                            const mapSrc = getMapSrc(settings?.google_maps_url);

                            return (
                                <div style={{ marginTop: '2.5rem', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
                                    {mapSrc && (
                                        <div style={{ marginBottom: '2rem', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                            <iframe
                                                src={mapSrc}
                                                width="100%"
                                                height="350"
                                                style={{ border: 0 }}
                                                allowFullScreen=""
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                                title="Lokasi Sekolah"
                                            ></iframe>
                                        </div>
                                    )}

                                    {settings.offline_images && settings.offline_images.length > 0 && (
                                        <div>
                                            <h4 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Denah & Lokasi Pendaftaran</h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                                                {settings.offline_images.map((img, idx) => (
                                                    <div key={idx} style={{ borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                                        <img src={img} alt={`Lokasi ${idx + 1}`} style={{ width: '100%', height: '150px', objectFit: 'cover', cursor: 'pointer' }} onClick={() => window.open(img, '_blank')} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                ) : (
                    <Routes>
                        <Route path="/" element={<StatusOverview registration={registration} settings={settings} />} />
                        <Route path="/payment" element={<PaymentUpload registration={registration} settings={settings} onUpdate={fetchRegistration} />} />
                        <Route path="/form" element={<RegistrationForm registration={registration} onUpdate={fetchRegistration} />} />
                        <Route path="/documents" element={<DocumentUpload registration={registration} onUpdate={fetchRegistration} />} />
                    </Routes>
                )}
            </div>
        </div>
    );
}

const StatusOverview = ({ registration, settings }) => {
    return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                {registration.status === 'passed' ? (
                    <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto' }} />
                ) : registration.status === 'failed' ? (
                    <AlertCircle size={64} color="var(--error)" style={{ margin: '0 auto' }} />
                ) : (
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '4px solid var(--primary-color)', borderTopColor: 'transparent', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
                )}
            </div>

            <h2 style={{ marginBottom: '1rem' }}>
                {registration.status === 'registered' && 'Silahkan Lakukan Pembayaran'}
                {registration.status === 'payment_submitted' && 'Menunggu Verifikasi Pembayaran'}
                {registration.status === 'payment_verified' && 'Pembayaran Terverifikasi. Silahkan Isi Formulir.'}
                {registration.status === 'documents_submitted' && 'Menunggu Verifikasi Data'}
                {registration.status === 'verified' && 'Data Terverifikasi. Menunggu Pengumuman.'}
                {registration.status === 'passed' && 'SELAMAT! ANDA DITERIMA.'}
                {registration.status === 'failed' && 'MOHON MAAF, ANDA BELUM DITERIMA.'}
            </h2>

            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
                Pantau terus halaman ini untuk melihat perkembangan status pendaftaran anda. Pastikan notifikasi WhatsApp anda aktif.
            </p>

            {/* NUDGE BUTTON */}
            {registration.status === 'payment_submitted' && settings?.contact_phone && (
                <a
                    href={`https://wa.me/${settings.contact_phone.replace(/^0/, '62')}?text=${encodeURIComponent(`Halo Admin, saya sudah membayar dan upload bukti transfer.\n\nNama: ${registration.profiles?.full_name || '-'}\nEmail: ${registration.profiles?.email || '-'}\n\nMohon verifikasi.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn"
                    style={{ backgroundColor: '#25D366', color: 'white', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: 'none' }}
                >
                    <MessageCircle size={18} /> Hubungi Admin untuk Verifikasi
                </a>
            )}

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
};
