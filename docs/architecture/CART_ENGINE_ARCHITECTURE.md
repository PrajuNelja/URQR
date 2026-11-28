# URQR Platform — Phase 1 POS Billing Cart Engine Architecture
**Assignee:** Swaroopa | **Role:** Frontend Engineer (POS Billing Engine)  
**Standard:** React 19.3.1, TanStack Query, Radix UI, Cart Math, IndexedDB, POS Hotkeys  
**Documentation Gate:** Day 6 Afternoon Task 4

---

## 1. Architecture Overview

The URQR POS Cart Engine manages active order line-items, tax calculations, discounts, idempotency keys, and offline buffering. It is engineered with a strict unidirectional data flow and zero-loss offline persistence.

```
[ Catalog Grid / Barcode Scanner ] 
               │
               ▼
   [ Zustand Cart Store (cartStore.ts) ] ──▶ [ Pure Math Tax Split Engine ]
               │                                       │
     ┌─────────┴─────────┐                             ▼
     ▼                   ▼                     [ PosCheckoutModal ]
[ Online Mode ]   [ Offline Mode ]                     │
     │                   │                             ▼
[ POST /orders ]  [ IndexedDB: offlineOrders ]  [ Bridge ESC/POS Print ]
```

---

## 2. State Management Patterns

### A. Immutable State Transitions (`cartStore.ts`)
- **Single Source of Truth:** Managed using lightweight Zustand state store.
- **Cart Line Items:**
  ```typescript
  interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    taxRate: number; // 0%, 5%, 18%
    category: string;
    discount?: number;
  }
  ```
- **Quantity Invariants:**
  - Increment/Decrement with strict bounds ($1 \le quantity \le 999$).
  - Automatic removal when quantity drops to 0.
  - Reset / Cart clear safeguarded by Radix UI `AlertDialog`.

---

## 3. Financial Calculation & Tax Split Engine

All monetary calculations adhere strictly to the 2-decimal financial rounding standard, guaranteeing exact parity with backend `BigDecimal` precision.

1. **Subtotal:**
   $$\text{Subtotal} = \sum (\text{unit\_price} \times \text{quantity})$$
2. **Item-Level & Bill-Level Discount:**
   - Capped at maximum allowable limits ($0\% \le \text{discount} \le 100\%$).
   - Net Taxable Base = $\max(0, \text{Subtotal} - \text{Discount})$.
3. **GST 3-Tier Split (India CGST / SGST):**
   - **5% GST (Restaurants / Beverages):** $2.5\% \text{ CGST} + 2.5\% \text{ SGST}$.
   - **18% GST (Air-conditioned Dining / Luxury):** $9.0\% \text{ CGST} + 9.0\% \text{ SGST}$.
   - **0% GST (Exempted Staples):** Non-taxable line items strictly segregated.
4. **Change Due Math:**
   $$\text{Change Due} = \max(0, \text{Tendered Amount} - \text{Total Payable})$$
   - Prevents negative change submissions.
   - Quick tender buttons: Exact Cash, Round to 100, 500, 2000.

---

## 4. IndexedDB Offline Resilience Layer

Implemented in `posDatabase.ts`, `catalogStorage.ts`, and `offlineOrderStorage.ts` via the `idb` library (`^8.0.4`):

- **Database:** `urqr-manager-pos` (Version 2)
- **Object Stores:**
  1. `catalog`: Keyed by `storeId`. Caches dish catalog for zero-latency instant search and offline browsing.
  2. `offlineOrders`: Keyed by UUID `id`. Indexed by `by-store`, `by-status`, `by-created-at`, and unique `by-idempotency-key`.
- **Automatic Fallback:** `useCatalogSync.ts` queries fresh network catalog and persists to IndexedDB. If network disconnects, it serves from IndexedDB cache with zero UI interruption.
- **Offline Buffering:** `bufferOfflineOrder()` writes cash orders to `offlineOrders` when `!navigator.onLine`.

---

## 5. POS Keyboard Shortcut Mapping

Engineered for ultra-fast, mouse-free cashier operation:

| Key | Action | Handler Function |
| :--- | :--- | :--- |
| **`F1`** | Help & Shortcut Cheat Sheet | `toggleHelpModal()` |
| **`F2`** | Focus Catalog Search Input | `focusSearchInput()` |
| **`F3`** | Focus Cart Line Items | `focusCart()` |
| **`F4`** | Quick Cash Checkout & Modal Open | `openCashCheckout()` |
| **`F5`** | Refresh Catalog Cache | `syncCatalog()` |
| **`F6`** | Toggle Virtual Keyboard | `toggleVirtualKeyboard()` |
| **`F8`** | Hold Active Order / Recall Order | `holdOrder()` / `recallOrder()` |
| **`F9`** | Reprint Last Receipt | `reprintLastReceipt()` |
| **`Esc`** | Dismiss Modal / Clear Search / Cancel | `handleEscape()` |
| **`Enter`** | Confirm Tender / Submit Payment | `confirmPayment()` |

---

## 6. Test Suite Verification

Covered by 76 automated Vitest tests:
- `checkoutErrors.test.ts` (38/38 passed)
- `posShortcutKeys.test.ts` (17/17 passed)
- `billing.test.ts` (11/11 passed)
- `cartStore.test.ts` (10/10 passed)
