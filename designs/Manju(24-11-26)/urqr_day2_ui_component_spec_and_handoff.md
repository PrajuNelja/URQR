# URQR Platform — Phase 1 Standalone Manager POS
## Complete UI Component Specification Sheet & React 19 Frontend Handoff

**Organization:** Nelja Tech  
**Date:** Tuesday, 24 November 2026 (Day 2 — Morning & Afternoon Sessions)  
**Author:** Gagan (Design Systems & Hardware Specs)  
**Reviewers & Recipients:** Vennela (Screen 1 `shadcn/ui Form` 1:1 Mapping) · Frontend Engineering Team (`@urqr/ui` React 19.3.1 Library)  
**Design Baseline:** `06 · Manager login · Grand Horizon.pdf` · `07 · Login specification sheet (1920×1080).pdf` + Tenant Slug Requirement  
**Technical Stack:** React 19.3.1 · TypeScript 6.0.3 · Vite 8.3.8 · Tailwind CSS · `shadcn/ui` · Radix UI Primitives · `react-hook-form` · `Zod`  

---

## 1. Design Tokens & Theme Baseline (`frontend/packages/ui/src/theme.css`)

All UI components consume semantic CSS variables from `theme.css`. Light mode matches the finalized URQR Beige / Sepia specification (`1920×1080 · Inter · 8px grid`), paired with a warm Dark Sepia variation.

### 1.1 Color Tokens

| CSS Variable | Light Mode (`:root`) | Dark Mode (`.dark`) | Component Usage |
| :--- | :--- | :--- | :--- |
| `--bg` | `#F5EEE0` | `#1B1511` | Page canvas, right login panel, secondary badge fill |
| `--surface` | `#FFFDF8` | `#251D17` | Company header, cards, dialogs, dropdown menus, outline buttons |
| `--surface-alt` | `#FAF3E6` | `#2E241C` | Secondary buttons, card footers, muted strips, hover backgrounds |
| `--border` | `#E4D8C3` | `#43352A` | Hairlines, card/header borders, dividers, info toast border |
| `--primary` | `#8B5E3C` | `#B07C54` | Primary button fill, input border, focus outline, active badge |
| `--primary-dark` | `#5C3D26` | `#8B5E3C` | Grand Horizon brand panel, logo mark tile, primary button hover/pressed |
| `--text` | `#3B2A1E` | `#F5EEE0` | Headings, body text, field labels, input text |
| `--text-secondary` | `#7A6A5A` | `#BFAEA0` | Subtitles, instructions, placeholders, helper copy, captions |
| `--success` | `#3F6B3A` | `#68A362` | Online status dot/text, Verified tenant badge, success toast |
| `--success-bg` | `#EEF3E8` | `#1E2E1D` | Online pill, Verified tenant badge, success banner/toast fill |
| `--warning` | `#B45309` | `#E08A2E` | Checking tenant badge, session timeout alert, warning toast |
| `--warning-bg` | `#FDF1E1` | `#332414` | Checking badge, warning toast & banner fill |
| `--error` | `#B91C1C` | `#E55353` | Invalid input border, form errors, destructive buttons/badges |
| `--error-bg` | `#FEE2E2` | `#361A1A` | Global auth/network alert fill, Suspended/Not Found badge, error toast |
| `--disabled` | `#D9CDB8` | `#3A2F27` | Disabled button and control background |
| `--disabled-text` | `#8E7F6C` | `#857467` | Disabled button and control text |
| `--on-primary` | `#FFFFFF` | `#FFFFFF` | Text and icons rendered on `--primary`, `--primary-dark`, and `--error` |
| `--input-bg` | `#FFFFFF` | `#1F1813` | Text, password, and combobox input fill |

### 1.2 Typography Scale (`Inter` + `JetBrains Mono`)

