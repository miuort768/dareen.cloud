/**
 * Dynamic UI Audit — interactive, Playwright-driven check per role.
 *
 * For every protected route of a role it performs a FULL page reload (real user),
 * then inspects every interactive element and reports:
 *   - covered / unclickable elements (something is stacked on top: overlay, z-index, pointer-events)
 *   - pointer-events:none on non-disabled controls
 *   - route health: redirected to /login, error boundary, no-access screen, stuck spinner
 *
 * Output: e2e/reports/audit-<project>-<role>.json  (JSON per project x role)
 * Run:   npx playwright test e2e/dynamic-audit.spec.ts --reporter=line
 */
import { test, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const REPORT_DIR = path.join(__dirname, 'reports');

const ROLES = [
  { id: 'admin', username: 'admin', password: '123456' },
  { id: 'teacher', username: 'demo_teacher_1', password: '123456' },
  { id: 'student', username: 'demo_student_1', password: '123456' },
  { id: 'parent', username: 'demo_parent_1', password: '123456' },
];

const ROUTES: Record<string, string[]> = {
  admin: [
    '/admin-dashboard', '/teachers', '/students', '/parents', '/evaluations', '/monthly-closing',
    '/attendance', '/schedule', '/agenda', '/appointments', '/finance', '/leads', '/trial-sessions',
    '/student-invoices', '/teacher-invoices', '/tasks', '/chat', '/reports', '/settings', '/announcements',
    '/forum', '/admin-jobs', '/admin-contacts', '/roles', '/monitoring', '/admin/blog', '/admin/blog-customers',
    '/student-profile', '/teacher-profile', '/parent-profile', '/teacher-payment-history', '/parent-payment-history',
  ],
  teacher: [
    '/teacher-dashboard', '/attendance', '/schedule', '/agenda', '/appointments', '/tasks', '/chat',
    '/teacher-profile', '/teacher-payment-history',
  ],
  student: ['/student-dashboard', '/student-profile', '/chat'],
  parent: ['/parent-dashboard', '/parent-students', '/parent-announcements', '/parent-profile', '/parent-payment-history', '/chat'],
};

type AuditItem = any;
type AuditEntry = {
  route: string;
  pathname: string;
  redirectedToLogin: boolean;
  errorBoundary: boolean;
  noAccess: boolean;
  spinnerVisible: boolean;
  interactiveCount: number;
  viteError: string;
  covered: AuditItem[];
  pointerEventsNone: AuditItem[];
};

function detectOverlays(): AuditItem[] {
  const sel = [
    'button', 'a[href]', 'select',
    '[role="button"]', '[role="tab"]', '[role="menuitem"]', '[role="menuitemcheckbox"]', '[role="radio"]',
    '[aria-haspopup]', 'input:not([type="hidden"])', 'textarea',
  ].join(',');
  const els = Array.from(document.querySelectorAll(sel)) as HTMLElement[];
  const items: AuditItem[] = [];
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const offscreen = cx < 0 || cy < 0 || cx > window.innerWidth || cy > window.innerHeight;
    const top = offscreen ? null : document.elementFromPoint(cx, cy);
    const covered = !offscreen && !!top && !el.contains(top);
    const rec: AuditItem = {
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
    };
    if (covered && top) {
      const os = getComputedStyle(top);
      rec.overlay = {
        tag: top.tagName.toLowerCase(),
        id: top.id || '',
        cls: (typeof top.className === 'string' ? top.className : '').slice(0, 180),
        text: (top.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 90),
        z: os.zIndex,
        pos: os.position,
        pe: os.pointerEvents,
        opacity: os.opacity,
      };
    }
    items.push(rec);
  }
  return items;
}

async function login(page: Page, username: string, password: string): Promise<string> {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.locator('form input[type="text"]').first().fill(username);
  await page.locator('form input[type="password"]').first().fill(password);
  await page.locator('form button[type="submit"]').click();
  try {
    await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 20000 });
  } catch {
    // login failed or server unreachable — recorded by caller
  }
  await page.waitForTimeout(1500);
  return new URL(page.url()).pathname;
}

