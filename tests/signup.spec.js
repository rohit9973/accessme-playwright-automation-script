// tests/signup.spec.js
// Sign-Up: 5 Positive + 5 Negative

import { test, expect } from '@playwright/test';
import { SignupPage } from '../pages/SignupPage.js';
import testData       from '../utils/dataHelper.js';
import logger         from '../utils/logger.js';

test.beforeEach(async ({ page }) => {
  const signup = new SignupPage(page);
  await signup.open();
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status === 'failed') {
    const signup = new SignupPage(page);
    await signup.screenshot(`signup-FAIL-${testInfo.title.replace(/\s+/g, '_')}`);
    logger.error(`❌ FAILED → ${testInfo.title}`);
  } else {
    logger.info(`✅ PASSED → ${testInfo.title}`);
  }
});

// ── Positive ──────────────────────────────────────────────────────

test.describe('✅ Sign-Up | Positive Scenarios', () => {
  for (const tc of testData.signup.positive) {
    test(`[${tc.id}] ${tc.description}`, async ({ page }) => {
      logger.info(`Running ${tc.id}: ${tc.description}`);
      const signup = new SignupPage(page);
      await signup.register(tc);
      expect(await signup.isSuccessVisible()).toBeTruthy();
    });
  }
});

// ── Negative ──────────────────────────────────────────────────────

test.describe('❌ Sign-Up | Negative Scenarios', () => {
  for (const tc of testData.signup.negative) {
    test(`[${tc.id}] ${tc.description}`, async ({ page }) => {
      logger.info(`Running ${tc.id}: ${tc.description}`);
      const signup = new SignupPage(page);
      await signup.register(tc);
      const error = await signup.getErrorText();
      expect(error, `Expected error containing "${tc.expectedError}"`).toContain(tc.expectedError);
    });
  }
});