| Role | Font Family | Size / Line-Height | Weight | Tracking / Case |
| :--- | :--- | :--- | :--- | :--- |
| Promo Headline | `Inter` | `56px / 68px` | Semi Bold (`600`) | `-0.02em` |
| Welcome Heading | `Inter` | `28px / 36px` | Semi Bold (`600`) | `-0.015em` |
| Brand Description | `Inter` | `22px / 34px` | Regular (`400`) | `0` |
| Company Wordmark (`URQR`) | `Inter` | `18px / 22px` (Billing rail: `14px / 20px`) | Bold (`700`) | `-0.01em` |
| Metric Pill Labels | `Inter` | `16px / 24px` | Semi Bold (`600`) | `0` |
| Fields & Primary Action | `Inter` | `14px / 20px` | Medium (`500`) / Semi Bold (`600`) | `0` |
| Instructions & Body | `Inter` | `14px / 22px` | Regular (`400`) | `0` |
| Demo Helper & Error Copy | `Inter` | `13px / 20px` | Regular (`400`) / Medium (`500`) | `0` |
| Field Labels | `Inter` | `12px / 16px` | Semi Bold (`600`) | `+0.05em`, Uppercase |
| Slugs & Order Numbers | `JetBrains Mono` | `14px / 20px` (Tables/Badges: `12px / 16px`) | Medium (`500`) / Semi Bold (`600`) | `0` |

### 1.3 Elevation, Radius, Spacing & Contrast Standards
- **Grid:** Strict `8px` spacing grid (`8`, `12`, `16`, `20`, `24`, `32`, `40`, `52`, `56`, `72`).
- **Elevation:** Flat composition on resting Screen 1 — **no drop shadows or gradients**. Curved promotional divider is a clipped ellipse (`overflow: hidden`).
- **Corner Radii:** Controls & inputs `8px` (`rounded-[8px]`), cards & dialogs `12px` (`rounded-xl`), brand mark tile `12px`, pills & badges `999px` (`rounded-full`).
- **Contrast Floor:** Normal text `>= 4.5:1`; large text and control boundaries (`1px` `#8B5E3C` input border on `#FFFFFF` / `#F5EEE0`) `>= 3:1`.
- **Global Focus Ring:** `outline: 2px solid var(--primary); outline-offset: 2px;` on every interactive control (`:focus-visible`).

---

## 2. Company Header & Status Bar

| Element | Specification |
| :--- | :--- |
| Container | `height: 72px`, `bg-surface (#FFFDF8)`, `border-b border-border (#E4D8C3)`, flat (no shadow). |
| Left Identity (Login) | `32 × 32px` dashed reserved logo slot (`border-dashed border-primary`) + `12px` gap + `URQR` (`18/22 Bold`). |
| Left Identity (Billing Rail) | `16 × 16px` logo space + `URQR` (`14/20 Bold`); `24px` extra clearance below identity; existing `16px` rail gap retained. |
| Right End Group | `Online` pill → `Date` chip (both visible, right-aligned). Badges are informational only (not actionable). |
| `Online` Pill | `bg-successBg (#EEF3E8)`, `border border-border`, `text-success (#3F6B3A)`, `8px` solid `#3F6B3A` dot, `rounded-full`. |
| `Date` Display | `en-IN` locale, format `"Ddd, DD Mon YYYY"` (e.g., `Tue, 24 Nov 2026`), automatically refreshed at local midnight. |

---

## 3. Screen 1 (Grand Horizon Login + Tenant Slug) Layout & Form Contract

### 3.1 Split-Screen & Responsive Geometry
- **Desktop Reference (`1920 × 1080`):** Header `72px`; Body `1008px`; Left Brand Region `1040px` wide (`#5C3D26` clipped ellipse + eyebrow `• GRAND HORIZON` + headline + description + 3 non-actionable `52px`-high `rounded-full` metric pills with `16px` vertical gap); Right Sign-In Region `880px` wide with horizontally centered `360px` form.
- **Form Vertical Rhythm:** `56 × 56px` brand mark (`radius 12`) → `16px` → Welcome heading → `16px` → Instructions → `40px` → Form fields (`8px` label-to-input gap, `24px` between fields/action) → `20px` → Demo helper copy.
- **Breakpoints:**
  - `>= 1024px`: Retain split layout; form `max-width: 360px`.
  - `768px – 1023px`: `32px` outer padding; retain split only if content fits without clipping.
  - `< 768px`: Stack brand region above form; remove curved ellipse; `24px` horizontal padding; enable vertical scrolling.

### 3.2 Sign-In Flow, Validation & Error Preservation Rules
1. **Tab & Submit Order:** `Tenant Slug` → `Manager ID` → `Password` → `Sign In`; pressing `Enter` submits the form.
2. **Whitespace Handling:** Trim outer whitespace on `tenantSlug` (lowercased) and `managerId` on submit. **Never trim `password`.**
3. **Empty Field Messages:**
   - Empty Tenant Slug: `"Enter your tenant slug."`
   - Empty Manager ID: `"Enter your manager ID."`
   - Empty Password: `"Enter your password."`
