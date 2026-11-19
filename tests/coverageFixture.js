const { test: base, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Custom Playwright test fixture instrumented with Istanbul/NYC code coverage extraction
 */
const test = base.extend({});

test.afterEach(async ({ page }, testInfo) => {
  try {
    const coverage = await page.evaluate(() => window.__coverage__);
    if (coverage) {
      const nycOutputDir = path.join(process.cwd(), '.nyc_output');
      if (!fs.existsSync(nycOutputDir)) {
        fs.mkdirSync(nycOutputDir, { recursive: true });
      }
      const hash = crypto.randomBytes(6).toString('hex');
      const sanitizedTitle = testInfo.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40);
      const filePath = path.join(nycOutputDir, `coverage_${sanitizedTitle}_${hash}.json`);
      fs.writeFileSync(filePath, JSON.stringify(coverage, null, 2));
    }
  } catch (err) {
    // Non-fatal if page closed or coverage unavailable
  }
});

module.exports = { test, expect };

