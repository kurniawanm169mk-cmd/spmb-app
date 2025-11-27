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
                const { data } = await supabase.from('school_settings').select('*').maybeSingle();
                if (data) {
                    const root = document.documentElement;

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
                        root.style.setProperty('--font-primary', `'${data.font_family}', sans-serif`);
                    }

                    // Update Border Radius
                    if (data.border_radius) {
                        root.style.setProperty('--radius-global', data.border_radius);
                    }

                    // Update Typography - Header
                    if (data.header_font_size_pc) root.style.setProperty('--header-size-pc', data.header_font_size_pc);
                    if (data.header_font_size_mobile) root.style.setProperty('--header-size-mobile', data.header_font_size_mobile);
                    if (data.header_letter_spacing_pc) root.style.setProperty('--header-spacing-pc', data.header_letter_spacing_pc);
                    if (data.header_letter_spacing_mobile) root.style.setProperty('--header-spacing-mobile', data.header_letter_spacing_mobile);

                    // Update Typography - Hero
                    if (data.hero_title_size_pc) root.style.setProperty('--hero-title-size-pc', data.hero_title_size_pc);
                    if (data.hero_title_size_mobile) root.style.setProperty('--hero-title-size-mobile', data.hero_title_size_mobile);
                    if (data.hero_title_spacing_pc) root.style.setProperty('--hero-title-spacing-pc', data.hero_title_spacing_pc);
                    if (data.hero_title_spacing_mobile) root.style.setProperty('--hero-title-spacing-mobile', data.hero_title_spacing_mobile);

                    // Update Typography - Schedule
                    if (data.schedule_size_pc) root.style.setProperty('--schedule-size-pc', data.schedule_size_pc);
                    if (data.schedule_size_mobile) root.style.setProperty('--schedule-size-mobile', data.schedule_size_mobile);
                    if (data.schedule_spacing_pc) root.style.setProperty('--schedule-spacing-pc', data.schedule_spacing_pc);
                    if (data.schedule_spacing_mobile) root.style.setProperty('--schedule-spacing-mobile', data.schedule_spacing_mobile);

                    // Update Typography - CTA
                    if (data.cta_title_size_pc) root.style.setProperty('--cta-title-size-pc', data.cta_title_size_pc);
                    if (data.cta_title_size_mobile) root.style.setProperty('--cta-title-size-mobile', data.cta_title_size_mobile);
                    if (data.cta_title_spacing_pc) root.style.setProperty('--cta-title-spacing-pc', data.cta_title_spacing_pc);
                    if (data.cta_title_spacing_mobile) root.style.setProperty('--cta-title-spacing-mobile', data.cta_title_spacing_mobile);
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