4. **Submitting State:** Button switches to `"Signing in…"`, disables repeat submissions (`disabled`), and announces `aria-busy="true"`.
5. **Authentication Failure:** Keep `tenantSlug` and `managerId`, **clear `password`**, display `"Unable to sign in. Check your credentials and try again."`
6. **Network Failure:** Preserve **all three** field values, display `"Connection unavailable. Please try again."`
7. **Demo Rule:** Accept any non-empty ID/password pair with a verified tenant slug **only** in an explicit demo environment, never production.

### 3.3 1:1 Figma → `shadcn/ui Form` + `Zod` Mapping (Vennela Review)

| Figma Component | `shadcn/ui` & Radix Primitive | `Zod` Validation Rule | Accessibility & Contract |
| :--- | :--- | :--- | :--- |
| `Header / CompanyBar` | Flex Header (`72h`) + `Badge` | Non-form global bar | Informational pills only; midnight date refresh |
| `Form / TenantSlugField` | `FormField` + `Popover` + `Command` + `Badge` | `z.string().trim().min(1, "Enter your tenant slug.").regex(/^[a-z0-9-]+$/)` | `360 × 52`, downward-only arrow icon, `role="combobox"`, live status badge |
| `Form / ManagerIdField` | `FormField` + `FormItem` + `FormLabel` + `FormControl(Input)` + `FormMessage` | `z.string().trim().min(1, "Enter your manager ID.")` | `360 × 52`, `autocomplete="username"`, trim outer spaces |
| `Form / PasswordField` | `FormField` + `FormItem` + `FormLabel` + `FormControl(Input)` + `FormMessage` | `z.string().min(1, "Enter your password.")` | `360 × 52`, `type="password"`, `autocomplete="current-password"`, never trim, no eye toggle, no recovery link |
| `Form / SignInButton` | `Button (type="submit")` | `form.formState.isSubmitting` | `360 × 52`, `bg-primary`, hover/pressed `bg-primaryDark`, `"Signing in…"` + spinner |
| `Global / SessionTimeoutModal` | `Dialog` + `DialogOverlay` + `DialogContent` | Triggered at `JWT exp - 60s` | `backdrop-blur-sm`, entrance animation, focus trap, `ESC` dismiss |

```ts
import { z } from "zod";

export const loginFormSchema = z.object({
  tenantSlug: z
    .string()
    .trim()
    .min(1, "Enter your tenant slug.")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, or hyphens."),
  managerId: z.string().trim().min(1, "Enter your manager ID."),
  password: z.string().min(1, "Enter your password."), // Never trim password
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
```

---

## 4. Input Fields (`@urqr/ui/input`)

### 4.1 Dimensions & Sizes

| Size | Height | Horizontal Padding | Border Radius | Font Size | Where Used |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `default` | `40px` (`h-10`) | `12px` (`px-3`) | `8px` (`rounded-[8px]`) | `14px / 20px` | Dense settings, search filters |
| `pos` | `44px` (`h-11`) | `14px` (`px-3.5`) | `8px` (`rounded-[8px]`) | `14px / 20px` | Touch POS billing & menu forms |
| `login` | `52px` (`h-[52px]`) | `16px` (`px-4`) | `8px` (`rounded-[8px]`) | `14px / 20px` | Screen 1 (Tenant Slug, Manager ID, Password) |

### 4.2 Interactive State Matrix

| State | Background | Border | Text / Placeholder | Outline & ARIA |
| :--- | :--- | :--- | :--- | :--- |
| `default` | `--input-bg` (`#FFFFFF`) | `1px solid --primary` (`#8B5E3C`) | `--text` / `--text-secondary` | None |
| `hover` | `--input-bg` | `1px solid --primary-dark` (`#5C3D26`) | `--text` | None |
| `focus` | `--input-bg` | `1px solid --primary` | `--text` | `outline: 2px solid var(--primary); outline-offset: 2px;` |
| `filled` | `--input-bg` | `1px solid --primary` | `--text` (`font-medium`) | None |
| `invalid` | `--input-bg` | `1px solid --error` (`#B91C1C`) | `--text` + `13px` `--error` message below | `aria-invalid="true"`, `aria-describedby="<id>-error"` |
| `disabled` | `--disabled` (`#D9CDB8`) | `1px solid --border` | `--disabled-text` (`#8E7F6C`) | `disabled`, `cursor-not-allowed` |

