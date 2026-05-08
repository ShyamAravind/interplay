import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX } from 'react-icons/hi';
import { IoMdMoon, IoMdSunny } from 'react-icons/io';
import { MdSportsSoccer } from 'react-icons/md';

export default function Navbar({ darkMode, setDarkMode }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileOpen(false);
    };

    const navLinks = [
        { to: '/events', label: 'Events' },
        { to: '/nearby', label: 'Nearby' },
        ...(user ? [{ to: '/create', label: 'Create Event' }] : []),
        ...(user ? [{ to: '/profile', label: 'Profile' }] : []),
    ];

    return (
        <nav className="glass sticky top-0 z-50" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
                    {/* Logo */}
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                        <MdSportsSoccer size={28} style={{ color: 'var(--color-accent)' }} />
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)' }}>
                            Inter<span className="text-gradient">Play</span>
                        </span>
                    </Link>

                    {/* Desktop Links */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="desktop-nav">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                style={{
                                    color: 'var(--color-text-muted)',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    transition: 'color 0.2s',
                                }}
                                onMouseEnter={(e) => (e.target.style.color = 'var(--color-accent)')}
                                onMouseLeave={(e) => (e.target.style.color = 'var(--color-text-muted)')}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Dark mode toggle */}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-text-muted)',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            {darkMode ? <IoMdSunny size={20} /> : <IoMdMoon size={20} />}
                        </button>

                        {/* Auth Buttons */}
                        {user ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                    {user.name}
                                </span>
                                <button className="btn-outline" onClick={handleLogout} style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Link to="/login">
                                    <button className="btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Sign In</button>
                                </Link>
                                <Link to="/signup">
                                    <button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Sign Up</button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="mobile-nav-btn"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        style={{
                            display: 'none',
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-text)',
                            cursor: 'pointer',
                        }}
                    >
                        {mobileOpen ? <HiX size={24} /> : <HiMenu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mobile-menu glass"
                        style={{ overflow: 'hidden', borderTop: '1px solid var(--color-border)' }}
                    >
                        <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setMobileOpen(false)}
                                    style={{
                                        color: 'var(--color-text-muted)',
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        padding: '0.5rem 0',
                                    }}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--color-text-muted)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 0',
                                    fontSize: '0.9rem',
                                }}
                            >
                                {darkMode ? <IoMdSunny size={18} /> : <IoMdMoon size={18} />}
                                {darkMode ? 'Light Mode' : 'Dark Mode'}
                            </button>
                            {user ? (
                                <button className="btn-outline" onClick={handleLogout} style={{ marginTop: '0.5rem' }}>
                                    Logout
                                </button>
                            ) : (
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    <Link to="/login" onClick={() => setMobileOpen(false)} style={{ flex: 1 }}>
                                        <button className="btn-outline" style={{ width: '100%' }}>Sign In</button>
                                    </Link>
                                    <Link to="/signup" onClick={() => setMobileOpen(false)} style={{ flex: 1 }}>
                                        <button className="btn-primary" style={{ width: '100%' }}>Sign Up</button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-btn { display: flex !important; }
        }
      `}</style>
        </nav>
    );
}
