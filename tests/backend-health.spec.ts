
import { test, expect } from '@playwright/test';

const backendUrl =
  process.env.BACKEND_BASE_URL || 'http://localhost:8082';

test('URQR backend liveness health check', async ({ request }) => {
  const response = await request.get(
    `${backendUrl}/actuator/health/liveness`
  );

  expect(response.status()).toBe(200);

  const body = await response.json();

  expect(body.status).toBe('UP');
});
