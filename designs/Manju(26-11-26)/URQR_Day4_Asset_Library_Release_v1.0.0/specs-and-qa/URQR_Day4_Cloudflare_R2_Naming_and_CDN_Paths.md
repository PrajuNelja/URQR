# Cloudflare R2 Asset Naming Conventions & Edge CDN Path Specification

**Project:** Nelja Tech — URQR Platform (Phase 1 Standalone Manager POS)

**Prepared By:** Gagan (Design Systems & Hardware Specs)

**Coordination Partner:** Prajwal B N (PM & Go 1.27.4 URQR-Bridge Lead)

**Date:** Thursday, 26 November 2026 (Day 4 — Afternoon Session, Task 3)

**Companion Spec:** `URQR_Day4_Asset_Specification_Manifest.md`

## 1. Bucket Topology & Edge CDN Domains

| Environment | Cloudflare R2 Bucket | Edge CDN Base URL (Confirm with PM) | Access Model | 
| ----- | ----- | ----- | ----- | 
| **Development** | `urqr-assets-dev` | `https://assets-dev.urqr.neljatech.in` | Public `GET` via R2 custom domain; Presigned `PUT` | 
| **Staging** | `urqr-assets-staging` | `https://assets-staging.urqr.neljatech.in` | Public `GET` via R2 custom domain; Presigned `PUT` | 
| **Production** | `urqr-assets-prod` | `https://assets.urqr.neljatech.in` | Public `GET` via Cloudflare Edge CDN; Presigned `PUT` | 

## 2. Canonical R2 Object Key Hierarchy

All object keys are partitioned into two top-level namespaces: **immutable shared design-system assets** (`shared/v{major}/`) and **tenant-isolated brand/menu assets** (`tenants/{tenant_slug}/`).

### 2.1 Shared Platform Assets (`shared/v1/`)

| Asset Type | R2 Object Key Pattern | Example Live Edge Path | 
| ----- | ----- | ----- | 
| **POS UI SVG Icons (`currentColor`)** | `shared/v1/icons/pos/currentcolor/{group}/{icon-id}.svg` | `/shared/v1/icons/pos/currentcolor/payment/urqr-payment-cash.svg` | 
| **POS UI SVG Icons (`urqr-theme`)** | `shared/v1/icons/pos/urqr-theme/{group}/{icon-id}.svg` | `/shared/v1/icons/pos/urqr-theme/status/urqr-status-cloud-sync.svg` | 
| **POS Icon Sprite** | `shared/v1/icons/pos/urqr-pos-icons-sprite.svg` | `/shared/v1/icons/pos/urqr-pos-icons-sprite.svg` | 
| **Store Emblem Placeholder** | `shared/v1/placeholders/branding/urqr-placeholder-store-emblem-512.{ext}` | `/shared/v1/placeholders/branding/urqr-placeholder-store-emblem-512.webp` | 
| **Store Wordmark Placeholder** | `shared/v1/placeholders/branding/urqr-placeholder-store-wordmark-1200x320.{ext}` | `/shared/v1/placeholders/branding/urqr-placeholder-store-wordmark-1200x320.webp` | 
| **Manager Avatar Placeholder** | `shared/v1/placeholders/avatars/urqr-placeholder-manager-avatar-{size}.{ext}` | `/shared/v1/placeholders/avatars/urqr-placeholder-manager-avatar-256.webp` | 
| **Thermal Logo Placeholder** | `shared/v1/placeholders/thermal/urqr-placeholder-thermal-logo-{paper}.png` | `/shared/v1/placeholders/thermal/urqr-placeholder-thermal-logo-80mm.png` | 

### 2.2 Tenant-Scoped Assets (`tenants/{tenant_slug}/`)

Every tenant-uploaded file includes an **8-character lowercase SHA-256 content hash (`{hash8}`)** so updates publish to a new immutable URL without manual Cloudflare cache purges.

