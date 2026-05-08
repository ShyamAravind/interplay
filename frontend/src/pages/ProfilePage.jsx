import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';
import EventCard from '../components/EventCard';

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [savedEvents, setSavedEvents] = useState([]);
    const [joinedEvents, setJoinedEvents] = useState([]);
    const [activeTab, setActiveTab] = useState(user?.role === 'organizer' ? 'posted' : 'joined');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const promises = [];

                if (user.role === 'organizer') {
                    promises.push(API.get(`/users/${user._id}/events`).then(r => setEvents(r.data)));
                }

                promises.push(API.get('/saved').then(r => setSavedEvents(r.data)));
                promises.push(API.get('/bookings').then(r => setJoinedEvents(r.data)));

                await Promise.all(promises);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const displayedEvents = activeTab === 'posted'
        ? events
        : activeTab === 'saved'
        ? savedEvents
        : joinedEvents;

    const tabs = [];
    if (user?.role === 'organizer') tabs.push({ key: 'posted', label: `My Events (${events.length})` });
    tabs.push({ key: 'joined', label: `Joined (${joinedEvents.length})` });
    tabs.push({ key: 'saved', label: `Saved (${savedEvents.length})` });

    const emptyMessages = {
        posted: { icon: '📋', title: 'No Events Yet', desc: 'Create your first event to get started!' },
        joined: { icon: '🎯', title: 'No Joined Events', desc: 'Browse events and join your first game!' },
        saved: { icon: '🔖', title: 'No Saved Events', desc: 'Browse events and save the ones you like' },
    };

    return (
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                {/* Profile Header */}
                <div className="glass" style={{ borderRadius: '1.5rem', padding: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{
                        width: '72px', height: '72px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dim))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', fontWeight: 800, color: '#0a1628',
                    }}>
                        {user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{user?.name}</h1>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{user?.email}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                            <span className="badge badge-sport" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
                            {joinedEvents.length > 0 && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>
                                    🎯 {joinedEvents.length} events joined
                                </span>
                            )}
                        </div>
                    </div>
                    <button className="btn-outline" onClick={handleLogout} style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                        Logout
                    </button>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex', gap: '0.5rem', marginBottom: '1.5rem',
                    borderBottom: '1px solid var(--color-border)', paddingBottom: '0',
                    overflowX: 'auto',
                }}>
                    {tabs.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                            padding: '0.75rem 1.25rem', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                            background: 'none', border: 'none', fontFamily: 'var(--font-sans)',
                            color: activeTab === tab.key ? 'var(--color-accent)' : 'var(--color-text-muted)',
                            borderBottom: activeTab === tab.key ? '2px solid var(--color-accent)' : '2px solid transparent',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap',
                        }}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ height: '300px', background: 'var(--color-card)', borderRadius: '1rem', border: '1px solid var(--color-border)' }} />
                        ))}
                    </div>
                ) : displayedEvents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-text-muted)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{emptyMessages[activeTab].icon}</div>
                        <h3 style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                            {emptyMessages[activeTab].title}
                        </h3>
                        <p style={{ fontSize: '0.9rem' }}>{emptyMessages[activeTab].desc}</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
                        {displayedEvents.map((evt, i) => <EventCard key={evt._id} event={evt} index={i} />)}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
