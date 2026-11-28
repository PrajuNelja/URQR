# URQR Platform — Phase 1 Standalone Manager POS
## Defect Log & Severity Register: Day 3 Authentication & Security
**Document Reference:** `DEF-LOG-DAY3-AUTH` | **Date:** 2026-11-25  
**QA Lead:** Nayana | **Assigned Developer:** Prajval V K (Backend Auth Lead)  
**Standard:** [`Defect_Severity_and_Reporting_Workflow.md`](file:///P:/URQR/qa/test-plan/Defect_Severity_and_Reporting_Workflow.md)

---

### 1. Defect Severity & Classification Summary

| Defect ID | Severity | Component | Summary | Status | Verified By |
| :--- | :---: | :--- | :--- | :---: | :---: |
| **DEF-AUTH-001** | **P1 (Blocker)** | Auth / RS256 | Missing claim `hotel_id` in token claims extraction | **RESOLVED** | Nayana |
| **DEF-AUTH-002** | **P2 (Critical)** | Auth / Refresh | Replay of revoked refresh token allowed in edge cache | **RESOLVED** | Nayana |
| **DEF-AUTH-003** | **P3 (Major)** | Auth / Rate Limit | Missing RFC 7807 problem structure on 429 response | **RESOLVED** | Nayana |

---

### 2. Detailed Defect Reports & Remediation Records

#### DEF-AUTH-001: Missing `hotel_id` Claim in Issued JWT
* **Severity:** **P1 (Blocker)**
* **Component:** `com.nelja.urqr.auth.security.TenantJwtAuthenticationConverter`
* **Reproduction Steps:**
  1. Dispatch `POST /api/v1/auth/login` with valid manager credentials.
  2. Decode Base64Url JWT payload.
  3. Inspect claims for tenant UUID.
* **Expected Result:**
  JWT payload contains `"hotel_id": "<UUID>"` and `"role": "MANAGER"`.
* **Actual Result:**
  Legacy token payload contained generic `"tenant_id"` claim rather than canonical UUID `"hotel_id"`.
* **Remediation & Fix:**
  Prajval V K harmonized JWT claims in `TokenService.java` to issue `"hotel_id"` matching PostgreSQL RLS tenant context.
* **Verification:**
  Verified via Newman test `02 - Manager Login (Happy Path & JWT RS256 Audit)`. **`PASSED`**.

---

#### DEF-AUTH-002: Replay of Consumed Refresh Token Must Be Rejected
* **Severity:** **P2 (Critical)**
* **Component:** `com.nelja.urqr.auth.security.AuthController` / `RefreshTokenRepository`
* **Reproduction Steps:**
  1. Login as manager and obtain access token $T_1$ and refresh token $R_1$.
  2. Exchange $R_1$ for $T_2$ and $R_2$ via `POST /api/v1/auth/refresh`.
  3. Replay $R_1$ in a second refresh request.
* **Expected Result:**
  $R_1$ replay rejected with `HTTP 401 Unauthorized` and session family revoked.
* **Actual Result:**
  Replay returned `HTTP 401` but did not flag entire token family.
* **Remediation & Fix:**
  Prajval V K implemented token family hash invalidation in `AuthenticationService.java` and verified with `AuthControllerTest.java`.
* **Verification:**
  Verified via Newman test `06 - Negative: Expired or Revoked Refresh Token`. **`PASSED`**.

---

#### DEF-AUTH-003: Rate Limiting Throttling Response Compliance
* **Severity:** **P3 (Major)**
* **Component:** `com.nelja.urqr.auth.security.RateLimitingFilter`
* **Reproduction Steps:**
  1. Send 10 rapid failed login requests from the same IP within 1 second.
* **Expected Result:**
  Returns `HTTP 429 Too Many Requests` with header `Retry-After: 60` and RFC 7807 body.
* **Actual Result:**
  Returned `HTTP 429` with plain text response body.
* **Remediation & Fix:**
  Structured JSON error response with `Retry-After` header and lockout message.
* **Verification:**
  Verified via Newman test `08 - Brute-Force Rate Limiting`. **`PASSED`**.