### 4.3 Credential-Specific Rules
- **Manager ID:** Plain text (`type="text"`), placeholder `e.g., MGR-8902`, `autocomplete="username"`.
- **Password:** Native masked entry (`type="password"`), placeholder `••••••••••`, `autocomplete="current-password"`. **No password reveal eye-toggle and no forgot/recovery link** on Screen 1 per finalized reference.

### 4.4 React 19 Component Interface

```ts
export interface InputProps extends React.ComponentProps<"input"> {
  uiSize?: "default" | "pos" | "login";
  isInvalid?: boolean;
}
// React 19: accept `ref` directly in props without React.forwardRef
```

---

## 5. Tenant Slug Resolution Dropdown (`@urqr/ui/tenant-combobox`)

Built by composing `Input` (`360 × 52`) with Radix `Popover` (`@radix-ui/react-popover`) and `Command` (`cmdk`).

### 5.1 Control & Dropdown Spec
- **Trigger Input:** `360 × 52px`, `pl-[16px] pr-[40px]`, `font-mono` value (`placeholder:font-sans` `e.g., grand-horizon`), `1px solid --primary` border.
- **Right Toggle Icon:** **Downward-only chevron arrow** (`16 × 16px`, SVG path `m6 9 6 6 6-6`, `stroke-width: 2`, `text-textSecondary`, hover `text-textMain`). Never use a double up/down chevron.
- **Dropdown Surface:** Flat `rounded-[8px] border border-primary bg-surface p-1`, `max-h-[208px] overflow-y-auto`, `4px` offset below input.
- **Option Row:** Full-width button (`role="option"`), `px-3 py-2 rounded-md`, left side shows `slug` (`font-mono font-semibold text-xs`) + `Outlet Name` (`11px text-textSecondary`), right side shows status pill; hover `bg-surfaceAlt`.
- **Keyboard Navigation:** `ArrowDown` / `ArrowUp` move active option, `Enter` selects, `Escape` closes listbox and keeps focus on input.

### 5.2 Tenant Validation Status Badges (Right-Aligned on Label Row)

| Status | Visual Classes | Indicator | Form Submission |
| :--- | :--- | :--- | :--- |
| **Idle (`Select outlet`)** | `border-border bg-surfaceAlt text-textSecondary` | Text only | Blocked (`"Enter your tenant slug."`) |
| **Verified** | `border-success/40 bg-successBg text-success` | `6px` `--success` dot + 3-letter hotel code (`Verified (GRH)`) | Allowed |
| **Checking…** | `border-warning/40 bg-warningBg text-warning` | `10px` animated spinner | Disabled until resolution completes |
| **Suspended** | `border-error bg-[var(--error-bg)] text-error` | `6px` `--error` dot | Blocked (`"This tenant outlet is suspended."`) |
| **Not Found** | `border-error bg-[var(--error-bg)] text-error` | `6px` `--error` dot | Blocked (`"Tenant slug not found."`) |

---

## 6. Buttons (`@urqr/ui/button`)

Built with `class-variance-authority` (`cva`) and `@radix-ui/react-slot` (`asChild`).

### 6.1 Variants

| Variant | Default State | Hover & Pressed State | Text Color | Primary POS Usage |
| :--- | :--- | :--- | :--- | :--- |
| `default` (Primary) | `bg-primary (#8B5E3C)` | `bg-primaryDark (#5C3D26)` | `--on-primary (#FFFFFF)` | Sign In, Settle Payment, Extend Session |
| `secondary` | `bg-surfaceAlt border border-border` | `bg-bg` | `--text (#3B2A1E)` | Secondary toolbar actions, Quick Search |
| `destructive` | `bg-error (#B91C1C)` | `opacity-90` (`#991B1B`) | `--on-primary (#FFFFFF)` | Void Cart, Soft Delete Menu Item |
| `outline` | `bg-surface border border-primary` | `bg-surfaceAlt` | `--primary (#8B5E3C)` | Log Out Now, Cancel, Reprint Receipt |
| `ghost` | `bg-transparent` | `bg-surfaceAlt` | `--text (#3B2A1E)` | Icon triggers, table row actions |
| `link` | `bg-transparent` | `underline underline-offset-4` | `--primary (#8B5E3C)` | Inline documentation links |

