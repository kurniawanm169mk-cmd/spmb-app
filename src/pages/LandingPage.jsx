import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Carousel from '../components/Carousel';
import IconBox from '../components/IconBox';
import InfoCard from '../components/InfoCard';
import {
    Calendar, CheckCircle, FileText, Upload,
    CreditCard, Bell, Phone, School, Award, Users, BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
    const [schoolSettings, setSchoolSettings] = useState(null);
    const [carouselImages, setCarouselImages] = useState([]);
    const [socials, setSocials] = useState([]);
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

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    if (loading) {
        return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar schoolSettings={schoolSettings} />

            <main style={{ flex: 1 }}>
                {/* Hero Section - Enhanced */}
                <section style={{ position: 'relative', overflow: 'hidden', minHeight: '500px' }}>
                    {/* Background with Carousel */}
                    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                        <Carousel slides={carouselImages} />
                        {/* Overlay gradient */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.85) 0%, rgba(6, 182, 212, 0.75) 100%)',
                            zIndex: 1
                        }} />
                    </div>

                    {/* Content */}
                    <div className="container" style={{ position: 'relative', zIndex: 2, padding: '6rem 1.5rem', textAlign: 'center' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            {schoolSettings?.logo_url && (
                                <motion.img
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.6 }}
                                    src={schoolSettings.logo_url}
                                    alt="Logo Sekolah"
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        objectFit: 'contain',
                                        marginBottom: '1.5rem',
                                        filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))'
                                    }}
                                />
                            )}
                            <h1 style={{
                                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                                fontWeight: '800',
                                color: 'white',
                                marginBottom: '1rem',
                                letterSpacing: '-0.02em',
                                textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
                            }}>
                                {schoolSettings?.school_name || 'SMPIT Ibnu Sina'}
                            </h1>
                            <p style={{
                                fontSize: 'clamp(1rem, 2vw, 1.5rem)',
                                color: 'rgba(255, 255, 255, 0.95)',
                                maxWidth: '700px',
                                margin: '0 auto 2.5rem',
                                lineHeight: '1.6',
                                textShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
                            }}>
                                {schoolSettings?.slogan || 'Generasi Islami, Unggul, Cerdas dan Berakhlak Mulia'}
                            </p>

                            {/* Registration Period Badge */}
                            {schoolSettings?.registration_start_date && schoolSettings?.registration_end_date && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 }}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '1rem 2rem',
                                        backgroundColor: 'white',
                                        borderRadius: 'var(--radius-full)',
                                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                                        color: 'var(--primary-color)',
                                        fontWeight: '600'
                                    }}
                                >
                                    <Calendar size={22} />
                                    <span>
                                        Pendaftaran: {new Date(schoolSettings.registration_start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} - {new Date(schoolSettings.registration_end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                </section>

                {/* Quick Access Icon Grid - NEW */}
                <section style={{ backgroundColor: 'white', padding: '4rem 0', marginTop: '-2rem', position: 'relative', zIndex: 3 }}>
                    <div className="container">
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                            gap: '1.5rem',
                            maxWidth: '1100px',
                            margin: '0 auto'
                        }}>
                            <IconBox
                                icon={<FileText size={32} />}
                                title="Pendaftaran"
                                description="Daftar online"
                                link="/register"
                                color="#10b981"
                            />
                            <IconBox
                                icon={<Upload size={32} />}
                                title="Persyaratan"
                                description="Dokumen wajib"
                                link="#info"
                                color="#3b82f6"
                            />
                            <IconBox
                                icon={<CreditCard size={32} />}
                                title="Pembayaran"
                                description="Info biaya"
                                link="#info"
                                color="#f59e0b"
                            />
                            <IconBox
                                icon={<Calendar size={32} />}
                                title="Jadwal"
                                description="Timeline"
                                link="#info"
                                color="#8b5cf6"
                            />
                            <IconBox
                                icon={<Bell size={32} />}
                                title="Pengumuman"
                                description="Cek hasil"
                                link="/login"
                                color="#ef4444"
                            />
                            <IconBox
                                icon={<Phone size={32} />}
                                title="Kontak"
                                description="Hubungi kami"
                                link="#footer"
                                color="#06b6d4"
                            />
                        </div>
                    </div>
                </section>

                {/* Keunggulan Section - NEW */}
                <section style={{ backgroundColor: '#f8fafc', padding: '6rem 0' }}>
                    <div className="container">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            style={{ textAlign: 'center', marginBottom: '4rem' }}
                        >
                            <h2 style={{
                                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                                fontWeight: '800',
                                color: 'var(--text-primary)',
                                marginBottom: '1rem'
                            }}>
                                Mengapa Memilih Kami?
                            </h2>
                            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                                Pendidikan berkualitas dengan fasilitas terbaik untuk masa depan putra-putri Anda
                            </p>
                        </motion.div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '2rem'
                        }}>
                            <InfoCard
                                icon={<School size={28} />}
                                title="Fasilitas Modern"
                                description="Lab komputer, perpustakaan digital, ruang kelas ber-AC, dan fasilitas olahraga lengkap untuk mendukung pembelajaran."
                                color="#10b981"
                            />
                            <InfoCard
                                icon={<Users size={28} />}
                                title="Guru Berkualitas"
                                description="Tenaga pengajar profesional dan berpengalaman dengan metode pembelajaran yang inovatif dan menyenangkan."
                                color="#3b82f6"
                            />
                            <InfoCard
                                icon={<Award size={28} />}
                                title="Prestasi Gemilang"
                                description="Berbagai penghargaan tingkat nasional dan internasional dalam bidang akademik maupun non-akademik."
                                color="#f59e0b"
                            />
                            <InfoCard
                                icon={<BookOpen size={28} />}
                                title="Kurikulum Terkini"
                                description="Kombinasi kurikulum nasional dengan pendekatan islami modern untuk membentuk karakter unggul."
                                color="#8b5cf6"
                            />
                        </div>
                    </div>
                </section>

                {/* Alur Pendaftaran Section - Enhanced */}
                <section id="info" style={{ backgroundColor: 'white', padding: '6rem 0' }}>
                    <div className="container">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            style={{
                                textAlign: 'center',
                                marginBottom: '4rem',
                                color: 'var(--text-primary)',
                                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                                fontWeight: '800'
                            }}
                        >
                            Alur Pendaftaran
                        </motion.h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
                            {[
                                { icon: <FileText size={36} />, title: '1. Daftar Akun', desc: 'Buat akun calon siswa dan login ke dashboard.', color: '#10b981' },
                                { icon: <Upload size={36} />, title: '2. Lengkapi Data', desc: 'Isi formulir biodata dan upload dokumen persyaratan.', color: '#3b82f6' },
                                { icon: <CheckCircle size={36} />, title: '3. Verifikasi', desc: 'Admin akan memverifikasi data dan dokumen Anda.', color: '#f59e0b' },
                                { icon: <Calendar size={36} />, title: '4. Pengumuman', desc: 'Cek status kelulusan pada tanggal pengumuman.', color: '#8b5cf6' }
                            ].map((step, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="card"
                                    style={{ textAlign: 'center', padding: '2.5rem' }}
                                >
                                    <div style={{
                                        margin: '0 auto 1.5rem',
                                        width: '80px',
                                        height: '80px',
                                        background: `linear-gradient(135deg, ${step.color}15, ${step.color}25)`,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: step.color
                                    }}>
                                        {step.icon}
                                    </div>
                                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '700' }}>{step.title}</h3>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>{step.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section - Enhanced */}
                <section style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                    color: 'white',
                    padding: '6rem 0',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Background Pattern */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
                        opacity: 0.5
                    }} />

                    <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 style={{
                                marginBottom: '1.5rem',
                                fontSize: 'clamp(2rem, 4vw, 3rem)',
                                fontWeight: '800',
                                textShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                            }}>
                                {schoolSettings?.cta_title || 'Siap Bergabung Bersama Kami?'}
                            </h2>
                            <p style={{
                                marginBottom: '2.5rem',
                                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                                opacity: 0.95,
                                maxWidth: '700px',
                                margin: '0 auto 2.5rem',
                                lineHeight: '1.6'
                            }}>
                                {schoolSettings?.cta_description || 'Pendaftaran Tahun Ajaran Baru Telah Dibuka. Segera daftarkan putra-putri Anda untuk masa depan yang gemilang.'}
                            </p>
                            <motion.a
                                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)' }}
                                whileTap={{ scale: 0.95 }}
                                href="/register"
                                className="btn"
                                style={{
                                    backgroundColor: 'white',
                                    color: 'var(--primary-color)',
                                    padding: '1.25rem 3rem',
                                    fontSize: '1.25rem',
                                    borderRadius: 'var(--radius-full)',
                                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                                    fontWeight: '700',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}
                            >
                                <FileText size={24} />
                                Daftar Sekarang
                            </motion.a>
                        </motion.div>
                    </div>
                </section>
            </main>

            <Footer schoolSettings={schoolSettings} socialMedia={socials} />
        </div>
    );
}
