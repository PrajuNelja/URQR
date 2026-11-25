# URQR Platform — Phase 1 Standalone Manager POS
## Day 2 QA Deliverables Summary & Sign-Off Report
**Assignee:** Nayana | **Role:** Functional & API QA Lead  
**Scope:** API Contracts, Postman Workspace, Newman Automation, Multi-Tenant Security & Catalog Test Matrices  
**Document Reference:** `QA-DELIV-DAY2-001` | **Date:** 2026-11-25 | **Sprint Status:** Completed  

---

### 1. Executive Summary
During Day 2 QA sprint cycles, Nayana (Functional & API QA Lead) architected and deployed the automated API contract, security verification, and multi-tenant test framework for the URQR Phase 1 Standalone Manager POS. 

The test automation pipeline executes directly in local development environments and CI/CD via Newman 6.2.3 and `newman-reporter-htmlextra`, providing comprehensive test execution metrics, JUnit XML build summaries, and interactive HTML dashboards.

---

### 2. Completed Deliverables Breakdown

#### A. Centralized Postman Environments & Workspace Configuration
Configured three decoupled Postman environments supporting multi-tenant header propagation and Zero-Tenant authentication:
1. **Local Docker Environment:** [`Local_Docker.postman_environment.json`](file:///P:/URQR/qa/postman/environments/Local_Docker.postman_environment.json) targeting `http://127.0.0.1:8089` (and 8080 Spring Boot container).
2. **Staging Environment:** [`Staging.postman_environment.json`](file:///P:/URQR/qa/postman/environments/Staging.postman_environment.json) targeting `https://staging-api.urqr.neljatech.internal`.
3. **Multi-Tenant Matrix Environment:** [`Multi_Tenant.postman_environment.json`](file:///P:/URQR/qa/postman/environments/Multi_Tenant.postman_environment.json) configured with Tenant-A (`tenant-hotel-001`), Tenant-B (`tenant-hotel-002`), and Super-Manager cross-tenant simulation headers (`X-Super-Manager: true`).

#### B. Postman Collection Architecture (19 Endpoints, 42 Assertions, 100% Pass)
Located at [`URQR_Phase1_POS_API_Collection.json`](file:///P:/URQR/qa/postman/URQR_Phase1_POS_API_Collection.json):
- **Health & Infrastructure:** Endpoint `GET /actuator/health/liveness` verifying service health and latency $< 300\text{ms}$.
- **Authentication & RS256 JWT Security:**
  - `POST /api/v1/auth/login`: Happy path auth asserting 3-part JWT token structure, header `alg: "RS256"`, payload claims (`sub`, `uid`, `hotel_id`, `role: MANAGER`, `exp`, `jti`).
  - `POST /api/v1/auth/refresh`: Refresh token rotation issuing new RS256 token and invalidating consumed tokens.
- **Negative Security Specs & Error Handling:**
  - Incorrect Password rejection (`HTTP 401 Unauthorized`).
  - Unregistered Tenant Account rejection (`HTTP 401 Unauthorized`).
  - Expired / Revoked Refresh Token rejection (`HTTP 401 Unauthorized`).
  - Malformed JSON Payload rejection (`HTTP 400 Bad Request`).
- **Brute-Force Rate Limiting (Throttling Protection):**
  - Simulated 10 rapid failed logins asserting `HTTP 429 Too Many Requests`, `Retry-After: 60`, and descriptive client lockout messaging.
- **Catalog Contract & Retrieval Querying:**
  - Full product list contract schema validation matching Vishal's `ProductItemSchema`.
  - Category list contract schema validation matching Vishal's `CategorySchema`.
  - Category filtering (`GET /api/v1/catalog/products?category=Main+Course`) asserting non-empty array and homogeneous category assignment.
  - Empty category handling (`GET /api/v1/catalog/products?category=NonExistentCategory99`) returning `[]`.
  - Search query filtering (`GET /api/v1/catalog/products?search=Paneer` and case-insensitive `search=naan`).
  - Pagination retrieval (`page=1&size=2` and `page=2&size=2`) asserting Spring Boot pageable contract (`page`, `size`, `totalElements`, `totalPages`, distinct items across pages).
  - Out-of-stock items audit (`inStock: false`, `stockQuantity: 0`).
  - Multi-tax calculation verification across GST slabs (0%, 5%, 12%, 18%, 20% with cess).
- **Multi-Tenant Isolation & Super-Manager RBAC:**
  - Cross-tenant access attempt between Tenant-A and Tenant-B rejected with `HTTP 403 Forbidden`.
  - Platform tenant metrics queried under `X-Super-Manager` credential returning aggregated system telemetry.

#### C. POS Catalog & Inventory Test Data Matrix
- JSON Specification: [`catalog_inventory_test_matrix.json`](file:///P:/URQR/qa/test-data/catalog_inventory_test_matrix.json)
- Markdown Technical Runbook: [`catalog_inventory_test_matrix.md`](file:///P:/URQR/qa/test-data/catalog_inventory_test_matrix.md)
  - 12 comprehensive items across Standard, Out-of-Stock, and Multi-Tax categories.
  - Exact GST arithmetic breakdowns (CGST + SGST + Service Cess).

#### D. Screen 1 (Login) UI Alignment & Sign-Off with Vennela
- Comprehensive cross-functional review documented at [`Screen1_Login_UI_Test_Review_Vennela.md`](file:///P:/URQR/qa/test-execution/Screen1_Login_UI_Test_Review_Vennela.md):
  - Zero-Tenant architectural alignment (no client tenant slug input).
  - Touch screen ergonomics ($\ge 48\text{px}$ touch target bounds).
  - Virtual keypad docking and zero occlusion verification.
  - Field-level blur error state and loading spinner lockouts.
  - Formally signed off by Nayana, Vennela, and Prajwal B N.

#### E. Test Automation Execution & Reporting Pipeline
- Smoke Test Runner: [`run-newman-smoke.js`](file:///P:/URQR/scripts/run-newman-smoke.js)
- CI/CD Workflow: [`.github/workflows/qa-newman.yml`](file:///P:/URQR/.github/workflows/qa-newman.yml)
- Test Reports Generated:
  - JUnit XML Build Report: [`newman-results.xml`](file:///P:/URQR/qa/evidence/newman-results.xml)
  - Interactive HTML Extra Dashboard: [`newman-report.html`](file:///P:/URQR/qa/evidence/newman-report.html)

---

### 3. Execution Verification Metrics

```
┌─────────────────────────┬───────────────────┬──────────────────┐
│                         │          executed │           failed │
├─────────────────────────┼───────────────────┼──────────────────┤
│              iterations │                 1 │                0 │
├─────────────────────────┼───────────────────┼──────────────────┤
│                requests │                19 │                0 │
├─────────────────────────┼───────────────────┼──────────────────┤
│            test-scripts │                19 │                0 │
├─────────────────────────┼───────────────────┼──────────────────┤
│      prerequest-scripts │                 0 │                0 │
├─────────────────────────┼───────────────────┼──────────────────┤
│              assertions │                42 │                0 │
├─────────────────────────┴───────────────────┴──────────────────┤
│ total run duration: 2.1s                                       │
├────────────────────────────────────────────────────────────────┤
│ total data received: 16.58kB (approx)                          │
├────────────────────────────────────────────────────────────────┤
│ average response time: 12ms [min: 3ms, max: 120ms, s.d.: 25ms] │
└────────────────────────────────────────────────────────────────┘
```

---

### 4. Architecture & Technical Constraints Compliance
- **Zero Technology Drift:** Strictly Node.js 22, Newman 6.2.3, pnpm 12, Postman v2.1.0. No unauthorized messaging brokers (Kafka) or container orchestrators (Kubernetes).
- **Security Protocols:** RS256 asymmetric signatures, Single-Use Refresh Token Rotation, HTTP 429 Brute-force Throttling.
