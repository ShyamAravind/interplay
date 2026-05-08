import { motion } from 'framer-motion';

const sports = [
    { value: '', label: 'All Sports', icon: '🏆' },
    { value: 'football', label: 'Football', icon: '⚽' },
    { value: 'cricket', label: 'Cricket', icon: '🏏' },
    { value: 'basketball', label: 'Basketball', icon: '🏀' },
    { value: 'badminton', label: 'Badminton', icon: '🏸' },
    { value: 'tennis', label: 'Tennis', icon: '🎾' },
    { value: 'volleyball', label: 'Volleyball', icon: '🏐' },
    { value: 'hockey', label: 'Hockey', icon: '🏑' },
    { value: 'swimming', label: 'Swimming', icon: '🏊' },
    { value: 'athletics', label: 'Athletics', icon: '🏃' },
];

export default function FilterSidebar({ filters, setFilters }) {
    const handleSportClick = (sport) => {
        setFilters((prev) => ({ ...prev, sport }));
    };

    return (
        <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            style={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '1rem',
                padding: '1.25rem',
                height: 'fit-content',
                position: 'sticky',
                top: '88px',
            }}
        >
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1rem' }}>
                Filters
            </h3>

            {/* Sport Type */}
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'block' }}>
                    Sport
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {sports.map((sport) => (
                        <button
                            key={sport.value}
                            onClick={() => handleSportClick(sport.value)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                background: filters.sport === sport.value ? 'rgba(57, 255, 20, 0.15)' : 'transparent',
                                color: filters.sport === sport.value ? 'var(--color-accent)' : 'var(--color-text-muted)',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: filters.sport === sport.value ? 600 : 400,
                                textAlign: 'left',
                                transition: 'all 0.2s ease',
                                fontFamily: 'var(--font-sans)',
                            }}
                        >
                            <span>{sport.icon}</span>
                            {sport.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Location */}
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'block' }}>
                    Location
                </label>
                <input
                    type="text"
                    placeholder="City or venue..."
                    value={filters.location || ''}
                    onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
                    className="input-field"
                    style={{ fontSize: '0.8rem', padding: '0.6rem 0.75rem' }}
                />
            </div>

            {/* Date */}
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'block' }}>
                    Date
                </label>
                <input
                    type="date"
                    value={filters.date || ''}
                    onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value }))}
                    className="input-field"
                    style={{ fontSize: '0.8rem', padding: '0.6rem 0.75rem' }}
                />
            </div>

            {/* Clear Filters */}
            <button
                onClick={() => setFilters({ sport: '', location: '', date: '', search: '', district: '' })}
                className="btn-outline"
                style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem' }}
            >
                Clear Filters
            </button>
        </motion.aside>
    );
}