### 6.2 Sizes

| Size | Height | Horizontal Padding | Font | Radius |
| :--- | :--- | :--- | :--- | :--- |
| `sm` | `36px` (`h-9`) | `12px` (`px-3`) | `12px / 16px Semi Bold` | `8px` |
| `default` | `40px` (`h-10`) | `16px` (`px-4`) | `14px / 20px Semi Bold` | `8px` |
| `lg` (POS Touch Floor) | `44px` (`h-11`) | `20px` (`px-5`) | `14px / 20px Semi Bold` | `8px` |
| `login` (Screen 1 CTA) | `52px` (`h-[52px]`) | `16px` (`px-4`), `w-full max-w-[360px]` | `14px / 20px Semi Bold` | `8px` |
| `icon` | `40px × 40px` (`h-10 w-10`) | `0` | — | `8px` |

### 6.3 Focus, Disabled & Loading States
- **Focus:** `outline: 2px solid var(--primary); outline-offset: 2px;`.
- **Disabled:** `bg-disabled (#D9CDB8)`, `text-disabledText (#8E7F6C)`, `cursor-not-allowed`, `pointer-events-none`.
- **Loading (`isLoading={true}`):** Sets `disabled`, `aria-busy="true"`, renders `16 × 16px` spinner (`0.75s linear infinite`) with `8px` gap left of loading label (e.g., `"Signing in…"`), preserving button width to prevent layout shift.

```ts
export interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";
  size?: "sm" | "default" | "lg" | "login" | "icon";
  isLoading?: boolean;
  asChild?: boolean;
}
```

---

## 7. Cards (`@urqr/ui/card`)

Flat structural container matching the URQR Beige / Sepia surface system (no drop shadows on resting views).

| Sub-component | Classes & Spacing | Typography |
| :--- | :--- | :--- |
| `Card` | `rounded-xl border border-border bg-surface text-textMain` | — |
| `CardHeader` | `flex flex-col space-y-1.5 p-6` (add `border-b border-border` for sectioned cards) | — |
| `CardTitle` | — | `16px / 24px Semi Bold` or `18px / 22px Bold` |
| `CardDescription` | — | `13px / 20px Regular text-textSecondary` |
| `CardContent` | `p-6 pt-0` (or `p-6` when header has bottom border) | `14px / 22px Regular` |
| `CardFooter` | `flex items-center justify-between border-t border-border bg-surfaceAlt px-6 py-3 rounded-b-xl` | `12px / 16px text-textSecondary` |

---

## 8. Badges & Order Status Pills (`@urqr/ui/badge`)

Base classes: `inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors`.

| Variant | URQR Theme Classes | Order Lifecycle Mapping | Example Pill |
| :--- | :--- | :--- | :--- |
| `default` | `bg-primary text-onPrimary` | Active / Preparing | `Preparing` (`NLJ202611240014`) |
| `secondary` | `border border-border bg-bg text-textMain` | Queued / Draft | `Queued` (`NLJ202611240015`) |
| `destructive` | `bg-error text-onPrimary` | Print Failed / Voided | `Print Failed` (`NLJ202611240011`) |
| `outline` | `border border-primary bg-surface text-primary` | Settled / Paid | `Settled · UPI` (`NLJ202611240009`) |

---

## 9. Dialogs, Backdrop Blur, Animations & Keyboard `ESC` (`@urqr/ui/dialog`)

Built on `@radix-ui/react-dialog` (`Dialog`, `DialogTrigger`, `DialogPortal`, `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`).

### 9.1 Surface, Backdrop Blur & Motion Spec

