
import { defineConfig, devices } from '@playwright/test';

/**
 * URQR Platform — Phase 1 Standalone Manager POS
 * Bharath | QA Automation & Hardware Lead
 * Playwright E2E & Cross-Browser Configuration
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],

  use: {
    baseURL: process.env.FRONTEND_BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },

  projects: [
    // Standard Desktop Cross-Browser Profiles
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // POS Counter Terminal — Touch Display (1366x768 standard cashier counter)
    {
      name: 'POS-Counter-1366x768',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 },
        isMobile: false,
        hasTouch: true,
      },
    },

    // POS Standard Display — Touch Display (1600x900 widescreen terminal)
    {
      name: 'POS-Standard-1600x900',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1600, height: 900 },
        isMobile: false,
        hasTouch: true,
      },
    },

    // POS Full Desktop Display — Touch Display (1920x1080 high-res counter display)
    {
      name: 'POS-Desktop-1920x1080',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        isMobile: false,
        hasTouch: true,
      },
    },
  ],
});
