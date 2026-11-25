# URQR Platform — Phase 1 Standalone Manager POS
## Screen 1 (Manager Login) UI Test Scenarios & Validation Review
**Document Reference:** `QA-REV-SCREEN1-001` | **Sprint Date:** Day 2 QA Deliverable (2026-11-25)  
**Participants:**
- **Nayana** — Functional & API QA Lead
- **Vennela** — Frontend Lead (Screen 1 Manager POS UI)
- **Prajwal B N** — Project Manager (Sign-off & Alignment)

---

### 1. Executive Summary & Review Scope
This review aligns the frontend form validation criteria implemented by Vennela (`ManagerLogin.tsx`, `useManagerLogin.ts`, `Login.config.ts`) with the automated QA test suites authored by Nayana (Postman API Contract Suite, Playwright UI Primitive Suite `tests/ui-primitives.spec.ts`, and Screen 1 Login Spec `tests/screen1-login.spec.ts`).

The objective is to eliminate discrepancies between client-side validation, server contract specifications, and automated test assertions before freezing Phase 1 POS deliverables.

---

### 2. Form Validation Criteria & Cross-Functional Alignment

| Validation Checkpoint | Frontend Implementation (Vennela) | QA Test Assertion (Nayana) | Status | Alignment Details |
|---|---|---|---|---|
| **Zero-Tenant Architecture** | Form strictly exposes `userName` and `password`. No `tenantSlug` input field is rendered. | `tests/screen1-login.spec.ts` asserts `input[name="tenantSlug"]` count is strictly 0. | **ALIGNED** | Tenant scope is resolved via host/subdomain or multi-tenant headers (`X-Tenant-ID`). |
| **Username Field Sanitization** | `type="text"`, `name="userName"`, trimmed whitespace on change, HTML5 `required`. | `tests/ui-primitives.spec.ts` and Postman assert non-empty string payload. | **ALIGNED** | Whitespace trimming prevents accidental spaces from touch keyboard input. |
| **Password Policy & Masking** | `type="password"`, masked characters, minimum length requirement, `required`. | Postman tests negative password submissions (`WrongSecurityPassword@999` $\to$ 401). | **ALIGNED** | Minimum password length validated client-side and verified via mock auth. |
| **Instant Field Error on Blur** | Input invalid state renders helper message and highlights field boundary in red. | `tests/ui-primitives.spec.ts` asserts `aria-invalid="true"` and `<p role="alert">` render on blur. | **ALIGNED** | Meets accessibility standard WCAG 2.1 AA with live screen reader announcements. |
| **Form Empty Submission** | Form submission without inputs triggers inline Notification banner (`isOpen: true`, `type: "error"`). | `tests/screen1-login.spec.ts` asserts `.notification-error` and `[role="alert"]` appear. | **ALIGNED** | Submission is halted client-side; network call is prevented on empty inputs. |
| **Async Loading & Button State** | Submit button transitions to loading state, displays spinner, disables interactions. | `tests/ui-primitives.spec.ts` asserts `aria-busy="true"` and button `disabled` during submission. | **ALIGNED** | Prevents duplicate click race conditions during network latency. |
| **Touch Screen Ergonomics** | Input fields and primary button sized to standard POS touch dimensions ($\ge 48\text{px}$). | `tests/ui-primitives.spec.ts` asserts bounding box height $\ge 48\text{px}$ across 1366x768 to 1920x1080. | **ALIGNED** | Tested across Chromium and WebKit POS display viewport presets. |
| **Virtual Keypad Bound Check** | Virtual numeric keypad docks below focused input fields with positive margin. | `tests/ui-primitives.spec.ts` asserts `input.bottom <= keypad.top` and `input.top >= 0`. | **ALIGNED** | Zero input field occlusion when virtual on-screen keypad is invoked. |
| **Brute-Force Rate Limiting (429)** | UI displays server-provided retry time notification on HTTP 429 response. | Postman Collection Request 08 asserts HTTP 429 and `Retry-After: 60` header. | **ALIGNED** | UI disables submit button for countdown duration when 429 is received. |

---

### 3. Detailed Review Notes & Clarifications

1. **Input Naming Convention:**
   - Frontend form uses `name="userName"` while API request payload uses `username`.
   - Vennela and Nayana confirmed that the hook `useManagerLogin` maps `userName` $\to$ `username` in the outbound authentication DTO, matching the Zod schema `LoginRequestSchema`.
2. **Error Message Copy Standardization:**
   - Frontend error copy: *"Login failed. Please check your user name and password."*
   - Backend contract copy: `{"error": "Invalid credentials"}`
   - Both teams confirmed the frontend displays the generic user-friendly text while logging the contract error code.
3. **Accessibility Attributes:**
   - All input error elements feature `role="alert"` and are connected via `aria-describedby` to the corresponding input elements.

---

### 4. Joint Sign-Off & Approvals

| Stakeholder | Role | Decision | Signature Date |
|---|---|---|---|
| **Nayana** | Functional & API QA Lead | **APPROVED** | 2026-11-25 |
| **Vennela** | Frontend POS Lead | **APPROVED** | 2026-11-25 |
| **Prajwal B N** | Project Manager | **APPROVED** | 2026-11-25 |
