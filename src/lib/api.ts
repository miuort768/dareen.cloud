import { API_BASE_URL } from '../config/api';

type FetchOptions = RequestInit & {
    params?: Record<string, string>;
};

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let errorMessage = 'حدث خطأ ما في الاتصال بالسيرفر';
        try {
            const error = await response.json();
            errorMessage = error.message || errorMessage;
        } catch (e) {
            // If response is not JSON
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
                ...options.headers,
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
                ...options.headers,
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
                ...options.headers,
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
        });
        return handleResponse<T>(response);
    },
};
