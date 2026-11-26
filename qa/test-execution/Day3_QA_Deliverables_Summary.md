# URQR Platform — Phase 1 Standalone Manager POS
## Day 3 QA Deliverables Summary & Verification Report
**Assignee:** Nayana | **Role:** Functional & API QA Lead  
**Scope:** Live Auth API, RS256 JWT Verification, Token Rotation, Screen 1 E2E Playwright Automation & Viewport Compliance  
**Document Reference:** `QA-DELIV-DAY3-001` | **Date:** 2026-11-25 | **Sprint Status:** Completed  

---

### 1. Executive Summary
On Day 3, Nayana (Functional & API QA Lead) executed the Day 3 testing cycle, validating Prajval V K's Spring Boot backend authentication endpoints and Vennela's Vite React Screen 1 (Manager Login) POS frontend.

The verification cycle combined automated API contracts via Newman/Postman (19 test cases, 42 assertions, 100% pass) and browser automation via Playwright E2E across desktop and touch viewports ($1366 \times 768$ and $1920 \times 1080$).

---

### 2. Morning Session: Backend Auth & RS256 Cryptographic Verification

#### A. Automated Postman Test Execution Against Live Auth API
* Dispatched `POST /api/v1/auth/login` asserting status code 200, valid JSON response, and latency $< 300\text{ms}$.
* Captured `accessToken` and `refreshToken` in Postman test runner environment.

#### B. Asymmetric JWT RS256 Cryptographic Signature Verification
* Validated 3-part structure (`header.payload.signature`) of issued JWT tokens.
* Asserted token header specifies algorithm `alg: "RS256"` and type `typ: "JWT"`.
* Verified negative rejection of tokens signed with rogue RSA keys, symmetric HS256 tokens, or `alg: "none"` tampering with `HTTP 401 Unauthorized`.

#### C. Token Claim Extraction & Validation
* Extracted and validated decoded claims:
  * `hotel_id`: Valid UUID string conforming to PostgreSQL tenant schema.
  * `role`: Confirmed `ROLE_MANAGER` authority granted.
  * `exp - iat`: Confirmed exact 900 seconds (15 minutes) access token TTL.

#### D. Refresh Token Rotation (RTR) & Replay Prevention
* Executed sequential 3-step test:
  1. Login and obtain initial tokens $T_1$ and $R_1$.
  2. Exchange $R_1$ for rotated tokens $T_2$ and $R_2$.
  3. Replay revoked $R_1$ and assert immediate rejection with `HTTP 401 Unauthorized`.

#### E. Defect Tracking
* Logged all findings in [`DEFECT_LOG_DAY3_AUTH.md`](file:///P:/URQR/qa/defect-reports/DEFECT_LOG_DAY3_AUTH.md). All 3 defects successfully remediated and verified.

---

### 3. Afternoon Session: Screen 1 Playwright E2E & Viewport Automation

#### A. Screen 1 Playwright E2E Test Suite (`tests/screen1-login.spec.ts`)
1. **Happy Path Login Flow:**
   * Automated cashier input (`admin` / `password123`), submit button click, and asserted seamless redirect to `/pos/billing`.
2. **Client-Side Form Validation:**
   * Verified instant error banner display upon empty submit or password $< 6$ characters before sending network requests.
3. **Route Guard Protection:**
   * Verified unauthenticated access attempt to `/pos/billing` is intercepted and redirected back to `/login`.

#### B. POS Desktop & Touch Viewport Testing (`tests/pos-viewport.spec.ts`)
* Validated layout across target POS resolutions:
  * Counter POS Touch: $1366 \times 768$ (touch-enabled)
  * Standard POS: $1600 \times 900$
  * Full HD Desktop: $1920 \times 1080$
* Asserted zero horizontal scrolling (`scrollWidth === clientWidth`) and submit button touch target height $\ge 44\text{px}$.

---

### 4. Day 3 Action Checklist Matrix Sign-Off

| # | Session | Task Name | Tool / Framework | Outcome |
| :-: | :--- | :--- | :--- | :---: |
| 1 | Morning | Live Auth API Test | Newman CLI | **PASSED** (200 OK, $< 300\text{ms}$) |
| 2 | Morning | RS256 Signature Specs | Postman Runner | **PASSED** (RS256 verified) |
| 3 | Morning | JWT Claim Extraction | Postman Assertions | **PASSED** (`hotel_id`, `ROLE_MANAGER`, 900s TTL) |
| 4 | Morning | Refresh Rotation | Newman Sequence | **PASSED** (Replay rejected with 401) |
| 5 | Morning | Defect Logging | Markdown Defect Tracker | **COMPLETED** (`DEF-LOG-DAY3-AUTH`) |
| 6 | Afternoon | Playwright Happy Path | Playwright Chromium | **PASSED** (Redirect to `/pos/billing`) |
| 7 | Afternoon | Client Validation Errors | Playwright Assertions | **PASSED** (Inline feedback displayed) |
| 8 | Afternoon | Route Guard Protection | Playwright Browser | **PASSED** (Redirect to `/login`) |
| 9 | Afternoon | Viewport Audit ($1366 \times 768$) | `pos-viewport.spec.ts` | **PASSED** (Zero scroll, $\ge 44\text{px}$ target) |
| 10 | Afternoon | Formal QA Sign-Off | Sign-Off Certificate | **APPROVED** (`PHASE1_SCREEN1_QA_SIGNOFF.md`) |
