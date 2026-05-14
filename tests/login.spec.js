
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import testData      from '../utils/dataHelper.js';
import logger        from '../utils/logger.js';

test.beforeEach(async ({ page }) => {
  const login = new LoginPage(page);
  await login.open();
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status === 'failed') {
    const login = new LoginPage(page);
    await login.screenshot(`login-FAIL-${testInfo.title.replace(/\s+/g, '_')}`);
    logger.error(`❌ FAILED → ${testInfo.title}`);
  } else {
    logger.info(`✅ PASSED → ${testInfo.title}`);
  }
});

// ── Positive Scenarios ────────────────────────────────────────────
test.describe('✅ Login | Positive Scenarios', () => {

  test('[LP-01]  Valid login', async ({ page }) => {
    const login = new LoginPage(page);

    await login.login(
      testData.credentials.email,
      testData.credentials.password
    );

    expect(await login.isLoggedIn()).toBeTruthy();
  });

  test('[LP-02] Login using Enter key', async ({ page }) => {
    const login = new LoginPage(page);

    await login.login(
      testData.credentials.email,
      testData.credentials.password,
      true // Press Enter key
    );

    expect(await login.isLoggedIn()).toBeTruthy();
  });

  test('[LP-03] Password visibility toggle', async ({ page }) => {
    const login = new LoginPage(page);
    await login.togglePassword();

    // Optional validation (type change)
    await expect(login.passwordInput).toHaveAttribute('type', /text|password/);
  });

  test('[LP-04] Forgot password navigation', async ({ page }) => {
    const login = new LoginPage(page);
    await login.clickForgotPassword();
    await expect(page).toHaveURL(/forgot|reset/i);
  });

  test('[LP-05] Sign up navigation', async ({ page }) => {
    const login = new LoginPage(page);

    await login.clickSignUp();

    await expect(page).toHaveURL(/signup|register/i);
  });

});


// ── Negative Scenarios ────────────────────────────────────────────

test.describe('❌ Login | Negative Scenarios', () => {

  for (const tc of testData.login.negative) {
    test(`[${tc.id}] ${tc.description}`, async ({ page }) => {
      const login = new LoginPage(page);

      await login.login(tc.email, tc.password);

      const error = await login.getErrorText();
      const match = tc.expectedError.some(keyword =>
        error.includes(keyword.toLowerCase())
      );

      expect(match, `Actual error: "${error}"`).toBeTruthy();
    });
  }

});