# Day 4 Morning Handoff — POS SVG Icon Library (v1.1.0 · URQR THEME)

**Project:** Nelja Tech — URQR Platform (Phase 1 Standalone Manager POS)  
**From:** Gagan (Design Systems & Hardware Specs)  
**To:** Swaroopa & Vishal (Billing UI Integration)  
**Date:** Thursday, 26 November 2026  
**Theme Alignment:** `05 · Specification sheet (1920×1080).pdf` — Variable Collection **URQR THEME (Beige / Sepia)**  
**Deliverable Archive:** `urqr_day4_pos_icon_library_v1.zip`

## Summary

All 11 optimized POS SVG icons (`24×24`, `1.75px` rounded stroke, **4,043 B** total in `currentColor`) are now aligned to the official **URQR THEME** Beige/Sepia palette and component states. The package includes both `currentColor` SVGs for React/Tailwind and pre-colored `urqr-theme` SVGs for direct Figma import or `<img>` usage, plus `theme/urqr-theme.css` and a `tone`-aware React 19 component module (`react/UrqrPosIcons.tsx`).

## URQR THEME Icon-to-Token Mapping

| Group | Filename | React Component | Hotkey | Default Stroke Token | Surface / State Binding |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Payment | `urqr-payment-cash.svg` | `CashTenderIcon` | — | `primaryDark` (`#5C3D26`) | Unselected: `surfaceAlt` (`#FAF3E6`); Selected: `onPrimary` (`#FFFFFF`) on `primary` (`#8B5E3C`); Disabled: `disabledText` (`#8E7F6C`) on `disabled` (`#D9CDB8`) |
| Payment | `urqr-payment-card.svg` | `CardPaymentIcon` | — | `primaryDark` (`#5C3D26`) | Same as Cash (`PaymentMethod` unselected / selected / disabled) |
| Payment | `urqr-payment-upi-qr.svg` | `UpiQrIcon` | — | `primaryDark` (`#5C3D26`) | Same as Cash (`PaymentMethod` unselected / selected / disabled) |
| Status | `urqr-status-cloud-sync.svg` | `CloudSyncActiveIcon` | — | `success` (`#3F6B3A`) | 72px header pill: `success` on `successBg` (`#EEF3E8`) |
| Status | `urqr-status-offline-buffered.svg` | `OfflineBufferedIcon` | — | `warning` (`#B45309`) | Queue pill: `warning` on `warningBg` (`#FDF1E1`); pure Offline pill uses `error` (`#B91C1C`) |
| Status | `urqr-status-centrifugo-connected.svg` | `CentrifugoConnectedIcon` | — | `success` (`#3F6B3A`) | 72px header pill: `success` on `successBg` (`#EEF3E8`) |
| Status | `urqr-status-printer-ready.svg` | `PrinterReadyIcon` | — | `success` (`#3F6B3A`) | 72px header pill: `success` on `successBg` (`#EEF3E8`) |
| Action | `urqr-action-quick-search.svg` | `QuickSearchIcon` | `F2` | `primaryDark` (`#5C3D26`) | Neutral button: `surfaceAlt` (`#FAF3E6`), `border` (`#E4D8C3`), label `text` (`#3B2A1E`) |
| Action | `urqr-action-cash-pay.svg` | `CashPayIcon` | `F4` | `primary` (`#8B5E3C`) | Confirm CTA: `onPrimary` (`#FFFFFF`) on `primary` (`#8B5E3C`); Disabled: `disabledText` on `disabled` |
| Action | `urqr-action-print-last.svg` | `PrintLastIcon` | `F9` | `primaryDark` (`#5C3D26`) | Neutral button: `surfaceAlt` (`#FAF3E6`), `border` (`#E4D8C3`), label `text` (`#3B2A1E`) |
| Action | `urqr-action-void-cart.svg` | `VoidCartIcon` | `Esc` | `error` (`#B91C1C`) | Destructive button: `error` (`#B91C1C`) on `surface` (`#FFFDF8`) |

## Drop-In Integration (`@urqr/ui`)

1. Import `theme/urqr-theme.css` into `frontend/packages/ui/src/theme.css` to expose all 17 `--urqr-*` CSS variables.
2. Copy `react/UrqrPosIcons.tsx` into `frontend/packages/ui/src/icons/UrqrPosIcons.tsx` and re-export from `packages/ui/src/index.ts`.
3. Use `tone="inherit"` (default) to inherit button/pill text color via `currentColor`, or pass a semantic URQR token directly (`tone="primaryDark"`, `tone="success"`, `tone="warning"`, `tone="error"`, `tone="disabled"`, `tone="onPrimary"`).

```tsx
import {
  CashPayIcon,
  CloudSyncActiveIcon,
  OfflineBufferedIcon,
} from '@urqr/ui/icons/UrqrPosIcons';

// 72px Header Status Pills (always paired with text label, never color-only)
<span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--urqr-success-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--urqr-success)]">
  <CloudSyncActiveIcon size={16} />
  Online
</span>

<span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--urqr-warning-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--urqr-warning)]">
  <OfflineBufferedIcon size={16} />
  Offline Buffered
</span>

// Confirm Cash Pay Button (52h, radius 8)
<button
  disabled={!isConfirmEnabled}
  className="h-[52px] rounded-lg bg-[var(--urqr-primary)] text-[var(--urqr-on-primary)] disabled:bg-[var(--urqr-disabled)] disabled:text-[var(--urqr-disabled-text)]"
>
  <CashPayIcon size={20} />
  Cash Pay (F4)
</button>
```

## Archive Contents (`urqr_day4_pos_icon_library_v1.zip`)

- `icons/currentColor/` — 11 SVGs using `stroke="currentColor"` (React/Tailwind)
- `icons/urqr-theme/` — 11 SVGs pre-colored with exact URQR THEME hex values (Figma / `<img>`)
- `theme/urqr-theme.css` — Official 17-token URQR THEME stylesheet
- `react/UrqrPosIcons.tsx` — Typed React 19 components with `URQR_ICON_TONES` + `tone` prop
- `sprite/urqr-pos-icons-sprite.svg` — Combined `<symbol>` sprite
- `svgo.config.mjs` & `manifest.json` — SVGO config and token-mapped manifest