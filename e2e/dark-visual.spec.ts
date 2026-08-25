import { test } from '@playwright/test'

const FAKE_ADMIN = {
  state: {
    currentUser: {
      id: 'e2e-admin',
      name: 'E2E Admin',
      username: 'e2e-admin',
      role: 'admin',
      permissions: ['*'],
    },
    isAuthenticated: true,
    token: 'e2e-fake-token',
  },
  version: 0,
}

const MOCK_LEADS = [
  {
    id: '1',
    studentName: 'أحمد عبد الله',
    phone: '00201015098836',
    subject: 'رياضيات',
    curriculum: 'مصري',
    status: 'new',
    priority: 'medium',
    notes: 'عالج الحصة عند الساعة 5',
    created_at: new Date().toISOString(),
    source: 'واتساب',
  },
  {
    id: '2',
    studentName: 'فاطمة السيد',
    phone: '00971509883611',
    subject: 'فيزياء',
    curriculum: 'بريطاني',
    status: 'contacted',
    priority: 'high',
    notes: '',
    created_at: new Date().toISOString(),
  },
]

test('dark mode visual sweep', async ({ page, context }) => {
  test.setTimeout(150000)
  await page.setViewportSize({ width: 390, height: 844 })

  await context.route('**/api/**', (r) => r.fulfill({ json: {} }))
  await context.route('**/api/leads**', (r) => r.fulfill({ json: MOCK_LEADS }))
  await context.route('**/api/leads/stats**', (r) =>
    r.fulfill({ json: { total: 63, converted: 13, conversionRate: 20.6, active: 51 } }),
  )
  await context.route('**/api/auth/**', (r) =>
    r.fulfill({ json: { valid: true, user: FAKE_ADMIN.state.currentUser } }),
  )

  await context.addInitScript(
    (v) => localStorage.setItem('auth-storage', v),
    JSON.stringify(FAKE_ADMIN),
  )
  await context.addInitScript(() => {
    localStorage.setItem('theme', 'dark')
    localStorage.setItem('public-theme', 'dark')
    localStorage.setItem('auth_token', 'e2e-fake-token')
  })

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(4000)
  await page.screenshot({ path: 'e2e/artifacts/dark-home.png' })

  await page.goto('/leads', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3000)
  await page.screenshot({ path: 'e2e/artifacts/dark-leads.png' })

  await page.goto('/admin-dashboard', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3000)
  await page.screenshot({ path: 'e2e/artifacts/dark-dashboard.png' })
})
