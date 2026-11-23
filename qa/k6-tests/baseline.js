
import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8082';

export const options = {
  vus: 1,
  iterations: 10,

  // Performance threshold: p95 below 200 ms
  thresholds: {
    http_req_duration: ['p(95)<200'],
  },
};

export default function () {

  // 1. Backend health endpoint
  const health = http.get(
    `${BASE_URL}/actuator/health/liveness`
  );

  check(health, {
    'Health endpoint returns 200': (r) => r.status === 200,
  });

  // 2. Menu items endpoint
  const menuItems = http.get(
    `${BASE_URL}/api/v1/menu/items`
  );

  check(menuItems, {
    'Menu items endpoint returns 200': (r) => r.status === 200,
  });

  // 3. Menu categories endpoint
  const menuCategories = http.get(
    `${BASE_URL}/api/v1/menu/categories`
  );

  check(menuCategories, {
    'Menu categories endpoint returns 200': (r) => r.status === 200,
  });
}

// Generate JSON and HTML reports
export function handleSummary(data) {
  const metrics = data.metrics.http_req_duration.values;

  const p95 = metrics['p(95)'];
  const avg = metrics.avg;
  const max = metrics.max;
  const passed = p95 < 200;

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>URQR k6 Performance Report</title>
  </head>
  <body>
    <h1>URQR Performance Test Report</h1>
    <h2>Endpoint Results</h2>
    <ul>
      <li>GET /actuator/health/liveness</li>
      <li>GET /api/v1/menu/items</li>
      <li>GET /api/v1/menu/categories</li>
    </ul>
    <h2>Performance Results</h2>
    <p>Average response time: ${avg} ms</p>
    <p>p95 response time: ${p95} ms</p>
    <p>Maximum response time: ${max} ms</p>
    <p>Threshold: p95 below 200 ms</p>
    <h2>Result: ${passed ? 'PASS' : 'FAIL'}</h2>
  </body>
  </html>`;

  return {
    'k6-results/summary.json': JSON.stringify(data, null, 2),
    'k6-results/summary.html': html,
  };
}
