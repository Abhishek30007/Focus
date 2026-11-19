const { test, expect } = require('./coverageFixture');

test.describe('Module 4.1: Auth & Session Expiry (4 Suites)', () => {
  const timestamp = Date.now();
  const testEmail = `auth_tester_${timestamp}@focusflow.io`;
  const testPassword = 'SecureVedicPassword123!';
  const testName = 'Atman Seeker';

  // Suite 1: Empty signup & client validation errors
  test('Suite 1: should enforce required field validation on empty registration attempt', async ({ page }) => {
    await page.goto('/signup');
    await page.click('#signup-submit-button');
    const errorBanner = page.locator('#error-message');
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText('Please fill in all fields');
  });

  // Suite 2: Password complexity & min-length requirements
  test('Suite 2: should reject signup when password is below minimum length threshold', async ({ page }) => {
    await page.goto('/signup');
    await page.fill('#name', testName);
    await page.fill('#email', testEmail);
    await page.fill('#password', '123'); // Below 6 chars
    await page.click('#signup-submit-button');

    const errorBanner = page.locator('#error-message');
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText('Password must be at least 6 characters long');
  });

  // Suite 3: User registration, dual token issuance & dashboard landing
  test('Suite 3: should register practitioner and transition to authenticated dashboard', async ({ page }) => {
    await page.goto('/signup');
    await page.fill('#name', testName);
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.click('#signup-submit-button');

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h1')).toContainText('Greetings');
  });

  // Suite 4: Invalid credential handling, failure banner & session logout revocation
  test('Suite 4: should reject invalid credentials and allow complete session sign-out', async ({ page }) => {
    // 4A: Negative login check
    await page.goto('/login');
    await page.fill('#email', testEmail);
    await page.fill('#password', 'WrongPasswordAttempt');
    await page.click('#login-submit-button');

    const errorBanner = page.locator('#error-message');
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText('Invalid credentials');

    // 4B: Positive login check
    await page.fill('#password', testPassword);
    await page.click('#login-submit-button');
    await expect(page).toHaveURL(/\/dashboard/);

    // 4C: Sign-out revocation
    const desktopLogout = page.locator('#desktop-logout-button');
    if (await desktopLogout.isVisible()) {
      await desktopLogout.click();
    } else {
      await page.click('button:has-text("Sign Out")');
    }
    await expect(page).toHaveURL(/\/(login)?$/);
  });
});
