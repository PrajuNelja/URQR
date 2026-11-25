#!/usr/bin/env node

/**
 * URQR Platform — Phase 1 Standalone Manager POS
 * Nayana | Functional & API QA Lead
 * Mock API Server & Automated Newman Smoke Test Runner
 *
 * Simulates Spring Boot endpoints matching Vishal's Zod schemas,
 * RS256 JWT tokens, auth refresh, negative security tests, rate limiting,
 * and comprehensive catalog querying (category filters, search queries, pagination, multi-tax).
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORT = 8089;

// Ensure evidence directory exists for JUnit XML and HTML report exports
const evidenceDir = path.join(__dirname, '..', 'qa', 'evidence');
if (!fs.existsSync(evidenceDir)) {
  fs.mkdirSync(evidenceDir, { recursive: true });
}

// Load POS Catalog & Inventory Test Data Matrix
let catalogData = null;
const matrixPath = path.join(__dirname, '..', 'qa', 'test-data', 'catalog_inventory_test_matrix.json');
try {
  if (fs.existsSync(matrixPath)) {
    catalogData = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
  }
} catch (e) {
  console.warn('[MOCK-SERVER] Could not load test matrix file, using fallback dataset:', e.message);
}

const defaultItems = [
  {
    id: 101,
    name: 'Paneer Butter Masala',
    category: 'Main Course',
    categoryKey: 'main-course',
    description: 'Rich cottage cheese cubes simmered in spiced tomato and butter gravy',
    price: 280.00,
    taxSlab: 'GST_5',
    taxRate: 5.0,
    taxComponents: [
      { name: 'CGST', rate: 2.5, amount: 7.00 },
      { name: 'SGST', rate: 2.5, amount: 7.00 }
    ],
    inStock: true,
    stockQuantity: 45,
    lowStockThreshold: 10,
    allowBackorder: false,
    itemType: 'STANDARD'
  },
  {
    id: 102,
    name: 'Garlic Naan',
    category: 'Breads',
    categoryKey: 'breads',
    description: 'Crisp traditional tandoori flatbread brushed with garlic and clarified butter',
    price: 60.00,
    taxSlab: 'GST_5',
    taxRate: 5.0,
    taxComponents: [
      { name: 'CGST', rate: 2.5, amount: 1.50 },
      { name: 'SGST', rate: 2.5, amount: 1.50 }
    ],
    inStock: true,
    stockQuantity: 120,
    lowStockThreshold: 20,
    allowBackorder: false,
    itemType: 'STANDARD'
  },
  {
    id: 103,
    name: 'Dal Makhani',
    category: 'Main Course',
    categoryKey: 'main-course',
    description: 'Slow cooked whole black lentils with creamy butter and aromatic spices',
    price: 220.00,
    taxSlab: 'GST_5',
    taxRate: 5.0,
    taxComponents: [
      { name: 'CGST', rate: 2.5, amount: 5.50 },
      { name: 'SGST', rate: 2.5, amount: 5.50 }
    ],
    inStock: true,
    stockQuantity: 30,
    lowStockThreshold: 8,
    allowBackorder: false,
    itemType: 'STANDARD'
  },
  {
    id: 104,
    name: 'Butter Roti',
    category: 'Breads',
    categoryKey: 'breads',
    description: 'Whole wheat bread baked in traditional clay tandoor with fresh butter',
    price: 35.00,
    taxSlab: 'GST_5',
    taxRate: 5.0,
    taxComponents: [
      { name: 'CGST', rate: 2.5, amount: 0.88 },
      { name: 'SGST', rate: 2.5, amount: 0.88 }
    ],
    inStock: true,
    stockQuantity: 150,
    lowStockThreshold: 25,
    allowBackorder: false,
    itemType: 'STANDARD'
  },
  {
    id: 105,
    name: 'Veg Dum Biryani',
    category: 'Main Course',
    categoryKey: 'main-course',
    description: 'Fragrant basmati rice layered with garden vegetables and saffron spices',
    price: 250.00,
    taxSlab: 'GST_5',
    taxRate: 5.0,
    taxComponents: [
      { name: 'CGST', rate: 2.5, amount: 6.25 },
      { name: 'SGST', rate: 2.5, amount: 6.25 }
    ],
    inStock: true,
    stockQuantity: 25,
    lowStockThreshold: 5,
    allowBackorder: false,
    itemType: 'STANDARD'
  },
  {
    id: 201,
    name: 'Tandoori Platter Special',
    category: 'Starters',
    categoryKey: 'starters',
    description: 'Chef special assorted chargrilled kebabs and cottage cheese chunks',
    price: 450.00,
    taxSlab: 'GST_5',
    taxRate: 5.0,
    taxComponents: [
      { name: 'CGST', rate: 2.5, amount: 11.25 },
      { name: 'SGST', rate: 2.5, amount: 11.25 }
    ],
    inStock: false,
    stockQuantity: 0,
    lowStockThreshold: 5,
    allowBackorder: false,
    itemType: 'OUT_OF_STOCK'
  },
  {
    id: 202,
    name: 'Alphonso Mango Kulfi',
    category: 'Desserts',
    categoryKey: 'desserts',
    description: 'Authentic reduced milk kulfi infused with Ratnagiri Alphonso mango pulp',
    price: 120.00,
    taxSlab: 'GST_18',
    taxRate: 18.0,
    taxComponents: [
      { name: 'CGST', rate: 9.0, amount: 10.80 },
      { name: 'SGST', rate: 9.0, amount: 10.80 }
    ],
    inStock: false,
    stockQuantity: 0,
    lowStockThreshold: 10,
    allowBackorder: false,
    itemType: 'OUT_OF_STOCK'
  },
  {
    id: 301,
    name: 'Mineral Water Bottle 1L',
    category: 'Beverages',
    categoryKey: 'beverages',
    description: 'Purified packaged drinking water with natural essential minerals',
    price: 30.00,
    taxSlab: 'GST_18',
    taxRate: 18.0,
    taxComponents: [
      { name: 'CGST', rate: 9.0, amount: 2.70 },
      { name: 'SGST', rate: 9.0, amount: 2.70 }
    ],
    inStock: true,
    stockQuantity: 200,
    lowStockThreshold: 30,
    allowBackorder: false,
    itemType: 'MULTI_TAX'
  },
  {
    id: 302,
    name: 'Fresh Cold-Pressed Orange Juice',
    category: 'Beverages',
    categoryKey: 'beverages',
    description: '100% pure fresh Valencia oranges pressed without added sugar or water',
    price: 110.00,
    taxSlab: 'GST_12',
    taxRate: 12.0,
    taxComponents: [
      { name: 'CGST', rate: 6.0, amount: 6.60 },
      { name: 'SGST', rate: 6.0, amount: 6.60 }
    ],
    inStock: true,
    stockQuantity: 25,
    lowStockThreshold: 5,
    allowBackorder: false,
    itemType: 'MULTI_TAX'
  },
  {
    id: 303,
    name: 'Farm Fresh Green Salad (Zero-Tax)',
    category: 'Salads',
    categoryKey: 'salads',
    description: 'Crisp cucumber, tomatoes, organic greens, and fresh lemon wedges',
    price: 90.00,
    taxSlab: 'GST_0',
    taxRate: 0.0,
    taxComponents: [
      { name: 'EXEMPT', rate: 0.0, amount: 0.00 }
    ],
    inStock: true,
    stockQuantity: 50,
    lowStockThreshold: 10,
    allowBackorder: false,
    itemType: 'MULTI_TAX'
  },
  {
    id: 304,
    name: 'Craft Mocktail Tower (Multi-Tax & Cess)',
    category: 'Beverages',
    categoryKey: 'beverages',
    description: 'Signature fruit blend mocktail tower with sparkling mint and lime',
    price: 650.00,
    taxSlab: 'GST_20_SPECIAL',
    taxRate: 20.0,
    taxComponents: [
      { name: 'CGST', rate: 9.0, amount: 58.50 },
      { name: 'SGST', rate: 9.0, amount: 58.50 },
      { name: 'F&B Service Cess', rate: 2.0, amount: 13.00 }
    ],
    inStock: true,
    stockQuantity: 15,
    lowStockThreshold: 3,
    allowBackorder: false,
    itemType: 'MULTI_TAX'
  }
];

const catalogItems = (catalogData && catalogData.items) ? catalogData.items : defaultItems;

const catalogCategories = [
  { id: 1, key: 'main-course', label: 'Main Course', name: 'Main Course', slug: 'main-course' },
  { id: 2, key: 'breads', label: 'Breads', name: 'Breads', slug: 'breads' },
  { id: 3, key: 'beverages', label: 'Beverages', name: 'Beverages', slug: 'beverages' },
  { id: 4, key: 'starters', label: 'Starters', name: 'Starters', slug: 'starters' },
  { id: 5, key: 'desserts', label: 'Desserts', name: 'Desserts', slug: 'desserts' },
  { id: 6, key: 'salads', label: 'Salads', name: 'Salads', slug: 'salads' }
];

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

    // Handle Malformed JSON Syntax
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
      // Brute-force rate limiting check
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

      // Positive Happy Path Login
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

    // 3. Auth Token Refresh Endpoint
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

    // 4. Catalog Products with Category Filtering, Search Queries & Pagination (Task 2)
    if (pathname === '/api/v1/catalog/products' && method === 'GET') {
      const categoryParam = url.searchParams.get('category');
      const searchParam = url.searchParams.get('search');
      const pageParam = url.searchParams.get('page');
      const sizeParam = url.searchParams.get('size');

      let filtered = [...catalogItems];

      // Category filter
      if (categoryParam) {
        const catQuery = categoryParam.trim().toLowerCase();
        filtered = filtered.filter(item => 
          item.category.toLowerCase() === catQuery ||
          (item.categoryKey && item.categoryKey.toLowerCase() === catQuery)
        );
      }

      // Search query
      if (searchParam) {
        const sQuery = searchParam.trim().toLowerCase();
        filtered = filtered.filter(item =>
          item.name.toLowerCase().includes(sQuery) ||
          (item.description && item.description.toLowerCase().includes(sQuery))
        );
      }

      // Pagination
      if (pageParam !== null || sizeParam !== null) {
        const page = Math.max(1, parseInt(pageParam || '1', 10));
        const size = Math.max(1, parseInt(sizeParam || '10', 10));
        const totalElements = filtered.length;
        const totalPages = Math.ceil(totalElements / size);
        const startIndex = (page - 1) * size;
        const paginatedItems = filtered.slice(startIndex, startIndex + size);

        res.writeHead(200);
        return res.end(JSON.stringify({
          items: paginatedItems,
          page: page,
          size: size,
          totalElements: totalElements,
          totalPages: totalPages
        }));
      }

      // Full list retrieval
      res.writeHead(200);
      return res.end(JSON.stringify(filtered));
    }

    // 5. Catalog Categories (CategorySchema contract)
    if (pathname === '/api/v1/catalog/categories' && method === 'GET') {
      res.writeHead(200);
      return res.end(JSON.stringify(catalogCategories));
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

  const junitReportPath = path.join(evidenceDir, 'newman-results.xml');
  const htmlReportPath = path.join(evidenceDir, 'newman-report.html');

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
    'cli,junit,htmlextra',
    '--reporter-junit-export',
    junitReportPath,
    '--reporter-htmlextra-export',
    htmlReportPath,
    '--reporter-htmlextra-title',
    'URQR Phase 1 POS - Newman API Test Report'
  ];

  console.log(`[NEWMAN] Executing: pnpm ${newmanArgs.join(' ')}\n`);

  const nProcess = spawn('pnpm', newmanArgs, {
    shell: true,
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });

  nProcess.on('close', (code) => {
    console.log(`\n[NEWMAN] Newman process completed with exit code: ${code}`);
    console.log(`[REPORTS] JUnit XML report exported to: ${junitReportPath}`);
    console.log(`[REPORTS] HTML interactive report exported to: ${htmlReportPath}`);
    server.close(() => {
      console.log('[MOCK-SERVER] Server stopped cleanly.');
      process.exit(code);
    });
  });
});
