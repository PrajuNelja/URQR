#!/usr/bin/env node

/**
 * URQR Platform — Phase 1 Standalone Manager POS
 * Nayana | Functional & API QA Lead
 * Mock API Server & Automated Newman Smoke Test Runner
 *
 * Simulates Spring Boot endpoints matching Vishal's Zod schemas
 * to verify Postman Collection assertions under Newman CLI.
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const PORT = 8089;

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
    try {
      if (body) parsedBody = JSON.parse(body);
    } catch (_) {}

    res.setHeader('Content-Type', 'application/json');

    // 1. Health Liveness Probe
    if (pathname === '/actuator/health/liveness' && method === 'GET') {
      res.writeHead(200);
      return res.end(JSON.stringify({ status: 'UP' }));
    }

    // 2. Auth Login Endpoint
    if (pathname === '/api/v1/auth/login' && method === 'POST') {
      if (!parsedBody.username && parsedBody.password) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: 'Username is required' }));
      }
      if (parsedBody.password === 'WrongSecurityPassword@999') {
        res.writeHead(401);
        return res.end(JSON.stringify({ error: 'Invalid credentials' }));
      }
      if (parsedBody.username && parsedBody.password) {
        res.writeHead(200);
        return res.end(
          JSON.stringify({
            token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwb3NfbWFuYWdlcl8xIiwicm9sZSI6Ik1BTkFHRVIifQ.sample',
            user: {
              id: 'usr-001',
              username: parsedBody.username,
              role: 'MANAGER',
              hotelId: 'tenant-hotel-001',
            },
          })
        );
      }
      res.writeHead(400);
      return res.end(JSON.stringify({ error: 'Bad Request' }));
    }

    // 3. Catalog Products (ProductItemSchema contract)
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

    // 4. Catalog Categories (CategorySchema contract)
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

    // 5. Multi-Tenant Isolation Breach (Cross-Tenant access)
    if (pathname.includes('/tenant/tenant-hotel-002') && method === 'GET') {
      res.writeHead(403);
      return res.end(JSON.stringify({ error: 'Access Denied: Tenant Isolation Enforcement' }));
    }

    // 6. Super-Manager Cross-Tenant Metrics
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
