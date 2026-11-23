
import { test, expect } from '@playwright/test';

const viewportProfiles: Record<string, { width: number; height: number }> = {
  'POS-Counter-1366x768': { width: 1366, height: 768 },
  'POS-Standard-1600x900': { width: 1600, height: 900 },
  'POS-Desktop-1920x1080': { width: 1920, height: 1080 },
};

test('POS viewport dimensions are configured correctly', async ({ page }, testInfo) => {
  const expectedViewport = viewportProfiles[testInfo.project.name];

  test.skip(!expectedViewport, 'This test is only for POS viewport projects');

  expect(page.viewportSize()).toEqual(expectedViewport);
});
