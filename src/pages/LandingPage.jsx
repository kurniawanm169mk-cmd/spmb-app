import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Carousel from '../components/Carousel';
import VideoGallerySection from '../components/VideoGallerySection';
import { Calendar, CheckCircle, FileText, Upload, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
    const [schoolSettings, setSchoolSettings] = useState(null);
    const [carouselImages, setCarouselImages] = useState([]);
    const [socials, setSocials] = useState([]);
    const [registrationSteps, setRegistrationSteps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch School Settings
                const { data: settings } = await supabase
                    .from('school_settings')
                    .select('*')
                    .limit(1)
                    .maybeSingle();

                if (settings) {
                    setSchoolSettings(settings);
                    // Apply theme colors
                    const root = document.documentElement;
                    if (settings.primary_color) root.style.setProperty('--primary-color', settings.primary_color);
                    if (settings.secondary_color) root.style.setProperty('--secondary-color', settings.secondary_color);
                }

                // Fetch Carousel Images
                const { data: images } = await supabase
                    .from('carousel_images')
                    .select('*')
                    .order('order_index', { ascending: true });

                if (images) setCarouselImages(images);

                // Fetch Social Media
                const { data: socialData } = await supabase
                    .from('social_media')
                    .select('*');

                if (socialData) setSocials(socialData);

                // Fetch Registration Steps
                const { data: steps } = await supabase
                    .from('registration_steps')
                    .select('*')
                    .order('order_index');

                if (steps) setRegistrationSteps(steps);

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const getIconComponent = (iconName) => {
        const icons = { FileText, Upload, CheckCircle, Calendar, User };
        return icons[iconName] || FileText;
    };

    if (loading) {
        return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar schoolSettings={schoolSettings} />

            <main style={{ flex: 1 }}>
                {/* Hero Section - Full Screen */}
                <section style={{ position: 'relative', overflow: 'hidden', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Background with Carousel */}
                    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                        <Carousel slides={carouselImages} height="100dvh" />
                    </div>

                    {/* Dark Overlay & Blur */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 0,
                        backgroundColor: `rgba(0, 0, 0, ${(schoolSettings?.hero_overlay_opacity ?? 50) / 100})`,
                        backdropFilter: `blur(${schoolSettings?.hero_blur || 0}px)`,
                        WebkitBackdropFilter: `blur(${schoolSettings?.hero_blur || 0}px)`
                    }}></div>

                    {/* Overlay Content */}
                    <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)', padding: '0 1rem' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
                            {schoolSettings?.logo_url && (
                                <motion.img
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                    src={schoolSettings.logo_url}
                                    alt="Logo Sekolah"
                                    style={{ width: 'clamp(80px, 15vw, 120px)', height: 'clamp(80px, 15vw, 120px)', objectFit: 'contain', marginBottom: '1.5rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}
                                />
                            )}
                            <h1 className="hero-title" style={{ fontWeight: '800', marginBottom: '1rem', color: 'white' }}>
                                {schoolSettings?.school_name || 'SMPIT Ibnu Sina'}
                            </h1>
                            <p style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)', maxWidth: '700px', margin: '0 auto 2rem', color: '#f0fdfa' }}>
                                {schoolSettings?.slogan || 'Generasi Islami, Unggul, Cerdas dan Berakhlak Mulia'}
                            </p>

                            {/* Registration Period */}
                            {schoolSettings?.registration_start_date && schoolSettings?.registration_end_date && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        backdropFilter: 'blur(4px)',
                                        borderRadius: 'var(--radius-global)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: 'var(--primary-color)',
                                        boxShadow: 'var(--shadow-lg)',
                                        textShadow: 'none'
                                    }}
                                >
                                    <Calendar size={20} />
                                    <span className="schedule-text" style={{ fontWeight: 600 }}>
                                        Pendaftaran: {new Date(schoolSettings.registration_start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} - {new Date(schoolSettings.registration_end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </motion.div>
                            )}

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                style={{ marginTop: '2rem' }}
                            >
                                <a href="#info" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem', textShadow: 'none' }}>
                                    Selengkapnya
                                </a>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Video Gallery Section */}
                <VideoGallerySection />

                {/* Info / Steps Section */}
                <section id="info" style={{ backgroundColor: 'white', padding: '6rem 0' }}>
                    <div className="container">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            style={{ textAlign: 'center', marginBottom: '4rem', color: 'var(--text-primary)', fontSize: '2.25rem', fontWeight: 'bold' }}
                        >
                            Alur Pendaftaran
                        </motion.h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
                            {registrationSteps.length > 0 ? (
                                registrationSteps.map((step, index) => {
                                    const IconComponent = getIconComponent(step.icon);
                                    return (
                                        <motion.div
                                            key={step.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.1 }}
                                            className="card"
                                            style={{ textAlign: 'center', padding: '2.5rem' }}
                                        >
                                            <div style={{ margin: '0 auto 1.5rem', width: '72px', height: '72px', backgroundColor: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                                                <IconComponent size={36} />
                                            </div>
                                            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>{index + 1}. {step.title}</h3>
                                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>{step.description}</p>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <p style={{ textAlign: 'center', gridColumn: '1/-1', color: 'var(--text-secondary)' }}>Belum ada alur pendaftaran yang diatur.</p>
                            )}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="cta-section-bg" style={{ position: 'relative', padding: '6rem 0', color: 'white', overflow: 'hidden' }}>
                    <div className="cta-overlay"></div>
                    <div className="container cta-content" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                        <h2 className="cta-title" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>
                            {schoolSettings?.cta_title || 'Siap Bergabung Bersama Kami?'}
                        </h2>
                        <p className="cta-description" style={{ fontSize: '1.25rem', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem', opacity: 0.9 }}>
                            {schoolSettings?.cta_description || 'Daftarkan putra-putri Anda sekarang dan jadilah bagian dari keluarga besar kami.'}
                        </p>
                        <Link to="/register" className="btn" style={{ backgroundColor: 'white', color: 'var(--primary-color)', padding: '1rem 2.5rem', fontSize: '1.125rem', border: '2px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                            {schoolSettings?.cta_button_text || 'Daftar Sekarang'}
                        </Link>
                    </div>
                </section>
            </main>

            <Footer schoolSettings={schoolSettings} socialMedia={socials} />
        </div>
    );
}
