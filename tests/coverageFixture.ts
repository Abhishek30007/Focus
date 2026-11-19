import { test as base, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export const test = base.extend({});

test.afterEach(async ({ page }, testInfo) => {
  try {
    const coverage = await page.evaluate(() => (window as any).__coverage__);
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
    // Non-fatal if page was closed or coverage wasn't instrumented on external domain
  }
});

export { expect };

