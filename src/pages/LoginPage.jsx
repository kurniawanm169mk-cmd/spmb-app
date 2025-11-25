import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, ArrowLeft, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

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
            const { user, error } = await login(email, password);
            if (error) throw error;

            // Redirect based on role
            if (user?.user_metadata?.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/student');
            }
        } catch (err) {
            setError('Email atau password salah.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)', padding: '2rem 1rem' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="card glass"
                style={{ width: '100%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.5)' }}
            >
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        style={{ width: '64px', height: '64px', backgroundColor: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--primary-color)' }}
                    >
                        <LogIn size={32} />
                    </motion.div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Selamat Datang</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Silakan masuk ke akun Anda</p>
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

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="email"
                                required
                                className="input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nama@email.com"
                                style={{ paddingLeft: '3rem' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="password"
                                required
                                className="input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{ paddingLeft: '3rem' }}
                            />
                        </div>
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
            </motion.div>
        </div>
    );
}
