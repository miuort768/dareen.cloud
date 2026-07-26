import { test, expect } from '@playwright/test';

test.describe('Public Pages - Critical Paths', () => {
  test('homepage loads with logo and navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=دارين السابعة').first()).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
  });

  test('navigation links work', async ({ page }) => {
    await page.goto('/');
    await page.click('text=الدورات');
    await expect(page).toHaveURL('/courses');

    await page.click('text=المكتبة');
    await expect(page).toHaveURL('/books');

    await page.click('text=من نحن');
    await expect(page).toHaveURL('/about');

    await page.click('text=اتصل بنا');
    await expect(page).toHaveURL('/contact');
  });

  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="text"], input[name="username"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('courses page loads', async ({ page }) => {
    await page.goto('/courses');
    await expect(page.locator('text=الدورات').first()).toBeVisible();
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('body')).toBeVisible();
  });

  test('contact page loads', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('SEO & Meta', () => {
  test('homepage has correct title', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toContain('دارين');
  });

  test('robots.txt is accessible', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);
  });

  test('sitemap.xml is accessible', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBe(200);
  });
});

test.describe('Responsive - Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('mobile header shows hamburger menu', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[aria-label*="فتح القائمة"]').first()).toBeVisible();
  });

  test('mobile menu opens and shows nav items', async ({ page }) => {
    await page.goto('/');
    await page.click('[aria-label*="فتح القائمة"]');
    await expect(page.locator('text=الرئيسية').first()).toBeVisible();
  });
});