| Layer / Property | Exact Specification |
| :--- | :--- |
| `DialogOverlay` | `fixed inset-0 z-50 bg-[#3B2A1E]/55 backdrop-blur-sm` (`4px` blur). |
| Overlay Animation | Entrance: `opacity 0 -> 1` in `150ms cubic-bezier(0.16, 1, 0.3, 1)`. Exit: `120ms ease-in`. |
| `DialogContent` | `fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-6 text-textMain`. |
| Content Animation | Entrance: `opacity: 0; transform: translateY(8px) scale(0.96)` → `opacity: 1; transform: translateY(0) scale(1)` over `180ms cubic-bezier(0.16, 1, 0.3, 1)`. |
| Reduced Motion | `@media (prefers-reduced-motion: reduce)`: disable scale/translate; run `100ms` opacity fade only. |
| Keyboard `ESC` Dismiss | Enabled via Radix `onEscapeKeyDown`; closes dialog and restores focus to triggering control. |
| Focus Trap | Radix traps `Tab` / `Shift+Tab` inside `DialogContent`; initial focus lands on primary safe CTA (**Extend Session**). |

### 9.2 Session Timeout Modal Contract (Screen 1 / Global Auth)
- **Trigger:** Fires automatically at `JWT exp - 60s` before RS256 token expiration and server-side `jti` revocation.
- **Elements:** `Warning` badge (`JWT RS256 Expiring`), heading (`Session Expiring Soon`), live countdown copy (`60s`), linear progress bar (`bg-warning` on `bg-surfaceAlt`, `h-2 rounded-full`), `Press ESC to dismiss` hint, and footer buttons: **Log Out Now** (`outline`) + **Extend Session** (`default` primary).

---

## 10. Toast Notifications (`@urqr/ui/toast`)

Built on `@radix-ui/react-toast` (`ToastProvider`, `ToastViewport`, `Toast`, `ToastTitle`, `ToastDescription`, `ToastAction`, `ToastClose`).

- **Viewport:** `fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2.5` (max `3` visible stacked; newest at bottom).
- **Motion & Dismiss:** Slide in from right (`translateX(100%) -> 0`, `220ms cubic-bezier(0.16, 1, 0.3, 1)`), `swipeDirection="right"`, manual close button (`aria-label="Close notification"`), and keyboard `ESC` dismiss when focused.

| Variant | Border & Surface Classes | Title Color | Auto-Dismiss | ARIA Live | POS Trigger Examples |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `success` | `border-success bg-successBg` | `text-success` | `4000ms` | `role="status"` (`polite`) | Signed in, order settled, 80mm receipt printed |
| `error` | `border-error bg-[var(--error-bg)]` | `text-error` | `6000ms` | `role="alert"` (`assertive`) | Network failure, Go URQR-Bridge unreachable (`:9105`) |
| `warning` | `border-warning bg-warningBg` | `text-warning` | `5000ms` | `role="status"` (`polite`) | Session token expiring in 60s, offline queue active |
| `info` | `border-border bg-surface` | `text-textMain` | `4000ms` | `role="status"` (`polite`) | Logged out, header date/status synced |

---

## 11. React 19 (`19.3.1`) Frontend Handoff & `@urqr/ui` Package Setup

### 11.1 Package Directory Layout

```text
frontend/packages/ui/
├── package.json              # Must include "@types/react": "^19.0.0" in devDependencies
└── src/
    ├── theme.css             # Finalized URQR Beige/Sepia (:root) + Dark Sepia (.dark) tokens
    ├── lib/utils.ts          # cn() helper (clsx + tailwind-merge)
    └── components/
        ├── button.tsx        # Button + buttonVariants (cva) — direct ref prop
        ├── input.tsx         # Input (default/pos/login sizes) — direct ref prop
        ├── tenant-combobox.tsx # Tenant Slug auto-complete + downward-only arrow + status badges
        ├── card.tsx          # Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
        ├── badge.tsx         # Badge + badgeVariants (default, secondary, destructive, outline)
        ├── dialog.tsx        # Radix Dialog + blurred overlay + 180ms entrance + ESC dismiss
        ├── toast.tsx         # Radix Toast + 4 semantic variants
        └── form.tsx          # shadcn/ui Form wrapper bound to react-hook-form + Zod
```

### 11.2 Required Dependencies & Build Rules
- **Packages:** `@radix-ui/react-dialog`, `@radix-ui/react-toast`, `@radix-ui/react-popover`, `@radix-ui/react-slot`, `cmdk`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `react-hook-form`, `@hookform/resolvers`, `zod`.
- **React 19 Pattern:** Author all primitives as standard function components accepting `ref` directly in props — do not wrap new components in `React.forwardRef`.
- **Windows PowerShell Verification:** Run `pnpm install` and `pnpm --filter urqr-web typecheck` as separate commands after scaffolding `@urqr/ui`.
