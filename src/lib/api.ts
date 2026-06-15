import { API_BASE_URL } from '../config/api';

type FetchOptions = RequestInit & {
    params?: Record<string, string>;
};

class ApiClient {
    private baseUrl: string;
    private refreshing: Promise<boolean> | null = null;
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    private getAuthHeader(): Record<string, string> {
        const token = localStorage.getItem('auth_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    private async refreshToken(): Promise<boolean> {
        const token = localStorage.getItem('auth_token');
        if (!token) return false;
        try {
            const res = await fetch(`${this.baseUrl}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });
            if (!res.ok) return false;
            const data = await res.json();
            if (data.token) {
                localStorage.setItem('auth_token', data.token);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }

    private async fetchWithProgress(input: string, init?: RequestInit, timeout = 15000): Promise<Response> {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        const combinedInit: RequestInit = {
            ...init,
            signal: (init as RequestInit)?.signal || controller.signal,
        };

        try {
            return await fetch(input, combinedInit);
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {
                throw new Error('انتهت مهلة الطلب، يرجى المحاولة مرة أخرى');
            }
            throw err;
        } finally {
            clearTimeout(timer);
        }
    }

    private async handleResponse<T>(response: Response, url?: string, init?: RequestInit): Promise<T> {
        if (response.status === 401 && url && url !== `${this.baseUrl}/auth/refresh`) {
            if (!this.refreshing) {
                this.refreshing = this.refreshToken();
            }
            const refreshed = await this.refreshing;
            this.refreshing = null;

            if (refreshed) {
                const newToken = localStorage.getItem('auth_token');
                const retryHeaders = { ...init?.headers as Record<string, string>, ...this.getAuthHeader() };
                let retryBody = init?.body;
                if (retryBody && typeof retryBody === 'string' && newToken) {
                    try {
                        const parsed = JSON.parse(retryBody);
                        if (parsed && typeof parsed === 'object' && parsed.token) {
                            parsed.token = newToken;
                            retryBody = JSON.stringify(parsed);
                        }
                    } catch { }
                }
                const retryRes = await this.fetchWithProgress(url, { ...init, headers: retryHeaders, body: retryBody });
                if (retryRes.ok) {
                    const text = await retryRes.text();
                    return text ? JSON.parse(text) : {} as T;
                }
            }

            localStorage.removeItem('auth_token');
            localStorage.removeItem('app_isAuthenticated');
            localStorage.removeItem('app_current_user');
            
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('auth_logout'));
            }

            throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
        }

        if (!response.ok) {
            let errorMessage = 'حدث خطأ ما في الاتصال بالسيرفر';
            try {
                const text = await response.text();
                try {
                    const error = JSON.parse(text);
                    errorMessage = error.error || error.message || errorMessage;
                } catch {
                    errorMessage = text || response.statusText || errorMessage;
                }
            } catch {
                errorMessage = response.statusText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        const text = await response.text();
        if (!text) return {} as T;
        return JSON.parse(text);
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
        const init = {
            ...options,
            method: 'GET',
            headers: {
                ...this.getAuthHeader(),
                ...options.headers as Record<string, string>,
            },
        };
        const response = await this.fetchWithProgress(fullUrl, init);
        return this.handleResponse<T>(response, fullUrl, init);
    }

    public async post<T>(url: string, data?: unknown, options: FetchOptions = {}): Promise<T> {
        const fullUrl = this.buildUrl(url, options.params);
        const init = {
            ...options,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeader(),
                ...options.headers as Record<string, string>,
            },
            body: data ? JSON.stringify(data) : undefined,
        };
        const response = await this.fetchWithProgress(fullUrl, init);
        return this.handleResponse<T>(response, fullUrl, init);
    }

    public async put<T>(url: string, data?: unknown, options: FetchOptions = {}): Promise<T> {
        const fullUrl = this.buildUrl(url, options.params);
        const init = {
            ...options,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeader(),
                ...options.headers as Record<string, string>,
            },
            body: data ? JSON.stringify(data) : undefined,
        };
        const response = await this.fetchWithProgress(fullUrl, init);
        return this.handleResponse<T>(response, fullUrl, init);
    }

    public async patch<T>(url: string, data?: unknown, options: FetchOptions = {}): Promise<T> {
        const fullUrl = this.buildUrl(url, options.params);
        const init = {
            ...options,
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeader(),
                ...options.headers as Record<string, string>,
            },
            body: data ? JSON.stringify(data) : undefined,
        };
        const response = await this.fetchWithProgress(fullUrl, init);
        return this.handleResponse<T>(response, fullUrl, init);
    }

    public async delete<T>(url: string, options: FetchOptions = {}): Promise<T> {
        const fullUrl = this.buildUrl(url, options.params);
        const init = {
            ...options,
            method: 'DELETE',
            headers: {
                ...this.getAuthHeader(),
                ...options.headers as Record<string, string>,
            },
        };
        const response = await this.fetchWithProgress(fullUrl, init);
        return this.handleResponse<T>(response, fullUrl, init);
    }
}

export const api = new ApiClient();
