import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import SaveButton from '../components/SaveButton';
import { IoCalendarOutline, IoLocationOutline, IoPersonOutline, IoOpenOutline, IoArrowBack, IoPeopleOutline, IoCashOutline, IoCheckmarkCircle, IoTrophyOutline } from 'react-icons/io5';

const sportIcons = { football: '⚽', cricket: '🏏', basketball: '🏀', badminton: '🏸', tennis: '🎾', volleyball: '🏐', hockey: '🏑', swimming: '🏊', athletics: '🏃' };

export default function EventDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [joined, setJoined] = useState(false);
    const [joining, setJoining] = useState(false);
    const [joinCount, setJoinCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await API.get(`/events/${id}`);
                setEvent(data);

                // Get join count
                const countRes = await API.get(`/bookings/count/${id}`);
                setJoinCount(countRes.data.count);

                // Check if user has joined
                if (user) {
                    const checkRes = await API.get(`/bookings/check/${id}`);
                    setJoined(checkRes.data.joined);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, user]);

    const handleJoin = async () => {
        if (!user || joining) return;

        // If event has an external registration link, redirect to it
        if (event.registrationLink) {
            window.open(event.registrationLink, '_blank', 'noopener,noreferrer');
            return;
        }

        setJoining(true);
        try {
            const { data } = await API.post('/bookings', { eventId: id });
            setJoined(true);
            setJoinCount((prev) => prev + 1);
            if (data.availableSlots !== null && data.availableSlots !== undefined) {
                setEvent((prev) => ({ ...prev, availableSlots: data.availableSlots }));
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to join event');
        } finally {
            setJoining(false);
        }
    };

    if (loading) return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div style={{ height: '400px', background: 'var(--color-card)', borderRadius: '1.5rem' }} />
        </div>
    );

    if (!event) return (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
            <h2>Event Not Found</h2>
            <Link to="/events" style={{ color: 'var(--color-accent)' }}>← Back</Link>
        </div>
    );

    const fmtDate = d => new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const fmtTime = d => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const icon = sportIcons[event.sport] || '🏆';
    const isFree = !event.price || event.price === 0;
    const hasSlots = event.totalSlots > 0;
    const noSlotsLeft = hasSlots && event.availableSlots <= 0;
    const isTournament = event.isTournament;
    const spotsLow = hasSlots && event.availableSlots > 0 && event.availableSlots <= 5;

    // Dynamic text based on event type
    const sidebarTitle = isTournament ? 'Register Your Team' : 'Join This Game';
    const joinButtonText = joining
        ? (isTournament ? 'Registering...' : 'Joining...')
        : noSlotsLeft
            ? 'Fully Booked'
            : event.registrationLink
                ? (isTournament ? 'Register Team ↗' : 'Register Now ↗')
                : (isTournament ? 'Register Team 🏆' : 'Join Game 🎯');

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem' }}>
            <Link to="/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, marginBottom: '1.5rem' }}>
                <IoArrowBack size={16} />Back to Events
            </Link>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                {/* Poster */}
                <div style={{ position: 'relative', borderRadius: '1.5rem', overflow: 'hidden', marginBottom: '2rem', background: 'var(--color-card)' }}>
                    <img
                        src={event.posterImage || `https://placehold.co/900x450/0f1d35/39ff14?text=${encodeURIComponent(event.sport)}`}
                        alt={event.title}
                        style={{ width: '100%', maxHeight: '450px', objectFit: 'cover', display: 'block' }}
                        onError={e => { e.target.src = `https://placehold.co/900x450/0f1d35/39ff14?text=${encodeURIComponent(event.sport)}` }}
                    />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(transparent,var(--color-primary))', pointerEvents: 'none' }} />
                    <SaveButton eventId={event._id} style={{ position: 'absolute', top: '1rem', right: '1rem', width: '44px', height: '44px' }} />
                    {isTournament && (
                        <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                            <span style={{
                                padding: '0.35rem 0.85rem',
                                borderRadius: '2rem',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background: 'rgba(255, 107, 53, 0.9)',
                                color: '#fff',
                                backdropFilter: 'blur(8px)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                            }}>
                                <IoTrophyOutline size={14} /> Tournament
                            </span>
                        </div>
                    )}
                </div>

                {/* Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }} className="detail-layout">
                    {/* Main Content */}
                    <div>
                        <span className="badge badge-sport" style={{ marginBottom: '1rem', display: 'inline-flex' }}>{icon} {event.sport}</span>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1.5rem' }}>{event.title}</h1>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-muted)' }}>
                                <IoCalendarOutline size={20} style={{ color: 'var(--color-accent)' }} />
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.95rem' }}>{fmtDate(event.date)}</div>
                                    <div style={{ fontSize: '0.8rem' }}>{fmtTime(event.date)}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-muted)' }}>
                                <IoLocationOutline size={20} style={{ color: 'var(--color-accent)' }} />
                                <div>
                                    <span>{event.location}</span>
                                    {event.district && (
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.3rem',
                                            marginLeft: '0.5rem',
                                            padding: '0.1rem 0.5rem',
                                            background: 'rgba(57, 255, 20, 0.08)',
                                            border: '1px solid rgba(57, 255, 20, 0.15)',
                                            borderRadius: '1rem',
                                            fontSize: '0.7rem',
                                            fontWeight: 500,
                                            color: 'var(--color-accent)',
                                        }}>
                                            📍 {event.district}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-muted)' }}>
                                <IoPersonOutline size={20} style={{ color: 'var(--color-accent)' }} />
                                <span>by <strong style={{ color: 'var(--color-text)' }}>{event.organizerId?.name || 'Unknown'}</strong></span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-muted)' }}>
                                <IoCashOutline size={20} style={{ color: 'var(--color-accent)' }} />
                                <span style={{ fontWeight: 600, color: isFree ? 'var(--color-accent)' : 'var(--color-text)' }}>
                                    {isFree ? 'Free Entry' : `₹${event.price} per ${isTournament ? 'team' : 'player'}`}
                                </span>
                            </div>
                            {hasSlots && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: noSlotsLeft ? '#ff4757' : 'var(--color-text-muted)' }}>
                                    <IoPeopleOutline size={20} style={{ color: noSlotsLeft ? '#ff4757' : 'var(--color-accent)' }} />
                                    <span style={{ fontWeight: 600 }}>
                                        {noSlotsLeft ? 'Fully Booked' : `${event.availableSlots} of ${event.totalSlots} spots available`}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* "Only X spots left" warning */}
                        {spotsLow && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{
                                    background: 'rgba(255, 71, 87, 0.1)',
                                    border: '1px solid rgba(255, 71, 87, 0.3)',
                                    borderRadius: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    color: '#ff4757',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    marginBottom: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}
                            >
                                🔥 Only {event.availableSlots} {event.availableSlots === 1 ? 'spot' : 'spots'} left!
                            </motion.div>
                        )}

                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>About This Event</h2>
                        <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{event.description}</p>

                        {/* Players Joined */}
                        {joinCount > 0 && (
                            <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--color-surface)', borderRadius: '0.75rem', border: '1px solid var(--color-border)' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                                    <IoPeopleOutline size={16} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />
                                    {joinCount} {joinCount === 1 ? 'player has' : 'players have'} joined this event
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div>
                        <div className="glass" style={{ borderRadius: '1rem', padding: '1.5rem', position: 'sticky', top: '88px' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {isTournament && <IoTrophyOutline size={20} style={{ color: 'var(--color-accent)' }} />}
                                {sidebarTitle}
                            </h3>

                            {/* Price section */}
                            <div style={{ background: 'var(--color-surface)', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Price</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: isFree ? 'var(--color-accent)' : 'var(--color-text)' }}>
                                    {isFree ? 'FREE' : `₹${event.price}`}
                                </div>
                                {isTournament && !isFree && <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', marginTop: '0.25rem' }}>per team</div>}
                            </div>

                            {/* Date section */}
                            <div style={{ background: 'var(--color-surface)', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Event Date</div>
                                <div style={{ fontWeight: 700 }}>{fmtDate(event.date)}</div>
                                <div style={{ color: 'var(--color-accent)', fontSize: '0.85rem', fontWeight: 500 }}>{fmtTime(event.date)}</div>
                            </div>

                            {/* Slots section */}
                            {hasSlots && (
                                <div style={{ background: 'var(--color-surface)', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.25rem' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Availability</div>
                                    <div style={{ fontWeight: 700, color: noSlotsLeft ? '#ff4757' : spotsLow ? '#ff6b35' : 'var(--color-text)' }}>
                                        {noSlotsLeft ? 'No spots left' : spotsLow ? `Only ${event.availableSlots} spots left!` : `${event.availableSlots} spots remaining`}
                                    </div>
                                    {/* Progress bar */}
                                    <div style={{ marginTop: '0.5rem', height: '6px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${((event.totalSlots - event.availableSlots) / event.totalSlots) * 100}%`,
                                            height: '100%',
                                            background: noSlotsLeft ? '#ff4757' : spotsLow ? '#ff6b35' : 'var(--color-accent)',
                                            borderRadius: '3px',
                                            transition: 'width 0.5s ease',
                                        }} />
                                    </div>
                                </div>
                            )}

                            {/* Join / Register Button */}
                            {user ? (
                                joined ? (
                                    <div style={{
                                        width: '100%',
                                        padding: '0.85rem',
                                        borderRadius: '0.75rem',
                                        background: 'rgba(57, 255, 20, 0.1)',
                                        border: '1px solid rgba(57, 255, 20, 0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        color: 'var(--color-accent)',
                                        fontWeight: 700,
                                        fontSize: '0.95rem',
                                    }}>
                                        <IoCheckmarkCircle size={20} /> You've Joined!
                                    </div>
                                ) : (
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="btn-primary"
                                        onClick={handleJoin}
                                        disabled={noSlotsLeft || joining}
                                        style={{
                                            width: '100%',
                                            padding: '0.85rem',
                                            fontSize: '0.95rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            opacity: noSlotsLeft ? 0.5 : 1,
                                        }}
                                    >
                                        {joinButtonText}
                                    </motion.button>
                                )
                            ) : (
                                <Link to="/login" style={{ textDecoration: 'none', display: 'block' }}>
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="btn-primary"
                                        style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
                                    >
                                        Login to {isTournament ? 'Register' : 'Join'}
                                    </motion.button>
                                </Link>
                            )}

                            {/* External Registration Link (secondary button when user already joined but link exists) */}
                            {event.registrationLink && joined && (
                                <a href={event.registrationLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', marginTop: '0.75rem' }}>
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="btn-outline"
                                        style={{ width: '100%', padding: '0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        External Registration <IoOpenOutline size={16} />
                                    </motion.button>
                                </a>
                            )}

                            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', textAlign: 'center', marginTop: '0.75rem' }}>
                                {event.registrationLink ? "Clicking register will redirect you to the organizer's form" : `${isTournament ? 'Register your team' : 'Join'} directly through InterPlay`}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
            <style>{`@media(max-width:768px){.detail-layout{grid-template-columns:1fr!important}}`}</style>
        </div>
    );
}
