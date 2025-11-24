import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Carousel from '../components/Carousel';
import { Calendar, CheckCircle, FileText, Upload } from 'lucide-react';

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
                {/* Hero Section */}
                <section className="container" style={{ padding: '2rem 1rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {schoolSettings?.logo_url && (
                            <img
                                src={schoolSettings.logo_url}
                                alt="Logo Sekolah"
                                style={{ width: '100px', height: '100px', objectFit: 'contain', marginBottom: '1rem' }}
                            />
                        )}
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                            {schoolSettings?.school_name || 'SMPIT Ibnu Sina'}
                        </h1>
                        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>
                            {schoolSettings?.slogan || 'Generasi Islami, Unggul, Cerdas dan Berakhlak Mulia'}
                        </p>

                        {/* Registration Period */}
                        {schoolSettings?.registration_start_date && schoolSettings?.registration_end_date && (
                            <div style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#f0f9ff', borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', border: '1px solid #bae6fd' }}>
                                <Calendar size={20} />
                                <span style={{ fontWeight: 500 }}>
                                    Pendaftaran: {new Date(schoolSettings.registration_start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} - {new Date(schoolSettings.registration_end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                        )}
                    </div>

                    <Carousel slides={carouselImages} />
                </section>

                {/* Info / Steps Section */}
                <section id="info" style={{ backgroundColor: 'white', padding: '4rem 0' }}>
                    <div className="container">
                        <h2 style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--text-primary)' }}>Alur Pendaftaran</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                            {/* Step 1 */}
                            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                                <div style={{ margin: '0 auto 1rem', width: '64px', height: '64px', backgroundColor: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                                    <FileText size={32} />
                                </div>
                                <h3 style={{ marginBottom: '0.5rem' }}>1. Daftar Akun</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>Buat akun calon siswa dan login ke dashboard.</p>
                            </div>

                            {/* Step 2 */}
                            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                                <div style={{ margin: '0 auto 1rem', width: '64px', height: '64px', backgroundColor: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                                    <Upload size={32} />
                                </div>
                                <h3 style={{ marginBottom: '0.5rem' }}>2. Pembayaran</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>Upload bukti pembayaran biaya pendaftaran.</p>
                            </div>

                            {/* Step 3 */}
                            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                                <div style={{ margin: '0 auto 1rem', width: '64px', height: '64px', backgroundColor: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                                    <Calendar size={32} />
                                </div>
                                <h3 style={{ marginBottom: '0.5rem' }}>3. Isi Formulir</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>Lengkapi biodata dan upload berkas persyaratan.</p>
                            </div>

                            {/* Step 4 */}
                            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                                <div style={{ margin: '0 auto 1rem', width: '64px', height: '64px', backgroundColor: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                                    <CheckCircle size={32} />
                                </div>
                                <h3 style={{ marginBottom: '0.5rem' }}>4. Selesai</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>Tunggu verifikasi dan pengumuman kelulusan.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '4rem 0', textAlign: 'center' }}>
                    <div className="container">
                        <h2 style={{ marginBottom: '1rem' }}>Siap Bergabung Bersama Kami?</h2>
                        <p style={{ marginBottom: '2rem', fontSize: '1.1rem', opacity: 0.9 }}>
                            Pendaftaran Tahun Ajaran Baru Telah Dibuka. Segera daftarkan putra-putri Anda.
                        </p>
                        <a href="/login" className="btn" style={{ backgroundColor: 'white', color: 'var(--primary-color)', padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
                            Daftar Sekarang
                        </a>
                    </div>
                </section>
            </main>

            <Footer schoolSettings={schoolSettings} socialMedia={socials} />
        </div>
    );
}
