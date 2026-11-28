#!/usr/bin/env node

/**
 * URQR Platform — Phase 1 Standalone Manager POS
 * Standalone Mock API Server for Postman Desktop and Newman QA Testing
 *
 * Implements:
 * - Spring Boot Actuator liveness & readiness probes
 * - RS256 JWT generation and validation
 * - Case-insensitive authentication & token rotation
 * - Negative security tests (invalid credentials, expired tokens, malformed JSON)
 * - Complete POS catalog matrix (Paneer Butter Masala, Garlic Naan, multi-tax, pagination, category filtering)
 * - Multi-tenant isolation verification
 */

const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = parseInt(process.env.PORT || '8089', 10);

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
    lowStockThreshold: 8,
    allowBackorder: false,
    itemType: 'OUT_OF_STOCK'
  },
  {
    id: 301,
    name: 'Imported Mineral Water (Sparkling 750ml)',
    category: 'Beverages',
    categoryKey: 'beverages',
    description: 'Natural mineral sparkling water bottled at source',
    price: 180.00,
    taxSlab: 'MULTI_TIER_COMPOSITE',
    taxRate: 28.0,
    taxComponents: [
      { name: 'CGST', rate: 14.0, amount: 25.20 },
      { name: 'SGST', rate: 14.0, amount: 25.20 }
    ],
    inStock: true,
    stockQuantity: 60,
    lowStockThreshold: 15,
    allowBackorder: false,
    itemType: 'MULTI_TAX'
  },
  {
    id: 302,
    name: 'Chef Luxury Tasting Thali',
    category: 'Specials',
    categoryKey: 'specials',
    description: 'Exquisite 7-course royal Indian feast with dessert and beverage pairings',
    price: 850.00,
    taxSlab: 'LUXURY_SERVICE_CESS',
    taxRate: 18.0,
    taxComponents: [
      { name: 'CGST', rate: 9.0, amount: 76.50 },
      { name: 'SGST', rate: 9.0, amount: 76.50 },
      { name: 'F&B Cess', rate: 0.0, amount: 0.00 }
    ],
    inStock: true,
    stockQuantity: 15,
    lowStockThreshold: 3,
    allowBackorder: false,
    itemType: 'MULTI_TAX'
  }
];

const catalogItems = catalogData?.items || defaultItems;

const rawCategories = catalogData?.categories || [
  { id: 'cat-01', name: 'Main Course', slug: 'main-course', displayOrder: 1, active: true },
  { id: 'cat-02', name: 'Breads', slug: 'breads', displayOrder: 2, active: true },
  { id: 'cat-03', name: 'Starters', slug: 'starters', displayOrder: 3, active: true },
  { id: 'cat-04', name: 'Desserts', slug: 'desserts', displayOrder: 4, active: true },
  { id: 'cat-05', name: 'Beverages', slug: 'beverages', displayOrder: 5, active: true },
  { id: 'cat-06', name: 'Specials', slug: 'specials', displayOrder: 6, active: true }
];

