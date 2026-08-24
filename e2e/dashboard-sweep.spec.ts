import { test } from '@playwright/test'

const ROUTES = [
  '/dashboard/admin-dashboard',
  '/dashboard/teachers',
  '/dashboard/students',
  '/dashboard/parents',
  '/dashboard/finance',
  '/dashboard/reports',
  '/dashboard/settings',
  '/dashboard/attendance',
  '/dashboard/schedule',
  '/dashboard/tasks',
  '/dashboard/chat',
  '/dashboard/trial-sessions',
  '/dashboard/student-invoices',
  '/dashboard/teacher-invoices',
]

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

test.describe('project health sweep (authed dashboards)', () => {
  test.setTimeout(180000)

  test.use({
    storageState: undefined as unknown as never, // not using playwright storage; we seed manually
  })

  for (const route of ROUTES) {
    test(`health ${route}`, async ({ page, context }) => {
      const problems: string[] = []
      page.on('pageerror', (err) => problems.push(`[JS-EXCEPTION] ${String(err).slice(0, 200)}`))
      page.on('console', (m) => {
        const t = m.text()
        if (
          m.type() === 'error' &&
          !/ERR_CONNECTION_REFUSED|Failed to fetch|net::|401|404 \(|Authentication failed|Token verification failed/.test(
            t,
          )
        ) {
          problems.push(`[console.error] ${t.slice(0, 180)}`)
        }
      })

      await context.addInitScript(
        (v) => localStorage.setItem('auth-storage', v),
        JSON.stringify(FAKE_ADMIN),
      )
      await context.addInitScript(() => localStorage.setItem('auth_token', 'e2e-fake-token'))

      await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(2500)

      const safeEval = async <T>(fn: () => T, fallback: T): Promise<T> => {
        for (let i = 0; i < 3; i++) {
          try {
            return await page.evaluate(fn)
          } catch {
            await page.waitForTimeout(1500)
          }
        }
        return fallback
      }

      // scroll through to mount lazy sections
      const h = await safeEval(() => document.documentElement.scrollHeight, 1500)
      for (let y = 0; y < Math.min(h, 4000); y += 600) {
        await page.evaluate((t) => window.scrollTo(0, t), y).catch(() => {})
        await page.waitForTimeout(120)
      }

      const audit = await safeEval(
        () => {
          const doc = document.documentElement
          const hOverflow = doc.scrollWidth - doc.clientWidth
          const dupIds = (() => {
            const seen = new Map<string, number>()
            document
              .querySelectorAll('[id]')
              .forEach((el) => seen.set(el.id, (seen.get(el.id) || 0) + 1))
            return Array.from(seen.entries())
              .filter(([, n]) => n > 1)
              .map(([id]) => id)
          })()
          const brokenImgs = Array.from(document.images)
            .filter((i) => i.complete && i.naturalWidth === 0 && !i.src.startsWith('data:'))
            .map((i) => i.src.slice(-70))
          return { hOverflow, dupIds, brokenImgs }
        },
        { hOverflow: 0, dupIds: [] as string[], brokenImgs: [] as string[] },
      )

      if (audit.hOverflow > 2) problems.push(`[H-OVERFLOW] ${audit.hOverflow}px`)
      audit.brokenImgs.forEach((s) => problems.push(`[BROKEN-IMG] ${s}`))
      if (audit.dupIds.length) problems.push(`[DUP-ID] ${audit.dupIds.join(', ').slice(0, 140)}`)
      if (problems.length)
        console.log(`DASH-${route.replace(/[/-]/g, '_')}:\n` + [...new Set(problems)].join('\n'))
    })
  }
})
