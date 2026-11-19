import { test, expect } from '@playwright/test';

test.describe('FocusFlow Core User Journey', () => {
  const uniqueEmail = `journey-${Date.now()}@example.com`;
  const password = 'password123';
  const name = 'Flow Practitioner';

  test.beforeAll(async () => {
    // Seed/register the user once to use in multiple steps or do it in the first test
  });

  test('should complete the entire focus session cycle', async ({ page }) => {
    // 1. SIGNUP & ONBOARD
    await page.goto('/signup');
    await page.fill('#name', name);
    await page.fill('#email', uniqueEmail);
    await page.fill('#password', password);
    await page.click('#signup-submit-button');
    await expect(page).toHaveURL(/\/dashboard/);

    // 2. CHOOSE A SUGGESTED SESSION & LAUNCH
    // Look for recommended session start button
    const startBtn = page.locator('#dashboard-start-recommended-button');
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    // 3. SET STARTING MOOD
    // Confirm mood modal appears
    await expect(page.locator('h4:has-text("How is your energy right now?")')).toBeVisible();
    // Select 'Calm'
    await page.click('button:has-text("🧘 CALM")');
    // Launch timer
    await page.click('#mood-confirm-start-button');

    // 4. TIMER COUNTDOWN SCREEN
    // Should transition to active session timer page
    await expect(page).toHaveURL(/\/sessions\//);
    await expect(page.locator('text=Active Meditation Training').or(page.locator('text=Active Focus Training')).or(page.locator('text=Active Flow Training'))).toBeVisible();

    // Click pause / resume to verify controls
    const toggleBtn = page.locator('#timer-toggle-button');
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click(); // Pause
    await expect(page.locator('text=PAUSED')).toBeVisible();
    await toggleBtn.click(); // Resume
    await expect(page.locator('text=FLOWING')).toBeVisible();

    // 5. ABORT / LOG EARLY
    // Click abort early to log the session with partial duration
    await page.click('#timer-abort-button');

    // 6. POST-SESSION ASSESSMENT MODAL
    await expect(page.locator('h4:has-text("How do you feel after this session?")')).toBeVisible();
    // Pick 'Refocused'
    await page.click('button:has-text("🎯 REFOCUSED")');
    // Write optional notes
    await page.fill('textarea[placeholder*="Write any thoughts"]', 'Felt grounded and ready to start my tasks.');
    // Save
    await page.click('#timer-confirm-complete-button');

    // 7. VIEW SUMMARY STATS
    await expect(page.locator('h2:has-text("Attention Shift Saved")')).toBeVisible();
    // Click return to dashboard
    await page.click('#summary-return-dashboard-button');
    await expect(page).toHaveURL(/\/dashboard/);

    // 8. VERIFY RECENT LOGS UPDATED
    // The recent sessions list should contain a row matching 'Felt grounded' or our starting session title
    const recentLogsTable = page.locator('table');
    await expect(recentLogsTable).toBeVisible();
    await expect(page.locator('td:has-text("Refocused")').first()).toBeVisible();

    // 9. GO TO SETTINGS & UPDATE PREFERENCES
    // Click Analytics or Settings from Nav
    const settingsLink = page.locator('aside nav a[href="/settings"]').first();
    await settingsLink.click();
    await expect(page).toHaveURL(/\/settings/);

    // Update Preferred Focus time
    await page.selectOption('select[class*="glass-input"]:has-text("mins")', '5'); // 5 mins
    // Save settings
    await page.click('#settings-save-button');
    
    // Verify success banner appears
    await expect(page.locator('text=preferences updated successfully')).toBeVisible();

    // Update name in Profile details form
    await page.fill('input[value="Flow Practitioner"]', 'Aligned Practitioner');
    await page.click('#profile-save-button');
    
    // Verify success banner
    await expect(page.locator('text=profile updated successfully')).toBeVisible();
  });
});
