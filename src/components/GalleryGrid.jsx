import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function GalleryGrid({ images = [] }) {
    const [selectedImage, setSelectedImage] = useState(null);

    // Sample images if none provided
    const galleryImages = images.length > 0 ? images : [
        { id: 1, url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400', caption: 'Kegiatan Belajar' },
        { id: 2, url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400', caption: 'Olahraga' },
        { id: 3, url: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=400', caption: 'Lab Komputer' },
        { id: 4, url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400', caption: 'Perpustakaan' },
        { id: 5, url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400', caption: 'Kelas Modern' },
        { id: 6, url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400', caption: 'Kegiatan Kelompok' }
    ];

    return (
        <>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '1.5rem'
            }}>
                {galleryImages.map((image, index) => (
                    <motion.div
                        key={image.id || index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setSelectedImage(image)}
                        style={{
                            position: 'relative',
                            aspectRatio: '4/3',
                            borderRadius: 'var(--radius-lg)',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            boxShadow: 'var(--shadow-md)'
                        }}
                    >
                        <img
                            src={image.url}
                            alt={image.caption || 'Gallery'}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />

                        {/* Overlay */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
                            display: 'flex',
                            alignItems: 'flex-end',
                            padding: '1rem',
                            opacity: 0,
                            transition: 'opacity 0.3s'
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                        >
                            <p style={{
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '0.95rem'
                            }}>
                                {image.caption}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.9)',
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2rem'
                        }}
                    >
                        <button
                            onClick={() => setSelectedImage(null)}
                            style={{
                                position: 'absolute',
                                top: '2rem',
                                right: '2rem',
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
                            <X size={24} />
                        </button>

                        <motion.img
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            src={selectedImage.url}
                            alt={selectedImage.caption}
                            style={{
                                maxWidth: '90%',
                                maxHeight: '90%',
                                objectFit: 'contain',
                                borderRadius: 'var(--radius-lg)'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
