/**
 * Final Pre-Production Review — extended dynamic audit.
 *
 * For every protected route per role, performs a FULL page reload (real user) and
 * captures, beyond the original overlay/coverage checks:
 *   - console.error() messages (app errors)
 *   - pageerror (uncaught exceptions / error boundaries)
 *   - failed network requests (4xx/5xx responses + request failures)
 *   - dialog/modal presence (role=dialog) and whether a modal-opener button exists
 *   - stuck spinner detection
 *
 * Output: e2e/reports/final-review-<project>-<role>.json
 * Run:    npx playwright test e2e/final-review.spec.ts --project=chromium --reporter=line
 */
import { test, Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const REPORT_DIR = path.join(__dirname, 'reports')

const ROLES = [
  { id: 'admin', username: 'admin', password: '123456' },
  { id: 'teacher', username: 'demo_teacher_1', password: '123456' },
  { id: 'student', username: 'demo_student_1', password: '123456' },
  { id: 'parent', username: 'demo_parent_1', password: '123456' },
]

const ROUTES: Record<string, string[]> = {
  admin: [
    '/admin-dashboard',
    '/teachers',
    '/students',
    '/parents',
    '/evaluations',
    '/monthly-closing',
    '/attendance',
    '/schedule',
    '/appointments',
    '/finance',
    '/leads',
    '/trial-sessions',
    '/student-invoices',
    '/teacher-invoices',
    '/tasks',
    '/chat',
    '/reports',
    '/settings',
    '/announcements',
    '/forum',
    '/admin-jobs',
    '/admin-contacts',
    '/roles',
    '/monitoring',
    '/admin/blog',
    '/admin/blog-customers',
    '/student-profile',
    '/teacher-profile',
    '/parent-profile',
    '/teacher-payment-history',
    '/parent-payment-history',
  ],
  teacher: [
    '/teacher-dashboard',
    '/attendance',
    '/schedule',
    '/appointments',
    '/tasks',
    '/chat',
    '/teacher-profile',
    '/teacher-payment-history',
  ],
  student: ['/student-dashboard', '/student-profile', '/chat'],
  parent: [
    '/parent-dashboard',
    '/parent-students',
    '/parent-announcements',
    '/parent-profile',
    '/parent-payment-history',
    '/chat',
  ],
}

type ConsoleEntry = { type: string; text: string }
type NetEntry = { kind: string; url: string; status?: number; error?: string }

type OverlayItem = {
  tag: string
  text: string
  aria: string
  href: string
  type: string
  cls: string
  disabled: boolean
  pe: string
  offscreen: boolean
  covered: boolean
  overlay: null | {
    tag: string
    id: string
    cls: string
    text: string
    z: string
    pos: string
    pe: string
    opacity: string
  }
}

type AuditEntry = {
  route: string
  pathname: string
  redirectedToLogin: boolean
  errorBoundary: boolean
  noAccess: boolean
  spinnerVisible: boolean
  interactiveCount: number
  dialogCount: number
  modalOpenerButtons: number
  viteError: string
  consoleErrors: ConsoleEntry[]
  pageErrors: string[]
  badResponses: NetEntry[]
  requestFailures: NetEntry[]
  covered: OverlayItem[]
  pointerEventsNone: OverlayItem[]
}

function detectOverlays(): OverlayItem[] {
  const sel = [
    'button',
    'a[href]',
    'select',
    '[role="button"]',
    '[role="tab"]',
    '[role="menuitem"]',
    '[role="radio"]',
    '[aria-haspopup]',
    'input:not([type="hidden"])',
    'textarea',
  ].join(',')
  const els = Array.from(document.querySelectorAll(sel)) as HTMLElement[]
  const items: OverlayItem[] = []
  for (const el of els) {
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.display === 'none') continue
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const offscreen = cx < 0 || cy < 0 || cx > window.innerWidth || cy > window.innerHeight
    const top = offscreen ? null : document.elementFromPoint(cx, cy)
    const covered = !offscreen && !!top && !el.contains(top)
    const rec: OverlayItem = {
      tag: el.tagName.toLowerCase(),
      text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 90),
      aria: el.getAttribute('aria-label') || '',
      href: el.getAttribute('href') || '',
      type: el.getAttribute('type') || '',
      cls: (typeof el.className === 'string' ? el.className : '').slice(0, 180),
      disabled: !!el.disabled || el.getAttribute('aria-disabled') === 'true',
      pe: cs.pointerEvents,
      offscreen,
      covered,
      overlay: null,
    }
    if (covered && top) {
      const os = getComputedStyle(top)
      rec.overlay = {
        tag: top.tagName.toLowerCase(),
        id: top.id || '',
        cls: (typeof top.className === 'string' ? top.className : '').slice(0, 180),
        text: (top.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 90),
        z: os.zIndex,
        pos: os.position,
        pe: os.pointerEvents,
        opacity: os.opacity,
      }
    }
    items.push(rec)
  }
  return items
}

