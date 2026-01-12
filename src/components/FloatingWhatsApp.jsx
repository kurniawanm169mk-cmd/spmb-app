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
        <>
            <div
                onClick={handleClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="floating-whatsapp"
                style={{
                    position: 'fixed',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#25D366',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
                    zIndex: 1000,
                    transition: 'all 0.3s ease',
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)'
                }}
            >
                <div className="wa-icon-container">
                    <MessageCircle className="wa-icon" color="white" />
                </div>
                <span className="wa-text">
                    {displayText}
                </span>
            </div>
            <style>{`
                /* Desktop styles */
                .floating-whatsapp {
                    bottom: 2rem;
                    right: 2rem;
                    gap: 0.75rem;
                    border-radius: 50px;
                    padding: 0.75rem 1.25rem;
                    max-width: ${isHovered ? '400px' : '280px'};
                }
                .wa-icon-container {
                    width: 44px;
                    height: 44px;
                    background-color: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .wa-icon {
                    width: 24px;
                    height: 24px;
                }
                .wa-text {
                    color: white;
                    font-weight: 600;
                    font-size: 0.95rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                /* Mobile styles */
                @media (max-width: 768px) {
                    .floating-whatsapp {
                        bottom: 1rem;
                        right: 1rem;
                        gap: 0.5rem;
                        padding: 0.5rem 0.75rem;
                        max-width: ${isHovered ? '240px' : '180px'};
                    }
                    .wa-icon-container {
                        width: 36px;
                        height: 36px;
                    }
                    .wa-icon {
                        width: 20px;
                        height: 20px;
                    }
                    .wa-text {
                        font-size: 0.8rem;
                    }
                }

                /* Extra small mobile - icon only */
                @media (max-width: 480px) {
                    .floating-whatsapp {
                        bottom: 1rem;
                        right: 1rem;
                        padding: 0.6rem;
                        border-radius: 50%;
                        max-width: none;
                    }
                    .wa-icon-container {
                        width: 40px;
                        height: 40px;
                    }
                    .wa-icon {
                        width: 22px;
                        height: 22px;
                    }
                    .wa-text {
                        display: none;
                    }
                }
            `}</style>
        </>
    );
}
