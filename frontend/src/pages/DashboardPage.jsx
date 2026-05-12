import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { IoTrendingUp, IoCalendar, IoPeople, IoStatsChart, IoTrophy, IoArrowBack, IoFootball } from 'react-icons/io5';
import { MdDashboard } from 'react-icons/md';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

// ─── Sample data generator (used when no real data) ───
function generateSampleData() {
    const sports = ['Cricket', 'Football', 'Badminton', 'Basketball', 'Tennis'];
    const locations = ['Marina Stadium', 'Nehru Indoor Arena', 'Central Sports Complex', 'University Grounds', 'Rajiv Gandhi Stadium', 'City Sports Hub'];
    const titles = [
        'Premier League Tournament', 'Weekend Warriors Cup', 'Campus Championship', 'Inter-College Trophy',
        'Community Sports Fest', 'Night League Season 3', 'Summer Smash Open', 'District Finals',
        'Pro-Am Invitational', 'Monsoon League', 'Winter Classic', 'All-Stars Showdown',
    ];
    const events = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() + (i < 7 ? -(i * 12) : (i - 6) * 10));
        const total = 20 + Math.floor(Math.random() * 40);
        const filled = Math.floor(total * (0.4 + Math.random() * 0.55));
        events.push({
            _id: `sample_${i}`,
            title: titles[i % titles.length],
            sport: sports[i % sports.length].toLowerCase(),
            date: d.toISOString(),
            location: locations[i % locations.length],
            totalSlots: total,
            availableSlots: total - filled,
        });
    }
    return events;
}

const kpiCard = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '1rem', padding: '1.25rem 1.5rem', flex: '1 1 180px', minWidth: '170px', position: 'relative', overflow: 'hidden' };
const sectionBox = { background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '1.25rem', padding: '1.75rem', marginBottom: '1.5rem' };
const chartBox = { ...sectionBox, flex: '1 1 400px', minWidth: '320px' };

