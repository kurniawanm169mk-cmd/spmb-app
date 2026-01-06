import React from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { LayoutDashboard, Users, Settings, LogOut, Palette, Type, Image, ListOrdered, FileText } from 'lucide-react';
import SchoolProfile from './SchoolProfile';
import StudentList from './StudentList';
import SystemSettings from './SystemSettings';
import Typography from './Typography';
import CTASettings from './CTASettings';
import RegistrationFlow from './RegistrationFlow';
import FormCustomization from './FormCustomization';

export default function AdminDashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/students', label: 'Data Pendaftar', icon: Users },
        { path: '/admin/profile', label: 'Profil Sekolah', icon: Palette },
        { path: '/admin/customization', label: 'Kustomisasi Formulir', icon: FileText },
        { path: '/admin/typography', label: 'Tipografi', icon: Type },
        { path: '/admin/cta-settings', label: 'CTA Section', icon: Image },
        { path: '/admin/registration-flow', label: 'Alur Pendaftaran', icon: ListOrdered },
        { path: '/admin/settings', label: 'Pengaturan', icon: Settings },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
            {/* Sidebar */}
            <aside style={{ width: '250px', backgroundColor: 'white', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <h2 style={{ color: 'var(--primary-color)', fontSize: '1.25rem', fontWeight: 'bold' }}>Admin Panel</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>SMPIT Ibnu Sina</p>
                </div>

                <nav style={{ flex: 1, padding: '1rem' }}>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.75rem 1rem',
                                            borderRadius: 'var(--radius-md)',
                                            backgroundColor: isActive ? '#ecfdf5' : 'transparent',
                                            color: isActive ? 'var(--primary-color)' : 'var(--text-primary)',
                                            fontWeight: isActive ? 500 : 400,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <item.icon size={20} />
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            width: '100%',
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: 'var(--error)',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        <LogOut size={20} />
                        Keluar
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                <Routes>
                    <Route path="/" element={<DashboardOverview />} />
                    <Route path="/students" element={<StudentList />} />
                    <Route path="/profile" element={<SchoolProfile />} />
                    <Route path="/typography" element={<Typography />} />
                    <Route path="/cta-settings" element={<CTASettings />} />
                    <Route path="/registration-flow" element={<RegistrationFlow />} />
                    <Route path="/customization" element={<FormCustomization />} />
                    <Route path="/settings" element={<SystemSettings />} />
                </Routes>
            </main>
        </div>
    );
}



const DashboardOverview = () => {
    const [stats, setStats] = React.useState({ total: 0, pending: 0, accepted: 0 });

    React.useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Use static supabase client
            const { count: total, error: err1 } = await supabase.from('registrations').select('*', { count: 'exact', head: true });
            const { count: pending, error: err2 } = await supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'payment_submitted');
            const { count: accepted, error: err3 } = await supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'passed');

            if (err1) console.error('Error fetching total:', err1);
            if (err2) console.error('Error fetching pending:', err2);
            if (err3) console.error('Error fetching accepted:', err3);

            setStats({
                total: total || 0,
                pending: pending || 0,
                accepted: accepted || 0
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };
    // ...

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Dashboard Overview</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div className="card">
                    <h3>Total Pendaftar</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{stats.total}</p>
                </div>
                <div className="card">
                    <h3>Menunggu Verifikasi</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning)' }}>{stats.pending}</p>
                </div>
                <div className="card">
                    <h3>Diterima</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>{stats.accepted}</p>
                </div>
            </div>
        </div>
    );
};
