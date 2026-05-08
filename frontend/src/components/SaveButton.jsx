import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { IoBookmark, IoBookmarkOutline } from 'react-icons/io5';
import { motion } from 'framer-motion';

export default function SaveButton({ eventId, style = {} }) {
    const { user } = useAuth();
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && eventId) {
            API.get(`/saved/check/${eventId}`)
                .then((res) => setSaved(res.data.saved))
                .catch(() => { });
        }
    }, [user, eventId]);

    const toggleSave = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user || loading) return;
        setLoading(true);
        try {
            const { data } = await API.post('/saved', { eventId });
            setSaved(data.saved);
        } catch (err) {
            console.error('Save error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={toggleSave}
            style={{
                background: saved ? 'var(--color-accent)' : 'rgba(0,0,0,0.5)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.3s ease',
                ...style,
            }}
            title={saved ? 'Unsave event' : 'Save event'}
        >
            {saved ? (
                <IoBookmark size={18} color="#0a1628" />
            ) : (
                <IoBookmarkOutline size={18} color="#fff" />
            )}
        </motion.button>
    );
}
