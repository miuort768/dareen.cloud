import { api } from '../../lib/api';

export const authUtils = {
    login: async (credentials: any) => {
        return api.post('/login', credentials);
    },

    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('app_isAuthenticated');
        window.location.href = '/login';
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};
