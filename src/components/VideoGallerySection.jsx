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

    // Helper to extract YouTube ID
    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
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
                                        <iframe
                                            src={`https://www.youtube.com/embed/${getYouTubeId(item.video_url)}`}
                                            title={item.title}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                border: 'none'
                                            }}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
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
