
import { test, expect } from '@playwright/test';

const viewportProfiles: Record<string, { width: number; height: number; hasTouch?: boolean }> = {
  'chromium': { width: 1280, height: 720, hasTouch: false },
  'POS-Counter-1366x768': { width: 1366, height: 768, hasTouch: true },
  'POS-Standard-1600x900': { width: 1600, height: 900, hasTouch: true },
  'POS-Desktop-1920x1080': { width: 1920, height: 1080, hasTouch: true },
};

test('POS viewport dimensions and touch capabilities are configured correctly', async ({ page }, testInfo) => {
  const expectedProfile = viewportProfiles[testInfo.project.name];

  test.skip(!expectedProfile, 'This test is dedicated to POS touch viewport presets');

  // Verify viewport boundaries
  expect(page.viewportSize()).toEqual({
    width: expectedProfile.width,
    height: expectedProfile.height,
  });

  // Verify touch support if defined
  if (expectedProfile.hasTouch) {
    const isTouchSupported = await page.evaluate(() => 'ontouchstart' in window || navigator.maxTouchPoints > 0);
    expect(isTouchSupported).toBe(true);
  }
});
