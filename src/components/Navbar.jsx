import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = ({ schoolSettings }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const {
        school_name = 'SMPIT Ibnu Sina',
        logo_url,
        header_bg_color = '#ffffff', // Default to white hex
        header_bg_opacity = 0.8,
        header_text_color = 'var(--primary-color)',
        header_font_family = 'Inter',
        header_font_size = '1.25rem',
        header_font_weight = 'bold',
        header_letter_spacing = 'normal',
        header_blur = 10
    } = schoolSettings || {};

    // Helper to convert hex to rgba
    const getBgColor = () => {
        if (!header_bg_color.startsWith('#')) return header_bg_color; // fallback if already rgb/rgba
        const r = parseInt(header_bg_color.slice(1, 3), 16);
        const g = parseInt(header_bg_color.slice(3, 5), 16);
        const b = parseInt(header_bg_color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${header_bg_opacity})`;
    };

    return (
        <nav className="glass" style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
            backgroundColor: getBgColor(),
            backdropFilter: `blur(${header_blur}px)`,
            WebkitBackdropFilter: `blur(${header_blur}px)`,
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
        }}>
            <div className="container" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '4.5rem'
            }}>
                {/* Logo & Brand */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                    {logo_url ? (
                        <img src={logo_url} alt="Logo" style={{ height: '40px', width: 'auto' }} />
                    ) : (
                        <div style={{
                            height: '40px',
                            width: '40px',
                            backgroundColor: 'var(--primary-color)',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold'
                        }}>
                            IS
                        </div>
                    )}
                    <span className="header-title" style={{
                        color: header_text_color,
                        fontFamily: header_font_family,
                        fontSize: header_font_size,
                        fontWeight: header_font_weight,
                        letterSpacing: header_letter_spacing
                    }}>
                        {school_name}
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="desktop-menu" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <Link to="/" className="nav-link" style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Beranda</Link>
                    <a href="#info" className="nav-link" style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Informasi</a>
                    <a href="#contact" className="nav-link" style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Kontak</a>
                    <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
                        Masuk / Daftar
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsOpen(!isOpen)}
                    style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-primary)' }}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="glass" style={{
                    borderTop: '1px solid var(--border-color)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0
                }}>
                    <Link to="/" onClick={() => setIsOpen(false)} style={{ padding: '0.5rem' }}>Beranda</Link>
                    <a href="#info" onClick={() => setIsOpen(false)} style={{ padding: '0.5rem' }}>Informasi</a>
                    <a href="#contact" onClick={() => setIsOpen(false)} style={{ padding: '0.5rem' }}>Kontak</a>
                    <Link to="/login" className="btn btn-primary" onClick={() => setIsOpen(false)}>
                        Masuk / Daftar
                    </Link>
                </div>
            )}

            <style>{`
        @media (max-width: 768px) {
          .desktop-menu { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
        .nav-link {
            position: relative;
            text-decoration: none;
            transition: color 0.3s ease;
        }
        .nav-link:hover {
            color: var(--primary-color) !important;
        }
        .nav-link::after {
            content: '';
            position: absolute;
            width: 0;
            height: 2px;
            bottom: -4px;
            left: 0;
            background-color: var(--primary-color);
            transition: width 0.3s ease;
        }
        .nav-link:hover::after {
            width: 100%;
        }
      `}</style>
        </nav>
    );
};

export default Navbar;
