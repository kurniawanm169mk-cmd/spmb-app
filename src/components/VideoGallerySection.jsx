import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Play, Image as ImageIcon } from 'lucide-react';

export default function VideoGallerySection() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

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
    const renderVideoEmbed = (url, title) => {
        if (!url) return null;

        // 1. YouTube
        const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const ytMatch = url.match(ytRegExp);
        if (ytMatch && ytMatch[2].length === 11) {
            return (
                <iframe
                    src={`https://www.youtube.com/embed/${ytMatch[2]}`}
                    title={title}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            );
        }

        // 2. Facebook
        if (url.includes('facebook.com') || url.includes('fb.watch')) {
            // FB requires encoded URL in the src
            const encodedUrl = encodeURIComponent(url);
            return (
                <iframe
                    src={`https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&t=0`}
                    title={title}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', overflow: 'hidden' }}
                    scrolling="no"
                    frameBorder="0"
                    allowFullScreen={true}
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                />
            );
        }

        // 3. Instagram
        if (url.includes('instagram.com')) {
            // Add /embed to the URL if not present
            // Remove query params first
            let cleanUrl = url.split('?')[0];
            if (!cleanUrl.endsWith('/')) cleanUrl += '/';
            if (!cleanUrl.endsWith('embed/') && !cleanUrl.endsWith('embed')) cleanUrl += 'embed';

            return (
                <iframe
                    src={cleanUrl}
                    title={title}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', overflow: 'hidden' }}
                    scrolling="no"
                    frameBorder="0"
                    allowFullScreen={true}
                />
            );
        }

        // 4. TikTok
        if (url.includes('tiktok.com')) {
            // Extract Video ID
            // Pattern: https://www.tiktok.com/@user/video/723...
            const tiktokMatch = url.match(/video\/(\d+)/);
            if (tiktokMatch && tiktokMatch[1]) {
                return (
                    <iframe
                        src={`https://www.tiktok.com/embed/v2/${tiktokMatch[1]}?lang=en-US`}
                        title={title}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                        allowFullScreen
                        scrolling="no"
                    />
                );
            }
        }

        // Fallback or Unknown
        return (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: 'white', padding: '1rem', textAlign: 'center' }}>
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
                        Galeri Kegiatan
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        Dokumentasi kegiatan dan profil sekolah kami
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    {items.map((item) => {
                        return (
                            <div key={item.id} className="card-hover-effect" style={{
                                backgroundColor: 'white',
                                borderRadius: '1rem',
                                overflow: 'hidden',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                transition: 'transform 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <div style={{ position: 'relative', paddingTop: '56.25%', backgroundColor: '#000' }}>
                                    {item.type === 'image' ? (
                                        <img
                                            src={item.image_url}
                                            alt={item.title}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    ) : (
                                        renderVideoEmbed(item.video_url, item.title)
                                    )}
                                </div>
                                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>
                                        {item.title}
                                    </h3>
                                    {item.description && (
                                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{item.description}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <style>{`
                .card-hover-effect:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }
            `}</style>
        </section>
    );
}