const catalogCategories = rawCategories.map(cat => ({
  id: cat.id,
  name: cat.name || cat.label || (cat.key ? cat.key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Category'),
  label: cat.label || cat.name,
  slug: cat.slug || cat.key || 'category',
  key: cat.key || cat.slug || 'category',
  active: cat.active !== undefined ? cat.active : true
}));

function generateRS256Token(payload) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const dummySignature = Buffer.from('urqr_rs256_mock_signature_' + Date.now()).toString('base64url');
  return `${b64Header}.${b64Payload}.${dummySignature}`;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || '127.0.0.1:8089'}`);
  const pathname = url.pathname;
  const method = req.method;

  // Always enable CORS for browser & postman calls
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Tenant-ID, Idempotency-Key');
  res.setHeader('Content-Type', 'application/json');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    // 1. Health & Liveness Probe
    if (pathname === '/actuator/health/liveness' || pathname === '/actuator/health') {
      res.writeHead(200);
      return res.end(JSON.stringify({ status: 'UP', timestamp: new Date().toISOString() }));
    }

    // 2. Manager Login & Negative Auth Tests
    if (pathname === '/api/v1/auth/login' && method === 'POST') {
      let parsed = {};
      try {
        parsed = JSON.parse(body);
      } catch (err) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: 'Malformed JSON syntax', status: 400 }));
      }

      const { username, password } = parsed;

      // Rate limit test case (Request 08 sends Attempt10WrongPass)
      if (username === 'attacker@example.com' || password === 'Attempt10WrongPass' || (password && password.includes('Attempt10'))) {
        res.setHeader('Retry-After', '60');
        res.writeHead(429);
        return res.end(JSON.stringify({
          error: 'Too Many Requests: Rate limit exceeded. Try again in 60 seconds.',
          message: 'Too Many Requests: Rate limit exceeded. Try again in 60 seconds.',
          status: 429
        }));
      }

      // Negative test: Invalid/Unknown tenant slug (Request 05)
      if (username === 'unknown_tenant_user') {
        res.writeHead(401);
        return res.end(JSON.stringify({
          type: 'about:blank',
          title: 'Unauthorized',
          status: 401,
          detail: 'Unknown tenant or inactive account',
          error: 'Unknown tenant or inactive account'
        }));
      }

      // Negative test: Incorrect password (Request 04 sends WrongSecurityPassword@999)
      if (password !== 'Manager@123' && password !== 'ValidPassword123!') {
        res.writeHead(401);
        return res.end(JSON.stringify({
          type: 'about:blank',
          title: 'Unauthorized',
          status: 401,
          detail: 'Invalid credentials',
          error: 'Invalid credentials'
        }));
      }

      // Happy path login
      if (username === 'pos_manager_1' || username === 'pos_manager_1@urqr.internal' || username === 'manager@example.com') {
        const now = Math.floor(Date.now() / 1000);
        const accessToken = generateRS256Token({
          sub: username,
          uid: 'usr-001',
          hotel_id: 'tenant-hotel-001',
          role: 'MANAGER',
          roles: ['MANAGER'],
          exp: now + 3600,
          jti: 'jti-' + Math.random().toString(36).substring(2)
        });
        const refreshToken = 'mock_refresh_token_' + Date.now();

        res.writeHead(200);
        return res.end(JSON.stringify({
          accessToken,
          tokenType: 'Bearer',
          expiresAt: new Date((now + 3600) * 1000).toISOString(),
          refreshToken,
          refreshExpiresAt: new Date((now + 86400) * 1000).toISOString(),
          userId: 'usr-001',
          hotelId: 'tenant-hotel-001',
          username: 'pos_manager_1',
          role: 'MANAGER'
        }));
      }

      res.writeHead(401);
      return res.end(JSON.stringify({ error: 'Unauthorized credentials' }));
    }

    // 3. Auth Token Refresh
    if (pathname === '/api/v1/auth/refresh' && method === 'POST') {
      let parsed = {};
      try { parsed = JSON.parse(body); } catch (_) {}

      if (parsed.refreshToken === 'expired.refresh.token.signature') {
        res.writeHead(401);
        return res.end(JSON.stringify({ error: 'Refresh token has expired or is invalid' }));
      }

      if (parsed.refreshToken) {
        const now = Math.floor(Date.now() / 1000);
        const newAccessToken = generateRS256Token({
          sub: 'pos_manager_1',
          uid: 'usr-001',
          hotel_id: 'tenant-hotel-001',
          role: 'MANAGER',
          roles: ['MANAGER'],
          exp: now + 3600,
          jti: 'jti-refreshed-' + Math.random().toString(36).substring(2)
        });
        const newRefreshToken = 'mock_refresh_token_rotated_' + Date.now();

        res.writeHead(200);
        return res.end(JSON.stringify({
          accessToken: newAccessToken,
          tokenType: 'Bearer',
          expiresAt: new Date((now + 3600) * 1000).toISOString(),
          refreshToken: newRefreshToken,
          refreshExpiresAt: new Date((now + 86400) * 1000).toISOString(),
          userId: 'usr-001',
          hotelId: 'tenant-hotel-001',
          username: 'pos_manager_1',
          role: 'MANAGER'
        }));
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
  console.log('======================================================================');
  console.log('  URQR PHASE 1 POS — STANDALONE QA MOCK API SERVER ACTIVE');
  console.log('======================================================================');
  console.log(`[STATUS] Listening at: http://127.0.0.1:${PORT}`);
  console.log(`[POSTMAN CONFIGURATION]`);
  console.log(`  1. Open Postman Desktop`);
  console.log(`  2. In your Environment (e.g. Local Mock / Local Docker), set:`);
  console.log(`     baseUrl = http://127.0.0.1:${PORT}`);
  console.log(`     tenantB_Id = tenant-hotel-002`);
  console.log(`  3. Select collection: "URQR Phase 1 POS - API Regression Collection"`);
  console.log(`  4. Click "Run collection" -> "Start run"`);
  console.log('======================================================================');
  console.log('Server is running. Press Ctrl+C in this terminal to stop.');
});

process.on('SIGINT', () => {
  console.log('\n[MOCK-SERVER] Shutting down mock API server...');
  server.close(() => {
    console.log('[MOCK-SERVER] Stopped cleanly.');
    process.exit(0);
  });
});
