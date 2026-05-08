import { useState, useEffect, useCallback } from 'react';
import { IoSearch, IoCloseCircle } from 'react-icons/io5';

export default function SearchBar({ onSearch, placeholder = 'Search events...' }) {
    const [query, setQuery] = useState('');

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(query);
        }, 400);
        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <IoSearch
                size={18}
                style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-dim)',
                }}
            />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="input-field"
                style={{ paddingLeft: '2.75rem', paddingRight: query ? '2.5rem' : '1rem' }}
            />
            {query && (
                <button
                    onClick={() => setQuery('')}
                    style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-dim)',
                        cursor: 'pointer',
                        display: 'flex',
                    }}
                >
                    <IoCloseCircle size={18} />
                </button>
            )}
        </div>
    );
}
