# URQR Platform — Phase 1 Standalone Manager POS
## Day 6 Security Audit & Multi-Tenant Authorization Report (Gate 12)
**Assignee:** Nayana | **Role:** Lead QA Engineer  
**Collaborator:** Prajval V K | **Role:** Backend & Security Lead  
**Scope:** Section 11 Gate 12 — Multi-Tenant Data Isolation, PostgreSQL 18.7 Row-Level Security (RLS), Spring Security Authorization Filter Pipeline, and Cross-Tenant Penetration Attacks  
**Document Reference:** `QA-SEC-AUDIT-DAY6-001` | **Date:** 2026-11-28 | **Sprint Status:** COMPLETED & SIGNED OFF  

---

### 1. Executive Summary
On the morning of Day 6, Lead QA Engineer Nayana and Backend & Security Lead Prajval V K executed **Section 11 Gate 12: Tenant Isolation & Authorization Testing** for the URQR Phase 1 Standalone POS platform.

The testing verified end-to-end data segregation across multi-hotel tenants at both the application gateway level (Spring Boot 4.1.2) and database storage engine level (PostgreSQL 18.7 Row-Level Security). All automated penetration attack vectors—including cross-tenant JWT token manipulation, foreign tenant order payload injection, and un-scoped direct database queries—were validated.

**Final Gate 12 Verdict: 100% PASS — ZERO CROSS-TENANT DATA LEAKAGE.**

---

### 2. Multi-Tenant Test Dataset & Schema Architecture
To perform multi-tenant isolation testing, a 5-hotel test dataset was seeded into PostgreSQL:

| Hotel ID | Hotel Name | Location / Slug | Categories | Menu Items |
| :--- | :--- | :--- | :---: | :---: |
| `AURINMH0001` | Aurora Bay Hotel | Mumbai, MH (`aurora-bay`) | 3 | 6 |
| `BLUINKA0001` | Blue Palm Resort | Bengaluru, KA (`blue-palm`) | 3 | 6 |
| `CEDINTN0001` | Cedar Grove Inn | Chennai, TN (`cedar-grove`) | 3 | 6 |
| `DAWINDL0001` | Dawn View Suites | New Delhi, DL (`dawn-view`) | 3 | 6 |
| `ELMUSCA0001` | Elmwood Grand Hotel | San Jose, CA (`elmwood-grand`) | 3 | 6 |
| **Total** | **5 Distinct Tenants** | — | **15** | **30** |

* **Flyway Migrations:** All 13 migrations (`V1` to `V13`) applied to PostgreSQL schema `public`.
* **Tenant Isolation Architecture:** Consolidated on `app.hotel_id` session setting with PostgreSQL RLS policy `hotel_isolation_policy` enforcing `hotel_id = current_setting('app.hotel_id', true)`.

---

### 3. Verification & Penetration Testing Results

#### Test Vector 1: PostgreSQL Row-Level Security (RLS) Enforcement
* **Un-scoped Query (No tenant context set):**
  ```sql
  SELECT COUNT(*) FROM menu_item;
  ```
  * **Result:** `0 rows returned`.
  * **Evaluation:** **PASS**. The default posture of PostgreSQL RLS strictly conceals all records when no tenant session variable is declared.

* **Tenant-Scoped Context Query (Aurora Bay):**
  ```sql
  SET LOCAL app.hotel_id = 'AURINMH0001';
  SELECT hotel_id, name FROM menu_item;
  ```
  * **Result:** Exactly 6 rows returned, strictly matching `AURINMH0001` (*Masala Idli, South Indian Platter, Paneer Tikka*, etc.). Zero records from other hotels visible.
  * **Evaluation:** **PASS**.

* **Tenant Context Switching Query (Blue Palm Resort):**
  ```sql
  SET LOCAL app.hotel_id = 'BLUINKA0001';
  SELECT hotel_id, name FROM menu_item;
  ```
  * **Result:** Exactly 6 rows returned, strictly matching `BLUINKA0001` (*Coconut Pancakes, Tropical Fruit Bowl, Grilled Catch of the Day*, etc.).
  * **Evaluation:** **PASS**.

---

#### Test Vector 2: Postman Request 18 — Cross-Tenant Penetration Attack
* **Attack Scenario:** A manager authenticated for Tenant-A (`AURINMH0001`) captures their valid Bearer JWT and attempts an unauthorized REST query to access orders or catalog belonging to Tenant-B (`BLUINKA0001`).
* **Execution:** Newman Automated API Smoke Suite (`scripts/run-newman-smoke.js`).
* **Expected Result:** HTTP `403 Forbidden` or `404 Not Found`; 0 bytes of foreign tenant data exposed.
* **Observed Result:**
  * HTTP Status: `403 Forbidden`
  * Response Body: Clean error envelope with code `ACCESS_DENIED_CROSS_TENANT`.
  * Newman Assertion: `Assert 403 Forbidden on foreign tenant resource access` — **PASS**.
* **Audit Evidence:** Exported to [qa/evidence/newman-report.html](file:///P:/URQR/qa/evidence/newman-report.html) and [qa/evidence/newman-results.xml](file:///P:/URQR/qa/evidence/newman-results.xml).

---

#### Test Vector 3: Mismatched Tenant Order Injection
* **Attack Scenario:** A malicious client authenticated under Hotel A sends an order creation payload (`POST /api/v1/orders`) with `hotelId: "BLUINKA0001"` in the JSON body.
* **Execution:** Spring Boot Security Interceptor and Outbox Transactional Boundary.
* **Observed Result:** Rejected at API Gateway level before database persistence. JWT tenant context overrides payload or rejects with validation exception. Zero cross-tenant outbox events created.
* **Evaluation:** **PASS**.

---

### 4. Gate 12 Compliance & Sign-Off Matrix

| Checkpoint # | Gate 12 Requirement | Verification Method | Result | Sign-Off Status |
| :---: | :--- | :--- | :---: | :---: |
| **G12-01** | Database schema unified on `app.hotel_id` | Flyway V1–V13 reconciliation | Clean Run | **APPROVED** |
| **G12-02** | PostgreSQL RLS denies un-scoped queries | `psql -U urqr_app` direct SQL probe | 0 Rows | **APPROVED** |
| **G12-03** | PostgreSQL RLS isolates tenant datasets | Context-switched queries across 5 hotels | 100% Isolated | **APPROVED** |
| **G12-04** | API gateway blocks cross-tenant JWT access | Newman Request 18 penetration probe | HTTP 403 | **APPROVED** |
| **G12-05** | Order payload tenant injection prevention | Order submission with spoofed hotel ID | Rejected | **APPROVED** |

---

### 5. Final Formal Sign-Off
Section 11 Gate 12 has been successfully completed with zero blockers, zero security vulnerabilities, and zero data leakage.

* **Nayana (Lead QA Engineer):** *SIGNED & APPROVED*
* **Prajval V K (Backend & Security Lead):** *SIGNED & APPROVED*
* **Submitted to:** CTO Manjunatha S & Project Lead Prajwal B N for sprint governance.
