import { defineConfig } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  testDir:       './tests',
  timeout:        60_000,
  expect:        { timeout: 10_000 },
  fullyParallel:  false,
  retries:        1,
  workers:        1,

  reporter: [
    // ['./utils/reporter.js'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }],
  ],

  use: {
    baseURL:    process.env.BASE_URL ?? 'https://app.access.me',
    headless:   false,

    // ── THE CORRECT FULLSCREEN FIX ────────────────────────────
    // Do NOT spread ...devices['Desktop Chrome'] — it re-adds
    // deviceScaleFactor which conflicts with viewport:null
    viewport:          null,       // let browser use full screen size
    deviceScaleFactor: undefined,  // MUST be undefined when viewport is null
    launchOptions: {
      args: ['--start-maximized'],
    },

    screenshot: 'only-on-failure',
    video:      'retain-on-failure',
    trace:      'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        browserName:'chromium',
        headless: true,
        viewport: null,
        deviceScaleFactor: undefined,
        launchOptions: { args: ['--start-maximized'] },
      },
    },
    {
      name: 'firefox',
      use: {
        browserName:       'firefox',
        headless:          true,
        viewport:          null,
        deviceScaleFactor: undefined,
        launchOptions: { args: ['-width', '1920', '-height', '1080'] },
      },
    },
  ],

  outputDir: 'reports/test-artifacts',
});