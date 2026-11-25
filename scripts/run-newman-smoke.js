#!/usr/bin/env node

/**
 * URQR Platform — Phase 1 Standalone Manager POS
 * Nayana | Functional & API QA Lead
 * Mock API Server & Automated Newman Smoke Test Runner
 *
 * Simulates Spring Boot endpoints matching Vishal's Zod schemas,
 * RS256 JWT tokens, auth refresh, negative security tests, and rate limiting.
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const PORT = 8089;

// Generate simulated RS256 JWT token structure: header.payload.signature
function createMockRS256Jwt(username, role = 'MANAGER', hotelId = 'tenant-hotel-001') {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };
  const payload = {
    sub: username,
    uid: 'usr-001',
    hotel_id: hotelId,
    role: role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    jti: 'jti-uuid-' + Math.random().toString(36).substring(2),
  };

  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = 'simulatedRS256Signature_hashBytesWithPrivateKey';

  return `${headerB64}.${payloadB64}.${signature}`;
}

// Mock HTTP server responding with exact Zod schema payload structures
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const method = req.method;

  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    let parsedBody = {};
    let isJsonMalformed = false;

    if (body) {
      try {
        parsedBody = JSON.parse(body);
      } catch (err) {
        isJsonMalformed = true;
      }
    }

    res.setHeader('Content-Type', 'application/json');

    // Handle Malformed JSON Syntax (Task 3)
    if (isJsonMalformed) {
      res.writeHead(400);
      return res.end(JSON.stringify({ error: 'Malformed JSON payload syntax' }));
    }

    // 1. Health Liveness Probe
    if (pathname === '/actuator/health/liveness' && method === 'GET') {
      res.writeHead(200);
      return res.end(JSON.stringify({ status: 'UP' }));
    }

    // 2. Auth Login Endpoint
    if (pathname === '/api/v1/auth/login' && method === 'POST') {
      // Brute-force rate limiting check (Task 4)
      if (req.headers['x-simulate-brute-force'] === 'true') {
        res.setHeader('Retry-After', '60');
        res.setHeader('X-RateLimit-Limit', '10');
        res.setHeader('X-RateLimit-Remaining', '0');
        res.writeHead(429);
        return res.end(
          JSON.stringify({
            error: 'Too many failed login attempts. Temporarily throttled. Please retry in 60s.',
          })
        );
      }

      // Negative: missing username or empty submission
      if (!parsedBody.username && parsedBody.password) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: 'Username is required' }));
      }

      // Negative: incorrect password
      if (parsedBody.password === 'WrongSecurityPassword@999') {
        res.writeHead(401);
        return res.end(JSON.stringify({ error: 'Invalid credentials' }));
      }

      // Negative: invalid / unregistered tenant account
      if (parsedBody.username === 'unregistered_tenant_user_xyz') {
        res.writeHead(401);
        return res.end(JSON.stringify({ error: 'Account not found in active tenant scope' }));
      }

      // Positive Happy Path Login (Task 1 & Task 2)
      if (parsedBody.username && parsedBody.password) {
        const accessToken = createMockRS256Jwt(parsedBody.username, 'MANAGER');
        const refreshToken = 'simulated.valid.refresh.token.jti123';

        res.writeHead(200);
        return res.end(
          JSON.stringify({
            accessToken: accessToken,
            tokenType: 'Bearer',
            expiresAt: new Date(Date.now() + 3600000).toISOString(),
            refreshToken: refreshToken,
            refreshExpiresAt: new Date(Date.now() + 86400000).toISOString(),
            userId: 'usr-001',
            hotelId: 'tenant-hotel-001',
            username: parsedBody.username,
            role: 'MANAGER',
          })
        );
      }

      res.writeHead(400);
      return res.end(JSON.stringify({ error: 'Bad Request' }));
    }

    // 3. Auth Token Refresh Endpoint (Task 1)
    if (pathname === '/api/v1/auth/refresh' && method === 'POST') {
      if (parsedBody.refreshToken === 'expired.refresh.token.signature') {
        res.writeHead(401);
        return res.end(JSON.stringify({ error: 'Invalid or expired refresh token' }));
      }

      if (parsedBody.refreshToken) {
        const newAccessToken = createMockRS256Jwt('pos_manager_1', 'MANAGER');
        const newRefreshToken = 'simulated.rotated.refresh.token.jti456';

        res.writeHead(200);
        return res.end(
          JSON.stringify({
            accessToken: newAccessToken,
            tokenType: 'Bearer',
            expiresAt: new Date(Date.now() + 3600000).toISOString(),
            refreshToken: newRefreshToken,
            refreshExpiresAt: new Date(Date.now() + 86400000).toISOString(),
            userId: 'usr-001',
            hotelId: 'tenant-hotel-001',
            username: 'pos_manager_1',
            role: 'MANAGER',
          })
        );
      }

      res.writeHead(400);
      return res.end(JSON.stringify({ error: 'Refresh token required' }));
    }

    // 4. Catalog Products (ProductItemSchema contract)
    if (pathname === '/api/v1/catalog/products' && method === 'GET') {
      res.writeHead(200);
      return res.end(
        JSON.stringify([
          {
            id: 101,
            name: 'Paneer Butter Masala',
            price: 280.0,
            category: 'Main Course',
            inStock: true,
          },
          {
            id: 102,
            name: 'Garlic Naan',
            price: 60.0,
            category: 'Breads',
            inStock: true,
          },
        ])
      );
    }

    // 5. Catalog Categories (CategorySchema contract)
    if (pathname === '/api/v1/catalog/categories' && method === 'GET') {
      res.writeHead(200);
      return res.end(
        JSON.stringify([
          { id: 1, name: 'Main Course', slug: 'main-course' },
          { id: 2, name: 'Breads', slug: 'breads' },
          { id: 3, name: 'Beverages', slug: 'beverages' },
        ])
      );
    }

    // 6. Multi-Tenant Isolation Breach (Cross-Tenant access)
    if (pathname.includes('/tenant/tenant-hotel-002') && method === 'GET') {
      res.writeHead(403);
      return res.end(JSON.stringify({ error: 'Access Denied: Tenant Isolation Enforcement' }));
    }

    // 7. Super-Manager Cross-Tenant Metrics
    if (pathname === '/api/v1/platform/tenants/metrics' && method === 'GET') {
      res.writeHead(200);
      return res.end(JSON.stringify({ totalTenants: 15, activeTenants: 14 }));
    }

    // Fallback 404
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not Found' }));
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[MOCK-SERVER] Mock backend server listening on http://127.0.0.1:${PORT}`);

  const collectionPath = path.join(__dirname, '..', 'qa', 'postman', 'URQR_Phase1_POS_API_Collection.json');
  const envPath = path.join(__dirname, '..', 'qa', 'postman', 'environments', 'Local_Docker.postman_environment.json');

  const newmanArgs = [
    'exec',
    'newman',
    'run',
    collectionPath,
    '-e',
    envPath,
    '--env-var',
    `baseUrl=http://127.0.0.1:${PORT}`,
    '--env-var',
    'tenantB_Id=tenant-hotel-002',
    '--reporters',
    'cli',
  ];

  console.log(`[NEWMAN] Executing: pnpm ${newmanArgs.join(' ')}\n`);

  const nProcess = spawn('pnpm', newmanArgs, {
    shell: true,
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });

  nProcess.on('close', (code) => {
    console.log(`\n[NEWMAN] Newman process completed with exit code: ${code}`);
    server.close(() => {
      console.log('[MOCK-SERVER] Server stopped cleanly.');
      process.exit(code);
    });
  });
});
