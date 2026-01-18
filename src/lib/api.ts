import { API_BASE_URL } from '../config/api';

type FetchOptions = RequestInit & {
    params?: Record<string, string>;
};

const getAuthHeader = (): Record<string, string> => {
    const token = localStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

async function handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('app_isAuthenticated');
        // window.location.href = '/login';
    }

    if (!response.ok) {
        let errorMessage = 'حدث خطأ ما في الاتصال بالسيرفر';
        try {
            const error = await response.json();
            errorMessage = error.error || error.message || errorMessage;
        } catch (e) {
            errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
    }
    return response.json();
}

export const api = {
    async get<T>(url: string, options: FetchOptions = {}): Promise<T> {
        let fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
        if (options.params) {
            const params = new URLSearchParams(options.params).toString();
            fullUrl += `?${params}`;
        }
        const response = await fetch(fullUrl, {
            ...options,
            method: 'GET',
            headers: {
                ...getAuthHeader(),
                ...options.headers as Record<string, string>,
            },
        });
        return handleResponse<T>(response);
    },

    async post<T>(url: string, data?: unknown, options: FetchOptions = {}): Promise<T> {
        const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
        const response = await fetch(fullUrl, {
            ...options,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader(),
                ...options.headers as Record<string, string>,
            },
            body: data ? JSON.stringify(data) : undefined,
        });
        return handleResponse<T>(response);
    },

    async put<T>(url: string, data?: unknown, options: FetchOptions = {}): Promise<T> {
        const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
        const response = await fetch(fullUrl, {
            ...options,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader(),
                ...options.headers as Record<string, string>,
            },
            body: data ? JSON.stringify(data) : undefined,
        });
        return handleResponse<T>(response);
    },

    async patch<T>(url: string, data?: unknown, options: FetchOptions = {}): Promise<T> {
        const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
        const response = await fetch(fullUrl, {
            ...options,
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader(),
                ...options.headers as Record<string, string>,
            },
            body: data ? JSON.stringify(data) : undefined,
        });
        return handleResponse<T>(response);
    },

    async delete<T>(url: string, options: FetchOptions = {}): Promise<T> {
        const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
        const response = await fetch(fullUrl, {
            ...options,
            method: 'DELETE',
            headers: {
                ...getAuthHeader(),
                ...options.headers as Record<string, string>,
            },
        });
        return handleResponse<T>(response);
    },
};
