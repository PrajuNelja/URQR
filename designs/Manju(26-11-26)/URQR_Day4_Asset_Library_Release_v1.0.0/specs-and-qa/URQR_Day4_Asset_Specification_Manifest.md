# URQR Platform — Phase 1 Asset Specification Manifest

**Project:** Nelja Tech — URQR Platform (Phase 1 Standalone Manager POS)

**Document Owner:** Gagan (Design Systems & Hardware Specs)

**Date:** Thursday, 26 November 2026 (Day 4 — Afternoon Session, Task 1)

**Target Viewports:** `1366×768` (minimum POS terminal) to `1920×1080` (primary desktop/laptop POS, 8px grid)

**Theme Standard:** Variable Collection **URQR THEME** (Beige / Sepia — `05 · Specification sheet`)

**Storage & Delivery:** Cloudflare R2 + Edge CDN (path conventions finalized in Task 3 with Prajwal B N)

## 1. Master Asset Specification Matrix

| Asset Category | Canonical Dimensions (px) | Aspect Ratio | Primary Format | Fallback Format | Max File Size | Compression & Optimization Spec | 
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | 
| **POS UI Icons (Payment, Status, Action)** | `24×24` (`viewBox="0 0 24 24"`) | `1:1` | SVG (`currentColor` + `urqr-theme`) | SVG `<symbol>` sprite | `<= 1.0 KB` / icon (`<= 6 KB` full set) | SVGO v3+ (`svgo.config.mjs`), `multipass: true`, `floatPrecision: 2`, `removeViewBox: false`, preserve `role` & `aria-label` | 
| **Store Branding Emblem (Square)** | `512×512` (display `48`–`128px`) | `1:1` | SVG (vector master) / WebP | PNG-24 (transparent) | `<= 35 KB` (WebP) / `<= 55 KB` (PNG) | WebP lossless or `q=90`; PNG via `oxipng -o 4 --strip safe`; sRGB | 
| **Store Branding Wordmark (Horizontal)** | `1200×320` (display `180×48px`) | `15:4` | SVG (vector master) / WebP | PNG-24 (transparent) | `<= 45 KB` (WebP) / `<= 70 KB` (PNG) | SVGO for vector; WebP `q=90` lossless alpha for raster | 
| **Store / Manager Avatars & Placeholders** | `256×256` (`2×`), `128×128` (`1×`) | `1:1` | WebP | SVG placeholder / PNG-24 | `<= 20 KB` (`256px`) / `<= 10 KB` (`128px`) | WebP `q=85`, `effort=6`, strip EXIF/IPTC/XMP; SVG placeholder `<= 2 KB` | 
| **Menu / Product Card Thumbnails** | `600×400` (`2×`), `300×200` (`1×`) | `3:2` | WebP | Progressive JPEG | `<= 45 KB` (`2×`) / `<= 22 KB` (`1×`) | WebP `q=80`, `effort=6`, chroma `4:2:0`, strip metadata; fits `300w` 4-column card grid | 
| **Login Screen Backdrop** | `1920×1080` | `16:9` | WebP | Progressive JPEG | `<= 180 KB` (WebP) / `<= 250 KB` (JPEG) | WebP `q=82`, sRGB, no alpha channel; preloaded on Screen 1 | 
| **Thermal Receipt Store Logo (80mm)** | `576×160` max (width `<= 576px`) | Flexible (`<= 3.6:1`) | PNG (1-bit Monochrome) | BMP (1-bit) | `<= 15 KB` | 1-bit Floyd-Steinberg dithered black/white (`#000000` / `#FFFFFF`), 203 DPI, zero anti-aliasing for Go URQR-Bridge ESC/POS | 
| **Thermal Receipt Store Logo (58mm)** | `384×120` max (width `<= 384px`) | Flexible (`<= 3.2:1`) | PNG (1-bit Monochrome) | BMP (1-bit) | `<= 10 KB` | 1-bit monochrome, 203 DPI, centered for 32-column thermal roll | 
| **Favicon & Desktop App Icons** | `32×32`, `180×180`, `192×192`, `512×512` | `1:1` | SVG (`favicon.svg`) + PNG | ICO (`32×32`) | `<= 25 KB` (`512px`), `<= 4 KB` (`32px`) | `oxipng -o 4 --strip all`; safe-zone padding `12%` around emblem | 

## 2. SVG Vector Standards (`@urqr/ui`)

