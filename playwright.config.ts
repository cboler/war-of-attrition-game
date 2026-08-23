import { defineConfig } from '@playwright/test';

/**
 * Playwright configuration for automated Google Play Store screenshot generation.
 * Generates verified, deterministic high-resolution assets for Phone, 7" Tablet,
 * and 10" Tablet / Desktop responsive layouts.
 */
export default defineConfig({
  testDir: './tests/screenshots',
  testMatch: /.*\.spec\.ts/,
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  workers: process.env['CI'] ? 2 : undefined,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: 'http://localhost:4200',
    browserName: 'chromium',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    bypassCSP: true,
  },
  projects: [
    {
      name: 'store-phone',
      use: {
        browserName: 'chromium',
        viewport: { width: 540, height: 960 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'store-tablet-7in',
      use: {
        browserName: 'chromium',
        viewport: { width: 600, height: 960 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'store-tablet-10in',
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 2,
        isMobile: false,
        hasTouch: false,
      },
    },
  ],
  webServer: {
    command: 'npx ng serve --port 4200',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
