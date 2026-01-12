import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Play, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function VideoGallerySection({ schoolSettings }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const { data, error } = await supabase
                    .from('landing_page_videos')
                    .select('*')
                    .order('order_index', { ascending: true });
                if (data) setItems(data);
            } catch (error) {
                console.error('Error fetching gallery:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, []);

    // Helper to get Embed URL or Component
    const renderVideoEmbed = (url, title, isLightbox = false) => {
        if (!url) return null;

        const style = isLightbox
            ? { width: '100%', height: '100%', border: 'none' }
            : { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' };

        // 1. YouTube
        const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const ytMatch = url.match(ytRegExp);
        if (ytMatch && ytMatch[2].length === 11) {
            return (
                <iframe
                    src={`https://www.youtube.com/embed/${ytMatch[2]}${isLightbox ? '?autoplay=1' : ''}`}
                    title={title}
                    style={style}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            );
        }

        // 2. Facebook
        if (url.includes('facebook.com') || url.includes('fb.watch')) {
            const encodedUrl = encodeURIComponent(url);
            return (
                <iframe
                    src={`https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&t=0`}
                    title={title}
                    style={style}
                    scrolling="no"
                    frameBorder="0"
                    allowFullScreen={true}
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                />
            );
        }

        // 3. Instagram
        if (url.includes('instagram.com')) {
            let cleanUrl = url.split('?')[0];
            if (!cleanUrl.endsWith('/')) cleanUrl += '/';
            if (!cleanUrl.endsWith('embed/') && !cleanUrl.endsWith('embed')) cleanUrl += 'embed';
            return (
                <iframe
                    src={cleanUrl}
                    title={title}
                    style={style}
                    scrolling="no"
                    frameBorder="0"
                    allowFullScreen={true}
                />
            );
        }

        // 4. TikTok
        if (url.includes('tiktok.com')) {
            const tiktokMatch = url.match(/video\/(\d+)/);
            if (tiktokMatch && tiktokMatch[1]) {
                return (
                    <iframe
                        src={`https://www.tiktok.com/embed/v2/${tiktokMatch[1]}?lang=en-US`}
                        title={title}
                        style={style}
                        allowFullScreen
                        scrolling="no"
                    />
                );
            }
        }

        // Fallback
        return (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: 'white', padding: '1rem', textAlign: 'center' }}>
                <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>
                    Tonton Video di Sumber Asli
                </a>
            </div>
        );
    };

    if (loading) return null;
    if (items.length === 0) return null;

    return (
        <section id="gallery" style={{ padding: '5rem 1rem', backgroundColor: '#f8fafc' }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>
                        {schoolSettings?.gallery_title || 'Galeri Kegiatan'}
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        {schoolSettings?.gallery_description || 'Dokumentasi kegiatan dan profil sekolah kami'}
                    </p>
                </div>

                <div className="gallery-grid">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="card-hover-effect"
                            onClick={() => setSelectedItem(item)}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '1rem',
                                overflow: 'hidden',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            {/* Image/Video Container - Adaptive Height */}
                            <div style={{ position: 'relative', width: '100%', backgroundColor: '#000' }}>
                                {item.type === 'image' ? (
                                    <img
                                        src={item.image_url}
                                        alt={item.title}
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            maxHeight: '500px', // Limit height on large screens
                                            objectFit: 'contain', // Ensure full image is visible
                                            display: 'block'
                                        }}
                                    />
                                ) : (
                                    <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                                        {renderVideoEmbed(item.video_url, item.title)}
                                        {/* Overlay to prevent interaction in grid view (so click opens lightbox) */}
                                        <div style={{ position: 'absolute', inset: 0, background: 'transparent' }}></div>
                                    </div>
                                )}
                            </div>

                            <div style={{ padding: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>
                                    {item.title}
                                </h3>
                                {item.description && (
                                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{item.description}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedItem(null)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1rem'
                        }}
                    >
                        <button
                            onClick={() => setSelectedItem(null)}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                zIndex: 10000
                            }}
                        >
                            <X size={24} color="black" />
                        </button>

                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: '100%',
                                maxWidth: '1000px',
                                maxHeight: '90vh',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}
                        >
                            {selectedItem.type === 'image' ? (
                                <img
                                    src={selectedItem.image_url}
                                    alt={selectedItem.title}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '80vh',
                                        objectFit: 'contain',
                                        borderRadius: '0.5rem'
                                    }}
                                />
                            ) : (
                                <div style={{ width: '100%', aspectRatio: '16/9' }}>
                                    {renderVideoEmbed(selectedItem.video_url, selectedItem.title, true)}
                                </div>
                            )}

                            <div style={{ marginTop: '1rem', textAlign: 'center', color: 'white' }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{selectedItem.title}</h3>
                                {selectedItem.description && <p style={{ opacity: 0.8 }}>{selectedItem.description}</p>}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .gallery-grid {
                    columns: 3 300px;
                    column-gap: 2rem;
                }
                .gallery-grid > div {
                    break-inside: avoid;
                    margin-bottom: 2rem;
                }
                .card-hover-effect:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }
            `}</style>
        </section>
    );
}
