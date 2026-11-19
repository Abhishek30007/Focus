import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration supporting:
 * - Desktop Chrome
 * - Desktop Firefox
 * - Desktop WebKit (Safari)
 * - Mobile iPhone 13
 * - Mobile Pixel 5
 * Integrated with Istanbul / NYC code coverage collection.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Avoid database session collision during test runs
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Desktop Firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Desktop Safari',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile iPhone 13',
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'Mobile Pixel 5',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: [
    {
      command: 'node backend/server.js',
      url: 'http://localhost:5000/',
      reuseExistingServer: true,
      timeout: 30000,
    },
    {
      command: 'npm --prefix frontend run dev',
      url: 'http://localhost:5173/',
      reuseExistingServer: true,
      timeout: 30000,
    },
  ],
});