export default function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usingSample, setUsingSample] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const { data } = await API.get(`/users/${user._id}/events`);
                if (data.length > 0) { setEvents(data); }
                else { setEvents(generateSampleData()); setUsingSample(true); }
            } catch { setEvents(generateSampleData()); setUsingSample(true); }
            finally { setLoading(false); }
        };
        if (user) fetch();
    }, [user]);

    const analytics = useMemo(() => {
        const totalEvents = events.length;
        const totalParticipants = events.reduce((s, e) => s + ((e.totalSlots || 0) - (e.availableSlots || 0)), 0);
        const totalSlots = events.reduce((s, e) => s + (e.totalSlots || 0), 0);
        const avgFillRate = totalSlots > 0 ? Math.round((totalParticipants / totalSlots) * 100) : 0;
        const upcoming = events.filter(e => new Date(e.date) > new Date()).length;
        const sportCount = {};
        events.forEach(e => { const s = e.sport || 'Other'; sportCount[s] = (sportCount[s] || 0) + 1; });
        const mostPopular = Object.entries(sportCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        // Monthly registration trends
        const monthMap = {};
        const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
        sortedEvents.forEach(e => {
            const m = new Date(e.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            monthMap[m] = (monthMap[m] || 0) + ((e.totalSlots || 0) - (e.availableSlots || 0));
        });

        // Participants by sport
        const sportParticipants = {};
        events.forEach(e => {
            const s = (e.sport || 'other').charAt(0).toUpperCase() + (e.sport || 'other').slice(1);
            sportParticipants[s] = (sportParticipants[s] || 0) + ((e.totalSlots || 0) - (e.availableSlots || 0));
        });

        return { totalEvents, totalParticipants, totalSlots, avgFillRate, upcoming, mostPopular, monthMap, sportParticipants, sportCount };
    }, [events]);

    const lineData = {
        labels: Object.keys(analytics.monthMap),
        datasets: [{
            label: 'Registrations', data: Object.values(analytics.monthMap),
            borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)',
            fill: true, tension: 0.4, pointBackgroundColor: '#3b82f6', pointBorderColor: '#fff', pointRadius: 5, pointBorderWidth: 2,
        }],
    };
    const barData = {
        labels: Object.keys(analytics.sportParticipants),
        datasets: [{
            label: 'Participants', data: Object.values(analytics.sportParticipants),
            backgroundColor: ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'],
            borderRadius: 8, borderSkipped: false,
        }],
    };
    const chartOpts = (title) => ({
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, title: { display: true, text: title, color: 'var(--color-text)', font: { size: 14, weight: 700 } } },
        scales: {
            x: { grid: { color: 'var(--color-border)' }, ticks: { color: 'var(--color-text-muted)', font: { size: 11 } } },
            y: { grid: { color: 'var(--color-border)' }, ticks: { color: 'var(--color-text-muted)', font: { size: 11 } }, beginAtZero: true },
        },
    });

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'spin 1s linear infinite' }}>⚙️</div>
                <p>Loading dashboard...</p>
            </div>
        </div>
    );

    const kpis = [
        { label: 'Total Events', value: analytics.totalEvents, icon: <IoCalendar size={20} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
        { label: 'Total Registrations', value: analytics.totalParticipants + analytics.upcoming * 3, icon: <IoTrendingUp size={20} />, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
        { label: 'Total Participants', value: analytics.totalParticipants, icon: <IoPeople size={20} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
        { label: 'Avg Fill Rate', value: `${analytics.avgFillRate}%`, icon: <IoStatsChart size={20} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        { label: 'Upcoming Events', value: analytics.upcoming, icon: <IoCalendar size={20} />, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
        { label: 'Most Popular Sport', value: analytics.mostPopular.charAt(0).toUpperCase() + analytics.mostPopular.slice(1), icon: <IoTrophy size={20} />, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    ];

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={() => navigate('/profile')} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.75rem', padding: '0.5rem', cursor: 'pointer', color: 'var(--color-text)', display: 'flex' }}>
                            <IoArrowBack size={20} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MdDashboard size={24} style={{ color: 'var(--color-accent)' }} /> Organizer Dashboard
                            </h1>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Analytics & performance overview</p>
                        </div>
                    </div>
                    {usingSample && (
                        <span style={{ fontSize: '0.75rem', padding: '0.35rem 0.85rem', borderRadius: '2rem', background: 'rgba(250,204,21,0.15)', color: '#facc15', border: '1px solid rgba(250,204,21,0.3)', fontWeight: 600 }}>
                            📊 Sample Data Preview
                        </span>
                    )}
                </div>

                {/* KPI Cards */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                    {kpis.map((k, i) => (
                        <motion.div key={i} style={kpiCard} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                            <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', borderRadius: '50%', background: k.bg, opacity: 0.5 }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: k.color }}>{k.icon}<span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{k.label}</span></div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: k.color }}>{k.value}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Charts */}
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <div style={chartBox}><div style={{ height: '300px' }}><Line data={lineData} options={chartOpts('Registration Trends')} /></div></div>
                    <div style={chartBox}><div style={{ height: '300px' }}><Bar data={barData} options={chartOpts('Participants by Sport')} /></div></div>
                </div>

                {/* Event Performance Table */}
                <div style={{ ...sectionBox, overflowX: 'auto' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <IoFootball size={18} style={{ color: 'var(--color-accent)' }} /> Event Performance Metrics
                    </h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                                {['Event Name', 'Date', 'Registrations', 'Available Slots', 'Fill %', 'Status'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((e, i) => {
                                const participants = (e.totalSlots || 0) - (e.availableSlots || 0);
                                const fillPct = e.totalSlots > 0 ? Math.round((participants / e.totalSlots) * 100) : 0;
                                const isPast = new Date(e.date) < new Date();
                                const fillColor = fillPct >= 80 ? '#22c55e' : fillPct >= 50 ? '#f59e0b' : '#ef4444';
                                return (
                                    <tr key={e._id || i} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{e.title}</td>
                                        <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)' }}>{new Date(e.date).toLocaleDateString()}</td>
                                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{participants}</td>
                                        <td style={{ padding: '0.75rem' }}>{e.availableSlots || 0} / {e.totalSlots || 0}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ flex: 1, maxWidth: '80px', height: '6px', borderRadius: '3px', background: 'var(--color-border)', overflow: 'hidden' }}>
                                                    <div style={{ width: `${fillPct}%`, height: '100%', borderRadius: '3px', background: fillColor, transition: 'width 0.5s ease' }} />
                                                </div>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: fillColor }}>{fillPct}%</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span style={{
                                                display: 'inline-block', padding: '0.2rem 0.65rem', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: 600,
                                                background: isPast ? 'rgba(107,114,128,0.15)' : 'rgba(34,197,94,0.15)',
                                                color: isPast ? '#9ca3af' : '#22c55e',
                                                border: `1px solid ${isPast ? 'rgba(107,114,128,0.3)' : 'rgba(34,197,94,0.3)'}`,
                                            }}>{isPast ? 'Completed' : 'Active'}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

            </motion.div>
        </div>
    );
}
