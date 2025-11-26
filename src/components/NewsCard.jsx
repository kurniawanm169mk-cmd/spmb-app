import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

export default function NewsCard({ image, title, date, excerpt, category }) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="card"
            style={{
                overflow: 'hidden',
                padding: 0,
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Image */}
            {image && (
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '200px',
                    overflow: 'hidden',
                    backgroundColor: '#f1f5f9'
                }}>
                    <img
                        src={image}
                        alt={title}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    />

                    {category && (
                        <div style={{
                            position: 'absolute',
                            top: '1rem',
                            left: '1rem',
                            backgroundColor: 'var(--primary-color)',
                            color: 'white',
                            padding: '0.375rem 0.75rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            {category}
                        </div>
                    )}
                </div>
            )}

            {/* Content */}
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {date && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.875rem',
                        marginBottom: '0.75rem'
                    }}>
                        <Calendar size={14} />
                        <span>{date}</span>
                    </div>
                )}

                <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    marginBottom: '0.75rem',
                    color: 'var(--text-primary)',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {title}
                </h3>

                {excerpt && (
                    <p style={{
                        fontSize: '0.95rem',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.6',
                        marginBottom: '1rem',
                        flex: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {excerpt}
                    </p>
                )}

                <div style={{
                    color: 'var(--primary-color)',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    Baca Selengkapnya →
                </div>
            </div>
        </motion.article>
    );
}
