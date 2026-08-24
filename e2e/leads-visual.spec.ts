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

const now = Date.now()
const daysAgo = (d: number) => new Date(now - d * 86400000).toISOString()

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
    created_at: daysAgo(2),
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
    created_at: daysAgo(5),
    source: 'فيسبوك',
  },
  {
    id: '3',
    studentName: 'محمد حسن',
    phone: '009659883622',
    subject: 'كيمياء',
    curriculum: 'كويتي',
    status: 'interested',
    priority: 'low',
    notes: 'يفضل المساء',
    created_at: daysAgo(9),
  },
  {
    id: '4',
    studentName: 'سارة أحمد',
    phone: '009745883633',
    subject: 'إنجليزي',
    curriculum: 'أمريكي',
    status: 'trial',
    priority: 'high',
    notes: '',
    created_at: daysAgo(1),
    source: 'إنستغرام',
  },
  {
    id: '5',
    studentName: 'عمر خالد',
    phone: '009715883644',
    subject: 'أحياء',
    curriculum: 'مصري',
    status: 'lost',
    priority: 'medium',
    notes: 'غير مهتم حاليًا',
    created_at: daysAgo(20),
  },
]

test('capture redesigned leads page (mocked API)', async ({ page, context }) => {
  test.setTimeout(120000)
  await page.setViewportSize({ width: 390, height: 844 })

  // catch-all FIRST (later registrations take precedence)
  await context.route('**/api/**', (r) => r.fulfill({ json: {} }))
  await context.route('**/api/leads/stats**', (r) =>
    r.fulfill({ json: { total: 63, converted: 13, conversionRate: 20.6, active: 51 } }),
  )
  await context.route('**/api/leads/all**', (r) => r.fulfill({ json: { success: true } }))
  await context.route('**/api/leads**', (r) => r.fulfill({ json: MOCK_LEADS }))
  await context.route('**/api/auth/**', (r) =>
    r.fulfill({
      json: { valid: true, user: FAKE_ADMIN.state.currentUser, token: 'e2e-fake-token' },
    }),
  )
  await context.route('**/api/settings**', (r) => r.fulfill({ json: { data: {} } }))
  await context.route('**/api/notifications**', (r) => r.fulfill({ json: [] }))
  await context.route('**/api/socket.io/**', (r) => r.fulfill({ json: {} }))

  await context.addInitScript(
    (v) => localStorage.setItem('auth-storage', v),
    JSON.stringify(FAKE_ADMIN),
  )
  await context.addInitScript(() => localStorage.setItem('auth_token', 'e2e-fake-token'))

  await page.goto('/leads', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(3500)
  await page.screenshot({ path: 'e2e/artifacts/leads-redesign.png' })

  await page.evaluate(() => window.scrollBy(0, 480))
  await page.waitForTimeout(600)
  await page.screenshot({ path: 'e2e/artifacts/leads-cards.png' })

  await page.getByRole('button', { name: /عرض/ }).first().click()
  await page.waitForTimeout(800)
  await page.screenshot({ path: 'e2e/artifacts/leads-lost.png' })
})
