import { http, HttpResponse } from 'msw'
import { db, makeStudent, makeTeacher, makeSession, makeNotification } from './data'

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
  // ─── Auth ───────────────────────────────────────────────
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { username?: string; password?: string }
    if (body.username === 'admin' && body.password === 'admin123') {
      return HttpResponse.json({
        token: 'mock-jwt-token',
        user: mockUser,
      })
    }
    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }),

  http.post(`${API_BASE}/auth/verify`, () => HttpResponse.json({ valid: true, user: mockUser })),

  http.post(`${API_BASE}/auth/refresh`, () =>
    HttpResponse.json({ token: 'mock-jwt-token-refreshed' }),
  ),

  // ─── System ─────────────────────────────────────────────
  http.get(`${API_BASE}/system/settings`, () =>
    HttpResponse.json({
      academyName: 'دارين السابعة',
      themeColor: 'var(--bg-primary)',
      currency: 'EGP',
    }),
  ),

  http.get(`${API_BASE}/health`, () => HttpResponse.json({ status: 'ok', timestamp: Date.now() })),

  // ─── Students ───────────────────────────────────────────
  http.get(`${API_BASE}/students`, () => HttpResponse.json(db.students)),

  http.get(`${API_BASE}/students/:id`, ({ params }) => {
    const student = db.students.find((s) => s.id === params.id)
    if (!student) return HttpResponse.json({ error: 'غير موجود' }, { status: 404 })
    return HttpResponse.json(student)
  }),

  http.post(`${API_BASE}/students`, async ({ request }) => {
    const body = (await request.json()) as Partial<(typeof db.students)[number]>
    const created = makeStudent(body)
    db.students.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.put(`${API_BASE}/students/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Partial<(typeof db.students)[number]>
    const idx = db.students.findIndex((s) => s.id === params.id)
    if (idx === -1) return HttpResponse.json({ error: 'غير موجود' }, { status: 404 })
    const existing = db.students[idx]
    if (!existing) return HttpResponse.json({ error: 'غير موجود' }, { status: 404 })
    db.students[idx] = { ...existing, ...body }
    return HttpResponse.json(db.students[idx])
  }),

  http.delete(`${API_BASE}/students/:id`, ({ params }) => {
    const idx = db.students.findIndex((s) => s.id === params.id)
    if (idx === -1) return HttpResponse.json({ error: 'غير موجود' }, { status: 404 })
    db.students.splice(idx, 1)
    return HttpResponse.json({ success: true })
  }),

  // ─── Teachers ───────────────────────────────────────────
  http.get(`${API_BASE}/teachers`, () => HttpResponse.json(db.teachers)),

  http.get(`${API_BASE}/teachers/me`, () => HttpResponse.json(db.teachers[0])),

  http.post(`${API_BASE}/teachers`, async ({ request }) => {
    const body = (await request.json()) as Partial<(typeof db.teachers)[number]>
    const created = makeTeacher(body)
    db.teachers.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.put(`${API_BASE}/teachers/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Partial<(typeof db.teachers)[number]>
    const idx = db.teachers.findIndex((t) => t.id === params.id)
    if (idx === -1) return HttpResponse.json({ error: 'غير موجود' }, { status: 404 })
    const existing = db.teachers[idx]
    if (!existing) return HttpResponse.json({ error: 'غير موجود' }, { status: 404 })
    db.teachers[idx] = { ...existing, ...body }
    return HttpResponse.json(db.teachers[idx])
  }),

  http.delete(`${API_BASE}/teachers/:id`, ({ params }) => {
    const idx = db.teachers.findIndex((t) => t.id === params.id)
    if (idx === -1) return HttpResponse.json({ error: 'غير موجود' }, { status: 404 })
    db.teachers.splice(idx, 1)
    return HttpResponse.json({ success: true })
  }),

  // ─── Sessions ───────────────────────────────────────────
  http.get(`${API_BASE}/sessions`, () => HttpResponse.json(db.sessions)),

  http.post(`${API_BASE}/sessions`, async ({ request }) => {
    const body = (await request.json()) as Partial<(typeof db.sessions)[number]>
    const created = makeSession(body)
    db.sessions.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.put(`${API_BASE}/sessions/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Partial<(typeof db.sessions)[number]>
    const idx = db.sessions.findIndex((s) => s.id === params.id)
    if (idx === -1) return HttpResponse.json({ error: 'غير موجود' }, { status: 404 })
    const existing = db.sessions[idx]
    if (!existing) return HttpResponse.json({ error: 'غير موجود' }, { status: 404 })
    db.sessions[idx] = { ...existing, ...body }
    return HttpResponse.json(db.sessions[idx])
  }),

  http.delete(`${API_BASE}/sessions/:id`, ({ params }) => {
    const idx = db.sessions.findIndex((s) => s.id === params.id)
    if (idx === -1) return HttpResponse.json({ error: 'غير موجود' }, { status: 404 })
    db.sessions.splice(idx, 1)
    return HttpResponse.json({ success: true })
  }),

  // ─── Parents ────────────────────────────────────────────
  http.get(`${API_BASE}/parents`, () =>
    HttpResponse.json([
      { id: 'parent-1', name: 'ولي أمر أحمد', phone: '966520000001', studentIds: ['student-1'] },
      { id: 'parent-2', name: 'ولي أمر سارة', phone: '966520000002', studentIds: ['student-2'] },
    ]),
  ),

  // ─── Notifications ──────────────────────────────────────
  http.get(`${API_BASE}/notifications`, () => HttpResponse.json(db.notifications)),

  http.post(`${API_BASE}/notifications`, async ({ request }) => {
    const body = (await request.json()) as Partial<(typeof db.notifications)[number]>
    const created = makeNotification(body)
    db.notifications.unshift(created)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.patch(`${API_BASE}/notifications/:id/read`, ({ params }) => {
    const notif = db.notifications.find((n) => n.id === params.id)
    if (!notif) return HttpResponse.json({ error: 'غير موجود' }, { status: 404 })
    notif.read = true
    return HttpResponse.json(notif)
  }),

  http.delete(`${API_BASE}/notifications/:id`, ({ params }) => {
    const idx = db.notifications.findIndex((n) => n.id === params.id)
    if (idx === -1) return HttpResponse.json({ error: 'غير موجود' }, { status: 404 })
    db.notifications.splice(idx, 1)
    return HttpResponse.json({ success: true })
  }),

  // ─── Finance (summary) ──────────────────────────────────
  http.get(`${API_BASE}/finance/summary`, () =>
    HttpResponse.json({
      totalRevenue: 150000,
      totalExpenses: 80000,
      netProfit: 70000,
      currency: 'EGP',
    }),
  ),

  // ─── Tasks ──────────────────────────────────────────────
  http.get(`${API_BASE}/tasks`, () =>
    HttpResponse.json([
      { id: 'task-1', title: 'متابعة حضور الطلاب', done: false, priority: 'high' },
      { id: 'task-2', title: 'مراجعة الفواتير', done: true, priority: 'medium' },
    ]),
  ),

  http.post(`${API_BASE}/tasks`, async ({ request }) => {
    const body = (await request.json()) as { title?: string; priority?: string }
    const created = {
      id: `task-${Date.now()}`,
      title: body.title ?? '',
      done: false,
      priority: body.priority ?? 'medium',
    }
    return HttpResponse.json(created, { status: 201 })
  }),
]
