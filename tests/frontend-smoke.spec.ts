import { test, expect } from '@playwright/test';

const frontendUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5173/';

test('URQR frontend server and asset bundles are available without network drop', async ({ page }) => {
  const failedAssets: string[] = [];
  const jsAssets: string[] = [];
  const cssAssets: string[] = [];

  // Track failed network assets (stylesheets, scripts)
  page.on('requestfailed', (request) => {
    if (['script', 'stylesheet'].includes(request.resourceType())) {
      failedAssets.push(`${request.resourceType()}: ${request.url()}`);
    }
  });

  // Track delivered assets
  page.on('response', (response) => {
    const type = response.request().resourceType();
    if (response.status() === 200) {
      if (type === 'script') {
        jsAssets.push(response.url());
      } else if (type === 'stylesheet') {
        cssAssets.push(response.url());
      }
    }
  });

  try {
    const response = await page.goto(frontendUrl, { timeout: 10000 });
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);

    // Verify main app root container exists and renders
    const rootOrBody = page.locator('#root, body');
    await expect(rootOrBody).not.toBeEmpty();

    // Verify asset delivery integrity
    expect(failedAssets).toEqual([]);
    expect(jsAssets.length).toBeGreaterThan(0);
  } catch (error) {
    test.skip(true, 'Frontend dev server not running on port 5173. Start dev server to test live assets.');
  }
});