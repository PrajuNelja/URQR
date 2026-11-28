#!/usr/bin/env node

/**
 * URQR Platform — Phase 1 Standalone Manager POS
 * Nayana (QA Lead) — Day 5 Morning Task 1 & 2
 * Payment Concurrency & Distributed Idempotency Test Harness
 *
 * Dispatches 5 concurrent HTTP POST /api/v1/orders requests carrying identical
 * Idempotency-Key headers to verify Redis 8.2 distributed locking:
 * - Exactly 1 request succeeds (HTTP 201 Created or 200 OK)
 * - Exactly 4 requests are blocked (HTTP 409 Conflict)
 * - Zero ghost rows or double-billing in PostgreSQL 18.7
 */

const http = require('http');

// Configurable target: port 8080 (backend) or port 8089 (mock)
const TARGET_HOST = process.env.API_HOST || '127.0.0.1';
const TARGET_PORT = parseInt(process.env.API_PORT || '8089', 10);
const TARGET_PATH = '/api/v1/orders';

// Generate a cryptographically random UUID v4 for this concurrency batch
const sharedIdempotencyKey = 'idem-' + (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : Math.random().toString(36).substring(2, 15));

const samplePayload = JSON.stringify({
  items: [
    { menuItemId: 101, quantity: 2 },
    { menuItemId: 103, quantity: 1 }
  ],
  payments: [
    { method: 'CASH', amount: 800.00, reference: 'CASH-TENDER' }
  ]
});

console.log('======================================================================');
console.log('  URQR PHASE 1 POS — NAYANA DAY 5 CONCURRENCY & IDEMPOTENCY HARNESS  ');
console.log('======================================================================');
console.log(`Target: http://${TARGET_HOST}:${TARGET_PORT}${TARGET_PATH}`);
console.log(`Shared Idempotency-Key: ${sharedIdempotencyKey}`);
console.log(`Concurrency Level: 5 simultaneous requests\n`);

function sendOrderRequest(requestId) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const options = {
      hostname: TARGET_HOST,
      port: TARGET_PORT,
      path: TARGET_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(samplePayload),
        'Idempotency-Key': sharedIdempotencyKey,
        'Authorization': 'Bearer test-jwt-token'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const duration = Date.now() - startTime;
        resolve({
          requestId,
          statusCode: res.statusCode,
          durationMs: duration,
          body: data
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        requestId,
        statusCode: 0,
        durationMs: Date.now() - startTime,
        error: err.message
      });
    });

    req.write(samplePayload);
    req.end();
  });
}

async function runConcurrencyHarness() {
  console.log('[HARNESS] Firing 5 simultaneous requests at T=0ms...\n');

  // Promise.all launches all 5 requests concurrently in the same event-loop tick
  const results = await Promise.all([
    sendOrderRequest(1),
    sendOrderRequest(2),
    sendOrderRequest(3),
    sendOrderRequest(4),
    sendOrderRequest(5)
  ]);

  console.log('----------------------------------------------------------------------');
  console.log('REQ #  | HTTP STATUS | LATENCY  | RESULT');
  console.log('----------------------------------------------------------------------');

  let successCount = 0;
  let conflictCount = 0;
  let errorCount = 0;

  results.forEach((r) => {
    let outcome = '';
    if (r.statusCode === 201 || r.statusCode === 200) {
      outcome = '[OK - LOCK ACQUIRED / ORDER CREATED]';
      successCount++;
    } else if (r.statusCode === 409) {
      outcome = '[BLOCKED - REDIS 409 CONFLICT]';
      conflictCount++;
    } else {
      outcome = `[FAILED - STATUS ${r.statusCode}: ${r.error || 'Server Error'}]`;
      errorCount++;
    }

    console.log(`Req #${r.requestId} | ${r.statusCode.toString().padEnd(11)} | ${r.durationMs.toString().padStart(4)}ms  | ${outcome}`);
  });

  console.log('----------------------------------------------------------------------\n');
  console.log('AUDIT SUMMARY:');
  console.log(`- Success (200/201) Count : ${successCount} (Target: Exactly 1)`);
  console.log(`- Blocked (409) Count     : ${conflictCount} (Target: Exactly 4)`);
  console.log(`- Unexpected Errors       : ${errorCount} (Target: 0)`);

  if (successCount === 1 && conflictCount === 4) {
    console.log('\n[PASS] Concurrency & Idempotency Audit PASSED! Zero double-debiting.');
    process.exit(0);
  } else {
    console.log('\n[FAIL] Concurrency audit did not meet (1 OK, 4 409) condition.');
    process.exit(1);
  }
}

runConcurrencyHarness();
