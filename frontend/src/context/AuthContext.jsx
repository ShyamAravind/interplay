import { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('interplay_user');
        return stored ? JSON.parse(stored) : null;
    });
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const { data } = await API.post('/auth/login', { email, password });
            setUser(data);
            localStorage.setItem('interplay_user', JSON.stringify(data));
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Login failed' };
        } finally {
            setLoading(false);
        }
    };

    const signup = async (name, email, password) => {
        setLoading(true);
        try {
            const { data } = await API.post('/auth/signup', { name, email, password });
            setUser(data);
            localStorage.setItem('interplay_user', JSON.stringify(data));
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Signup failed' };
        } finally {
            setLoading(false);
        }
    };

    const googleLogin = async (credentialResponse) => {
        setLoading(true);
        try {
            // Decode the JWT credential from Google
            const payload = JSON.parse(atob(credentialResponse.credential.split('.')[1]));

            const { data } = await API.post('/auth/google', {
                googleId: payload.sub,
                email: payload.email,
                name: payload.name,
                profilePhoto: payload.picture,
            });

            setUser(data);
            localStorage.setItem('interplay_user', JSON.stringify(data));
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Google login failed' };
        } finally {
            setLoading(false);
        }
    };

    const updateUser = (updatedData) => {
        const newUser = { ...user, ...updatedData };
        setUser(newUser);
        localStorage.setItem('interplay_user', JSON.stringify(newUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('interplay_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, googleLogin, updateUser, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
