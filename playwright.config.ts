
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: 'html',

  use: {
  trace: 'retain-on-failure',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
},

  projects: [
    // Existing browser configurations
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

    // POS Counter Terminal
    {
      name: 'POS-Counter-1366x768',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 },
        isMobile: false,
        hasTouch: true,
      },
    },

    // POS Standard Display
    {
      name: 'POS-Standard-1600x900',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1600, height: 900 },
        isMobile: false,
        hasTouch: true,
      },
    },

    // POS Desktop Display
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
