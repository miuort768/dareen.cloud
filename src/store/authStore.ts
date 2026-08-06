import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            currentUser: null,
            isAuthenticated: false,
            isLoading: true,
            token: null,

            login: async (username: string, password?: string) => {
                try {
                    const res = await api.post<{ token: string; user: User }>('/auth/login', { username, password });
                    const token = res?.token;
                    const user = res?.user;
                    if (!token || !user) return false;
                    set({ token, currentUser: user, isAuthenticated: true, isLoading: false });
                    localStorage.setItem('auth_token', token);

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
                set({ token: null, currentUser: null, isAuthenticated: false, isLoading: false });
                localStorage.removeItem('auth_token');
            },

            updateCurrentUser: async (updates: Partial<User>) => {
                const { currentUser } = get();
                if (!currentUser) return;
                const updated = { ...currentUser, ...updates };

                try {
                    await api.put(`/system/users/${currentUser.id}`, updated);
                    set({ currentUser: updated });
                } catch (e) {
                    console.error("Error updating user:", e);
                    throw e;
                }
            },

            verifyToken: async () => {
                const { token, logout } = get();
                if (!token) {
                    set({ isLoading: false });
                    return;
                }

                try {
                    const data = await api.post<{ valid: boolean; user: User; token?: string }>('/auth/verify', { token });
                    if (data.valid && data.user) {
                        // Rolling token: server issues a fresh token on successful verify
                        if (data.token) {
                            set({ token: data.token });
                            localStorage.setItem('auth_token', data.token);
                        }
                        set({ currentUser: data.user, isAuthenticated: true });

                        import('../services/pushService').then(({ pushService }) => {
                            pushService.checkPermission().then(permission => {
                                if (permission === 'granted') {
                                    pushService.subscribeUser();
                                }
                            });
                        });
                    } else {
                        // Token verify failed (expired/revoked) — try refresh before logout
                        try {
                            const refreshData = await api.post<{ token: string }>('/auth/refresh', { token });
                            if (refreshData.token) {
                                set({ token: refreshData.token });
                                localStorage.setItem('auth_token', refreshData.token);
                                // Re-verify with the new token
                                const retryData = await api.post<{ valid: boolean; user: User; token?: string }>('/auth/verify', { token: refreshData.token });
                                if (retryData.valid && retryData.user) {
                                    if (retryData.token) {
                                        set({ token: retryData.token });
                                        localStorage.setItem('auth_token', retryData.token);
                                    }
                                    set({ currentUser: retryData.user, isAuthenticated: true });
                                    return;
                                }
                            }
                        } catch {
                            // Refresh failed (token_version revoked or user deleted)
                        }
                        logout();
                    }
                } catch (error) {
                    console.error("Token verification failed:", error);
                    // Keep state on API issues, let standard API 401 interceptor handle stale tokens
                } finally {
                    set({ isLoading: false });
                }
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                currentUser: state.currentUser,
                isAuthenticated: state.isAuthenticated,
                token: state.token,
            }),
            onRehydrateStorage: () => (state) => {
                // Sync token to localStorage('auth_token') so api.ts can read it
                if (state?.token) {
                    localStorage.setItem('auth_token', state.token);
                }
            },
        }
    )
);

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
