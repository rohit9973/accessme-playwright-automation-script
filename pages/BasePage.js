// pages/BasePage.js
// Shared helpers used by every page object

import logger from '../utils/logger.js';
import path from 'path';
import fs from 'fs';

export class BasePage {
  constructor(page) {
    this.page = page;
    if (!fs.existsSync('reports/screenshots')) {
      fs.mkdirSync('reports/screenshots', { recursive: true });
    }
  }

  async goto(url) {
    logger.info(`Navigating → ${url}`);
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async fill(locator, value, label) {
    logger.debug(`Filling ${label}`);
    await locator.waitFor({ state: 'visible' });
    await locator.clear();
    await locator.fill(value);
  }

  async click(locator, label) {
    logger.debug(`Clicking ${label}`);
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  async screenshot(name) {
    const file = path.join('reports/screenshots', `${name}-${Date.now()}.png`);
    await this.page.screenshot({ path: file, fullPage: true });
    logger.warn(`Screenshot saved → ${file}`);
  }
}