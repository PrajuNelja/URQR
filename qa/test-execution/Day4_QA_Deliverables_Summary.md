# URQR Platform — Phase 1 Standalone Manager POS
## Day 4 QA Deliverables Summary & Verification Report
**Assignee:** Nayana | **Role:** Functional & API QA Lead  
**Scope:** Catalog & Order Creation API Testing, Tenant-Scoped Redis Caching, Financial Math Precision & Boundary Audits  
**Document Reference:** `QA-DELIV-DAY4-001` | **Date:** 2026-11-26 | **Sprint Status:** Completed  

---

### 1. Executive Summary
On Day 4, Nayana (Functional & API QA Lead) executed the comprehensive quality verification for Girish T's Catalog API, Redis caching layer, Order Creation REST API, and financial calculation precision engine.

The verification process validated that all currency, line items, discounts, and taxes computed across the frontend and backend match with **zero rounding discrepancy**, strictly utilizing Java `BigDecimal` arithmetic and `RoundingMode.HALF_UP`.

---

### 2. Morning Session: Catalog API & Order Creation Contracts

#### A. Live Catalog API Testing (`GET /api/v1/catalog/products`)
* Executed automated test suite asserting `HTTP 200 OK`, valid schema payloads matching `ProductItemSchema`, and active item listings.
* Verified that queries strictly return products belonging exclusively to the authenticated hotel tenant UUID (`hotel_id`), enforcing PostgreSQL Row-Level Security (RLS).

#### B. Redis 8.2.11 Caching Performance & Latency Audit
* Measured latency drop between cache miss and cache hit:
  * **Cache Miss (Cold Database Query):** $42\text{ms}$ average response latency.
  * **Cache Hit (Warm Redis Cache `tenant:{id}:catalog`):** $4.8\text{ms}$ average response latency (well below the $15\text{ms}$ service level threshold).
* Verified automatic cache invalidation via `@CacheEvict` when catalog items are created, modified, or deactivated.

#### C. Order Creation Contract & Negative Boundary Testing (`POST /api/v1/orders`)
* Validated order creation payload contracts:
  * Missing line items returns `HTTP 400 Bad Request` ("Order must contain between 1 and 100 item lines").
  * Negative / zero quantities returns `HTTP 400 Bad Request` ("Quantity must be between 1 and 999").
  * Unavailable menu items or cross-tenant menu items returns `HTTP 400 Bad Request`.
  * Inactive category items returns `HTTP 400 Bad Request`.
* Validated atomic persistence: Order header, line items, payment record, and transactional outbox event commit in one single transaction with `@Transactional(isolation = Isolation.READ_COMMITTED)`.

---

### 3. Afternoon Session: POS Financial Calculations & Precision Audit

#### A. Line-Item Discount Boundary Verification
* Tested boundary discount percentages:
  * **0% Discount:** Gross amount equals net taxable amount with zero discount deductions.
  * **50% Discount:** Accurate half-value deduction with correct proportional CGST/SGST scaling.
  * **100% Discount:** Fully complimentary item producing $0.00$ net total and $0.00$ tax liability.

#### B. Tax Computation Precision Across GST & VAT Slabs
* Verified precision against official Indian GST tax tiers:
  * **5% GST Tier (2.5% CGST + 2.5% SGST):** Tested on standard beverages and snacks (e.g. ₹33.33 item resulting in ₹0.83 CGST + ₹0.83 SGST = ₹34.99 total).
  * **12% GST Tier (6.0% CGST + 6.0% SGST):** Tested on processed menu categories.
  * **18% GST Tier (9.0% CGST + 9.0% SGST):** Tested on AC dining room services.
  * **28% GST Tier (14.0% CGST + 14.0% SGST):** Tested on luxury items.
  * **VAT Only Tier (12.5%):** Tested on applicable jurisdictions with zero GST interference.
* All tax components verified to round individually using `RoundingMode.HALF_UP` to 2 decimal places.

#### C. Floating-Point Math Audit
* Confirmed that `double` and `float` types are completely banned across all billing and calculation modules.
* Evaluated cart total matching: Total calculated bill amount in Newman and unit tests matches backend `OrderCalculationEngine` `BigDecimal` output with **zero rounding discrepancy ($0.00\text{ error}$)**.

---

### 4. Day 4 Action Checklist Matrix Sign-Off

| # | Session | Task Name | Tool / Framework | Outcome |
| :-: | :--- | :--- | :--- | :---: |
| 1 | Morning | Live Catalog API Test | Newman CLI / Postman | **PASSED** (200 OK, valid contract) |
| 2 | Morning | Tenant Catalog Isolation | Postman Assertions | **PASSED** (0 cross-tenant records) |
| 3 | Morning | Redis Caching Performance | HTTP Latency Profiler | **PASSED** ($4.8\text{ms} < 15\text{ms}$ threshold) |
| 4 | Morning | Order Creation Collection | Postman Runner | **PASSED** (`POST /api/v1/orders` contract verified) |
| 5 | Morning | Order Validation Rejections | Newman Suite | **PASSED** (HTTP 400 on invalid input) |
| 6 | Afternoon | Financial Precision Cases | Test Matrix & Excel | **PASSED** (100% precision verified) |
| 7 | Afternoon | Line-Item Discount Math | Unit Tests / Postman | **PASSED** (0%, 50%, 100% boundary checks) |
| 8 | Afternoon | GST & VAT Tier Precision | `OrderCalculationEngineTest` | **PASSED** (5%, 12%, 18%, 28% verified) |
| 9 | Afternoon | Bill Discount Allocation | PosOrderService | **PASSED** (Exact half-up rounding) |
| 10 | Afternoon | Zero Discrepancy Matching | Audit Comparison | **PASSED** (0.00 discrepancy vs BigDecimal) |
