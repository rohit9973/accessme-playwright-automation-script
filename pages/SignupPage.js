// pages/SignupPage.js

import { BasePage } from './BasePage.js';
import logger from '../Utils/logger.js';

export class SignupPage extends BasePage {
  constructor(page) {
    super(page);
    this.fullNameInput   = page.locator('#signUpUserNameId').first()
    this.emailInput      = page.locator('#signupemailInput').first();
    this.passwordInput   = page.locator('#signupPassord').first();
    this.confirmPassInput= page.locator('#signupConfirmPassord').first();
    this.submitBtn       = page.getByRole('button', { name: 'Sign Up' }).first();
    this.errorMsg        = page.locator('#snackbar').first();
    this.successMsg      = page.locator('#snackbar').first();
  }

  async open() {
    await this.goto('https://app.access.me/signup');
    await this.page.waitForLoadState('networkidle');
    logger.info('Signup page loaded');
  }

  async register(user) {
    logger.info(`Registering → ${user.email}`);
    await this.fill(this.fullNameInput,    user.fullName,        'Full Name');
    await this.fill(this.emailInput,       user.email,           'Email');
    await this.fill(this.passwordInput,    user.password,        'Password');
    await this.fill(this.confirmPassInput, user.confirmPassword, 'Confirm Password');
    await this.submitBtn.click();
  }

  async getErrorText() {
    await this.errorMsg.waitFor({ state: 'visible', timeout: 8_000 });
    const text = await this.errorMsg.innerText();
    logger.warn(`Error → "${text}"`);
    return text.toLowerCase();
  }

  async isSuccessVisible() {
   try {
      await this.page.waitForURL(
        url => !url.includes('/signup'),
        { timeout: 10_000 }
      );
      logger.info(`Signup success → ${this.page.url()}`);
      return true;
    } catch {
      try {
        await this.successMsg.waitFor({ state: 'visible', timeout: 3_000 });
        return true;
      } catch { return false; }
    }
  }
}