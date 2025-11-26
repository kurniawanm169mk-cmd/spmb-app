import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react';
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

    useEffect(() => {
        if (user) fetchRegistration();
    }, [user]);

    const fetchRegistration = async () => {
        try {
            const { data, error } = await supabase
                .from('registrations')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
                console.error('Error fetching registration:', error);
            } else {
                setRegistration(data);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false);
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
                <Routes>
                    <Route path="/" element={<StatusOverview registration={registration} />} />
                    <Route path="/payment" element={<PaymentUpload registration={registration} onUpdate={fetchRegistration} />} />
                    <Route path="/form" element={<RegistrationForm registration={registration} onUpdate={fetchRegistration} />} />
                    <Route path="/documents" element={<DocumentUpload registration={registration} onUpdate={fetchRegistration} />} />
                </Routes>
            </div>
        </div>
    );
}

const StatusOverview = ({ registration }) => {
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

            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
                Pantau terus halaman ini untuk melihat perkembangan status pendaftaran anda. Pastikan notifikasi WhatsApp anda aktif.
            </p>

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
};
