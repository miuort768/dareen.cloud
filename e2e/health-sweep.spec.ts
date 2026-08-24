import { test } from '@playwright/test'

const ROUTES = ['/', '/courses', '/books', '/about', '/contact', '/privacy-policy', '/jobs']

test.describe('project health sweep (public)', () => {
  test.setTimeout(180000)
  for (const route of ROUTES) {
    test(`health ${route}`, async ({ page }) => {
      const problems: string[] = []
      page.on('pageerror', (err) => problems.push(`[JS-EXCEPTION] ${String(err).slice(0, 200)}`))
      page.on('console', (m) => {
        const t = m.text()
        if (m.type() === 'error' && !/ERR_CONNECTION_REFUSED|Failed to fetch|net::/.test(t)) {
          problems.push(`[console.error] ${t.slice(0, 180)}`)
        }
      })
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

      // slow-scroll whole page to trigger lazy sections/images
      const h = await safeEval(() => document.documentElement.scrollHeight, 2000)
      for (let y = 0; y < h; y += 500) {
        await page.evaluate((t) => window.scrollTo(0, t), y).catch(() => {})
        await page.waitForTimeout(120)
      }

      const audit = await safeEval(
        () => {
          const doc = document.documentElement
          const hOverflow = doc.scrollWidth - doc.clientWidth
          const brokenImgs = Array.from(document.images)
            .filter((i) => i.complete && i.naturalWidth === 0 && !i.src.startsWith('data:'))
            .map((i) => i.src.slice(-80))
          const dupIds = (() => {
            const seen = new Map<string, number>()
            document
              .querySelectorAll('[id]')
              .forEach((el) => seen.set(el.id, (seen.get(el.id) || 0) + 1))
            return Array.from(seen.entries())
              .filter(([, n]) => n > 1)
              .map(([id]) => id)
          })()
          return { hOverflow, brokenImgs, dupIds }
        },
        { hOverflow: 0, brokenImgs: [] as string[], dupIds: [] as string[] },
      )

      if (audit.hOverflow > 2) problems.push(`[H-OVERFLOW] ${audit.hOverflow}px horizontal scroll`)
      audit.brokenImgs.forEach((s) => problems.push(`[BROKEN-IMG] ${s}`))
      if (audit.dupIds.length) problems.push(`[DUP-ID] ${audit.dupIds.join(', ').slice(0, 150)}`)
      if (problems.length)
        console.log(`HEALTH-${route.replace(/\//g, '_')}:\n` + [...new Set(problems)].join('\n'))
    })
  }
})
