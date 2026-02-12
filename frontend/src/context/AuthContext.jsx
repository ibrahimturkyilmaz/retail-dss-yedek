import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for existing session on mount
        const storedUser = localStorage.getItem('user_session');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user session", e);
                localStorage.removeItem('user_session');
            }
        }
        setLoading(false);
    }, []);

    const login = (username, password) => {
        // Mock authentication logic
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (username === 'admin' && password === 'admin123') {
                    const userData = { username: 'admin', role: 'admin', name: 'Yönetici' };
                    setUser(userData);
                    localStorage.setItem('user_session', JSON.stringify(userData));
                    resolve(userData);
                } else if (username === 'user1' && password === 'user123') {
                    const userData = { username: 'user1', role: 'user', name: 'Kullanıcı 1' };
                    setUser(userData);
                    localStorage.setItem('user_session', JSON.stringify(userData));
                    resolve(userData);
                } else {
                    reject(new Error('Kullanıcı adı veya şifre hatalı'));
                }
            }, 500); // Simulate network delay
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user_session');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
