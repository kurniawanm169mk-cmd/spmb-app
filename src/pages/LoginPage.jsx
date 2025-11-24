import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { user } = await login(email, password);
            // Redirect based on role? For now just go to student dashboard, 
            // AuthContext/ProtectedRoute will handle role checks if they try to access admin.
            // Ideally we check role here but profile might take a sec to load in context.
            // Let's just push to /student, if they are admin they can go to /admin manually or we redirect later.
            navigate('/student');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--primary-color)' }}>
                        <LogIn size={24} />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Login Peserta</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Masuk ke akun pendaftaran anda</p>
                </div>

                {error && (
                    <div style={{ backgroundColor: '#fef2f2', color: 'var(--error)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
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

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Password</label>
                        <input
                            type="password"
                            required
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password anda"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
                        {loading ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Belum punya akun? <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: 500 }}>Daftar disini</Link>
                    </p>
                    <div style={{ marginTop: '1rem' }}>
                        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                            <ArrowLeft size={16} /> Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
