import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';
import { IoImage, IoClose } from 'react-icons/io5';

const sportOptions = ['football', 'cricket', 'basketball', 'badminton', 'tennis', 'volleyball', 'hockey', 'swimming', 'athletics', 'rugby', 'other'];

const TN_DISTRICTS = [
    '', 'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
    'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram',
    'Kanniyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
    'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
    'Ramanathapuram', 'Ranipet', 'Salem', 'Sivagangai', 'Tenkasi',
    'Thanjavur', 'Theni', 'Thoothukudi (Tuticorin)', 'Tiruchirappalli',
    'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvallur',
    'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar',
];

export default function CreateEventPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '',
        sport: 'football',
        description: '',
        date: '',
        location: '',
        district: '',
        registrationLink: '',
        price: '',
        totalSlots: '',
        isTournament: false,
    });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            if (image) fd.append('posterImage', image);
            await API.post('/events', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            navigate('/events');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    return (
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Create <span className="text-gradient">Event</span></h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Share your sports event with the community</p>

                {error && <div style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: '#ff4757', fontSize: '0.8rem', marginBottom: '1.5rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Image Upload */}
                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'block' }}>Event Poster</label>
                        {preview ? (
                            <div style={{ position: 'relative', borderRadius: '1rem', overflow: 'hidden' }}>
                                <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', display: 'block', borderRadius: '1rem' }} />
                                <button type="button" onClick={() => { setImage(null); setPreview(null) }} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><IoClose size={18} /></button>
                            </div>
                        ) : (
                            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', border: '2px dashed var(--color-border)', borderRadius: '1rem', cursor: 'pointer', background: 'var(--color-surface)', transition: 'border-color 0.3s' }}>
                                <IoImage size={36} style={{ color: 'var(--color-text-dim)', marginBottom: '0.75rem' }} />
                                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Click to upload poster image</span>
                                <span style={{ color: 'var(--color-text-dim)', fontSize: '0.75rem', marginTop: '0.25rem' }}>JPG, PNG, WebP — Max 5MB</span>
                                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                            </label>
                        )}
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.4rem', display: 'block' }}>Event Title</label>
                        <input type="text" className="input-field" placeholder="e.g. Inter-College Football Tournament" value={form.title} onChange={e => update('title', e.target.value)} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.4rem', display: 'block' }}>Sport Type</label>
                            <select className="input-field" value={form.sport} onChange={e => update('sport', e.target.value)} style={{ textTransform: 'capitalize' }}>
                                {sportOptions.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.4rem', display: 'block' }}>Event Date</label>
                            <input type="datetime-local" className="input-field" value={form.date} onChange={e => update('date', e.target.value)} required />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.4rem', display: 'block' }}>Location</label>
                        <input type="text" className="input-field" placeholder="e.g. Sports Complex, Chennai" value={form.location} onChange={e => update('location', e.target.value)} required />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.4rem', display: 'block' }}>District</label>
                        <select className="input-field" value={form.district} onChange={e => update('district', e.target.value)}>
                            <option value="">Select District (Optional)</option>
                            {TN_DISTRICTS.filter(Boolean).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    {/* Price & Slots */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.4rem', display: 'block' }}>Price per Player (₹)</label>
                            <input
                                type="number"
                                className="input-field"
                                placeholder="0 = Free"
                                min="0"
                                value={form.price}
                                onChange={e => update('price', e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.4rem', display: 'block' }}>Total Slots</label>
                            <input
                                type="number"
                                className="input-field"
                                placeholder="0 = Unlimited"
                                min="0"
                                value={form.totalSlots}
                                onChange={e => update('totalSlots', e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.4rem', display: 'block' }}>Description</label>
                        <textarea className="input-field" rows={5} placeholder="Tell people about your event — rules, prizes, format, etc." value={form.description} onChange={e => update('description', e.target.value)} required style={{ resize: 'vertical', fontFamily: 'var(--font-sans)' }} />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.4rem', display: 'block' }}>Registration Link (Optional)</label>
                        <input type="url" className="input-field" placeholder="https://forms.gle/..." value={form.registrationLink} onChange={e => update('registrationLink', e.target.value)} />
                    </div>

                    {/* Tournament Toggle */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '1rem',
                        background: form.isTournament ? 'rgba(255, 107, 53, 0.08)' : 'var(--color-surface)',
                        borderRadius: '0.75rem',
                        border: `1px solid ${form.isTournament ? 'rgba(255, 107, 53, 0.3)' : 'var(--color-border)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                    }} onClick={() => update('isTournament', !form.isTournament)}>
                        <div style={{
                            width: '44px',
                            height: '24px',
                            borderRadius: '12px',
                            background: form.isTournament ? '#ff6b35' : 'var(--color-border)',
                            position: 'relative',
                            transition: 'background 0.25s ease',
                            flexShrink: 0,
                        }}>
                            <div style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: '#fff',
                                position: 'absolute',
                                top: '3px',
                                left: form.isTournament ? '23px' : '3px',
                                transition: 'left 0.25s ease',
                            }} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: form.isTournament ? '#ff6b35' : 'var(--color-text)' }}>
                                🏆 Tournament Event
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: '0.15rem' }}>
                                Enable team registration for this event
                            </div>
                        </div>
                    </div>

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn-primary" disabled={loading} style={{ padding: '0.85rem', fontSize: '1rem', width: '100%', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Publishing...' : 'Publish Event 🚀'}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}
