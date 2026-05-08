import { Link } from 'react-router-dom';
import { MdSportsSoccer } from 'react-icons/md';

export default function Footer() {
    return (
        <footer
            style={{
                borderTop: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                padding: '3rem 1.5rem 2rem',
                marginTop: '4rem',
            }}
        >
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '2rem',
                        marginBottom: '2.5rem',
                    }}
                >
                    {/* Brand */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <MdSportsSoccer size={24} style={{ color: 'var(--color-accent)' }} />
                            <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                                Inter<span className="text-gradient">Play</span>
                            </span>
                        </div>
                        <p style={{ color: 'var(--color-text-dim)', fontSize: '0.8rem', lineHeight: 1.6 }}>
                            Discover sports events, connect with organizers, and never miss a game again.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                            Explore
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {[
                                { to: '/events', label: 'All Events' },
                                { to: '/nearby', label: 'Nearby Events' },
                                { to: '/signup', label: 'Sign Up' },
                            ].map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    style={{
                                        color: 'var(--color-text-dim)',
                                        textDecoration: 'none',
                                        fontSize: '0.85rem',
                                        transition: 'color 0.2s',
                                    }}
                                    onMouseEnter={(e) => (e.target.style.color = 'var(--color-accent)')}
                                    onMouseLeave={(e) => (e.target.style.color = 'var(--color-text-dim)')}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Sports */}
                    <div>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                            Sports
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {['Football', 'Cricket', 'Basketball', 'Badminton', 'Tennis', 'Volleyball'].map((sport) => (
                                <span
                                    key={sport}
                                    style={{
                                        padding: '0.25rem 0.6rem',
                                        background: 'var(--color-card)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '1rem',
                                        fontSize: '0.75rem',
                                        color: 'var(--color-text-dim)',
                                    }}
                                >
                                    {sport}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div style={{
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: '1.5rem',
                    textAlign: 'center',
                    color: 'var(--color-text-dim)',
                    fontSize: '0.75rem',
                }}>
                    © 2026 InterPlay. Built for sports enthusiasts everywhere.
                </div>
            </div>
        </footer>
    );
}