| Asset Type | R2 Object Key Pattern | Example (`nelja-bistro`) | 
| ----- | ----- | ----- | 
| **Store Emblem (`512×512`)** | `tenants/{tenant_slug}/branding/logo-emblem-{hash8}-512.{webp|png}` | `/tenants/nelja-bistro/branding/logo-emblem-a4f9c21b-512.webp` | 
| **Store Wordmark (`1200×320`)** | `tenants/{tenant_slug}/branding/logo-wordmark-{hash8}-1200x320.{webp|png}` | `/tenants/nelja-bistro/branding/logo-wordmark-7e2b9104-1200x320.webp` | 
| **Thermal Logo (`80mm` / `58mm`)** | `tenants/{tenant_slug}/branding/thermal-logo-{hash8}-{80mm|58mm}.png` | `/tenants/nelja-bistro/branding/thermal-logo-3d8a11f0-80mm.png` | 
| **Manager Avatar (`128` / `256`)** | `tenants/{tenant_slug}/avatars/manager-{user_id}-{hash8}-{128|256}.webp` | `/tenants/nelja-bistro/avatars/manager-01-9c12b4e7-256.webp` | 
| **Menu Item Thumbnail** | `tenants/{tenant_slug}/menu/{item_id}-{hash8}-{300x200|600x400}.{webp|jpg}` | `/tenants/nelja-bistro/menu/item-104-f82a01c3-600x400.webp` | 

## 3. Strict Naming & Validation Rules

* **Allowed Characters:** Lowercase ASCII alphanumeric and hyphens only (`^[a-z0-9][a-z0-9.-]*$`). Reject spaces, uppercase letters, underscores, and non-ASCII characters at upload signing.

* **Explicit Dimension / Hardware Suffix:** Every raster object key must carry its pixel dimension (`-128`, `-256`, `-512`, `-600x400`, `-1200x320`) or thermal roll width (`-58mm`, `-80mm`) before the file extension.

* **Canonical Extensions:** `.svg`, `.webp`, `.png`, `.jpg` (normalize `.jpeg` to `.jpg`).

* **Tenant Prefix Enforcement:** Spring Boot 4.1.2 backend must bind presigned `PUT` keys strictly to the authenticated JWT's `tenant_slug` claim to prevent cross-tenant overwrites.

## 4. Edge CDN Caching, Security & Offline Bridge Rules

| Rule Area | Production Specification | 
| ----- | ----- | 
| **Cache-Control (Hashed / `shared/v1/`)** | `public, max-age=31536000, immutable` | 
| **Cache-Control (Fallback / Mutable)** | `public, max-age=3600, stale-while-revalidate=86400` | 
| **Upload Cap & Presigned TTL** | Max `2 MB` raw upload; presigned `PUT` URL expires in `300s` (5 minutes) with locked `Content-Type` | 
| **SVG Security Headers** | `Content-Type: image/svg+xml`, `X-Content-Type-Options: nosniff`, `Content-Security-Policy: default-src 'none'; sandbox` | 
| **CORS Policy (`GET`/`HEAD`)** | Allow `http://localhost:5173` (dev), staging POS origin, and production POS origin | 
| **Go URQR-Bridge Thermal Cache** | Daemon downloads `thermal-logo-{hash8}-80mm.png` once per hash change and caches locally on disk so offline printing never blocks on CDN | 

## 5. Coordination Sign-Off Checklist for Prajwal B N

1. **Custom CDN Domain:** Confirm final DNS hostname (`assets.urqr.neljatech.in` vs. alternate subdomain).

2. **Tenant Partition Key:** Confirm `tenant_slug` (human-readable, immutable post-onboarding) vs. `tenant_uuid` for the `tenants/{key}/` prefix.

3. **Upload Pipeline Ownership:** Confirm whether Spring Boot 4.1.2 transcodes WebP/1-bit thermal PNG server-side or via a Cloudflare Worker on R2 upload.

4. **R2 Lifecycle Retention:** Confirm retention window (recommended: `30 days`) for superseded `{hash8}` tenant logos/thumbnails before automatic cleanup.