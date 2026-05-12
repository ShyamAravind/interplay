import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import API from '../services/api';
import { IoArrowBack, IoPeople, IoCalendar, IoLocation, IoTrash, IoCreate, IoDownload, IoCheckmarkCircle, IoTrophy, IoStatsChart, IoMail } from 'react-icons/io5';

const cardStyle = { background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '1.25rem', padding: '1.75rem', marginBottom: '1.5rem' };
const kpiStyle = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '1rem', padding: '1.25rem', textAlign: 'center', flex: '1 1 160px', minWidth: '150px' };

export default function ManageEventPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [eventRes, partRes] = await Promise.all([
                    API.get(`/events/${id}`),
                    API.get(`/events/${id}/participants`),
                ]);
                setEvent(eventRes.data);
                setParticipants(partRes.data.participants || []);
                setStats({
                    registrationCount: partRes.data.registrationCount || 0,
                    totalSlots: partRes.data.totalSlots || 0,
                    availableSlots: partRes.data.availableSlots || 0,
                    fillPercentage: partRes.data.fillPercentage || 0,
                });
            } catch (err) {
                console.error(err);
                if (err.response?.status === 403) {
                    navigate('/profile');
                }
            } finally { setLoading(false); }
        };
        fetchData();
    }, [id, navigate]);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await API.delete(`/events/${id}`);
            navigate('/profile');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete event');
        } finally { setDeleting(false); }
    };

    const exportCSV = () => {
        if (!participants.length) return;
        const headers = ['Name', 'Email', 'Registration Date', 'Status'];
        const rows = participants.map(p => [
            p.name, p.email,
            new Date(p.registrationDate).toLocaleDateString(),
            p.status,
        ]);
        const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${event?.title || 'event'}_participants.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }}>📊</div>
                <p style={{ fontWeight: 600 }}>Loading event data...</p>
            </div>
        </div>
    );

    if (!event) return (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
            <p>Event not found</p>
            <button className="btn-primary" onClick={() => navigate('/profile')} style={{ marginTop: '1rem' }}>Back to Profile</button>
        </div>
    );

    const fillColor = stats.fillPercentage >= 80 ? '#22c55e' : stats.fillPercentage >= 50 ? '#f59e0b' : '#3b82f6';
    const isPast = new Date(event.date) < new Date();

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <button onClick={() => navigate('/profile')} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.75rem', padding: '0.5rem', cursor: 'pointer', color: 'var(--color-text)', display: 'flex' }}>
                        <IoArrowBack size={20} />
                    </button>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Manage Event</h1>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{event.title}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button className="btn-primary" onClick={exportCSV} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <IoDownload size={16} /> Export CSV
                        </button>
                        <button className="btn-outline" onClick={() => setShowDeleteConfirm(true)} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ff4757', borderColor: '#ff4757' }}>
                            <IoTrash size={16} /> Delete
                        </button>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ ...cardStyle, maxWidth: '420px', width: '90%', textAlign: 'center', margin: 0 }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Delete Event?</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                                This will permanently delete "{event.title}" and remove all {stats.registrationCount} registrations. This action cannot be undone.
                            </p>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                                <button className="btn-outline" onClick={() => setShowDeleteConfirm(false)} style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}>Cancel</button>
                                <button onClick={handleDelete} disabled={deleting} style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem', fontWeight: 700, borderRadius: '0.75rem', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #ff4757, #c0392b)', color: '#fff', opacity: deleting ? 0.7 : 1 }}>
                                    {deleting ? 'Deleting...' : 'Delete Event'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Event Details Card */}
                <div style={{ ...cardStyle, display: 'flex', gap: '1.5rem', flexWrap: 'wrap', background: 'linear-gradient(135deg, var(--color-card) 0%, var(--color-surface) 100%)' }}>
                    {event.posterImage && (
                        <img src={event.posterImage} alt={event.title} style={{ width: '200px', height: '130px', objectFit: 'cover', borderRadius: '0.75rem', border: '1px solid var(--color-border)' }}
                            onError={(e) => { e.target.src = `https://placehold.co/200x130/0f1d35/39ff14?text=${encodeURIComponent(event.sport || 'Event')}`; }}
                        />
                    )}
                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{event.title}</h2>
                            <span className="badge badge-sport" style={{ textTransform: 'capitalize' }}>{event.sport}</span>
                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: 600, background: isPast ? 'rgba(107,114,128,0.15)' : 'rgba(34,197,94,0.15)', color: isPast ? '#9ca3af' : '#22c55e', border: `1px solid ${isPast ? 'rgba(107,114,128,0.3)' : 'rgba(34,197,94,0.3)'}` }}>
                                {isPast ? 'Completed' : 'Active'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><IoCalendar size={14} style={{ color: 'var(--color-accent)' }} /> {formatDate(event.date)} at {formatTime(event.date)}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><IoLocation size={14} style={{ color: 'var(--color-accent)' }} /> {event.location}{event.district ? `, ${event.district}` : ''}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><IoPeople size={14} style={{ color: 'var(--color-accent)' }} /> {event.totalSlots > 0 ? `${event.totalSlots} total slots` : 'Unlimited slots'} · ₹{event.price || 'Free'}</span>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    {[
                        { label: 'Total Registrations', value: stats.registrationCount, icon: <IoPeople size={22} />, color: '#3b82f6' },
                        { label: 'Available Slots', value: stats.totalSlots > 0 ? stats.availableSlots : '∞', icon: <IoCheckmarkCircle size={22} />, color: '#22c55e' },
                        { label: 'Fill Rate', value: `${stats.fillPercentage}%`, icon: <IoStatsChart size={22} />, color: fillColor },
                        { label: 'Total Slots', value: stats.totalSlots || '∞', icon: <IoTrophy size={22} />, color: '#8b5cf6' },
                    ].map((k, i) => (
                        <motion.div key={i} style={kpiStyle} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                            <div style={{ color: k.color, marginBottom: '0.5rem' }}>{k.icon}</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: k.color }}>{k.value}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{k.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Fill Rate Progress */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Registration Fill Rate</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: fillColor }}>{stats.fillPercentage}%</span>
                    </div>
                    <div style={{ width: '100%', height: '12px', borderRadius: '6px', background: 'var(--color-border)', overflow: 'hidden' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(stats.fillPercentage, 100)}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            style={{ height: '100%', borderRadius: '6px', background: `linear-gradient(90deg, ${fillColor}, ${fillColor}dd)` }}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>
                        <span>0</span>
                        <span>{stats.registrationCount} / {stats.totalSlots || '∞'} registered</span>
                        <span>{stats.totalSlots || '∞'}</span>
                    </div>
                </div>

                {/* Participants Table */}
                <div style={{ ...cardStyle, overflowX: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <IoPeople size={18} style={{ color: 'var(--color-accent)' }} /> Registered Participants ({participants.length})
                        </h2>
                    </div>

                    {participants.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👥</div>
                            <h3 style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.35rem' }}>No Participants Yet</h3>
                            <p style={{ fontSize: '0.85rem' }}>Share your event to get registrations!</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                                    {['#', 'Participant Name', 'Email Address', 'Registration Date', 'Status'].map(h => (
                                        <th key={h} style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {participants.map((p, i) => (
                                    <tr key={p._id || i} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '0.75rem', color: 'var(--color-text-dim)', fontWeight: 600 }}>{i + 1}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dim))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, color: '#0a1628', flexShrink: 0 }}>
                                                    {p.name?.[0]?.toUpperCase() || '?'}
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{p.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><IoMail size={13} /> {p.email}</span>
                                        </td>
                                        <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)' }}>{new Date(p.registrationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span style={{ display: 'inline-block', padding: '0.2rem 0.65rem', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: 600, background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
                                                {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

            </motion.div>
        </div>
    );
}
