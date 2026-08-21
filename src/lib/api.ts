import { API_BASE_URL } from '../config/api'

type FetchOptions = RequestInit & {
  params?: Record<string, string>
}

class ApiClient {
  private baseUrl: string
  private refreshing: Promise<boolean> | null = null
  constructor() {
    this.baseUrl = API_BASE_URL
  }

  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('auth_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  private async refreshToken(): Promise<boolean> {
    const token = localStorage.getItem('auth_token')
    if (!token) return false
    try {
      const res = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      if (!res.ok) return false
      const data = await res.json()
      if (data.token) {
        localStorage.setItem('auth_token', data.token)
        return true
      }
      return false
    } catch (e) {
      console.error(e)
      return false
    }
  }

  private async fetchWithProgress(
    input: string,
    init?: RequestInit,
    timeout = 15000,
  ): Promise<Response> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)
    const combinedInit: RequestInit = {
      ...init,
      signal: (init as RequestInit)?.signal || controller.signal,
    }

    try {
      return await fetch(input, combinedInit)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new Error('انتهت مهلة الطلب، يرجى المحاولة مرة أخرى')
      }
      throw err
    } finally {
      clearTimeout(timer)
    }
  }

  private async handleResponse<T>(
    response: Response,
    url?: string,
    init?: RequestInit,
  ): Promise<T> {
    if (
      response.status === 401 &&
      url &&
      !url.includes('/auth/login') &&
      url !== `${this.baseUrl}/auth/refresh`
    ) {
      if (!this.refreshing) {
        this.refreshing = this.refreshToken()
      }
      const refreshed = await this.refreshing
      this.refreshing = null

      if (refreshed) {
        const newToken = localStorage.getItem('auth_token')
        const retryHeaders = {
          ...(init?.headers as Record<string, string>),
          ...this.getAuthHeader(),
        }
        let retryBody = init?.body
        if (retryBody && typeof retryBody === 'string' && newToken) {
          try {
            const parsed = JSON.parse(retryBody)
            if (parsed && typeof parsed === 'object' && parsed.token) {
              parsed.token = newToken
              retryBody = JSON.stringify(parsed)
            }
          } catch (e) {
            console.warn(e)
          }
        }
        const retryRes = await this.fetchWithProgress(url, {
          ...init,
          headers: retryHeaders,
          body: retryBody,
        })
        if (retryRes.ok) {
          const text = await retryRes.text()
          return text ? JSON.parse(text) : ({} as T)
        }
      }

      localStorage.removeItem('auth_token')
      localStorage.removeItem('app_isAuthenticated')
      localStorage.removeItem('app_current_user')

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth_logout'))
      }

      throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى')
    }

    if (!response.ok) {
      let errorMessage =
        response.status >= 500
          ? 'الخدمة غير متاحة مؤقتًا، يرجى المحاولة بعد قليل'
          : 'حدث خطأ ما في الاتصال بالسيرفر'
      try {
        const text = await response.text()
        const looksLikeHtml = text.trim().startsWith('<')
        if (looksLikeHtml) {
          // 502/504 gateway HTML page — keep the friendly default message
          throw new Error(errorMessage)
        }
        try {
          const error = JSON.parse(text)
          errorMessage = error.error || error.message || errorMessage
          if (error.details && Array.isArray(error.details) && error.details.length > 0) {
            errorMessage +=
              ': ' +
              error.details.map((d: { field: string; message: string }) => d.message).join(' | ')
          }
        } catch (e) {
          if (e instanceof Error && e.message === errorMessage) throw e
          console.warn(e)
          errorMessage = text && text.length < 200 ? text : response.statusText || errorMessage
        }
      } catch (e) {
        if (e instanceof Error && e.message === errorMessage) throw e
        console.warn(e)
        errorMessage = response.statusText || errorMessage
      }
      throw new Error(errorMessage)
    }

    const text = await response.text()
    if (!text) return {} as T
    try {
      return JSON.parse(text)
    } catch {
      return text as unknown as T
    }
  }

  private buildUrl(url: string, params?: Record<string, string>): string {
    let fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`
    if (params) {
      const searchParams = new URLSearchParams(params).toString()
      const separator = fullUrl.includes('?') ? '&' : '?'
      fullUrl += `${separator}${searchParams}`
    }
    return fullUrl
  }

  public async get<T>(url: string, options: FetchOptions = {}): Promise<T> {
    const fullUrl = this.buildUrl(url, options.params)
    const init = {
      ...options,
      method: 'GET',
      headers: {
        ...this.getAuthHeader(),
        ...(options.headers as Record<string, string>),
      },
    }
    const response = await this.fetchWithProgress(fullUrl, init)
    return this.handleResponse<T>(response, fullUrl, init)
  }

  public async post<T>(url: string, data?: unknown, options: FetchOptions = {}): Promise<T> {
    const fullUrl = this.buildUrl(url, options.params)
    const init = {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...(options.headers as Record<string, string>),
      },
      body: data ? JSON.stringify(data) : undefined,
    }
    const response = await this.fetchWithProgress(fullUrl, init)
    return this.handleResponse<T>(response, fullUrl, init)
  }

  public async put<T>(url: string, data?: unknown, options: FetchOptions = {}): Promise<T> {
    const fullUrl = this.buildUrl(url, options.params)
    const init = {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...(options.headers as Record<string, string>),
      },
      body: data ? JSON.stringify(data) : undefined,
    }
    const response = await this.fetchWithProgress(fullUrl, init)
    return this.handleResponse<T>(response, fullUrl, init)
  }

  public async patch<T>(url: string, data?: unknown, options: FetchOptions = {}): Promise<T> {
    const fullUrl = this.buildUrl(url, options.params)
    const init = {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...(options.headers as Record<string, string>),
      },
      body: data ? JSON.stringify(data) : undefined,
    }
    const response = await this.fetchWithProgress(fullUrl, init)
    return this.handleResponse<T>(response, fullUrl, init)
  }

  public async delete<T>(url: string, options: FetchOptions = {}): Promise<T> {
    const fullUrl = this.buildUrl(url, options.params)
    const init = {
      ...options,
      method: 'DELETE',
      headers: {
        ...this.getAuthHeader(),
        ...(options.headers as Record<string, string>),
      },
    }
    const response = await this.fetchWithProgress(fullUrl, init)
    return this.handleResponse<T>(response, fullUrl, init)
  }
}

export const api = new ApiClient()

/**
 * Safely extract an array from any API response shape.
 * Handles: bare arrays, { data: [...] }, { posts: [...] }, { results: [...] }, etc.
 */
export function safeArray<T = unknown>(res: unknown, ...keys: string[]): T[] {
  if (Array.isArray(res)) return res as T[]
  if (res && typeof res === 'object') {
    for (const key of keys) {
      const val = (res as Record<string, unknown>)[key]
      if (Array.isArray(val)) return val as T[]
    }
    // Fallback: first array property on the object
    for (const val of Object.values(res as Record<string, unknown>)) {
      if (Array.isArray(val)) return val as T[]
    }
  }
  return []
}

/**
 * Safely extract a nested object property (e.g. res.system.report_header).
 * Returns undefined instead of throwing if any part of the chain is missing.
 */
export function safeGet<T = unknown>(obj: unknown, ...path: string[]): T | undefined {
  let current: unknown = obj
  for (const key of path) {
    if (current === null || current === undefined || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return current as T | undefined
}
