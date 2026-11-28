import type { SVGProps } from 'react';

export const URQR_ICON_TONES = {
  primary: 'var(--urqr-primary, #8B5E3C)',
  primaryDark: 'var(--urqr-primary-dark, #5C3D26)',
  text: 'var(--urqr-text, #3B2A1E)',
  textSecondary: 'var(--urqr-text-secondary, #7A6A5A)',
  success: 'var(--urqr-success, #3F6B3A)',
  warning: 'var(--urqr-warning, #B45309)',
  error: 'var(--urqr-error, #B91C1C)',
  disabled: 'var(--urqr-disabled-text, #8E7F6C)',
  onPrimary: 'var(--urqr-on-primary, #FFFFFF)',
} as const;

export type UrqrIconTone = keyof typeof URQR_ICON_TONES | 'inherit';

export interface UrqrIconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: number | string;
  strokeWidth?: number | string;
  /** Defaults to 'inherit' (currentColor), or pass any URQR THEME semantic token. */
  tone?: UrqrIconTone;
}

export function CashTenderIcon({ size = 24, strokeWidth = 1.35, tone = 'inherit', className, style, ...props }: UrqrIconProps) {
  const isDuotone = tone === 'primaryDark' || tone === 'primary';
  const strokeColor = tone === 'inherit' ? 'currentColor' : URQR_ICON_TONES[tone];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Cash Tender"
      className={className}
      style={style}
      {...props}
    >
      {isDuotone ? (
        <>
          <rect x="2.21" y="8.35" width="17.45" height="9.09" rx="1.25" transform="rotate(-8 2.21 8.35)" fill="var(--urqr-border, #E4D8C3)" />
          <rect x="4.21" y="8.92" width="17.45" height="9.09" rx="1.25" fill="var(--urqr-surface-alt, #FAF3E6)" />
          <circle cx="12.93" cy="13.46" r="2.95" fill="var(--urqr-surface, #FFFDF8)" strokeWidth="1.2" />
        </>
      ) : (
        <>
          <path d="M4.2 17.65a1.25 1.25 0 0 1-1.35-1.08l-.92-6.56a1.25 1.25 0 0 1 1.07-1.41l14.79-2.08a1.25 1.25 0 0 1 1.41 1.06l.19 1.34" />
          <rect x="4.21" y="8.92" width="17.45" height="9.09" rx="1.25" />
          <circle cx="12.93" cy="13.46" r="2.95" strokeWidth="1.2" />
        </>
      )}
      <path d="M12.19 12.24H13.84L13.74 12.51H13.23C13.34 12.57 13.42 12.66 13.45 12.75H13.84L13.74 13.0H13.47C13.44 13.35 13.17 13.6 12.69 13.65L13.5 14.7H13.04L12.17 13.64V13.4H12.56C12.88 13.4 13.06 13.25 13.09 13.0H12.1L12.19 12.75H13.04C12.99 12.59 12.83 12.51 12.57 12.51H12.1Z" fill={strokeColor} stroke="none" />
    </svg>
  );
}

export function CardPaymentIcon({ size = 24, strokeWidth = 1.75, tone = 'inherit', className, style, ...props }: UrqrIconProps) {
  const color = tone === 'inherit' ? 'currentColor' : URQR_ICON_TONES[tone];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Credit / Debit Card"
      className={className}
      style={style}
      {...props}
    >
      <rect height="14" rx="2" width="20" x="2" y="5" />
      <rect height="3" rx=".5" width="3.5" x="5.5" y="12.5" />
      <path d="M2 9.5h20M12.5 15h6" />
    </svg>
  );
}

export function UpiQrIcon({ size = 24, strokeWidth = 1.75, tone = 'inherit', className, style, ...props }: UrqrIconProps) {
  const color = tone === 'inherit' ? 'currentColor' : URQR_ICON_TONES[tone];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="UPI QR Code"
      className={className}
      style={style}
      {...props}
    >
      <rect height="6.5" rx="1" width="6.5" x="3" y="3" />
      <rect height="6.5" rx="1" width="6.5" x="14.5" y="3" />
      <rect height="6.5" rx="1" width="6.5" x="3" y="14.5" />
      <path d="M6.25 6.25h.01M17.75 6.25h.01M6.25 17.75h.01M14.5 14.5h2.5v2.5M21 14.5v2.5M14.5 20.5h2.5M19.5 19.5H21V21" />
    </svg>
  );
}

export function CloudSyncActiveIcon({ size = 24, strokeWidth = 1.75, tone = 'inherit', className, style, ...props }: UrqrIconProps) {
  const color = tone === 'inherit' ? 'currentColor' : URQR_ICON_TONES[tone];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Cloud Sync Active"
      className={className}
      style={style}
      {...props}
    >
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9ZM8.75 15.5v-4.75M7.25 12.25 8.75 10.75l1.5 1.5M13.25 10.75v4.75M11.75 14 13.25 15.5l1.5-1.5" />
    </svg>
  );
}

