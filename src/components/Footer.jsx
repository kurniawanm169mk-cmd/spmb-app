import React from 'react';
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube, Twitter, Globe } from 'lucide-react';

// Custom TikTok Icon since Lucide might not have it
const TikTokIcon = ({ size = 24, color = "currentColor" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
);

const Footer = ({ schoolSettings, socialMedia }) => {
    const {
        school_name = 'SMPIT Ibnu Sina',
        address = 'Alamat Sekolah...',
        contact_phone = '08123456789',
        google_maps_url
    } = schoolSettings || {};

    // Use passed socialMedia or empty array
    const socials = socialMedia || [];

    // Helper to extract src from iframe if user pasted the whole tag
    const getMapSrc = (input) => {
        if (!input) return null;
        if (input.includes('<iframe')) {
            const match = input.match(/src="([^"]+)"/);
            return match ? match[1] : null;
        }
        return input;
    };

    const mapSrc = getMapSrc(google_maps_url);

    return (
        <footer style={{ backgroundColor: 'var(--surface-color)', borderTop: '1px solid var(--border-color)', padding: '3rem 0', marginTop: 'auto' }}>
            <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                {/* School Info */}
                <div>
                    <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem', fontSize: '1.25rem' }}>{school_name}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                            <MapPin size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <p>{address}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <Phone size={20} />
                            <a
                                href={`https://wa.me/${contact_phone.replace(/\D/g, '').replace(/^0/, '62')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
                                onMouseOver={(e) => e.target.style.color = 'var(--primary-color)'}
                                onMouseOut={(e) => e.target.style.color = 'inherit'}
                                title="Chat via WhatsApp"
                            >
                                {contact_phone}
                            </a>
                        </div>
                    </div>
                </div>

                {/* Social Media */}
                <div id="contact">
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>Ikuti Kami</h3>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {socials && socials.length > 0 ? (
                                socials.map((social) => {
                                    const Icon =
                                        social.platform_name.toLowerCase().includes('facebook') ? Facebook :
                                            social.platform_name.toLowerCase().includes('instagram') ? Instagram :
                                                social.platform_name.toLowerCase().includes('youtube') ? Youtube :
                                                    social.platform_name.toLowerCase().includes('twitter') ? Twitter :
                                                        social.platform_name.toLowerCase().includes('tiktok') ? TikTokIcon :
                                                            Globe; // Default icon

                                    return (
                                        <a
                                            key={social.id}
                                            href={social.platform_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="social-link"
                                            style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}
                                            title={social.platform_name}
                                        >
                                            <Icon size={24} />
                                        </a>
                                    );
                                })
                            ) : (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Belum ada sosmed.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Google Maps */}
                <div>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>Lokasi</h3>
                    <div style={{
                        width: '100%',
                        height: '200px',
                        backgroundColor: '#e2e8f0',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden'
                    }}>
                        {/* Embed Google Maps Iframe if URL is provided */}
                        {mapSrc ? (
                            <iframe
                                src={mapSrc}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Lokasi Sekolah"
                            ></iframe>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                                <MapPin size={32} />
                                <span style={{ marginLeft: '0.5rem' }}>Peta Lokasi Belum Diatur</span>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            <div className="container" style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem', position: 'relative' }}>
                <p>&copy; {new Date().getFullYear()} {school_name}. All rights reserved.</p>

                {/* Discreet Admin Login Button */}
                <a href="/admin/login" style={{
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    opacity: 0.3,
                    padding: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }} title="Admin Login">
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--text-secondary)' }}></div>
                </a>
            </div>
        </footer>
    );
};

export default Footer;
