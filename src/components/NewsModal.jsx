import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar } from 'lucide-react';

export default function NewsModal({ news, isOpen, onClose }) {
    if (!news) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            zIndex: 9998,
                            backdropFilter: 'blur(4px)'
                        }}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 9999,
                            width: '90%',
                            maxWidth: '700px',
                            maxHeight: '85vh',
                            backgroundColor: 'white',
                            borderRadius: 'var(--radius-xl)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {/* Header Image */}
                        {news.image_url && (
                            <div style={{ position: 'relative', width: '100%', height: '250px', overflow: 'hidden' }}>
                                <img
                                    src={news.image_url}
                                    alt={news.title}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />

                                {/* Category Badge */}
                                {news.category && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '1rem',
                                        left: '1rem',
                                        backgroundColor: 'var(--primary-color)',
                                        color: 'white',
                                        padding: '0.5rem 1rem',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        textTransform: 'uppercase'
                                    }}>
                                        {news.category}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                backgroundColor: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                transition: 'transform 0.2s',
                                zIndex: 10
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            <X size={20} />
                        </button>

                        {/* Content */}
                        <div style={{
                            padding: '2rem',
                            overflowY: 'auto',
                            flex: 1
                        }}>
                            {/* Date */}
                            {news.published_date && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.875rem',
                                    marginBottom: '1rem'
                                }}>
                                    <Calendar size={16} />
                                    <span>{new Date(news.published_date).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}</span>
                                </div>
                            )}

                            {/* Title */}
                            <h2 style={{
                                fontSize: '1.75rem',
                                fontWeight: '800',
                                marginBottom: '1.5rem',
                                color: 'var(--text-primary)',
                                lineHeight: '1.3'
                            }}>
                                {news.title}
                            </h2>

                            {/* Content */}
                            <div style={{
                                fontSize: '1rem',
                                color: 'var(--text-secondary)',
                                lineHeight: '1.8',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {news.content || news.excerpt}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
