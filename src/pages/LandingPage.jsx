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
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="card"
            style={{ textAlign: 'center', padding: '2.5rem' }}
                            >
            <div style={{ margin: '0 auto 1.5rem', width: '72px', height: '72px', backgroundColor: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                <Upload size={36} />
            </div>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>2. Lengkapi Data</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>Isi formulir biodata dan upload dokumen persyaratan.</p>
        </motion.div>

        {/* Step 3 */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="card"
            style={{ textAlign: 'center', padding: '2.5rem' }}
        >
            <div style={{ margin: '0 auto 1.5rem', width: '72px', height: '72px', backgroundColor: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                <CheckCircle size={36} />
            </div>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>3. Verifikasi</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>Admin akan memverifikasi data dan dokumen Anda.</p>
        </motion.div>

        {/* Step 4 */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="card"
            style={{ textAlign: 'center', padding: '2.5rem' }}
        >
            <div style={{ margin: '0 auto 1.5rem', width: '72px', height: '72px', backgroundColor: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                <Calendar size={36} />
            </div>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>4. Pengumuman</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>Cek status kelulusan pada tanggal pengumuman.</p>
        </motion.div>
    </div>
                    </div >
                </section >

    {/* CTA Section */ }
    < section className = "cta-section-bg" style = {{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '6rem 0', textAlign: 'center' }
}>
                    <div className="cta-overlay"></div>
                    <div className="container cta-content">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="cta-title" style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>{schoolSettings?.cta_title || 'Siap Bergabung Bersama Kami?'}</h2>
                            <p className="cta-description" style={{ marginBottom: '2.5rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 2.5rem' }}>
                                {schoolSettings?.cta_description || 'Pendaftaran Tahun Ajaran Baru Telah Dibuka. Segera daftarkan putra-putri Anda untuk masa depan yang gemilang.'}
                            </p>
                            <motion.a
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                href="/login"
                                className="btn"
                                style={{ backgroundColor: 'white', color: 'var(--primary-color)', padding: '1rem 3rem', fontSize: '1.25rem', borderRadius: 'var(--radius-full)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                            >
                                Daftar Sekarang
                            </motion.a>
                        </motion.div>
                    </div>
                </section >
            </main >

    <Footer schoolSettings={schoolSettings} socialMedia={socials} />
        </div >
    );
}
