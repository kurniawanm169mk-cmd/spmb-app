import React from 'react';
import { motion } from 'framer-motion';

export default function RunningText({ text = "Pendaftaran siswa baru tahun ajaran 2024/2025 telah dibuka!" }) {
    return (
        <div style={{
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            padding: '1rem 0',
            overflow: 'hidden',
            position: 'relative'
        }}>
            <motion.div
                animate={{ x: ['100%', '-100%'] }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'linear'
                }}
                style={{
                    whiteSpace: 'nowrap',
                    fontSize: '1rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3rem'
                }}
            >
                <span>📢 {text}</span>
                <span>📢 {text}</span>
                <span>📢 {text}</span>
            </motion.div>
        </div>
    );
}
