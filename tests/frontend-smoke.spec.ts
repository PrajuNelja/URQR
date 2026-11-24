import { test, expect } from '@playwright/test';

test('URQR frontend server and assets are available', async ({ page }) => {
  const failedAssets: string[] = [];
  const jsAssets: string[] = [];

  page.on('requestfailed', request => {
    if (['script', 'stylesheet'].includes(request.resourceType())) {
      failedAssets.push(request.url());
    }
  });

  page.on('response', response => {
    const type = response.request().resourceType();

    if (type === 'script' && response.status() === 200) {
      jsAssets.push(response.url());
    }
  });

  const response = await page.goto('http://localhost:5173/');

  expect(response).not.toBeNull();
  expect(response!.status()).toBe(200);

  await expect(page.locator('body')).not.toBeEmpty();

  expect(failedAssets).toEqual([]);
  expect(jsAssets.length).toBeGreaterThan(0);
});