import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
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
            // Wait a bit for profile to update in context or check manually
            // Ideally useAuth should provide a way to check role immediately or we fetch it here.
            // For now, let's just navigate. The ProtectedRoute will handle the check.
            // If double login is needed, it's likely because 'user' state in context isn't updated fast enough
            // or the ProtectedRoute redirects back to login because it thinks user is null.
            // Let's force a small delay or rely on the fact that login() awaits signInWithPassword.

            // Better approach: Check role directly here to be sure
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            if (profile?.role === 'admin') {
                navigate('/admin');
            } else {
                setError('Anda bukan admin!');
                await supabase.auth.signOut();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', borderTop: '4px solid var(--primary-color)' }}>
                <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--text-primary)' }}>
                        <ShieldCheck size={24} />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Administrator</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Login untuk mengelola sistem</p>
                </div>

                {error && (
                    <div style={{ backgroundColor: '#fef2f2', color: 'var(--error)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Email Admin</label>
                        <input
                            type="email"
                            required
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@sekolah.id"
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
                            placeholder="Password admin"
                        />
                    </div>

                    <button type="submit" className="btn" disabled={loading} style={{ marginTop: '0.5rem', backgroundColor: '#334155', color: 'white' }}>
                        {loading ? 'Memproses...' : 'Masuk Dashboard'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        <ArrowLeft size={16} /> Kembali ke Website
                    </button>
                </div>
            </div>
        </div>
    );
}