export function OfflineBufferedIcon({ size = 24, strokeWidth = 1.75, tone = 'inherit', className, style, ...props }: UrqrIconProps) {
  const color = tone === 'inherit' ? 'currentColor' : URQR_ICON_TONES[tone];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Offline Buffered"
      className={className}
      style={style}
      {...props}
    >
      <path d="M9.2 5.2A5.5 5.5 0 0 1 15.3 7h1.2a3.75 3.75 0 0 1 1.65 7.12M13.5 14.5H6a3.5 3.5 0 0 1-.82-6.9M4 3.5 18 16.5M6 18.5h12M8.5 21.25h7" />
    </svg>
  );
}

export function CentrifugoConnectedIcon({ size = 24, strokeWidth = 1.75, tone = 'inherit', className, style, ...props }: UrqrIconProps) {
  const color = tone === 'inherit' ? 'currentColor' : URQR_ICON_TONES[tone];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Centrifugo Connected"
      className={className}
      style={style}
      {...props}
    >
      <circle cx="12" cy="12" r="2.25" />
      <path d="M8.11 8.11a5.5 5.5 0 0 0 0 7.78M15.89 8.11a5.5 5.5 0 0 1 0 7.78M5.28 5.28a9.5 9.5 0 0 0 0 13.44M18.72 5.28a9.5 9.5 0 0 1 0 13.44" />
    </svg>
  );
}

export function PrinterReadyIcon({ size = 24, strokeWidth = 1.75, tone = 'inherit', className, style, ...props }: UrqrIconProps) {
  const color = tone === 'inherit' ? 'currentColor' : URQR_ICON_TONES[tone];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Printer Ready"
      className={className}
      style={style}
      {...props}
    >
      <path d="M6 9V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v5M6 17H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1.5M18 12h.01M6 14h6.5M6 14v6a1 1 0 0 0 1 1h4.5M15 18.5 17 20.5 21.5 16" />
    </svg>
  );
}

export function QuickSearchIcon({ size = 24, strokeWidth = 1.75, tone = 'inherit', className, style, ...props }: UrqrIconProps) {
  const color = tone === 'inherit' ? 'currentColor' : URQR_ICON_TONES[tone];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Quick Search (F2)"
      className={className}
      style={style}
      {...props}
    >
      <circle cx="10.5" cy="10.5" r="7.5" />
      <path d="M21 21l-5.2-5.2M11.25 6.75 8.75 10.5h3.5l-2.5 3.75" />
    </svg>
  );
}

export function CashPayIcon({ size = 24, strokeWidth = 1.75, tone = 'inherit', className, style, ...props }: UrqrIconProps) {
  const color = tone === 'inherit' ? 'currentColor' : URQR_ICON_TONES[tone];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Cash Pay (F4)"
      className={className}
      style={style}
      {...props}
    >
      <path d="M22 12.25V6.5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9M7.25 7.75h4.75M7.25 10.25h4.75M8.75 7.75a2.1 2.1 0 0 1 0 4.2H7.25l3.5 2.3M15.5 18.25l2 2 4.25-4.5" />
    </svg>
  );
}

export function PrintLastIcon({ size = 24, strokeWidth = 1.75, tone = 'inherit', className, style, ...props }: UrqrIconProps) {
  const color = tone === 'inherit' ? 'currentColor' : URQR_ICON_TONES[tone];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Print Last (F9)"
      className={className}
      style={style}
      {...props}
    >
      <path d="M6 9V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v5M6 17H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1M6 14h5.5M6 14v6a1 1 0 0 0 1 1h4.25M15.2 16.4a3.25 3.25 0 1 1 .5 3.9M14.75 13.75v2.75h2.75" />
    </svg>
  );
}

export function VoidCartIcon({ size = 24, strokeWidth = 1.75, tone = 'inherit', className, style, ...props }: UrqrIconProps) {
  const color = tone === 'inherit' ? 'currentColor' : URQR_ICON_TONES[tone];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Void Cart (Esc)"
      className={className}
      style={style}
      {...props}
    >
      <circle cx="9.25" cy="19.75" r="1.35" />
      <circle cx="17.25" cy="19.75" r="1.35" />
      <path d="M2.5 4h2.75l2.2 10.2a1.5 1.5 0 0 0 1.47 1.18h8.7a1.5 1.5 0 0 0 1.46-1.15L20.75 7.5H6M11.65 9.55l3.7 3.7M15.35 9.55l-3.7 3.7" />
    </svg>
  );
}

export const URQR_POS_ICONS = {
  "urqr-payment-cash": CashTenderIcon,
  "urqr-payment-card": CardPaymentIcon,
  "urqr-payment-upi-qr": UpiQrIcon,
  "urqr-status-cloud-sync": CloudSyncActiveIcon,
  "urqr-status-offline-buffered": OfflineBufferedIcon,
  "urqr-status-centrifugo-connected": CentrifugoConnectedIcon,
  "urqr-status-printer-ready": PrinterReadyIcon,
  "urqr-action-quick-search": QuickSearchIcon,
  "urqr-action-cash-pay": CashPayIcon,
  "urqr-action-print-last": PrintLastIcon,
  "urqr-action-void-cart": VoidCartIcon,
} as const;

export type UrqrPosIconId = keyof typeof URQR_POS_ICONS;