async function auditRoute(page: Page, route: string): Promise<AuditEntry> {
  await page.goto(route, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2400);
  const pathname = new URL(page.url()).pathname;
  const errCount = await page.locator('text=/عذراً، حدث خطأ|حدث خطأ غير متوقع|حدث خطأ أثناء/').count();
  const noAccess = await page.locator('text=/ليس لديك صلاحية|غير مصرح|Forbidden/').count();
  const spinner = await page.locator('.animate-spin, [class*="skeleton"], .spinner').count();
  const viteError = await page.locator('#vite-error-overlay').textContent({ timeout: 1500 }).catch(() => null);
  const items = await page.evaluate(detectOverlays);
  const covered = items.filter((i: AuditItem) => i.covered && i.overlay && !i.disabled);
  const peNone = items.filter((i: AuditItem) => !i.covered && i.pe === 'none' && !i.disabled);
  return {
    route,
    pathname,
    redirectedToLogin: pathname.startsWith('/login'),
    errorBoundary: errCount > 0,
    noAccess: noAccess > 0,
    spinnerVisible: spinner > 0,
    interactiveCount: items.length,
    viteError: (viteError || '').replace(/\s+/g, ' ').slice(0, 400),
    covered,
    pointerEventsNone: peNone,
  };
}

test.describe('Dynamic UI Audit (report only — no fixes)', () => {
  for (const role of ROLES) {
    test(`audit role: ${role.id}`, async ({ page }, testInfo) => {
      test.setTimeout(600000);
      const entries: AuditEntry[] = [];

      const loginPath = await login(page, role.username, role.password);
      entries.push({
        route: '/login', pathname: loginPath, redirectedToLogin: loginPath.startsWith('/login'),
        errorBoundary: false, noAccess: false, spinnerVisible: false,
        interactiveCount: 0, viteError: '', covered: [], pointerEventsNone: [],
      });

      for (const route of ROUTES[role.id]) {
        entries.push(await auditRoute(page, route));
      }

      fs.mkdirSync(REPORT_DIR, { recursive: true });
      const reportFile = path.join(REPORT_DIR, `audit-${testInfo.project.name}-${role.id}.json`);
      fs.writeFileSync(reportFile, JSON.stringify(entries, null, 2));

      const coveredTotal = entries.reduce((n, r) => n + r.covered.length, 0);
      const peTotal = entries.reduce((n, r) => n + r.pointerEventsNone.length, 0);
      const broken = entries.filter((r) => r.errorBoundary || r.redirectedToLogin).length;

      console.log(`[AUDIT] ${testInfo.project.name}/${role.id}: routes=${ROUTES[role.id].length} covered=${coveredTotal} pe:none=${peTotal} broken=${broken} report=${reportFile}`);

      for (const e of entries) {
        if (e.viteError) console.log(`  !! ${role.id} ${e.route} -> VITE RUNTIME ERROR: ${e.viteError.slice(0, 260)}`);
        if (e.errorBoundary) console.log(`  !! ${role.id} ${e.route} -> ERROR BOUNDARY (${e.pathname})`);
        if (e.redirectedToLogin) console.log(`  !! ${role.id} ${e.route} -> REDIRECTED TO LOGIN (${e.pathname})`);
        if (e.noAccess) console.log(`  ?? ${role.id} ${e.route} -> no-access/403 text shown (${e.pathname})`);
        if (e.spinnerVisible && e.interactiveCount === 0) console.log(`  ?? ${role.id} ${e.route} -> stuck spinner, 0 interactive elements`);
        for (const it of e.covered.slice(0, 10)) {
          const label = it.text || it.aria || it.href || it.cls.slice(0, 40);
          const ov = it.overlay;
          console.log(`  X ${role.id} ${e.route}: <${it.tag}> "${label}" COVERED by <${ov.tag}> z=${ov.z} pos=${ov.pos} pe=${ov.pe} cls=${ov.cls.slice(0, 70)}`);
        }
        if (e.covered.length > 10) console.log(`    ... ${role.id} ${e.route}: +${e.covered.length - 10} more covered`);
        for (const it of e.pointerEventsNone.slice(0, 5)) {
          const label = it.text || it.aria || it.href || it.cls.slice(0, 40);
          console.log(`  P ${role.id} ${e.route}: <${it.tag}> "${label}" has pointer-events:none (not disabled)`);
        }
      }
    });
  }
});
