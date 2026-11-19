const { test, expect } = require('./coverageFixture');

test.describe('Module 4.6: Responsive Layouts (3 Suites)', () => {
  const timestamp = Date.now();
  const testEmail = `responsive_tester_${timestamp}@focusflow.io`;
  const testPassword = 'ResponsivePass123!';
  const testName = 'Responsive Practitioner';

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('/signup');
    await page.fill('#name', testName);
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.click('#signup-submit-button');
    await expect(page).toHaveURL(/\/dashboard/);
    await page.close();
  });

  const loginUser = async (page) => {
    await page.goto('/login');
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.click('#login-submit-button');
    await expect(page).toHaveURL(/\/dashboard/);
  };

  // Suite 1: Desktop viewport drawer sidebar navigation & user profile
  test('Suite 1: should render desktop sidebar drawer on large viewports', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginUser(page);

    const desktopAside = page.locator('aside');
    await expect(desktopAside).toBeVisible();
    await expect(desktopAside.locator('a[href="/dashboard"]')).toBeVisible();
    await expect(desktopAside.locator('a[href="/sessions"]')).toBeVisible();
    await expect(desktopAside.locator('#desktop-logout-button')).toBeVisible();
  });

  // Suite 2: Mobile viewport bottom navigation bar display and active routes
  test('Suite 2: should render mobile bottom navigation dock on small viewport screens', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 13 dimensions
    await loginUser(page);

    // Desktop sidebar should be hidden
    const desktopAside = page.locator('aside');
    await expect(desktopAside).toBeHidden();

    // Bottom mobile bar should be visible
    const mobileBottomNav = page.locator('nav.md\\:hidden.fixed.bottom-0');
    await expect(mobileBottomNav).toBeVisible();
    await expect(mobileBottomNav.locator('a[href="/dashboard"]')).toBeVisible();
    await expect(mobileBottomNav.locator('a[href="/progress"]')).toBeVisible();
  });

  // Suite 3: Mobile top header drawer menu toggle and sign out
  test('Suite 3: should open mobile drawer modal on hamburger click and permit logout', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginUser(page);

    // Header hamburger button
    const hamburgerBtn = page.locator('header.md\\:hidden button').nth(1);
    await hamburgerBtn.click();

    // Mobile drawer should appear
    const mobileLogoutBtn = page.locator('#mobile-logout-button');
    await expect(mobileLogoutBtn).toBeVisible();
    await mobileLogoutBtn.click();

    await expect(page).toHaveURL(/\/(login)?$/);
  });
});
