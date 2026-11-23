// src/components/PopupModal/Receipt.tsx

import type { ReceiptProps } from "./PopupModal.types";
import { RECEIPT_WRAPPER, receiptConfig } from "./PopupModal.config";

const formatMoney = (n: number, currency = "₹") =>
  `${currency}${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const Receipt = ({
  business,
  orderId,
  date,
  time,
  items,
  subtotal,
  taxRate,
  tax,
  total,
  paymentMethod,
  cashCollected,
  change,
  status = "Completed",
  isReprint = false,
  reprintedAt,
  currency = "₹",
  className = "",
}: ReceiptProps) => {
  const isCash = paymentMethod.toLowerCase() === "cash";

  return (
    // Added flex justify-center here so the paper sits perfectly in the middle
    <div className={`${RECEIPT_WRAPPER} ${className}`.trim()}>
      <div className={receiptConfig.paper}>
        
        <h2 className={receiptConfig.businessName}>{business.name}</h2>
        <div className={receiptConfig.businessMeta}>
          {business.address && (
            <>
              {business.address}
              <br />
            </>
          )}
          {[business.phone, business.email].filter(Boolean).join(" · ")}
        </div>

        <div className={receiptConfig.title}>
          {isReprint ? "Receipt reprint" : "Completed order receipt"}
        </div>

        <dl className={receiptConfig.infoGrid}>
          <div>
            <dt className={receiptConfig.infoLabel}>Order number</dt>
            <dd className={receiptConfig.infoValue}>{orderId}</dd>
          </div>
          <div>
            <dt className={receiptConfig.infoLabel}>Date / time</dt>
            <dd className={receiptConfig.infoValue}>
              {date}, {time}
            </dd>
          </div>
          <div>
            <dt className={receiptConfig.infoLabel}>Payment method</dt>
            <dd className={receiptConfig.infoValue}>{paymentMethod}</dd>
          </div>
          <div>
            <dt className={receiptConfig.infoLabel}>Order status</dt>
            <dd className={receiptConfig.infoValue}>{status}</dd>
          </div>
        </dl>

        <table className={receiptConfig.table}>
          <thead>
            <tr>
              <th className={receiptConfig.th}>Item / quantity</th>
              <th className={`${receiptConfig.th} text-right`}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={`${item.name}-${i}`}>
                <td className={receiptConfig.td}>
                  {item.name} × {item.quantity}
                </td>
                <td className={`${receiptConfig.td} text-right`}>
                  {formatMoney(item.price * item.quantity, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={receiptConfig.totalsWrap}>
          <div className={receiptConfig.totalsRow}>
            <span>Subtotal</span>
            <span>{formatMoney(subtotal, currency)}</span>
          </div>
          <div className={receiptConfig.totalsRow}>
            <span>Tax ({taxRate}%)</span>
            <span>{formatMoney(tax, currency)}</span>
          </div>
          <div className={receiptConfig.totalsFinal}>
            <span>Final payable</span>
            <span>{formatMoney(total, currency)}</span>
          </div>
          {isCash && cashCollected !== undefined && (
            <>
              <div className={receiptConfig.totalsRow}>
                <span>Cash collected</span>
                <span>{formatMoney(cashCollected, currency)}</span>
              </div>
              {change !== undefined && (
                <div className={receiptConfig.totalsRow}>
                  <span>Change given</span>
                  <span>{formatMoney(change, currency)}</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className={receiptConfig.thanks}>Thank you for dining with us.</div>

        {isReprint && reprintedAt && (
          <div className={receiptConfig.reprint}>
            Reprinted {reprintedAt} · Duplicate copy
          </div>
        )}
      </div>
    </div>
  );
};

export default Receipt;