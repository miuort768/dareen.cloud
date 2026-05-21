import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'

describe('ApiClient', () => {
    it('performs GET requests', async () => {
        const { api } = await import('../../lib/api')
        const result = await api.get<{ status: string }>('/health')
        expect(result.status).toBe('ok')
    })

    it('throws on 401 and clears auth state', async () => {
        server.use(
            http.get('*/api/test-401', () =>
                HttpResponse.json({ error: 'Unauthorized' }, { status: 401 }),
            ),
        )

        localStorage.setItem('auth_token', 'expired-token')
        localStorage.setItem('app_isAuthenticated', 'true')
        localStorage.setItem('app_current_user', JSON.stringify({ id: '1' }))

        const { api } = await import('../../lib/api')
        await expect(api.get('/api/test-401')).rejects.toThrow()
        expect(localStorage.getItem('auth_token')).toBeNull()
    })

    it('sends Bearer auth header when token exists', async () => {
        localStorage.setItem('auth_token', 'test-token-123')

        let authHeader: string | null = null
        server.use(
            http.get('*/api/echo-headers', ({ request }) => {
                authHeader = request.headers.get('Authorization')
                return HttpResponse.json({ ok: true })
            }),
        )

        const { api } = await import('../../lib/api')
        await api.get('/api/echo-headers')
        expect(authHeader).toBe('Bearer test-token-123')
    })

    it('rejects on request timeout', async () => {
        server.use(
            http.get('*/api/slow', async () => {
                await new Promise(r => setTimeout(r, 500))
                return HttpResponse.json({ ok: true })
            }),
        )

        const { api } = await import('../../lib/api')
        await expect(api.get('/api/slow', { signal: AbortSignal.timeout(50) })).rejects.toThrow()
    })

    it('appends query params to URL', async () => {
        let capturedUrl = ''
        server.use(
            http.get('*/api/students', ({ request }) => {
                capturedUrl = request.url
                return HttpResponse.json([])
            }),
        )

        const { api } = await import('../../lib/api')
        await api.get('/api/students', { params: { classId: '5', active: 'true' } })
        expect(capturedUrl).toContain('classId=5')
        expect(capturedUrl).toContain('active=true')
    })

    it('handles POST with JSON request body', async () => {
        let capturedBody: unknown = null
        server.use(
            http.post('*/api/students', async ({ request }) => {
                capturedBody = await request.json()
                return HttpResponse.json({ id: 'new-1' }, { status: 201 })
            }),
        )

        const { api } = await import('../../lib/api')
        const result = await api.post('/api/students', { name: 'Test Student', grade: 5 })
        expect(result).toEqual({ id: 'new-1' })
        expect(capturedBody).toEqual({ name: 'Test Student', grade: 5 })
    })

    it('handles PUT, PATCH, DELETE methods', async () => {
        const { api } = await import('../../lib/api')

        let method = ''
        server.use(
            http.put('*/api/students/1', async ({ request }) => {
                method = request.method
                return HttpResponse.json({ id: '1' })
            }),
            http.patch('*/api/students/1', async ({ request }) => {
                method = request.method
                return HttpResponse.json({ id: '1' })
            }),
            http.delete('*/api/students/1', async ({ request }) => {
                method = request.method
                return HttpResponse.json({ success: true })
            }),
        )

        await api.put('/api/students/1', { name: 'Updated' })
        expect(method).toBe('PUT')

        await api.patch('/api/students/1', { name: 'Patched' })
        expect(method).toBe('PATCH')

        await api.delete('/api/students/1')
        expect(method).toBe('DELETE')
    })
})
