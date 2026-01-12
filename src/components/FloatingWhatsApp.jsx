import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';

export default function FloatingWhatsApp({ phoneNumber, buttonText, message }) {
    const [isHovered, setIsHovered] = useState(false);

    if (!phoneNumber) return null;

    const handleClick = () => {
        // Format: https://wa.me/628123456789?text=Your%20message
        const encodedMessage = encodeURIComponent(message || 'Halo, saya ingin menanyakan informasi lebih lanjut tentang pendaftaran.');
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    const displayText = buttonText || 'Informasi lebih lanjut, hubungi panitia';

    return (
        <div
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: '#25D366',
                borderRadius: '50px',
                padding: '0.75rem 1.25rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
                zIndex: 1000,
                transition: 'all 0.3s ease',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                maxWidth: isHovered ? '400px' : '280px'
            }}
        >
            <div
                style={{
                    width: '44px',
                    height: '44px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}
            >
                <MessageCircle size={24} color="white" />
            </div>
            <span
                style={{
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}
            >
                {displayText}
            </span>
        </div>
    );
}
