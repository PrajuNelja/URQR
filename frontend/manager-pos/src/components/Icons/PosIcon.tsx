
import type { SVGProps, ReactNode } from "react";

// ==========================================
// AVAILABLE POS ICONS
// ==========================================

export type PosIconName =
  | "menu"
  | "search"
  | "keyboard"
  | "billing"
  | "dashboard"
  | "logout"
  | "moon"
  | "sun"
  | "skeleton"
  | "wifi"
  | "wifi-off"
  | "sync"
  | "success"
  | "warning"
  | "close"
  | "chevron-down"
  | "cart"
  | "cash"
  | "card"
  | "upi"
  | "printer";

// ==========================================
// ICON PROPERTIES
// ==========================================

interface PosIconProps extends SVGProps<SVGSVGElement> {
  name: PosIconName;
  size?: number;
}

// ==========================================
// REUSABLE SVG ICON LIBRARY
// ==========================================

const icons: Record<PosIconName, ReactNode> = {

  // MENU

  menu: (
    <>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </>
  ),

  // SEARCH

  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </>
  ),

  // VIRTUAL KEYBOARD

  keyboard: (
    <>
      <rect
        x="2"
        y="5"
        width="20"
        height="14"
        rx="2"
      />

      <path d="M6 9h.01 M10 9h.01 M14 9h.01 M18 9h.01" />

      <path d="M6 12h.01 M10 12h.01 M14 12h.01 M18 12h.01" />

      <path d="M8 15h8" />
    </>
  ),

  // BILLING / RECEIPT

  billing: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16l3-2 2 2 3-2 3 2 3-2 2 2V8z" />

      <line
        x1="9"
        y1="13"
        x2="15"
        y2="13"
      />
    </>
  ),

  // DASHBOARD

  dashboard: (
    <>
      <rect
        x="3"
        y="3"
        width="7"
        height="9"
        rx="1"
      />

      <rect
        x="14"
        y="3"
        width="7"
        height="5"
        rx="1"
      />

      <rect
        x="14"
        y="12"
        width="7"
        height="9"
        rx="1"
      />

      <rect
        x="3"
        y="16"
        width="7"
        height="5"
        rx="1"
      />
    </>
  ),

  // LOGOUT

  logout: (
    <>
      <path d="M10 17l5-5-5-5" />

      <path d="M15 12H3" />

      <path d="M13 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
    </>
  ),

  // DARK THEME

  moon: (
    <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472 7 7 0 0 0 9.473 9.472Z" />
  ),

  // LIGHT THEME

  sun: (
    <>
      <circle cx="12" cy="12" r="4" />

      <path d="M12 2v2 M12 20v2" />

      <path d="m4.93 4.93 1.42 1.42" />

      <path d="m17.66 17.66 1.41 1.41" />

      <path d="M2 12h2 M20 12h2" />

      <path d="m6.34 17.66-1.41 1.41" />

      <path d="m19.07 4.93-1.41 1.41" />
    </>
  ),

  // SKELETON LOADING

  skeleton: (
    <>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063L2 12l6.5-2.063A2 2 0 0 0 9.937 8.5L12 2l2.063 6.5A2 2 0 0 0 15.5 9.937L22 12l-6.5 2.063a2 2 0 0 0-1.437 1.437L12 22z" />

      <path d="M5 3v4 M3 5h4" />
    </>
  ),

  // ONLINE NETWORK

  wifi: (
    <>
      <path d="M2 8.82a15 15 0 0 1 20 0" />

      <path d="M5 12.86a10 10 0 0 1 14 0" />

      <path d="M8.5 16.5a5 5 0 0 1 7 0" />

      <path d="M12 20h.01" />
    </>
  ),

  // OFFLINE NETWORK

  "wifi-off": (
    <>
      <path d="M2 2l20 20" />

      <path d="M8.5 16.5a5 5 0 0 1 7 0" />

      <path d="M5 12.86a10 10 0 0 1 5.17-2.69" />

      <path d="M12 20h.01" />
    </>
  ),

  // SYNCHRONIZATION

  sync: (
    <>
      <path d="M21 12a9 9 0 1 1-6.22-8.56" />

      <polyline points="21 3 21 9 15 9" />
    </>
  ),

  // SUCCESS

  success: (
    <path d="M20 6L9 17l-5-5" />
  ),

  // WARNING

  warning: (
    <>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />

      <line
        x1="12"
        y1="9"
        x2="12"
        y2="13"
      />

      <line
        x1="12"
        y1="17"
        x2="12.01"
        y2="17"
      />
    </>
  ),

  // CLOSE / CROSS MARK

  close: (
    <>
      <line
        x1="18"
        y1="6"
        x2="6"
        y2="18"
      />

      <line
        x1="6"
        y1="6"
        x2="18"
        y2="18"
      />
    </>
  ),

  // CHEVRON DOWN

  "chevron-down": (
    <polyline points="6 9 12 15 18 9" />
  ),

  // SHOPPING CART

  cart: (
    <>
      <path d="M3 3h2l3.5 12h10l3-9H6" />

      <circle
        cx="9"
        cy="20"
        r="1.5"
      />

      <circle
        cx="18"
        cy="20"
        r="1.5"
      />
    </>
  ),

  // ==========================================
  // CASH PAYMENT
  // Original Day 4 payment-selector SVG
  // urqr-payment-cash.svg
  // ==========================================

  cash: (
    <g strokeWidth={1.35}>

      <path d="M4.2 17.65a1.25 1.25 0 0 1-1.35-1.08l-.92-6.56a1.25 1.25 0 0 1 1.07-1.41l14.79-2.08a1.25 1.25 0 0 1 1.41 1.06l.19 1.34" />

      <rect
        x="4.21"
        y="8.92"
        width="17.45"
        height="9.09"
        rx="1.25"
      />

      <circle
        cx="12.93"
        cy="13.46"
        r="2.95"
        strokeWidth={1.2}
      />

      <path
        d="M12.19 12.24H13.84L13.74 12.51H13.23C13.34 12.57 13.42 12.66 13.45 12.75H13.84L13.74 13.0H13.47C13.44 13.35 13.17 13.6 12.69 13.65L13.5 14.7H13.04L12.17 13.64V13.4H12.56C12.88 13.4 13.06 13.25 13.09 13.0H12.1L12.19 12.75H13.04C12.99 12.59 12.83 12.51 12.57 12.51H12.1Z"
        fill="currentColor"
        stroke="none"
      />

    </g>
  ),

  // ==========================================
  // CREDIT / DEBIT CARD PAYMENT
  // Original Day 4 SVG
  // urqr-payment-card.svg
  // ==========================================

  card: (
    <g strokeWidth={1.75}>

      <rect
        x="2"
        y="5"
        width="20"
        height="14"
        rx="2"
      />

      <rect
        x="5.5"
        y="12.5"
        width="3.5"
        height="3"
        rx=".5"
      />

      <path d="M2 9.5h20M12.5 15h6" />

    </g>
  ),

  // ==========================================
  // UPI QR PAYMENT
  // Original Day 4 SVG
  // urqr-payment-upi-qr.svg
  // ==========================================

  upi: (
    <g strokeWidth={1.75}>

      <rect
        x="3"
        y="3"
        width="6.5"
        height="6.5"
        rx="1"
      />

      <rect
        x="14.5"
        y="3"
        width="6.5"
        height="6.5"
        rx="1"
      />

      <rect
        x="3"
        y="14.5"
        width="6.5"
        height="6.5"
        rx="1"
      />

      <path d="M6.25 6.25h.01M17.75 6.25h.01M6.25 17.75h.01M14.5 14.5h2.5v2.5M21 14.5v2.5M14.5 20.5h2.5M19.5 19.5H21V21" />

    </g>
  ),

  // PRINTER

  printer: (
    <>
      <polyline points="6 9 6 2 18 2 18 9" />

      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />

      <rect
        x="6"
        y="14"
        width="12"
        height="8"
      />
    </>
  ),
};

// ==========================================
// REUSABLE POS ICON COMPONENT
// ==========================================

export function PosIcon({
  name,
  size = 20,
  strokeWidth = 1.75,
  className,
  ...props
}: PosIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`shrink-0 ${className ?? ""}`}
      {...props}
    >
      {icons[name]}
    </svg>
  );
}

export default PosIcon;