async function login(page: Page, username: string, password: string): Promise<string> {
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.locator('form input[type="text"]').first().fill(username)
  await page.locator('form input[type="password"]').first().fill(password)
  await page.locator('form button[type="submit"]').click()
  try {
    await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 20000 })
  } catch {
    /* login failed or server unreachable */
  }
  await page.waitForTimeout(1500)
  return new URL(page.url()).pathname
}

async function auditRoute(page: Page, route: string): Promise<AuditEntry> {
  const consoleErrors: ConsoleEntry[] = []
  const pageErrors: string[] = []
  const badResponses: NetEntry[] = []
  const requestFailures: NetEntry[] = []

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push({ type: msg.type(), text: msg.text().slice(0, 300) })
    }
  })
  page.on('pageerror', (err) => pageErrors.push(String(err.message || err).slice(0, 300)))
  page.on('response', (res) => {
    if (res.status() >= 400 && !res.url().includes('/health')) {
      badResponses.push({ kind: 'http-' + res.status(), url: res.url().slice(0, 180) })
    }
  })
  page.on('requestfailed', (req) => {
    const f = req.failure()
    requestFailures.push({
      kind: 'fail',
      url: req.url().slice(0, 180),
      error: ((f && f.errorText) || '').slice(0, 120),
    })
  })

  await page.goto(route, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2600)
  page.removeAllListeners('console')
  page.removeAllListeners('pageerror')
  page.removeAllListeners('response')
  page.removeAllListeners('requestfailed')

  const pathname = new URL(page.url()).pathname
  const errCount = await page
    .locator('text=/عذراً، حدث خطأ|حدث خطأ غير متوقع|حدث خطأ أثناء/')
    .count()
  const noAccess = await page.locator('text=/ليس لديك صلاحية|غير مصرح|Forbidden/').count()
  const spinner = await page.locator('.animate-spin, [class*="skeleton"], .spinner').count()
  const dialogCount = await page.locator('[role="dialog"], [role="alertdialog"]').count()
  const modalOpenerButtons = await page
    .locator('button[aria-haspopup="dialog"], button[data-state]')
    .count()
  const viteError = await page
    .locator('#vite-error-overlay')
    .textContent({ timeout: 1500 })
    .catch(() => null)
  const items = await page.evaluate(detectOverlays)
  const covered = items.filter((i: OverlayItem) => i.covered && i.overlay && !i.disabled)
  const peNone = items.filter((i: OverlayItem) => !i.covered && i.pe === 'none' && !i.disabled)

  return {
    route,
    pathname,
    redirectedToLogin: pathname.startsWith('/login'),
    errorBoundary: errCount > 0,
    noAccess: noAccess > 0,
    spinnerVisible: spinner > 0,
    interactiveCount: items.length,
    dialogCount,
    modalOpenerButtons,
    viteError: (viteError || '').replace(/\s+/g, ' ').slice(0, 400),
    consoleErrors,
    pageErrors,
    badResponses,
    requestFailures,
    covered,
    pointerEventsNone: peNone,
  }
}

