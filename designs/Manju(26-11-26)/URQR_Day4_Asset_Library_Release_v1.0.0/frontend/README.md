# URQR Phase 1 — POS SVG Icon Library (v1.1.0 · URQR THEME)

Aligned to **URQR THEME (Beige / Sepia)** from `05 · Specification sheet (1920×1080).pdf`.

## What's Inside
- `icons/currentColor/` — 11 optimized SVGs using `stroke="currentColor"` (4,043 B total) for React/Tailwind.
- `icons/urqr-theme/` — 11 optimized SVGs pre-bound to exact **URQR THEME** hex tokens (`#5C3D26`, `#8B5E3C`, `#3F6B3A`, `#B45309`, `#B91C1C`) for direct Figma import or `<img>` usage (3,988 B total).
- `theme/urqr-theme.css` — All 17 CSS custom properties (`--urqr-bg` through `--urqr-input-bg`).
- `react/UrqrPosIcons.tsx` — React 19 + TypeScript components with `tone` prop (`'inherit' | 'primary' | 'primaryDark' | 'text' | 'textSecondary' | 'success' | 'warning' | 'error' | 'disabled' | 'onPrimary'`).
- `sprite/urqr-pos-icons-sprite.svg` — Combined `<symbol>` sprite sheet.
- `svgo.config.mjs` & `manifest.json` — SVGO config and token-mapped icon manifest.
