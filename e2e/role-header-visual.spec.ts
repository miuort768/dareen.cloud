import { test } from '@playwright/test'

const FAKE_TEACHER = {
  state: {
    currentUser: {
      id: 'e2e-t',
      name: 'أحمد إبراهيم',
      username: 'e2e-t',
      role: 'teacher',
      permissions: ['*'],
    },
    isAuthenticated: true,
    token: 'e2e-fake-token',
  },
  version: 0,
}

test('role header screenshots (light+dark, teacher)', async ({ page, context }) => {
  test.setTimeout(150000)
  await context.route('**/api/**', (r) => r.fulfill({ json: [] }))
  await context.route('**/api/auth/**', (r) =>
    r.fulfill({ json: { valid: true, user: FAKE_TEACHER.state.currentUser } }),
  )
  await context.route('**/api/system/**', (r) => r.fulfill({ json: { data: {} } }))
  await context.route('**/api/settings**', (r) => r.fulfill({ json: { data: {} } }))
  await context.addInitScript(
    (v) => localStorage.setItem('auth-storage', v),
    JSON.stringify(FAKE_TEACHER),
  )
  await context.addInitScript(() => localStorage.setItem('auth_token', 'e2e-fake-token'))

  await page.setViewportSize({ width: 768, height: 340 })
  await page.goto('/teacher-dashboard', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(4500)
  await page.screenshot({
    path: 'e2e/artifacts/role-header-light.png',
    clip: { x: 0, y: 0, width: 768, height: 340 },
  })

  await page.evaluate(() => {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  })
  await page.waitForTimeout(600)
  await page.screenshot({
    path: 'e2e/artifacts/role-header-dark.png',
    clip: { x: 0, y: 0, width: 768, height: 340 },
  })
})
