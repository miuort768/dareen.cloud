import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../../test/mocks/server'

describe('rolesService', () => {
  const baseUrl = '*/api/roles'

  beforeEach(() => {
    server.use(
      http.get(baseUrl, () =>
        HttpResponse.json([
          {
            id: 1,
            name: 'admin',
            label: 'مدير النظام',
            description: null,
            isSystem: 1,
            _count: { userRoles: 2 },
          },
          {
            id: 2,
            name: 'manager',
            label: 'مدير',
            description: 'مدير تنفيذي',
            isSystem: 0,
            _count: { userRoles: 0 },
          },
        ]),
      ),
      http.get('*/api/roles/permissions', () =>
        HttpResponse.json([
          { id: 1, key: 'dashboard.read', label: 'عرض لوحة التحكم', group: 'dashboard' },
          { id: 2, key: 'students.read', label: 'عرض الطلاب', group: 'students' },
        ]),
      ),
    )
  })

  it('getAll returns array of roles', async () => {
    const { rolesService } = await import('./rolesService')
    const roles = await rolesService.getAll()
    expect(Array.isArray(roles)).toBe(true)
    expect(roles[0]?.name).toBe('admin')
    expect(roles[0]?._count?.userRoles).toBe(2)
  })

  it('getPermissions returns array of permissions', async () => {
    const { rolesService } = await import('./rolesService')
    const perms = await rolesService.getPermissions()
    expect(Array.isArray(perms)).toBe(true)
    expect(perms[0]?.group).toBe('dashboard')
  })
})
