const { test, expect } = require('./coverageFixture');

test.describe('Module 4.5: Network Edge Cases & Resilience (4 Suites)', () => {
  const timestamp = Date.now();
  const testEmail = `network_tester_${timestamp}@focusflow.io`;
  const testPassword = 'NetworkSecurePassword123!';
  const testName = 'Resilience Tester';

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

  // Suite 1: Dashboard API 500 error graceful fallback banner
  test('Suite 1: should display fallback error UI when dashboard API returns 500 internal error', async ({ page }) => {
    await loginUser(page);

    // Intercept dashboard route and mock 500 HTTP server error
    await page.route('**/api/dashboard', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: { code: 'INTERNAL_SERVER_ERROR', message: 'Simulated backend database disconnect' }
        })
      });
    });

    await page.goto('/dashboard');
    const errorBanner = page.locator('#error-message');
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText('Failed to fetch dashboard data');
  });

  // Suite 2: Session template API 500 error resilience
  test('Suite 2: should display error banner when session template endpoint fails with 500', async ({ page }) => {
    await loginUser(page);

    await page.route('**/api/sessions/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: { code: 'SESSION_FETCH_FAILED', message: 'Session cluster offline' }
        })
      });
    });

    await page.goto('/sessions/mock-template-id');
    await expect(page.locator('text=Failed to fetch session configurations').or(page.locator('text=Could not auto-start focus log in background.'))).toBeVisible();
  });

  // Suite 3: Analytics API 500 network failure error recovery
  test('Suite 3: should display error notification when analytics endpoint fails with 500', async ({ page }) => {
    await loginUser(page);

    await page.route('**/api/progress/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: { code: 'ANALYTICS_DOWN', message: 'Aggregator pipeline failed' }
        })
      });
    });

    await page.goto('/progress');
    await expect(page.locator('text=Could not retrieve progress analytics.')).toBeVisible();
  });

  // Suite 4: Auth server failure resilience
  test('Suite 4: should display network failure feedback on login when auth service throws 500', async ({ page }) => {
    await page.goto('/login');

    await page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: { code: 'AUTH_GATEWAY_TIMEOUT', message: 'Authentication gateway unreachable' }
        })
      });
    });

    await page.fill('#email', 'practitioner@network-edge.io');
    await page.fill('#password', 'AnyPassword123');
    await page.click('#login-submit-button');

    const err = page.locator('#error-message');
    await expect(err).toBeVisible();
    await expect(err).toContainText('Login failed');
  });
});

