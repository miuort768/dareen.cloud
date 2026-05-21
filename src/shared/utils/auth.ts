import { api } from '../../lib/api';

export const authUtils = {
    login: async (credentials: { username: string; password?: string }) => {
        return api.post('/login', credentials);
    },

    logout: () => {
        try {
            localStorage.removeItem('user');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('app_isAuthenticated');
        } catch { /* ignore */ }
        window.location.href = '/login';
    },

    getCurrentUser: () => {
        try {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch {
            return null;
        }
    }
};
