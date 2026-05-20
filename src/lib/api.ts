import { API_BASE_URL } from '../config/api';

type FetchOptions = RequestInit & {
    params?: Record<string, string>;
};

class ApiClient {
    private baseUrl: string;
    private activeRequests: number;

    constructor() {
        this.baseUrl = API_BASE_URL;
        this.activeRequests = 0;
    }

    private getAuthHeader(): Record<string, string> {
        const token = localStorage.getItem('auth_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    private async fetchWithProgress(input: string, init?: RequestInit, timeout = 15000): Promise<Response> {
        if (this.activeRequests === 0) {
            // NProgress.start() can be loaded here in the future
        }
        this.activeRequests++;

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        const combinedInit: RequestInit = {
            ...init,
            signal: (init as any)?.signal || controller.signal,
        };

        try {
            return await fetch(input, combinedInit);
        } finally {
            clearTimeout(timer);
            this.activeRequests = Math.max(0, this.activeRequests - 1);
            if (this.activeRequests === 0) {
                // NProgress.done() can be called here in the future
            }
        }
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (response.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('app_isAuthenticated');
            localStorage.removeItem('app_current_user');
            
            // Fire global logout event to sync tabs and Zustand stores
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('auth_logout'));
            }
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

    private buildUrl(url: string, params?: Record<string, string>): string {
        let fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
        if (params) {
            const searchParams = new URLSearchParams(params).toString();
            const separator = fullUrl.includes('?') ? '&' : '?';
            fullUrl += `${separator}${searchParams}`;
        }
        return fullUrl;
    }

    public async get<T>(url: string, options: FetchOptions = {}): Promise<T> {
        const fullUrl = this.buildUrl(url, options.params);
        const response = await this.fetchWithProgress(fullUrl, {
            ...options,
            method: 'GET',
            headers: {
                ...this.getAuthHeader(),
                ...options.headers as Record<string, string>,
            },
        });
        return this.handleResponse<T>(response);
    }

    public async post<T>(url: string, data?: unknown, options: FetchOptions = {}): Promise<T> {
        const fullUrl = this.buildUrl(url, options.params);
        const response = await this.fetchWithProgress(fullUrl, {
            ...options,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeader(),
                ...options.headers as Record<string, string>,
            },
            body: data ? JSON.stringify(data) : undefined,
        });
        return this.handleResponse<T>(response);
    }

    public async put<T>(url: string, data?: unknown, options: FetchOptions = {}): Promise<T> {
        const fullUrl = this.buildUrl(url, options.params);
        const response = await this.fetchWithProgress(fullUrl, {
            ...options,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeader(),
                ...options.headers as Record<string, string>,
            },
            body: data ? JSON.stringify(data) : undefined,
        });
        return this.handleResponse<T>(response);
    }

    public async patch<T>(url: string, data?: unknown, options: FetchOptions = {}): Promise<T> {
        const fullUrl = this.buildUrl(url, options.params);
        const response = await this.fetchWithProgress(fullUrl, {
            ...options,
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeader(),
                ...options.headers as Record<string, string>,
            },
            body: data ? JSON.stringify(data) : undefined,
        });
        return this.handleResponse<T>(response);
    }

    public async delete<T>(url: string, options: FetchOptions = {}): Promise<T> {
        const fullUrl = this.buildUrl(url, options.params);
        const response = await this.fetchWithProgress(fullUrl, {
            ...options,
            method: 'DELETE',
            headers: {
                ...this.getAuthHeader(),
                ...options.headers as Record<string, string>,
            },
        });
        return this.handleResponse<T>(response);
    }
}

export const api = new ApiClient();
