import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';
import EventCard from '../components/EventCard';
import { IoLocationOutline, IoNavigateOutline, IoListOutline, IoMapOutline } from 'react-icons/io5';

export default function NearbyEventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

    useEffect(() => {
        // Request user location
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (err) => {
                    setLocationError('Location access denied. Showing all events instead.');
                    console.warn('Geolocation error:', err);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            setLocationError('Geolocation is not supported by your browser.');
        }

        // Fetch all events
        const fetchEvents = async () => {
            try {
                const { data } = await API.get('/events', { params: { limit: 50 } });
                setEvents(data.events || []);
            } catch (err) {
                console.error('Failed to fetch events:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    // Initialize map when view mode changes to 'map'
    useEffect(() => {
        if (viewMode !== 'map' || !mapRef.current) return;

        // Dynamically load Leaflet CSS
        if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }

        // Dynamically load Leaflet JS
        const loadLeaflet = () => {
            return new Promise((resolve) => {
                if (window.L) {
                    resolve(window.L);
                    return;
                }
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                script.onload = () => resolve(window.L);
                document.head.appendChild(script);
            });
        };

        loadLeaflet().then((L) => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
            }

            const center = userLocation
                ? [userLocation.lat, userLocation.lng]
                : [13.0827, 80.2707]; // Tamil Nadu (Chennai)

            const map = L.map(mapRef.current).setView(center, userLocation ? 12 : 8);
            mapInstanceRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
            }).addTo(map);

            // Add user location marker
            if (userLocation) {
                const userIcon = L.divIcon({
                    html: `<div style="width:16px;height:16px;background:#39ff14;border:3px solid #0a1628;border-radius:50%;box-shadow:0 0 10px rgba(57,255,20,0.5)"></div>`,
                    iconSize: [16, 16],
                    className: '',
                });
                L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
                    .addTo(map)
                    .bindPopup('<strong>You are here</strong>');
            }

            // Add event markers using actual coordinates
            events.forEach((event, i) => {
                const lat = event.coordinates?.lat || 13.0827 + (i * 0.05);
                const lng = event.coordinates?.lng || 80.2707 + (i * 0.05);

                const sportEmoji = {
                    football: '⚽', cricket: '🏏', basketball: '🏀',
                    badminton: '🏸', tennis: '🎾', volleyball: '🏐',
                }[event.sport] || '🏆';

                const markerIcon = L.divIcon({
                    html: `<div style="width:28px;height:28px;background:${event.isTournament ? '#ff6b35' : '#0a1628'};border:2px solid #39ff14;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${sportEmoji}</div>`,
                    iconSize: [28, 28],
                    className: '',
                });

                L.marker([lat, lng], { icon: markerIcon })
                    .addTo(map)
                    .bindPopup(
                        `<div style="min-width:180px">
                            <strong style="font-size:14px">${event.title}</strong><br/>
                            <span style="font-size:12px;color:#666">📍 ${event.location}</span><br/>
                            <span style="font-size:12px;color:#666">🏅 ${event.sport}${event.isTournament ? ' (Tournament)' : ''}</span><br/>
                            <a href="/events/${event._id}" style="color:#16a34a;font-size:12px;font-weight:600">View Details →</a>
                        </div>`
                    );
            });
        });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [viewMode, events, userLocation]);

    return (
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                        Nearby <span className="text-gradient">Events</span>
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <IoLocationOutline size={16} />
                        {userLocation
                            ? `Events around your location`
                            : locationError || 'Detecting your location...'}
                    </p>
                </div>

                {/* View Toggle */}
                <div style={{ display: 'flex', background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '0.75rem', overflow: 'hidden' }}>
                    <button
                        onClick={() => setViewMode('list')}
                        style={{
                            padding: '0.6rem 1rem',
                            background: viewMode === 'list' ? 'rgba(57,255,20,0.15)' : 'transparent',
                            color: viewMode === 'list' ? 'var(--color-accent)' : 'var(--color-text-muted)',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            fontFamily: 'var(--font-sans)',
                        }}
                    >
                        <IoListOutline size={18} /> List
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        style={{
                            padding: '0.6rem 1rem',
                            background: viewMode === 'map' ? 'rgba(57,255,20,0.15)' : 'transparent',
                            color: viewMode === 'map' ? 'var(--color-accent)' : 'var(--color-text-muted)',
                            border: 'none',
                            borderLeft: '1px solid var(--color-border)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            fontFamily: 'var(--font-sans)',
                        }}
                    >
                        <IoMapOutline size={18} /> Map
                    </button>
                </div>
            </div>

            {/* Location indicator */}
            {userLocation && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: 'rgba(57, 255, 20, 0.1)',
                        border: '1px solid rgba(57, 255, 20, 0.3)',
                        borderRadius: '2rem',
                        fontSize: '0.8rem',
                        color: 'var(--color-accent)',
                        fontWeight: 500,
                        marginBottom: '1.5rem',
                    }}
                >
                    <IoNavigateOutline size={14} />
                    Location detected — showing nearby events
                </motion.div>
            )}

            {/* Map View */}
            {viewMode === 'map' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        borderRadius: '1.5rem',
                        overflow: 'hidden',
                        border: '1px solid var(--color-border)',
                        marginBottom: '2rem',
                    }}
                >
                    <div
                        ref={mapRef}
                        style={{
                            width: '100%',
                            height: '500px',
                            background: 'var(--color-card)',
                        }}
                    />
                </motion.div>
            )}

            {/* Events List */}
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
                            <div style={{ paddingTop: '56.25%', background: 'var(--color-surface)' }} />
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
                    style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-text-muted)' }}
                >
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📍</div>
                    <h3 style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>No Events Found Nearby</h3>
                    <p style={{ fontSize: '0.9rem' }}>Try checking back later or browse all events.</p>
                    <Link to="/events">
                        <button className="btn-primary" style={{ marginTop: '1.5rem' }}>Browse All Events</button>
                    </Link>
                </motion.div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    {events.map((event, i) => (
                        <EventCard key={event._id} event={event} index={i} />
                    ))}
                </div>
            )}
        </div>
    );
}
