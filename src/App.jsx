import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { supabase } from './lib/supabase';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import StudentDashboard from './pages/student/StudentDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

const ProtectedRoute = ({ children, role }) => {
    const { user, profile, loading } = useAuth();

    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;

    // Wait for profile to load if user is logged in
    if (!profile) return <div>Loading Profile...</div>;

    if (role && profile?.role !== role) return <Navigate to="/" />;

    return children;
};

function App() {
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await supabase.from('school_settings').select('logo_url, font_family, border_radius').maybeSingle();
                if (data) {
                    // Update Favicon
                    if (data.logo_url) {
                        const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
                        link.type = 'image/png';
                        link.rel = 'icon';
                        link.href = data.logo_url;
                        document.getElementsByTagName('head')[0].appendChild(link);
                    }

                    // Update Font Family
                    if (data.font_family) {
                        document.documentElement.style.setProperty('--font-primary', `'${data.font_family}', sans-serif`);
                    }

                    // Update Border Radius
                    if (data.border_radius) {
                        document.documentElement.style.setProperty('--radius-global', data.border_radius);
                    }
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
            }
        };
        fetchSettings();
    }, []);

    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/admin/login" element={<AdminLoginPage />} />

                    <Route path="/student/*" element={
                        <ProtectedRoute role="student">
                            <StudentDashboard />
                        </ProtectedRoute>
                    } />

                    <Route path="/admin/*" element={
                        <ProtectedRoute role="admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
