import React from 'react';
import { motion } from 'framer-motion';

export default function InfoCard({ image, icon, title, description, color = 'var(--primary-color)' }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="card"
            style={{
                overflow: 'hidden',
                padding: 0,
                height: '100%'
            }}
        >
            {image && (
                <div style={{ position: 'relative', width: '100%', height: '200px', overflow: 'hidden' }}>
                    <img
                        src={image}
                        alt={title}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '50%',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)'
                        }}
                    />
                </div>
            )}
            <div style={{ padding: '1.5rem' }}>
                {icon && (
                    <div
                        style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            backgroundColor: `${color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: color,
                            marginBottom: '1rem'
                        }}
                    >
                        {icon}
                    </div>
                )}
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                    {title}
                </h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {description}
                </p>
            </div>
        </motion.div>
    );
}
