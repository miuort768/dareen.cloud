const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:5173';
const OUT = path.join(__dirname, 'screenshots');

const PAGES = [
  { name: 'design-system', url: `${BASE}/design-system` },
  { name: 'landing', url: BASE },
  { name: 'login', url: `${BASE}/login` },
];

async function capture(page, filePath) {
  // Wait for network to settle
  await page.waitForLoadState('networkidle');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: filePath, fullPage: true });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Users\\Fannan\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe',
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  for (const p of PAGES) {
    // Light mode
    console.log(`📸 ${p.name} — Light`);
    await page.goto(p.url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.evaluate(() => document.documentElement.classList.remove('dark'));
    await capture(page, path.join(OUT, `${p.name}-light.png`));

    // Dark mode
    console.log(`📸 ${p.name} — Dark`);
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await capture(page, path.join(OUT, `${p.name}-dark.png`));
  }

  // Dashboard needs auth — try to capture whatever renders
  console.log(`📸 dashboard — Light`);
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.evaluate(() => document.documentElement.classList.remove('dark'));
  await capture(page, path.join(OUT, 'dashboard-light.png'));

  console.log(`📸 dashboard — Dark`);
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await capture(page, path.join(OUT, 'dashboard-dark.png'));

  // Settings
  console.log(`📸 settings — Light`);
  await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.evaluate(() => document.documentElement.classList.remove('dark'));
  await capture(page, path.join(OUT, 'settings-light.png'));

  console.log(`📸 settings — Dark`);
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await capture(page, path.join(OUT, 'settings-dark.png'));

  await browser.close();
  console.log('✅ All screenshots captured');
})();
