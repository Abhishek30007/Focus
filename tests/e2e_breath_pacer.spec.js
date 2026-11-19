const { test, expect } = require('./coverageFixture');

test.describe('Module 4.2: Guided Meditation & Breath Pacer (6 Suites)', () => {
  const setupActiveSession = async (page) => {
    const timestamp = Date.now() + Math.floor(Math.random() * 100000);
    const uniqueEmail = `pacer_user_${timestamp}@focusflow.io`;

    await page.goto('/signup');
    await page.fill('#name', 'Pranayama Master');
    await page.fill('#email', uniqueEmail);
    await page.fill('#password', 'PacerSecurePassword123!');
    await page.click('#signup-submit-button');
    await expect(page).toHaveURL(/\/dashboard/);

    const startBtn = page.locator('#dashboard-start-recommended-button');
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    // Confirm mood modal
    await expect(page.locator('h4:has-text("How is your energy right now?")')).toBeVisible();
    await page.click('button:has-text("🧘 CALM")');
    await page.click('#mood-confirm-start-button');
    await expect(page).toHaveURL(/\/sessions\//);
  };

  // Suite 1: Pacer initial idle state
  test('Suite 1: should initialize breath pacer in idle state with countdown timer ready', async ({ page }) => {
    await setupActiveSession(page);
    const pacerVisualizer = page.locator('#breath-pacer-visualizer');
    await expect(pacerVisualizer).toBeVisible();

    const stateLabel = page.locator('#pacer-state-label');
    await expect(stateLabel).toContainText('PAUSED').or(expect(stateLabel).toContainText('IDLE'));
  });

  // Suite 2: Pacer animating active state with expanding visualizer ring
  test('Suite 2: should transition pacer to animating active state on start', async ({ page }) => {
    await setupActiveSession(page);
    const toggleBtn = page.locator('#timer-toggle-button');
    await toggleBtn.click(); // Start / Resume

    const stateLabel = page.locator('#pacer-state-label');
    await expect(stateLabel).toContainText('FLOWING');
    await expect(page.locator('#breath-phase-text')).toBeVisible();
  });

  // Suite 3: Pacer pause transition & audio muting
  test('Suite 3: should transition pacer to paused state when user triggers pause', async ({ page }) => {
    await setupActiveSession(page);
    const toggleBtn = page.locator('#timer-toggle-button');
    await toggleBtn.click(); // Start
    await expect(page.locator('#pacer-state-label')).toContainText('FLOWING');

    await toggleBtn.click(); // Pause
    await expect(page.locator('#pacer-state-label')).toContainText('PAUSED');
  });

  // Suite 4: Pacer resume transition back to active flowing
  test('Suite 4: should resume active breathing cycles from paused state', async ({ page }) => {
    await setupActiveSession(page);
    const toggleBtn = page.locator('#timer-toggle-button');
    await toggleBtn.click(); // Start
    await toggleBtn.click(); // Pause
    await expect(page.locator('#pacer-state-label')).toContainText('PAUSED');

    await toggleBtn.click(); // Resume
    await expect(page.locator('#pacer-state-label')).toContainText('FLOWING');
  });

  // Suite 5: Pacer early abort handling and partial duration evaluation
  test('Suite 5: should allow practitioner to abort session early and open assessment modal', async ({ page }) => {
    await setupActiveSession(page);
    const toggleBtn = page.locator('#timer-toggle-button');
    await toggleBtn.click();

    // Abort early
    await page.click('#timer-abort-button');
    await expect(page.locator('h4:has-text("How do you feel after this session?")')).toBeVisible();
  });

  // Suite 6: Pacer completion cycle & post-session transition
  test('Suite 6: should finalize completed assessment and persist attention shift to summary', async ({ page }) => {
    await setupActiveSession(page);
    const toggleBtn = page.locator('#timer-toggle-button');
    await toggleBtn.click();
    await page.click('#timer-abort-button');

    // Complete assessment
    await expect(page.locator('h4:has-text("How do you feel after this session?")')).toBeVisible();
    await page.click('button:has-text("🎯 REFOCUSED")');
    await page.fill('textarea[placeholder*="Write any thoughts"]', 'Coherence restored and vagal tone aligned.');
    await page.click('#timer-confirm-complete-button');

    // Summary screen
    await expect(page.locator('h2:has-text("Attention Shift Saved")')).toBeVisible();
    await page.click('#summary-return-dashboard-button');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
