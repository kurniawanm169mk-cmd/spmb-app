import React from 'react';
import { motion } from 'framer-motion';

export default function IconBox({ icon, title, description, link, color = 'var(--primary-color)' }) {
    const content = (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                transition: 'all 0.3s ease',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem'
            }}
        >
            <div
                style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: `${color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: color
                }}
            >
                {icon}
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                {title}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                {description}
            </p>
        </motion.div>
    );

    if (link) {
        return (
            <a href={link} style={{ textDecoration: 'none', display: 'block' }}>
                {content}
            </a>
        );
    }

    return content;
}
