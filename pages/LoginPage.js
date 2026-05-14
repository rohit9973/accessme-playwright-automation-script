// pages/LoginPage.js

import { BasePage } from './BasePage.js';
import logger from '../utils/logger.js';

export class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.emailInput    = page.locator('#loginEmailId').first();
    this.passwordInput = page.locator('#password').first();
    this.submitBtn     = page.locator('section').getByRole('button', { name: 'Sign In' }).first();
    this.errorMsg      = page.locator('#snackbar').first();
    this.eyeIcon        = page.getByText('visibility_off');
    this.forgotLink     = page.getByRole('heading', { name: 'Forgot Password?' }).first();
    this.signupLink     = page.getByText('Sign Up', { exact: true }) ;
  }


  async togglePassword() {
  await this.passwordInput.fill('test@123');
  await this.eyeIcon.click();
}


async clickForgotPassword() {
  await this.forgotLink.click();
}

async clickSignUp() {
  await this.signupLink.click();
}

async open() {
    await this.goto('https://app.access.me/signin');
    await this.page.waitForLoadState('networkidle');
    logger.info('Login page loaded');
  }
    
  async login(email, password, useEnter = false) {
  logger.info(`Logging in → ${email || 'empty'}`);

  await this.fill(this.emailInput, email.trim(), 'Email');
  await this.fill(this.passwordInput, password, 'Password');

  if (useEnter) {
    await this.passwordInput.press('Enter');
  } else {
    await this.submitBtn.click();
  }
}


 async login(email, password, useEnter = false) {
  logger.info(`Logging in → ${email || 'empty'}`);

  await this.fill(this.emailInput, email.trim(), 'Email');
  await this.fill(this.passwordInput, password, 'Password');

  if (useEnter) {
    await this.passwordInput.press('Enter');
  } else {
    await this.submitBtn.click();
  }
}
  async getErrorText() {
    await this.errorMsg.waitFor({ state: 'visible', timeout: 8_000 });
    const text = await this.errorMsg.innerText();
    logger.warn(`Error → "${text}"`);
    return text.toLowerCase();
  }

  async isLoggedIn() {
    try {
  await this.page.waitForURL('https://app.access.me/', {
    timeout: 10_000
  });
  logger.info(`Login success → redirected to: ${this.page.url()}`);
  return true;
} catch {
  logger.warn('Login failed — did not reach dashboard');
  return false;
}
  }

  async logout() {
    try {
      await this.page.getByRole('button', { name: 'user' }).first().click();
      await this.page.getByRole('menuitem', { name: 'Sign Out' }).first().click();
      await this.page.getByRole('button', { name: 'Sign Out' }).first().click();
      await this.page.waitForLoadState('domcontentloaded');
    } catch {
      logger.warn('Logout button not found');
    }
  }
}