const { test, expect } = require('./coverageFixture');

test.describe('Module 4.3: Biomarker & Mood Sliders (5 Suites)', () => {
  const openBiomarkerModal = async (page) => {
    const timestamp = Date.now() + Math.floor(Math.random() * 100000);
    const uniqueEmail = `biomarker_${timestamp}@focusflow.io`;

    await page.goto('/signup');
    await page.fill('#name', 'Veda Biometric');
    await page.fill('#email', uniqueEmail);
    await page.fill('#password', 'BiomarkerSecurePassword123!');
    await page.click('#signup-submit-button');
    await expect(page).toHaveURL(/\/dashboard/);

    const startBtn = page.locator('#dashboard-start-recommended-button');
    await expect(startBtn).toBeVisible();
    await startBtn.click();
    await expect(page.locator('h4:has-text("How is your energy right now?")')).toBeVisible();
  };

  // Suite 1: Calm score slider input bounds validation (1-10)
  test('Suite 1: should configure calm score slider within 1 to 10 scale', async ({ page }) => {
    await openBiomarkerModal(page);
    const calmSlider = page.locator('#calm-score-slider');
    await expect(calmSlider).toBeVisible();

    await calmSlider.fill('8');
    await expect(calmSlider).toHaveValue('8');
  });

  // Suite 2: Heart rate input bounds validation (40-200 BPM)
  test('Suite 2: should reject heart rate input below 40 BPM minimum physiological bound', async ({ page }) => {
    await openBiomarkerModal(page);
    const hrInput = page.locator('#heart-rate-input');
    await hrInput.fill('25'); // Invalid < 40 BPM
    await page.click('#mood-confirm-start-button');

    const errBanner = page.locator('#biomarker-error-message');
    await expect(errBanner).toBeVisible();
    await expect(errBanner).toContainText('Heart rate must be between 40 and 200 BPM');
  });

  // Suite 3: HRV input bounds validation (10-200 ms)
  test('Suite 3: should reject HRV input exceeding 200 ms physiological bound', async ({ page }) => {
    await openBiomarkerModal(page);
    const hrInput = page.locator('#heart-rate-input');
    await hrInput.fill('75'); // Valid

    const hrvInput = page.locator('#hrv-input');
    await hrvInput.fill('350'); // Invalid > 200 ms
    await page.click('#mood-confirm-start-button');

    const errBanner = page.locator('#biomarker-error-message');
    await expect(errBanner).toBeVisible();
    await expect(errBanner).toContainText('HRV (RMSSD) must be between 10 and 200 ms');
  });

  // Suite 4: Biomarker validation error banners preventing invalid launch
  test('Suite 4: should prevent session start until all biomarker bounds are strictly satisfied', async ({ page }) => {
    await openBiomarkerModal(page);
    const hrInput = page.locator('#heart-rate-input');
    await hrInput.fill('500'); // Extreme invalid
    await page.click('#mood-confirm-start-button');

    const errBanner = page.locator('#biomarker-error-message');
    await expect(errBanner).toBeVisible();
    await expect(page.locator('h4:has-text("How is your energy right now?")')).toBeVisible();
  });

  // Suite 5: Successful biomarker calibration and session initiation
  test('Suite 5: should accept valid physiological biomarkers and launch session timer', async ({ page }) => {
    await openBiomarkerModal(page);
    await page.locator('#calm-score-slider').fill('7');
    await page.locator('#heart-rate-input').fill('68');
    await page.locator('#hrv-input').fill('55');
    await page.click('button:has-text("🧘 CALM")');

    await page.click('#mood-confirm-start-button');
    await expect(page).toHaveURL(/\/sessions\//);
  });
});
