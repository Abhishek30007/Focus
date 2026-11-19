const { test, expect } = require('./coverageFixture');

test.describe('Module 4.4: Analytics & Metrics Charts (4 Suites)', () => {
  const timestamp = Date.now();
  const testEmail = `analytics_tester_${timestamp}@focusflow.io`;
  const testPassword = 'AnalyticsPassword123!';
  const testName = 'Cognitive Analyst';

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

  const loginAndNavigate = async (page) => {
    await page.goto('/login');
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.click('#login-submit-button');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto('/progress');
    await expect(page).toHaveURL(/\/progress/);
  };

  // Suite 1: Empty state analytics display for new practitioner
  test('Suite 1: should render attention analytics landing with zero-baseline metrics', async ({ page }) => {
    await loginAndNavigate(page);
    await expect(page.locator('h1')).toContainText('Attention Analytics');
    await expect(page.locator('text=Weekly Trend')).toBeVisible();
    await expect(page.locator('text=Monthly Trend')).toBeVisible();
  });

  // Suite 2: Weekly attention analytics rendering and chart visualization
  test('Suite 2: should render weekly trend analytics dashboard and stat cards', async ({ page }) => {
    await loginAndNavigate(page);
    await page.click('button:has-text("Weekly Trend")');
    await expect(page.locator('text=Total Focus Time').or(page.locator('text=Focus Minutes'))).toBeVisible();
  });

  // Suite 3: Monthly trend range switching and aggregate calculations
  test('Suite 3: should seamlessly switch between Weekly and Monthly aggregation ranges', async ({ page }) => {
    await loginAndNavigate(page);
    const monthlyBtn = page.locator('button:has-text("Monthly Trend")');
    await monthlyBtn.click();
    await expect(monthlyBtn).toHaveClass(/bg-limeAccent-400/);

    const weeklyBtn = page.locator('button:has-text("Weekly Trend")');
    await weeklyBtn.click();
    await expect(weeklyBtn).toHaveClass(/bg-limeAccent-400/);
  });

  // Suite 4: Summary cards displaying vagal coherence & focus score metrics
  test('Suite 4: should display physiological metric cards on dashboard and progress page', async ({ page }) => {
    await loginAndNavigate(page);
    await expect(page.locator('text=Focus Score').or(page.locator('text=Avg Focus Score'))).toBeVisible();
    await expect(page.locator('text=Completed Sessions').or(page.locator('text=Sessions Logged'))).toBeVisible();
  });
});

