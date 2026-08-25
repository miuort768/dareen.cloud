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

const PUBLIC_ROUTES = ['/', '/courses', '/books', '/about', '/contact']
const DASH_ROUTES = [
  '/dashboard/admin-dashboard',
  '/students',
  '/finance',
  '/teachers',
  '/settings',
]

const VIEWPORTS = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
]

async function seed(context) {
  await context.addInitScript(
    (v) => localStorage.setItem('auth-storage', v),
    JSON.stringify(FAKE_ADMIN),
  )
  await context.addInitScript(() => localStorage.setItem('auth_token', 'e2e-fake-token'))
}

async function sweep(page) {
  const problems = []

  const getBars = () =>
    page.evaluate(() => {
      const out = { top: 0, bottomFixed: [] as string[] }
      document.querySelectorAll('header, nav').forEach((el) => {
        const cs = getComputedStyle(el)
        if (cs.display === 'none' || cs.visibility === 'hidden') return
        const r = el.getBoundingClientRect()
        if (r.height < 20) return
        if (cs.position === 'fixed' || cs.position === 'sticky') {
          if (r.top <= 5 && r.bottom < innerHeight / 2) out.top = Math.max(out.top, r.bottom)
          if (r.bottom >= innerHeight - 5 && r.top > innerHeight / 2)
            out.bottomFixed.push(String(el.className).slice(0, 60))
        }
      })
      return out
    })

  const checkVisible = async (label: string) => {
    const bars = await getBars()
    const blocked = await page.evaluate(
      ({ topBar }) => {
        const out: string[] = []
        const els = Array.from(
          document.querySelectorAll('button, a[href], input, select, textarea, [role="button"]'),
        )
        for (const el of els) {
          const cs = getComputedStyle(el)
          if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') continue
          const r = el.getBoundingClientRect()
          if (r.width < 10 || r.height < 10) continue
          if (r.bottom < 0 || r.top > innerHeight) continue
          const cx = Math.min(Math.max(r.left + r.width / 2, 1), innerWidth - 1)
          const cy = Math.min(Math.max(r.top + r.height / 2, 1), innerHeight - 1)
          const hit = document.elementFromPoint(cx, cy)
          if (!hit || el.contains(hit) || hit.contains(el)) continue
          const hitCs = getComputedStyle(hit)
          const isBar =
            hit.closest('header, nav') &&
            (hitCs.position === 'fixed' ||
              hitCs.position === 'sticky' ||
              !!hit.closest('header, nav')?.matches('header, nav'))
          if (isBar) {
            const inTopBar =
              (hit.closest('header, nav') as HTMLElement).getBoundingClientRect().top <= 5
            if (inTopBar && r.top >= topBar - 4) continue // element starts below bar = fine
            out.push(
              `${el.tagName} "${(el.textContent || '').trim().slice(0, 25)}" @y${Math.round(r.top)} covered by ${String(hit.className).slice(0, 50)}`,
            )
          }
        }
        return out
      },
      { topBar: bars.top },
    )
    blocked.forEach((b) => problems.push(`[${label}] ${b}`))
    return bars
  }

  // TOP check
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(400)
  await checkVisible('top')

  // BOTTOM check — scroll to absolute end
  await page.evaluate(async () => {
    window.scrollTo(0, document.documentElement.scrollHeight)
    await new Promise((r) => setTimeout(r, 300))
    window.scrollTo(0, document.documentElement.scrollHeight)
  })
  await page.waitForTimeout(500)
  await checkVisible('bottom')

  // mid-scroll sample (FloatingActions band etc.)
  const h = await page.evaluate(() => document.documentElement.scrollHeight)
  for (const frac of [0.33, 0.66]) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.floor(h * frac))
    await page.waitForTimeout(300)
    await checkVisible(`mid${Math.round(frac * 100)}`)
  }

  // horizontal overflow
  const hOv = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  if (hOv > 2) problems.push(`[H-OVERFLOW] ${hOv}px`)

  return problems
}

test.describe('navbar overlap audit (top/bottom) across devices', () => {
  test.setTimeout(240000)

  for (const vp of VIEWPORTS) {
    for (const route of PUBLIC_ROUTES) {
      test(`${vp.name} ${route}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height })
        await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 60000 })
        await page.waitForTimeout(2500)
        const problems = await sweep(page)
        if (problems.length)
          console.log(
            `NAV-${vp.name}-${route.replace(/\//g, '_')}:\n` + [...new Set(problems)].join('\n'),
          )
      })
    }
    for (const route of DASH_ROUTES) {
      test(`${vp.name} ${route}`, async ({ page, context }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height })
        await seed(context)
        await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 60000 })
        await page.waitForTimeout(3500)
        const problems = await sweep(page)
        if (problems.length)
          console.log(
            `NAV-${vp.name}-${route.replace(/\//g, '_')}:\n` + [...new Set(problems)].join('\n'),
          )
      })
    }
  }
})
