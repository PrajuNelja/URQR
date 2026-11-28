# URQR Platform — Multi-Tenant Security & Isolation Verification Report

**Author / Assignee:** Prajval V K (Backend Auth Lead)  
**Reviewed by:** Nayana (QA Lead)  
**Lead Architect:** Prajwal B N (Overall Lead & System Architect)  
**Approved by:** Manjunatha S (CTO)  
**Date:** 26 November 2026  
**Scope:** Phase 1 Standalone Manager POS — Auth, Security & Multi-Tenancy Row-Level Security (RLS)  

---

## 1. Executive Summary

This report documents the security architecture, cryptographic token claim specifications, PostgreSQL 18.7 Row-Level Security (RLS) policies, and penetration testing evidence for the URQR platform across Days 1 through 4.

The multi-tenant isolation model employs defense-in-depth:
1. **Application Layer (Spring Security 6.x / Java 21)**: Stateless RS256 JWT tokens, method-level authorization (`@EnableMethodSecurity`), and Policy-Based Access Control (`TenantSecurityService`).
2. **Context Layer (`TenantFilter` & `TenantContext`)**: Safe `ThreadLocal` request scope with strict unconditional cleanup preventing thread pollution on Project Loom virtual threads.
3. **Database Layer (PostgreSQL 18.7 RLS)**: Native PostgreSQL RLS enabled and forced across all business tables. Session parameters are scoped per-transaction via `SET LOCAL app.tenant_id = ?` (`select set_config('app.tenant_id', :tenantId, true)`).
4. **Runtime Privilege Boundary**: The runtime database user `urqr_app` strictly possesses `rolsuper = false` and `rolbypassrls = false`.

---

## 2. Authentication & Cryptographic Token Architecture

### 2.1 Cryptographic Keypair & Signing Specifications
- **Algorithm:** Asymmetric RSA-256 (`SHA256withRSA`).
- **Key Length:** 2048-bit RSA asymmetric keypair loaded from environment secrets (`JWT_PRIVATE_KEY` in PKCS#8 and `JWT_PUBLIC_KEY` in X.509 Base64 format).
- **Validation:** Enforced by `RsaKeyProperties.java` requiring minimum 2048-bit key modulus and challenge roundtrip signature verification during bean initialization.

### 2.2 Token Claim Specifications & Expiry
| Token Type | Lifespan | Claims Embedded | Rotation / Storage |
| :--- | :--- | :--- | :--- |
| **Access Token** | 15 Minutes | `sub` (username), `hotel_id` (UUID), `uid` (UUID), `roles` (`ROLE_MANAGER`, `ROLE_CASHIER`), `token_type` (`access`) | Stateless, validated cryptographically by Nimbus `JwtDecoder`. |
| **Refresh Token** | 7 Days | `sub`, `hotel_id`, `uid`, `jti` (UUID), `token_type` (`refresh`) | Stateful single-use token tracked in Redis. Atomic consumption via `RedisAuthStateService.consumeRefreshToken()` prevents token replay attacks. |

---

## 3. PostgreSQL 18.7 Row-Level Security (RLS) Policies

### 3.1 Session Context Variables
- `app.tenant_id`: Active tenant UUID set transaction-locally using `set_config('app.tenant_id', :tenantId, true)`.
- `app.platform_admin`: Boolean flag (`true`/`false`) set transaction-locally for platform management tasks.

### 3.2 Table Policies Enforced in `V1__init_schema.sql`
Every business table possesses row-level security enabled and forced:
```sql
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON categories
    USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid
           OR current_setting('app.platform_admin', true) = 'true');
```
Tables covered: `tenants`, `hotel`, `staff_user`, `hotel_role`, `categories`, `menu_items`, `orders`, `order_items`, `payments`, `receipts`, `outbox_events`, `audit_logs`.

---

## 4. Policy-Based Access Control (PBAC) & Anti-Spoofing

### 4.1 PBAC Evaluation (`TenantSecurityService`)
- Evaluates whether an authenticated principal's cryptographically verified `hotel_id` matches the resource being queried.
- Global bypass is granted only to verified principals holding `ROLE_PLATFORM_ADMIN`.

### 4.2 Anti-Spoofing Defense
- **Attack Scenario:** Attacker sends a valid JWT for Tenant A, but supplies header `X-Tenant-ID: <Tenant-B-UUID>` to forge cross-tenant requests.
- **Defense Implementation:** `TenantFilter.java` and `TenantJwtAuthenticationConverter.java` prioritize the verified JWT `hotel_id` claim over untrusted headers.
- **Automated Verification:** Verified in `UrqrServerApplicationTests.tamperingWithTenantHeaderIsOverriddenByVerifiedJwtClaims` and `TenantFilterTest.jwtAlwaysOverridesSpoofedHeader`.

---

## 5. Automated Penetration & Isolation Test Evidence

All automated security tests executed successfully with **zero failures and zero cross-tenant data leakage**:

1. **Cross-Tenant Attack Simulation (`RlsAndAtomicityIntegrationTest.java`)**:
   - `tenantASeesOnlyItsRowsAndRuntimeRoleCannotBypassRls`:
     - Tenant A and Tenant B categories inserted.
     - Tenant A executes `SELECT count(*) FROM categories WHERE tenant_id = :tenantB`.
     - **Result:** Exact count = 0 rows returned.
     - Privilege check verifies `rolsuper = false` and `rolbypassrls = false` on `urqr_app`.
2. **Context Leak Prevention (`TenantFilterTest.java`)**:
   - Validates that `TenantContext.getTenantId()` is populated during filter execution and unconditionally cleared (`null`) after chain completion and upon simulated exceptions.
3. **Authentication Failure & Replay Rejection (`AuthControllerTest.java`)**:
   - Validates that bad credentials return RFC 7807 401 Unauthorized.
   - Validates that replaying an already-consumed refresh token returns 401 Unauthorized.
4. **End-to-End Anti-Spoofing (`UrqrServerApplicationTests.java`)**:
   - Forged `X-Tenant-ID` headers are ignored in favor of verified claims.

---

## 6. Lead & CTO Sign-Off

| Role | Signee | Date | Status |
| :--- | :--- | :--- | :--- |
| **Backend Auth Lead** | Prajval V K | 26 Nov 2026 | **PASSED & SUBMITTED** |
| **QA Lead** | Nayana | 26 Nov 2026 | **VERIFIED & ACCEPTED** |
| **Overall Lead & Architect** | Prajwal B N | 26 Nov 2026 | **APPROVED** |
| **Chief Technology Officer** | Manjunatha S | 26 Nov 2026 | **FINAL SIGN-OFF** |
