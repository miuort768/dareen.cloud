import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { API_BASE_URL } from '../config/api';
import type { User } from '../types/auth';

interface AuthContextType {
    currentUser: User | null;
    isAuthenticated: boolean;
    login: (username: string, password?: string) => Promise<boolean>;
    logout: () => void;
    updateCurrentUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('app_current_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [isAuthenticated, setIsAuthenticated] = useState(() =>
        localStorage.getItem('app_isAuthenticated') === 'true'
    );

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('app_current_user', JSON.stringify(currentUser));
            localStorage.setItem('app_isAuthenticated', 'true');
        } else {
            localStorage.removeItem('app_current_user');
            localStorage.setItem('app_isAuthenticated', 'false');
        }
    }, [currentUser]);

    const login = async (username: string, password?: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    return false; // Invalid credentials
                }
                throw new Error(`Server error: ${response.status}`);
            }

            const { token, user: loggedInUser } = await response.json();
            localStorage.setItem('auth_token', token);
            setCurrentUser(loggedInUser);
            setIsAuthenticated(true);
            return true;
        } catch (error) {
            console.error("Authentication failed:", error);
            throw error; // Re-throw to be caught by UI
        }
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('app_current_user');
        setIsAuthenticated(false);
        setCurrentUser(null);
    };

    const updateCurrentUser = async (updates: Partial<User>) => {
        if (!currentUser) return;
        const updated = { ...currentUser, ...updates };
        setCurrentUser(updated);

        try {
            await fetch(`${API_BASE_URL}/system/users/${currentUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            });
        } catch (e) {
            console.error("Error updating user:", e);
        }
    };

    return (
        <AuthContext.Provider value={{ currentUser, isAuthenticated, login, logout, updateCurrentUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