test.describe('Final Pre-Production Review (report only — no fixes)', () => {
  for (const role of ROLES) {
    test(`review role: ${role.id}`, async ({ page }, testInfo) => {
      test.setTimeout(900000)
      const entries: AuditEntry[] = []

      const loginPath = await login(page, role.username, role.password)
      entries.push({
        route: '/login',
        pathname: loginPath,
        redirectedToLogin: loginPath.startsWith('/login'),
        errorBoundary: false,
        noAccess: false,
        spinnerVisible: false,
        interactiveCount: 0,
        dialogCount: 0,
        modalOpenerButtons: 0,
        viteError: '',
        consoleErrors: [],
        pageErrors: [],
        badResponses: [],
        requestFailures: [],
        covered: [],
        pointerEventsNone: [],
      })

      for (const route of ROUTES[role.id]) {
        entries.push(await auditRoute(page, route))
      }

      fs.mkdirSync(REPORT_DIR, { recursive: true })
      const reportFile = path.join(
        REPORT_DIR,
        `final-review-${testInfo.project.name}-${role.id}.json`,
      )
      fs.writeFileSync(reportFile, JSON.stringify(entries, null, 2))

      const consoleTotal = entries.reduce((n, r) => n + r.consoleErrors.length, 0)
      const pageErrTotal = entries.reduce((n, r) => n + r.pageErrors.length, 0)
      const badResp = entries.reduce((n, r) => n + r.badResponses.length, 0)
      const reqFail = entries.reduce((n, r) => n + r.requestFailures.length, 0)
      const broken = entries.filter((r) => r.errorBoundary || r.redirectedToLogin).length

      console.log(
        `[REVIEW] ${testInfo.project.name}/${role.id}: routes=${ROUTES[role.id].length} consoleErrors=${consoleTotal} pageErrors=${pageErrTotal} badResponses=${badResp} requestFailures=${reqFail} broken=${broken} report=${reportFile}`,
      )

      for (const e of entries) {
        if (e.viteError)
          console.log(`  !! ${role.id} ${e.route} -> VITE ERROR: ${e.viteError.slice(0, 200)}`)
        if (e.errorBoundary)
          console.log(`  !! ${role.id} ${e.route} -> ERROR BOUNDARY (${e.pathname})`)
        if (e.redirectedToLogin) console.log(`  !! ${role.id} ${e.route} -> REDIRECTED TO LOGIN`)
        if (e.noAccess)
          console.log(`  ?? ${role.id} ${e.route} -> no-access/403 text (${e.pathname})`)
        if (e.spinnerVisible && e.interactiveCount === 0)
          console.log(`  ?? ${role.id} ${e.route} -> stuck spinner, 0 interactive`)
        for (const ce of e.consoleErrors.slice(0, 5))
          console.log(`  C ${role.id} ${e.route}: ${ce.text.slice(0, 160)}`)
        if (e.consoleErrors.length > 5)
          console.log(`    ... +${e.consoleErrors.length - 5} console errors`)
        for (const pe of e.pageErrors.slice(0, 5))
          console.log(`  E ${role.id} ${e.route}: ${pe.slice(0, 160)}`)
        for (const br of e.badResponses.slice(0, 8))
          console.log(`  N ${role.id} ${e.route}: ${br.kind} ${br.url}`)
        if (e.badResponses.length > 8)
          console.log(`    ... +${e.badResponses.length - 8} bad responses`)
        for (const rf of e.requestFailures.slice(0, 5))
          console.log(`  F ${role.id} ${e.route}: ${rf.error} ${rf.url}`)
        for (const it of e.covered.slice(0, 6)) {
          const label = it.text || it.aria || it.href || it.cls.slice(0, 40)
          console.log(
            `  X ${role.id} ${e.route}: <${it.tag}> "${label}" COVERED by <${it.overlay!.tag}> z=${it.overlay!.z} cls=${it.overlay!.cls.slice(0, 60)}`,
          )
        }
      }
    })
  }
})
