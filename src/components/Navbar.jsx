import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = ({ schoolSettings }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const { school_name = 'SMPIT Ibnu Sina', logo_url } = schoolSettings || {};

    return (
        <nav style={{
            backgroundColor: 'var(--surface-color)',
            borderBottom: '1px solid var(--border-color)',
            position: 'sticky',
            top: 0,
            zIndex: 50
        }}>
            <div className="container" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '4rem'
            }}>
                {/* Logo & Brand */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                    <span style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--primary-color)' }}>
                        {school_name}
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="desktop-menu" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link to="/" className="nav-link" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Beranda</Link>
                    <a href="#info" className="nav-link" style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Informasi</a>
                    <a href="#contact" className="nav-link" style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Kontak</a>
                    <Link to="/login" className="btn btn-primary">
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
                <div style={{
                    borderTop: '1px solid var(--border-color)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    backgroundColor: 'var(--surface-color)'
                }}>
                    <Link to="/" onClick={() => setIsOpen(false)}>Beranda</Link>
                    <a href="#info" onClick={() => setIsOpen(false)}>Informasi</a>
                    <a href="#contact" onClick={() => setIsOpen(false)}>Kontak</a>
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
