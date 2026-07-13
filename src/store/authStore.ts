import { create } from 'zustand';
import { api } from '../lib/api';
import type { User } from '../types/auth';

interface AuthState {
    currentUser: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    token: string | null;
    login: (username: string, password?: string) => Promise<boolean>;
    logout: () => void;
    updateCurrentUser: (updates: Partial<User>) => Promise<void>;
    verifyToken: () => Promise<void>;
}

// Initial state helpers
const getSavedUser = (): User | null => {
    try {
        const saved = localStorage.getItem('app_current_user');
        return saved ? JSON.parse(saved) : null;
    } catch {
        localStorage.removeItem('app_current_user');
        return null;
    }
};

const getSavedIsAuthenticated = (): boolean => {
    try {
        return localStorage.getItem('app_isAuthenticated') === 'true';
    } catch {
        return false;
    }
};

export const useAuthStore = create<AuthState>((set, get) => ({
    currentUser: getSavedUser(),
    isAuthenticated: getSavedIsAuthenticated(),
    isLoading: true,
    token: localStorage.getItem('auth_token'),

    login: async (username: string, password?: string) => {
        try {
            const { token, user } = await api.post<{ token: string; user: User }>('/auth/login', { username, password });
            localStorage.setItem('auth_token', token);
            localStorage.setItem('app_current_user', JSON.stringify(user));
            localStorage.setItem('app_isAuthenticated', 'true');
            set({ token, currentUser: user, isAuthenticated: true, isLoading: false });

            // Subscribe to push notifications if permission is granted
            import('../services/pushService').then(({ pushService }) => {
                pushService.checkPermission().then(permission => {
                    if (permission === 'granted') {
                        pushService.subscribeUser();
                    }
                });
            });

            return true;
        } catch (error) {
            console.error("Authentication failed:", error);
            if (error instanceof Error && (error.message?.includes('Invalid credentials') || error.message?.includes('401'))) {
                return false;
            }
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('app_current_user');
        localStorage.setItem('app_isAuthenticated', 'false');
        set({ token: null, currentUser: null, isAuthenticated: false, isLoading: false });
    },

    updateCurrentUser: async (updates: Partial<User>) => {
        const { currentUser } = get();
        if (!currentUser) return;
        const updated = { ...currentUser, ...updates };

        try {
            await api.put(`/system/users/${currentUser.id}`, updated);
            localStorage.setItem('app_current_user', JSON.stringify(updated));
            set({ currentUser: updated });
        } catch (e) {
            console.error("Error updating user:", e);
            throw e;
        }
    },

    verifyToken: async () => {
        const { token, logout } = get();
        if (!token) {
            if (localStorage.getItem('app_isAuthenticated') === 'true') {
                logout();
            }
            set({ isLoading: false });
            return;
        }

        try {
            const data = await api.post<{ valid: boolean; user: User }>('/auth/verify', { token });
            if (data.valid && data.user) {
                localStorage.setItem('app_current_user', JSON.stringify(data.user));
                localStorage.setItem('app_isAuthenticated', 'true');
                set({ currentUser: data.user, isAuthenticated: true });

                // Silently subscribe if push permission is granted
                import('../services/pushService').then(({ pushService }) => {
                    pushService.checkPermission().then(permission => {
                        if (permission === 'granted') {
                            pushService.subscribeUser();
                        }
                    });
                });
            } else {
                logout();
            }
        } catch (error) {
            console.error("Token verification failed:", error);
            // Keep state on API issues, let standard API 401 interceptor handle stale tokens
        } finally {
            set({ isLoading: false });
        }
    }
}));

// Auto-verify token on store initialization (deferred to avoid TDZ issues)
if (typeof window !== 'undefined') {
    queueMicrotask(() => useAuthStore.getState().verifyToken());
}

// Setup global auth logout event listener
if (typeof window !== 'undefined') {
    window.addEventListener('auth_logout', () => {
        useAuthStore.getState().logout();
    });
}
