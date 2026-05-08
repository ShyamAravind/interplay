import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoCalendarOutline, IoLocationOutline, IoPeopleOutline } from 'react-icons/io5';
import SaveButton from './SaveButton';

const sportIcons = {
    football: '⚽',
    cricket: '🏏',
    basketball: '🏀',
    badminton: '🏸',
    tennis: '🎾',
    volleyball: '🏐',
    hockey: '🏑',
    swimming: '🏊',
    athletics: '🏃',
    rugby: '🏉',
};

export default function EventCard({ event, index = 0 }) {
    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const sportIcon = sportIcons[event.sport] || '🏆';
    const isFree = !event.price || event.price === 0;
    const hasSlots = event.totalSlots > 0;
    const slotsLow = hasSlots && event.availableSlots <= 5 && event.availableSlots > 0;
    const isTournament = event.isTournament;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className="card"
            style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
        >
            <Link to={`/events/${event._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {/* Poster */}
                <div style={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden' }}>
                    <img
                        src={event.posterImage || '/placeholder-event.svg'}
                        alt={event.title}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.5s ease',
                        }}
                        onError={(e) => {
                            e.target.src = `https://placehold.co/600x340/0f1d35/39ff14?text=${encodeURIComponent(event.sport || 'Event')}`;
                        }}
                        onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
                        onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                    />
                    <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
                        <span className="badge badge-sport">
                            {sportIcon} {event.sport}
                        </span>
                    </div>
                    <SaveButton eventId={event._id} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }} />

                    {/* Price badge */}
                    <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem' }}>
                        <span style={{
                            padding: '0.3rem 0.75rem',
                            borderRadius: '2rem',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            background: isFree ? 'rgba(57, 255, 20, 0.9)' : 'rgba(10, 22, 40, 0.85)',
                            color: isFree ? '#0a1628' : '#f0f4f8',
                            backdropFilter: 'blur(8px)',
                            border: isFree ? 'none' : '1px solid rgba(57, 255, 20, 0.3)',
                        }}>
                            {isFree ? 'FREE' : `₹${event.price}`}
                        </span>
                    </div>
                </div>

                {/* Info */}
                <div style={{ padding: '1rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.3, color: 'var(--color-text)' }}>
                        {event.title}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-accent)', fontSize: '0.8rem', fontWeight: 500 }}>
                        <IoCalendarOutline size={14} />
                        {formatDate(event.date)}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                        <IoLocationOutline size={14} />
                        {event.location}
                    </div>

                    {event.district && (
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.15rem 0.55rem',
                            background: 'rgba(57, 255, 20, 0.06)',
                            border: '1px solid rgba(57, 255, 20, 0.15)',
                            borderRadius: '1rem',
                            fontSize: '0.7rem',
                            fontWeight: 500,
                            color: 'var(--color-accent)',
                            width: 'fit-content',
                        }}>
                            📍 {event.district}
                        </div>
                    )}

                    {/* Slots info */}
                    {hasSlots && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: slotsLow ? 'var(--color-danger, #ff4757)' : 'var(--color-text-muted)',
                        }}>
                            <IoPeopleOutline size={14} />
                            {event.availableSlots === 0
                                ? 'Fully Booked'
                                : slotsLow
                                    ? `🔥 Only ${event.availableSlots} spots left!`
                                    : `${event.availableSlots} spots left`}
                        </div>
                    )}

                    <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>
                            by {event.organizerId?.name || 'Organizer'}
                        </span>
                        <span
                            className="btn-primary"
                            style={{ padding: '0.3rem 0.9rem', fontSize: '0.75rem', borderRadius: '0.5rem' }}
                        >
                            {isTournament ? 'Register Team →' : 'Join Game →'}
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
