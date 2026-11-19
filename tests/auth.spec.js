import { test, expect } from '@playwright/test';

test.describe('FocusFlow Authentication Flow', () => {
  const uniqueEmail = `test-${Date.now()}@example.com`;
  const password = 'password123';
  const name = 'Test Practitioner';

  test('should show validation error on empty signup form', async ({ page }) => {
    await page.goto('/signup');
    await page.click('#signup-submit-button');
    const errorBanner = page.locator('#error-message');
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText('Please fill in all fields');
  });

  test('should show validation error on short password', async ({ page }) => {
    await page.goto('/signup');
    await page.fill('#name', name);
    await page.fill('#email', uniqueEmail);
    await page.fill('#password', '123');
    await page.click('#signup-submit-button');
    const errorBanner = page.locator('#error-message');
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText('Password must be at least 6 characters long');
  });

  test('should successfully register a new user', async ({ page }) => {
    await page.goto('/signup');
    await page.fill('#name', name);
    await page.fill('#email', uniqueEmail);
    await page.fill('#password', password);
    await page.click('#signup-submit-button');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h1')).toContainText('Greetings');
  });

  test('should fail to login with wrong credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', uniqueEmail);
    await page.fill('#password', 'wrongpassword');
    await page.click('#login-submit-button');

    const errorBanner = page.locator('#error-message');
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText('Invalid credentials');
  });

  test('should login successfully with correct credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', uniqueEmail);
    await page.fill('#password', password);
    await page.click('#login-submit-button');

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h1')).toContainText('Greetings');
  });

  test('should successfully logout', async ({ page }) => {
    // First, login
    await page.goto('/login');
    await page.fill('#email', uniqueEmail);
    await page.fill('#password', password);
    await page.click('#login-submit-button');
    await expect(page).toHaveURL(/\/dashboard/);

    // Click logout
    // Check if desktop sidebar logout is visible
    const logoutBtn = page.locator('#desktop-logout-button');
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
    } else {
      // Toggle mobile menu
      await page.click('button:has-text("Sign Out")');
    }

    // Should redirect back to landing page or login
    await expect(page).toHaveURL('/');
  });
});
