import { http, HttpResponse } from 'msw'

const API_BASE = 'http://localhost:3001/api'

interface User {
    id: string
    username: string
    role: string
    name: string
    phone: string
    permissions: string[]
}

const mockUser: User = {
    id: '1',
    username: 'admin',
    role: 'admin',
    name: 'مشرف النظام',
    phone: '966500000000',
    permissions: ['all'],
}

export const handlers = [
    http.post(`${API_BASE}/auth/login`, async ({ request }) => {
        const body = await request.json() as { username?: string; password?: string }
        if (body.username === 'admin' && body.password === 'admin123') {
            return HttpResponse.json({
                token: 'mock-jwt-token',
                user: mockUser,
            })
        }
        return HttpResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 },
        )
    }),

    http.post(`${API_BASE}/auth/verify`, () =>
        HttpResponse.json({ valid: true, user: mockUser }),
    ),

    http.get(`${API_BASE}/system/settings`, () =>
        HttpResponse.json({
            academyName: 'دارين السابعة',
            themeColor: 'var(--bg-primary)',
            currency: 'EGP',
        }),
    ),

    http.get(`${API_BASE}/health`, () =>
        HttpResponse.json({ status: 'ok', timestamp: Date.now() }),
    ),
]
