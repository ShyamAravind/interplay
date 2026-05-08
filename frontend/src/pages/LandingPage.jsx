import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { MdSportsSoccer, MdOutlineExplore, MdEventNote, MdPersonAdd } from 'react-icons/md';
import { IoArrowForward, IoTrophyOutline } from 'react-icons/io5';

const features = [
    {
        icon: <MdOutlineExplore size={32} />,
        title: 'Discover Events',
        desc: 'Browse sports events happening near you — from local tournaments to inter-city leagues.',
    },
    {
        icon: <MdEventNote size={32} />,
        title: 'Promote Your Events',
        desc: 'Organizers can create and publish events to reach thousands of sports enthusiasts.',
    },
    {
        icon: <IoTrophyOutline size={32} />,
        title: 'Never Miss a Game',
        desc: 'Save your favorite events, filter by sport, and get all the details you need in one place.',
    },
];

const popularSports = [
    { name: 'Football', icon: '⚽', color: '#22c55e' },
    { name: 'Cricket', icon: '🏏', color: '#f59e0b' },
    { name: 'Basketball', icon: '🏀', color: '#ef4444' },
    { name: 'Badminton', icon: '🏸', color: '#3b82f6' },
    { name: 'Tennis', icon: '🎾', color: '#a855f7' },
    { name: 'Volleyball', icon: '🏐', color: '#06b6d4' },
];

export default function LandingPage() {
    const { user } = useAuth();

    return (
        <div>
            {/* Hero Section */}
            <section
                style={{
                    minHeight: 'calc(100vh - 64px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    padding: '2rem 1.5rem',
                }}
            >
                {/* Background effects */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-30%',
                        right: '-10%',
                        width: '600px',
                        height: '600px',
                        background: 'radial-gradient(circle, var(--color-accent-glow) 0%, transparent 70%)',
                        borderRadius: '50%',
                        filter: 'blur(80px)',
                        pointerEvents: 'none',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: '-20%',
                        left: '-10%',
                        width: '500px',
                        height: '500px',
                        background: 'radial-gradient(circle, rgba(30, 80, 200, 0.2) 0%, transparent 70%)',
                        borderRadius: '50%',
                        filter: 'blur(80px)',
                        pointerEvents: 'none',
                    }}
                />

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ textAlign: 'center', maxWidth: '720px', position: 'relative', zIndex: 1 }}
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                        style={{ marginBottom: '1.5rem' }}
                    >
                        <MdSportsSoccer size={64} style={{ color: 'var(--color-accent)' }} />
                    </motion.div>

                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem' }}>
                        Your Next Game<br />
                        <span className="text-gradient">Starts Here</span>
                    </h1>

                    <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '560px', margin: '0 auto 2.5rem' }}>
                        Discover sports events, tournaments, and leagues near you.
                        Connect with organizers and never miss a game again.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to={user ? '/events' : '/signup'}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn-primary"
                                style={{ padding: '0.875rem 2rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                {user ? 'Browse Events' : 'Get Started'}
                                <IoArrowForward size={18} />
                            </motion.button>
                        </Link>
                        <Link to="/events">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn-outline"
                                style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}
                            >
                                Explore Events
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Sports Grid */}
            <section style={{ padding: '4rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
                <motion.h2
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '2.5rem' }}
                >
                    Popular <span className="text-gradient">Sports</span>
                </motion.h2>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: '1rem',
                        maxWidth: '800px',
                        margin: '0 auto',
                    }}
                >
                    {popularSports.map((sport, i) => (
                        <motion.div
                            key={sport.name}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ scale: 1.08, y: -4 }}
                            style={{
                                background: 'var(--color-card)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '1rem',
                                padding: '1.5rem 1rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'border-color 0.3s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = sport.color)}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                        >
                            <span style={{ fontSize: '2.5rem' }}>{sport.icon}</span>
                            <p style={{ marginTop: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>{sport.name}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section style={{ padding: '4rem 1.5rem', background: 'var(--color-surface)' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '3rem' }}
                    >
                        Why <span className="text-gradient">InterPlay?</span>
                    </motion.h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {features.map((f, i) => (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                style={{
                                    background: 'var(--color-card)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '1rem',
                                    padding: '2rem',
                                }}
                            >
                                <div style={{ color: 'var(--color-accent)', marginBottom: '1rem' }}>{f.icon}</div>
                                <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem' }}>{f.title}</h3>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ maxWidth: '560px', margin: '0 auto' }}
                >
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
                        Ready to <span className="text-gradient">Play?</span>
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
                        Join thousands of sports enthusiasts discovering events every day.
                    </p>
                    <Link to={user ? '/events' : '/signup'}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-primary animate-pulse-glow"
                            style={{ padding: '1rem 3rem', fontSize: '1.05rem' }}
                        >
                            {user ? 'Explore Now' : 'Join InterPlay'}
                        </motion.button>
                    </Link>
                </motion.div>
            </section>

        </div>
    );
}
