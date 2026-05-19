import type { User } from '../types';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const setToken = (token: string): void => {
    try {
        localStorage.setItem(TOKEN_KEY, token);
    } catch { /* ignore */ }
};

export const getToken = (): string | null => {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
};

export const removeToken = (): void => {
    try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    } catch { /* ignore */ }
};

export const setUser = (user: User): void => {
    try {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch { /* ignore */ }
};

export const getUser = (): User | null => {
    try {
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    } catch {
        return null;
    }
};

export const getAuthHeaders = (): HeadersInit => {
    const token = getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const isAuthenticated = (): boolean => {
    return !!getToken();
};
