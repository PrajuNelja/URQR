# URQR Platform — GitHub Actions Secrets Reference
# Nelja Tech | Assignee: Prajwal B N | Role: System Architect
#
# This file documents every secret that must be configured in:
#   GitHub → Repository Settings → Secrets and variables → Actions
#
# NEVER store actual values here. This file is tracked in git as documentation only.
# =============================================================================

## How to Add Secrets
# 1. Go to: https://github.com/<org>/<repo>/settings/secrets/actions
# 2. Click "New repository secret"
# 3. Enter the Name and Value from the table below
# 4. Click "Add secret"

---

## Secret Registry

### JWT (RSA-256 / HMAC)

| Secret Name | Description | Example format | Required in |
|---|---|---|---|
| `JWT_SECRET` | HMAC secret for signing JWTs. Min 32 chars. Rotate on compromise. | `kdskjnhfi...` (≥32 chars) | `ci.yml` → `backend-test` |

> **RSA-256 upgrade path:** When switching to RS256, replace `JWT_SECRET` with:
> - `JWT_RSA_PRIVATE_KEY` — PEM-encoded RSA private key (for signing)
> - `JWT_RSA_PUBLIC_KEY`  — PEM-encoded RSA public key (for verification)
>
> Store multi-line PEM keys by pasting the full block including `-----BEGIN RSA PRIVATE KEY-----`.

---

### Database Credentials

| Secret Name | Description | Used by |
|---|---|---|
| `DB_PASSWORD` | PostgreSQL password for `urqr` user | Production / staging deploy workflows |
| `DB_URL` | Full JDBC URL for production DB | Production deploy |

> **CI note:** The `backend-test` job overrides these with an H2 in-memory database
> so no live DB is needed for unit tests to pass.

---

### Platform Bootstrap Secrets

| Secret Name | Description | Used by |
|---|---|---|
| `PLATFORM_ADMIN_USERNAME` | Username for platform-level hotel provisioning | `ci.yml` → `backend-test` |
| `PLATFORM_ADMIN_PASSWORD` | Password for platform-level hotel provisioning | `ci.yml` → `backend-test` |
| `SETUP_SECRET` | One-time secret for first-hotel creation (`POST /api/v1/setup/first-hotel`) | `ci.yml` → `backend-test` |
| `PLATFORM_ADMIN_SECRET` | Multi-tenant hotel provisioning secret (`POST /api/v1/platform/hotels`) | `ci.yml` → `backend-test` |

---

### S3 / Object Storage Access Tokens

| Secret Name | Description | Used by |
|---|---|---|
| `S3_ACCESS_KEY_ID` | AWS / S3-compatible access key ID | Future artifact upload workflows |
| `S3_SECRET_ACCESS_KEY` | AWS / S3-compatible secret access key | Future artifact upload workflows |
| `S3_BUCKET_NAME` | Target bucket for uploads (receipts, reports) | Future workflows |
| `S3_REGION` | AWS region (e.g. `ap-south-1`) | Future workflows |

---

### Centrifugo

| Secret Name | Description | Used by |
|---|---|---|
| `CENTRIFUGO_TOKEN_SECRET` | HMAC secret for Centrifugo JWT tokens | Production deploy |
| `CENTRIFUGO_API_KEY` | Key for backend→Centrifugo HTTP API calls | Production deploy |

---

## Secret Rotation Policy

| Frequency | Secrets |
|---|---|
| **On any suspected compromise** | All secrets — immediately |
| **Every 90 days** | `JWT_SECRET`, `S3_SECRET_ACCESS_KEY`, `CENTRIFUGO_TOKEN_SECRET` |
| **On team member offboarding** | `PLATFORM_ADMIN_PASSWORD`, `PLATFORM_ADMIN_SECRET`, `SETUP_SECRET` |

---

## CI vs Production Separation

```
Environments used in GitHub Actions:
  ┌─────────────────────────────────────────────────┐
  │  Job: backend-test  → uses: H2 in-memory DB     │
  │                        no real DB credentials    │
  │                        JWT_SECRET from secrets   │
  ├─────────────────────────────────────────────────┤
  │  Future: deploy-staging → uses: staging secrets  │
  │  Future: deploy-prod    → uses: production env   │
  │          (protected environment with approval)   │
  └─────────────────────────────────────────────────┘
```
