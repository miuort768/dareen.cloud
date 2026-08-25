import { test } from '@playwright/test'

const FAKE_ADMIN = {
  state: {
    currentUser: {
      id: 'e2e-admin',
      name: 'أحمد إبراهيم',
      username: 'e2e-admin',
      role: 'admin',
      permissions: ['*'],
    },
    isAuthenticated: true,
    token: 'e2e-fake-token',
  },
  version: 0,
}

test('header redesign screenshots (3 devices)', async ({ page, context }) => {
  test.setTimeout(150000)

  await context.route('**/api/**', (r) => r.fulfill({ json: {} }))
  await context.route('**/api/auth/**', (r) =>
    r.fulfill({ json: { valid: true, user: FAKE_ADMIN.state.currentUser } }),
  )

  await context.addInitScript(
    (v) => localStorage.setItem('auth-storage', v),
    JSON.stringify(FAKE_ADMIN),
  )
  await context.addInitScript(() => localStorage.setItem('auth_token', 'e2e-fake-token'))

  // phone
  await page.setViewportSize({ width: 390, height: 300 })
  await page.goto('/students', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(4000)
  await page.screenshot({
    path: 'e2e/artifacts/header-phone.png',
    clip: { x: 0, y: 0, width: 390, height: 300 },
  })

  // tablet
  await page.setViewportSize({ width: 768, height: 320 })
  await page.waitForTimeout(800)
  await page.screenshot({
    path: 'e2e/artifacts/header-tablet.png',
    clip: { x: 0, y: 0, width: 768, height: 320 },
  })

  // desktop
  await page.setViewportSize({ width: 1440, height: 360 })
  await page.waitForTimeout(800)
  await page.screenshot({
    path: 'e2e/artifacts/header-desktop.png',
    clip: { x: 0, y: 0, width: 1440, height: 360 },
  })
})
