# URQR Platform (Phase 1) — Day 4 Asset Library Release Notes (`v1.0.0`)

**Release Tag:** `urqr-assets-day4-v1.0.0`  
**Release Date:** Thursday, 26 November 2026  
**Prepared By:** Gagan (Design Systems & Hardware Specs, Nelja Tech)  
**Target Audiences:** Frontend Engineering (Swaroopa, Vishal, Vennela) & Backend / Infrastructure / Hardware (Prajwal B N, Spring Boot & Go URQR-Bridge Team)  
**Master Archive:** `URQR_Day4_Asset_Library_Release_v1.0.0.zip`

## 1. Release Summary

This release packages all **Day 4 Morning and Afternoon** visual assets, theme bindings, Cloudflare R2 placeholders, optimization configs, and hardware display QA reports for the **Phase 1 Standalone Manager POS** (`1366×768` to `1920×1080`, **URQR THEME Beige / Sepia**).

| Deliverable Group | Count / Scope | Verification Status |
| :--- | :--- | :--- |
| **Custom POS SVG Icons** (`payment`, `status`, `actions`) | 11 icons (`currentColor` + `urqr-theme` + React TSX + `<symbol>` sprite) | SVGO-optimized (-20.8%), 0px edge clipping, 93%–100% stroke solidity (1× & 2× DPR) |
| **Store Branding Placeholders & Avatars** (Cloudflare R2) | 11 files (`512×512` emblem, `1200×320` wordmark, `256/128` avatars, `576×160` 1-bit thermal PNG) | WebP q85–90 (sRGB, EXIF stripped), all assets well under spec budgets |
| **Theme & Build Configs** | `urqr-theme.css` (17 tokens), `svgo.config.mjs`, `urqr_asset_spec_manifest.json` | Aligned 1:1 with `05 · Specification sheet (1920×1080).pdf` |
| **Specs, R2 Conventions & QA Audits** | 4 Markdown/JSON specs + 4 interactive HTML visual QA reports + `SHA256SUMS.txt` | Ready for engineering integration & PM sign-off |

## 2. Frontend Engineering Integration Notes (`@urqr/ui` · React 19 + TypeScript 6.0.3)

- **Drop-In Package Paths (`frontend/`):**
  - Copy `frontend/theme/urqr-theme.css` into `frontend/packages/ui/src/theme.css` to expose all 17 `--urqr-*` CSS variables.
  - Copy `frontend/react/UrqrPosIcons.tsx` into `frontend/packages/ui/src/icons/UrqrPosIcons.tsx` and export all 11 components plus `URQR_POS_ICONS` from `packages/ui/src/index.ts`.
  - Copy `frontend/svgo.config.mjs` to `frontend/packages/ui/svgo.config.mjs` to enforce `removeViewBox: false` and `role`/`aria-label` retention on future icons.
- **Component State & Sizing Guidance:**
  - **72px Header Status Pills (`16px`):** `CloudSyncActiveIcon`, `CentrifugoConnectedIcon`, and `PrinterReadyIcon` use `success` (`#3F6B3A`) on `successBg` (`#EEF3E8`); `OfflineBufferedIcon` uses `warning` (`#B45309`) on `warningBg` (`#FDF1E1`). Always pair with text labels (never color-only).
  - **Payment Method Tiles (`24px`–`28px`):** Use `CashTenderIcon` (`tone="primaryDark"` for duotone Beige/Sepia on `surfaceAlt` `#FAF3E6`; `tone="onPrimary"` for crisp monochrome `#FFFFFF` on Selected `primary` `#8B5E3C`; `tone="disabled"` on `#D9CDB8`). Keep duotone Cash Tender at `>= 24px` on `1×` `1366×768` touchscreens.
  - **Hotkey Action Buttons (`20px`):** `QuickSearchIcon` (`F2`) and `PrintLastIcon` (`F9`) on `surfaceAlt`; `CashPayIcon` (`F4`) on `primary` (`#8B5E3C`); `VoidCartIcon` (`Esc`) in `error` (`#B91C1C`).

## 3. Backend, Cloudflare R2 & Go URQR-Bridge Integration Notes

- **Pre-Structured R2 Upload Tree (`r2-assets/shared/v1/`):**
  - Files under `r2-assets/shared/v1/` mirror the canonical Cloudflare R2 key hierarchy (`shared/v1/placeholders/branding/`, `avatars/`, `thermal/`) and can be synced directly to `urqr-assets-dev`, `urqr-assets-staging`, and `urqr-assets-prod`.
- **Upload Validation (`specs-and-qa/urqr_asset_spec_manifest.json`):**
  - Enforce `2 MB` max raw client upload, `sRGB` color profile, EXIF/XMP/IPTC stripping, lowercase kebab-case keys, and `{hash8}` SHA-256 content hashes for tenant-scoped uploads (`tenants/{tenant_slug}/...`).
  - Serve standalone `.svg` files with `Content-Type: image/svg+xml`, `X-Content-Type-Options: nosniff`, and `Content-Security-Policy: default-src 'none'; sandbox`.
  - Set `Cache-Control: public, max-age=31536000, immutable` on `shared/v1/` and hashed tenant paths.
- **Go 1.27.4 URQR-Bridge Thermal Spooler:**
  - `r2-assets/shared/v1/placeholders/thermal/urqr-placeholder-thermal-logo-80mm.png` (`576×160`, 1-bit monochrome, `1.3 KB`) is ready for ESC/POS raster printing without runtime dithering. Cache tenant `thermal-logo-{hash8}-80mm.png` locally on disk so offline receipt printing never blocks on CDN.

## 4. Open Coordination Items (PM Sign-Off — Prajwal B N)

1. Confirm final Edge CDN hostname (`assets.urqr.neljatech.in` vs. alternate domain).
2. Confirm `tenant_slug` vs. `tenant_uuid` for `tenants/{key}/` R2 object prefixes.
3. Confirm whether WebP / 1-bit thermal transcoding runs in Spring Boot 4.1.2 or via Cloudflare Workers.
4. Confirm 30-day R2 lifecycle cleanup policy for superseded `{hash8}` tenant assets.

## 5. Archive Structure (`URQR_Day4_Asset_Library_Release_v1.0.0.zip`)

- `RELEASE_NOTES.md` — This release document
- `SHA256SUMS.txt` — Integrity checksums for every packaged file
- `frontend/` — Optimized SVGs (`currentColor` & `urqr-theme`), `UrqrPosIcons.tsx`, sprite, `urqr-theme.css`, `svgo.config.mjs`, `manifest.json`
- `r2-assets/shared/v1/` — Production-ready Cloudflare R2 placeholder logos, avatars, and 1-bit thermal logo
- `specs-and-qa/` — Asset Specification Manifest (`.md` + `.json`), R2 Naming & CDN Spec, Morning Handoff, and HTML visual QA reports
