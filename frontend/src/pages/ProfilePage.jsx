import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';
import EventCard from '../components/EventCard';
import { IoCalendar, IoTrophy, IoBookmark, IoStatsChart, IoChevronForward, IoPerson, IoMail, IoTime, IoGridOutline } from 'react-icons/io5';
import { MdDashboard } from 'react-icons/md';

const sectionStyle = {
    background: 'var(--color-card)', border: '1px solid var(--color-border)',
    borderRadius: '1.25rem', padding: '1.75rem', marginBottom: '1.5rem',
};
const sectionTitle = { fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' };
const statCard = {
    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
    borderRadius: '1rem', padding: '1.25rem', textAlign: 'center', flex: '1 1 140px', minWidth: '140px',
};
const infoRow = { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 0', borderBottom: '1px solid var(--color-border)' };
const statusBadge = (status) => ({
    display: 'inline-block', padding: '0.2rem 0.65rem', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: 600,
    background: status === 'Confirmed' ? 'rgba(34,197,94,0.15)' : status === 'Upcoming' ? 'rgba(59,130,246,0.15)' : 'rgba(250,204,21,0.15)',
    color: status === 'Confirmed' ? '#22c55e' : status === 'Upcoming' ? '#3b82f6' : '#facc15',
    border: `1px solid ${status === 'Confirmed' ? 'rgba(34,197,94,0.3)' : status === 'Upcoming' ? 'rgba(59,130,246,0.3)' : 'rgba(250,204,21,0.3)'}`,
});

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [savedEvents, setSavedEvents] = useState([]);
    const [joinedEvents, setJoinedEvents] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const promises = [
                    API.get('/saved').then(r => setSavedEvents(r.data)).catch(() => {}),
                    API.get('/bookings').then(r => setJoinedEvents(r.data)).catch(() => {}),
                ];
                if (user?.role === 'organizer') {
                    promises.push(API.get(`/users/${user._id}/events`).then(r => setEvents(r.data)).catch(() => {}));
                }
                await Promise.all(promises);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        if (user) fetchData();
    }, [user]);

    const handleLogout = () => { logout(); navigate('/'); };

    const uniqueSports = [...new Set([
        ...joinedEvents.map(e => e.sport),
        ...events.map(e => e.sport),
    ].filter(Boolean))];
    const upcomingCount = [...joinedEvents, ...events].filter(e => new Date(e.date) > new Date()).length;
    const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

    const tabs = [
        { key: 'overview', label: 'Overview', icon: <IoGridOutline size={15} /> },
        { key: 'registered', label: `Registered (${joinedEvents.length})`, icon: <IoCalendar size={15} /> },
        ...(user?.role === 'organizer' ? [{ key: 'created', label: `Created (${events.length})`, icon: <IoTrophy size={15} /> }] : []),
        { key: 'saved', label: `Saved (${savedEvents.length})`, icon: <IoBookmark size={15} /> },
    ];

    const profilePhoto = user?.profilePhoto;

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

                {/* Profile Header */}
                <div style={{ ...sectionStyle, display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', background: 'linear-gradient(135deg, var(--color-card) 0%, var(--color-surface) 100%)' }}>
                    {profilePhoto ? (
                        <img src={profilePhoto} alt={user?.name} referrerPolicy="no-referrer" style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid var(--color-accent)', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dim))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: '#0a1628', border: '3px solid var(--color-accent)' }}>
                            {user?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                    )}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.25rem' }}>{user?.name}</h1>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{user?.email}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                            <span className="badge badge-sport" style={{ textTransform: 'capitalize' }}>{user?.role || 'Player'}</span>
                            {user?.authProvider === 'google' && (
                                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '2rem', background: 'rgba(66,133,244,0.15)', color: '#4285f4', border: '1px solid rgba(66,133,244,0.3)', fontWeight: 600 }}>
                                    ✦ Google Account
                                </span>
                            )}
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>📅 Joined {memberSince}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {user?.role === 'organizer' && (
                            <Link to="/dashboard" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <MdDashboard size={16} /> Dashboard
                            </Link>
                        )}
                        <button className="btn-outline" onClick={handleLogout} style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem' }}>Logout</button>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', overflowX: 'auto' }}>
                    {tabs.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                            padding: '0.75rem 1.1rem', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                            background: 'none', border: 'none', fontFamily: 'var(--font-sans)',
                            color: activeTab === tab.key ? 'var(--color-accent)' : 'var(--color-text-muted)',
                            borderBottom: activeTab === tab.key ? '2px solid var(--color-accent)' : '2px solid transparent',
                            transition: 'all 0.2s', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.35rem',
                        }}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {/* Activity Summary */}
                        <div style={sectionStyle}>
                            <h2 style={sectionTitle}><IoStatsChart size={18} style={{ color: 'var(--color-accent)' }} /> Activity Summary</h2>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {[
                                    { label: 'Events Registered', value: joinedEvents.length, color: '#3b82f6', icon: '🎯' },
                                    { label: 'Events Created', value: events.length, color: '#22c55e', icon: '📋' },
                                    { label: 'Sports Participated', value: uniqueSports.length, color: '#f59e0b', icon: '🏅' },
                                    { label: 'Upcoming Events', value: upcomingCount, color: '#8b5cf6', icon: '📆' },
                                ].map((s, i) => (
                                    <motion.div key={i} style={statCard} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                        <div style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{s.icon}</div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{s.label}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div style={sectionStyle}>
                            <h2 style={sectionTitle}><IoPerson size={18} style={{ color: 'var(--color-accent)' }} /> Personal Information</h2>
                            <div style={infoRow}><IoPerson size={16} style={{ color: 'var(--color-text-dim)' }} /> <div><div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)' }}>Full Name</div><div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name}</div></div></div>
                            <div style={infoRow}><IoMail size={16} style={{ color: 'var(--color-text-dim)' }} /> <div><div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)' }}>Email Address</div><div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.email}</div></div></div>
                            <div style={{ ...infoRow, borderBottom: 'none' }}><IoTime size={16} style={{ color: 'var(--color-text-dim)' }} /> <div><div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)' }}>Account Created</div><div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{memberSince}</div></div></div>
                        </div>

                        {/* Sports Participated */}
                        {uniqueSports.length > 0 && (
                            <div style={sectionStyle}>
                                <h2 style={sectionTitle}><IoTrophy size={18} style={{ color: 'var(--color-accent)' }} /> Sports Participated</h2>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {uniqueSports.map(s => <span key={s} className="badge badge-sport" style={{ textTransform: 'capitalize', fontSize: '0.8rem', padding: '0.4rem 1rem' }}>{s}</span>)}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Registered Events Tab */}
                {activeTab === 'registered' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {loading ? <LoadingSkeleton /> : joinedEvents.length === 0 ? (
                            <EmptyState icon="🎯" title="No Registered Events" desc="Browse events and join your first game!" />
                        ) : (
                            <>
                                {/* Table view */}
                                <div style={{ ...sectionStyle, overflowX: 'auto' }}>
                                    <h2 style={sectionTitle}><IoCalendar size={18} style={{ color: 'var(--color-accent)' }} /> Your Registered Events</h2>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                        <thead><tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                                            {['Event', 'Sport', 'Date', 'Location', 'Status'].map(h => <th key={h} style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>{h}</th>)}
                                        </tr></thead>
                                        <tbody>
                                            {joinedEvents.map((e, i) => {
                                                const isPast = new Date(e.date) < new Date();
                                                const status = isPast ? 'Completed' : 'Confirmed';
                                                return (
                                                    <tr key={e._id || i} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.2s' }}>
                                                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{e.title}</td>
                                                        <td style={{ padding: '0.75rem' }}><span className="badge badge-sport" style={{ textTransform: 'capitalize' }}>{e.sport}</span></td>
                                                        <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)' }}>{new Date(e.date).toLocaleDateString()}</td>
                                                        <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)' }}>{e.location}</td>
                                                        <td style={{ padding: '0.75rem' }}><span style={statusBadge(status)}>{status}</span></td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Card view */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
                                    {joinedEvents.map((evt, i) => <EventCard key={evt._id} event={evt} index={i} />)}
                                </div>
                            </>
                        )}
                    </motion.div>
                )}

                {/* Created Events Tab */}
                {activeTab === 'created' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {loading ? <LoadingSkeleton /> : events.length === 0 ? (
                            <EmptyState icon="📋" title="No Events Created" desc="Create your first event to get started!" />
                        ) : (
                            <>
                                <div style={{ ...sectionStyle, overflowX: 'auto' }}>
                                    <h2 style={sectionTitle}><IoTrophy size={18} style={{ color: 'var(--color-accent)' }} /> Events You Organized</h2>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                        <thead><tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                                            {['Event', 'Date', 'Available Slots', 'Participants', 'Status'].map(h => <th key={h} style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>{h}</th>)}
                                        </tr></thead>
                                        <tbody>
                                            {events.map((e, i) => {
                                                const participants = (e.totalSlots || 0) - (e.availableSlots || 0);
                                                const isPast = new Date(e.date) < new Date();
                                                return (
                                                    <tr key={e._id || i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{e.title}</td>
                                                        <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)' }}>{new Date(e.date).toLocaleDateString()}</td>
                                                        <td style={{ padding: '0.75rem' }}>{e.availableSlots || 0} / {e.totalSlots || 0}</td>
                                                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{participants}</td>
                                                        <td style={{ padding: '0.75rem' }}><span style={statusBadge(isPast ? 'Completed' : 'Upcoming')}>{isPast ? 'Completed' : 'Upcoming'}</span></td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
                                    {events.map((evt, i) => <EventCard key={evt._id} event={evt} index={i} />)}
                                </div>
                            </>
                        )}
                    </motion.div>
                )}

                {/* Saved Events Tab */}
                {activeTab === 'saved' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {loading ? <LoadingSkeleton /> : savedEvents.length === 0 ? (
                            <EmptyState icon="🔖" title="No Saved Events" desc="Browse events and save the ones you like!" />
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
                                {savedEvents.map((evt, i) => <EventCard key={evt._id} event={evt} index={i} />)}
                            </div>
                        )}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}

function EmptyState({ icon, title, desc }) {
    return (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
            <h3 style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>{title}</h3>
            <p style={{ fontSize: '0.9rem' }}>{desc}</p>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
            {[1, 2, 3].map(i => <div key={i} style={{ height: '300px', background: 'var(--color-card)', borderRadius: '1rem', border: '1px solid var(--color-border)', animation: 'pulse 1.5s infinite' }} />)}
        </div>
    );
}
