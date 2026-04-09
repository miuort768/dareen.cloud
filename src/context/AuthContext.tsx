import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { api } from '../lib/api';
import type { User } from '../types/auth';

interface AuthContextType {
    currentUser: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
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
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                // If we thought we were authenticated but have no token, fix the state
                if (localStorage.getItem('app_isAuthenticated') === 'true') {
                    localStorage.removeItem('app_isAuthenticated');
                    localStorage.removeItem('app_current_user');
                    setIsAuthenticated(false);
                    setCurrentUser(null);
                }
                setIsLoading(false);
                return;
            }

            try {
                // Use api.post which will handle the token verification
                const data = await api.post<{ valid: boolean, user: User }>('/auth/verify', { token });

                if (data.valid) {
                    setIsAuthenticated(true);
                    if (data.user) {
                        setCurrentUser(data.user);
                    }
                } else {
                    logout();
                }
            } catch (error) {
                console.error("Token verification failed:", error);
                // On error, we might want to logout if it's a 401, but api utility handles 401
            } finally {
                setIsLoading(false);
            }
        };

        verifyToken();
    }, []);

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
            const { token, user: loggedInUser } = await api.post<{ token: string, user: User }>('/auth/login', { username, password });
            localStorage.setItem('auth_token', token);
            setCurrentUser(loggedInUser);
            setIsAuthenticated(true);
            return true;
        } catch (error: any) {
            console.error("Authentication failed:", error);
            if (error.message?.includes('Invalid credentials') || error.message?.includes('401')) {
                return false;
            }
            throw error;
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

        try {
            await api.put(`/system/users/${currentUser.id}`, updated);
            setCurrentUser(updated);
        } catch (e) {
            console.error("Error updating user:", e);
            throw e;
        }
    };

    useEffect(() => {
        if (isAuthenticated && currentUser) {
            // Silently try to subscribe if permission is already granted
            import('../services/pushService').then(({ pushService }) => {
                pushService.checkPermission().then(permission => {
                    if (permission === 'granted') {
                        pushService.subscribeUser(currentUser.id);
                    }
                });
            });
        }
    }, [isAuthenticated, currentUser]);

    return (
        <AuthContext.Provider value={{ currentUser, isAuthenticated, isLoading, login, logout, updateCurrentUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