* **Grid & Alignment:** Strict `24×24` integer/half-pixel canvas (`viewBox="0 0 24 24"`); `1.75px` uniform stroke (`1.35px` for multi-layer duotone icons such as `urqr-payment-cash.svg`), `stroke-linecap="round"`, `stroke-linejoin="round"`.

* **Dual Color Modes:**

  * `icons/currentColor/` — Inherits CSS `color` for Tailwind, Radix UI, and shadcn/ui interactive states (`unselected`, `selected`, `disabled`).

  * `icons/urqr-theme/` — Pre-bound to official **URQR THEME** hex values for Figma imports and `<img>` contexts.

* **Disallowed SVG Content:** No `<script>`, `<style>` blocks with global selectors, embedded base64 `<image>` tags, `<foreignObject>`, XML processing instructions, or editor namespaces (`inkscape:*`, `sodipodi:*`, `sketch:*`).

* **Accessibility:** Every standalone SVG must retain `role="img"` and a descriptive `aria-label` (decorative icons wrapped inside labeled buttons may pass `aria-hidden="true"` via `UrqrIconProps`).

## 3. Raster & Cloudflare R2 Ingestion Rules

* **Color Profile:** Convert all uploaded raster assets to **sRGB** before encoding; reject CMYK and Display-P3 profiles at upload validation.

* **Metadata Stripping:** Strip all EXIF (camera, GPS), XMP, IPTC, and thumbnail blocks on ingestion to protect tenant privacy and minimize payload size.

* **Max Client Upload Cap:** `2 MB` raw upload ceiling per image before server/edge transcoding into canonical WebP sizes (`1×` and `2×`).

* **Cache Headers (R2 / Edge CDN):**

  * Immutable versioned/hashed assets: `Cache-Control: public, max-age=31536000, immutable`

  * Mutable tenant branding placeholders (until versioned): `Cache-Control: public, max-age=3600, stale-while-revalidate=86400`

* **Resilience / Offline POS:** Core UI SVG icons (`urqr_day4_pos_icon_library_v1.zip`, `~4 KB` gzipped) and default store branding placeholders must be bundled locally in `@urqr/ui` so the POS operates cleanly in **Offline Buffered** mode without CDN dependency.

## 4. URQR THEME (Beige / Sepia) Color Compliance

All generated brand placeholders, avatars, and themed SVG icons must use only tokens from the **URQR THEME** variable collection:

| Token | Hex | Asset Usage | 
| ----- | ----- | ----- | 
| `bg` | `#F5EEE0` | Canvas backdrop, light placeholder fill | 
| `surface` | `#FFFDF8` | Card/modal surface, icon inner highlight (e.g., Cash Tender center circle) | 
| `surfaceAlt` | `#FAF3E6` | Unselected tile well, front banknote fill, avatar surface | 
| `border` | `#E4D8C3` | 1px divider, subtle frame stroke, back banknote fill | 
| `primary` | `#8B5E3C` | Selected tile fill, primary CTA, placeholder accent | 
| `primaryDark` | `#5C3D26` | Store logo mark, primary icon stroke, strong brand contrast | 
| `text` / `textSecondary` | `#3B2A1E` / `#7A6A5A` | Primary typography / secondary labels & hotkey keycaps | 
| `success` / `successBg` | `#3F6B3A` / `#EEF3E8` | Online, Cloud Sync Active, Centrifugo Connected, Printer Ready | 
| `warning` / `warningBg` | `#B45309` / `#FDF1E1` | Offline Buffered, Remaining Amount alerts | 
| `error` | `#B91C1C` | Offline, Invalid state, Void Cart (`Esc`) destructive icon | 
| `disabled` / `disabledText` | `#D9CDB8` / `#8E7F6C` | Disabled button/tile background and icon stroke | 
| `onPrimary` | `#FFFFFF` | Icons and labels rendered on `primary` (`#8B5E3C`) surfaces | 

## 5. Pre-Release Validation Checklist

* Verify every SVG passes `svgo.config.mjs` with zero visual drift across `16px`, `20px`, `24px`, and `32px`.

* Verify all raster assets meet the byte-size budgets above and contain zero EXIF/GPS metadata.

* Verify thermal receipt logos pass 1-bit monochrome rasterization on Go 1.27.4 URQR-Bridge (58mm / 80mm).

* Verify all icon and branding assets pass sharpness inspection on `1366×768` (`1×` low-DPI touchscreen) and `1920×1080` (`2×` HiDPI) displays (Day 4 Afternoon Task 4).