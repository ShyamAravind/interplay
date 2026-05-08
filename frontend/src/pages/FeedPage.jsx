import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../services/api';
import EventCard from '../components/EventCard';
import SearchBar from '../components/SearchBar';
import FilterSidebar from '../components/FilterSidebar';
import { IoFilterOutline, IoClose, IoLocationOutline, IoChevronDown } from 'react-icons/io5';

const TN_DISTRICTS = [
    'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
    'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram',
    'Kanniyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
    'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
    'Ramanathapuram', 'Ranipet', 'Salem', 'Sivagangai', 'Tenkasi',
    'Thanjavur', 'Theni', 'Thoothukudi (Tuticorin)', 'Tiruchirappalli',
    'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvallur',
    'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar',
];

export default function FeedPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ sport: '', location: '', date: '', search: '', district: '' });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 12 };
            if (filters.sport) params.sport = filters.sport;
            if (filters.location) params.location = filters.location;
            if (filters.date) params.date = filters.date;
            if (filters.search) params.search = filters.search;
            if (filters.district) params.district = filters.district;

            const { data } = await API.get('/events', { params });
            setEvents(data.events);
            setTotalPages(data.pages);
        } catch (err) {
            console.error('Failed to fetch events:', err);
        } finally {
            setLoading(false);
        }
    }, [filters, page]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [filters]);

    // Close district dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.district-dropdown-container')) {
                setDistrictDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    const handleDistrictSelect = (district) => {
        setFilters((prev) => ({ ...prev, district }));
        setDistrictDropdownOpen(false);
    };

    return (
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                    Discover <span className="text-gradient">Events</span>
                </h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    Find sports events happening near you
                </p>
            </div>

            {/* District Filter Dropdown */}
            <div
                className="district-dropdown-container"
                style={{
                    marginBottom: '1.25rem',
                    position: 'relative',
                    maxWidth: '360px',
                }}
            >
                <label
                    style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: '0.4rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                    }}
                >
                    <IoLocationOutline size={13} />
                    Filter by District
                </label>
                <button
                    id="district-filter-dropdown"
                    onClick={() => setDistrictDropdownOpen(!districtDropdownOpen)}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        padding: '0.7rem 1rem',
                        background: filters.district
                            ? 'linear-gradient(135deg, rgba(57, 255, 20, 0.08), rgba(0, 255, 136, 0.05))'
                            : 'var(--color-surface)',
                        border: filters.district
                            ? '1.5px solid rgba(57, 255, 20, 0.35)'
                            : '1.5px solid var(--color-border)',
                        borderRadius: '0.75rem',
                        color: filters.district ? 'var(--color-accent)' : 'var(--color-text)',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.88rem',
                        fontWeight: filters.district ? 600 : 400,
                        transition: 'all 0.25s ease',
                        outline: 'none',
                    }}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1rem' }}>📍</span>
                        {filters.district || 'All Districts'}
                    </span>
                    <IoChevronDown
                        size={16}
                        style={{
                            transition: 'transform 0.25s ease',
                            transform: districtDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            opacity: 0.6,
                        }}
                    />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                    {districtDropdownOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.97 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                marginTop: '0.35rem',
                                background: 'var(--color-card)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '0.75rem',
                                boxShadow: '0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(57, 255, 20, 0.05)',
                                maxHeight: '320px',
                                overflowY: 'auto',
                                zIndex: 50,
                                padding: '0.35rem',
                            }}
                        >
                            {/* All Districts option */}
                            <button
                                onClick={() => handleDistrictSelect('')}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.55rem 0.75rem',
                                    borderRadius: '0.5rem',
                                    border: 'none',
                                    background: !filters.district ? 'rgba(57, 255, 20, 0.12)' : 'transparent',
                                    color: !filters.district ? 'var(--color-accent)' : 'var(--color-text)',
                                    cursor: 'pointer',
                                    fontSize: '0.84rem',
                                    fontWeight: !filters.district ? 600 : 400,
                                    textAlign: 'left',
                                    transition: 'all 0.15s ease',
                                    fontFamily: 'var(--font-sans)',
                                }}
                                onMouseEnter={(e) => {
                                    if (filters.district) e.target.style.background = 'var(--color-surface)';
                                }}
                                onMouseLeave={(e) => {
                                    if (filters.district) e.target.style.background = 'transparent';
                                }}
                            >
                                <span style={{ fontSize: '0.9rem' }}>🌍</span>
                                All Districts
                            </button>

                            {/* Divider */}
                            <div style={{
                                height: '1px',
                                background: 'var(--color-border)',
                                margin: '0.25rem 0.5rem',
                            }} />

                            {/* District options */}
                            {TN_DISTRICTS.map((district) => (
                                <button
                                    key={district}
                                    onClick={() => handleDistrictSelect(district)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: '0.5rem',
                                        border: 'none',
                                        background: filters.district === district ? 'rgba(57, 255, 20, 0.12)' : 'transparent',
                                        color: filters.district === district ? 'var(--color-accent)' : 'var(--color-text-muted)',
                                        cursor: 'pointer',
                                        fontSize: '0.84rem',
                                        fontWeight: filters.district === district ? 600 : 400,
                                        textAlign: 'left',
                                        transition: 'all 0.15s ease',
                                        fontFamily: 'var(--font-sans)',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (filters.district !== district) e.target.style.background = 'var(--color-surface)';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (filters.district !== district) e.target.style.background = 'transparent';
                                    }}
                                >
                                    {district}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Active District Chip */}
            {filters.district && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.35rem 0.85rem',
                        background: 'rgba(57, 255, 20, 0.1)',
                        border: '1px solid rgba(57, 255, 20, 0.25)',
                        borderRadius: '2rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: 'var(--color-accent)',
                        marginBottom: '1rem',
                    }}
                >
                    📍 {filters.district}
                    <button
                        onClick={() => setFilters((prev) => ({ ...prev, district: '' }))}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-accent)',
                            cursor: 'pointer',
                            padding: '0 0.15rem',
                            display: 'flex',
                            alignItems: 'center',
                            opacity: 0.7,
                        }}
                    >
                        <IoClose size={14} />
                    </button>
                </motion.div>
            )}

            {/* Search + Mobile Filter Toggle */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                    <SearchBar onSearch={(q) => setFilters((prev) => ({ ...prev, search: q }))} />
                </div>
                <button
                    className="mobile-filter-btn"
                    onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                    style={{
                        display: 'none',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.75rem 1rem',
                        background: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '0.75rem',
                        color: 'var(--color-text)',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        position: 'relative',
                    }}
                >
                    <IoFilterOutline size={18} />
                    Filters
                    {activeFilterCount > 0 && (
                        <span style={{
                            position: 'absolute', top: '-4px', right: '-4px',
                            background: 'var(--color-accent)', color: '#0a1628',
                            width: '18px', height: '18px', borderRadius: '50%',
                            fontSize: '0.7rem', fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem' }} className="feed-layout">
                {/* Sidebar (desktop) */}
                <div className="sidebar-desktop">
                    <FilterSidebar filters={filters} setFilters={setFilters} />
                </div>

                {/* Events Grid */}
                <div>
                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    style={{
                                        borderRadius: '1rem',
                                        background: 'var(--color-card)',
                                        border: '1px solid var(--color-border)',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <div style={{ paddingTop: '56.25%', background: 'var(--color-surface)', animation: 'pulse 2s infinite' }} />
                                    <div style={{ padding: '1rem' }}>
                                        <div style={{ height: '1rem', background: 'var(--color-surface)', borderRadius: '0.5rem', marginBottom: '0.5rem', width: '80%' }} />
                                        <div style={{ height: '0.8rem', background: 'var(--color-surface)', borderRadius: '0.5rem', width: '60%' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : events.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                textAlign: 'center',
                                padding: '4rem 2rem',
                                color: 'var(--color-text-muted)',
                            }}
                        >
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏟️</div>
                            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text)' }}>No Events Found</h3>
                            <p style={{ fontSize: '0.9rem' }}>Try adjusting your filters or search query.</p>
                            {filters.district && (
                                <button
                                    onClick={() => setFilters((prev) => ({ ...prev, district: '' }))}
                                    className="btn-outline"
                                    style={{ marginTop: '1rem', fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}
                                >
                                    Clear District Filter
                                </button>
                            )}
                        </motion.div>
                    ) : (
                        <>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                    gap: '1.25rem',
                                }}
                            >
                                {events.map((event, i) => (
                                    <EventCard key={event._id} event={event} index={i} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPage(i + 1)}
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '0.5rem',
                                                border: page === i + 1 ? '1.5px solid var(--color-accent)' : '1px solid var(--color-border)',
                                                background: page === i + 1 ? 'rgba(57, 255, 20, 0.15)' : 'var(--color-card)',
                                                color: page === i + 1 ? 'var(--color-accent)' : 'var(--color-text-muted)',
                                                cursor: 'pointer',
                                                fontWeight: 600,
                                                fontSize: '0.85rem',
                                                fontFamily: 'var(--font-sans)',
                                            }}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Filter Overlay */}
            <AnimatePresence>
                {mobileFilterOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 100,
                            background: 'rgba(0,0,0,0.5)',
                        }}
                        onClick={() => setMobileFilterOpen(false)}
                    >
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                bottom: 0,
                                width: '300px',
                                background: 'var(--color-primary)',
                                padding: '1.5rem',
                                overflowY: 'auto',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontWeight: 700 }}>Filters</h3>
                                <button
                                    onClick={() => setMobileFilterOpen(false)}
                                    style={{ background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer' }}
                                >
                                    <IoClose size={24} />
                                </button>
                            </div>
                            <FilterSidebar filters={filters} setFilters={setFilters} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        @media (max-width: 768px) {
          .feed-layout {
            grid-template-columns: 1fr !important;
          }
          .sidebar-desktop {
            display: none !important;
          }
          .mobile-filter-btn {
            display: flex !important;
          }
          .district-dropdown-container {
            max-width: 100% !important;
          }
        }
      `}</style>
        </div>
    );
}
