// src/components/PopupModal/Receipt.tsx
import type { ReceiptProps } from "./PopupModal.types";

const formatMoney = (n: number) =>
  `₹${n.toLocaleString("en-IN", {
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
  total,
  paymentMethod,
  isReprint = false,
  reprintedAt,
  className = "",
}: ReceiptProps) => {
  const isCash = paymentMethod.toLowerCase() === "cash";
  // Mock logic for CGST/SGST based on the reference layout
  const cgst = +(subtotal * 0.025).toFixed(2);
  const sgst = +(subtotal * 0.025).toFixed(2);
  
  // Transaction ID for non-cash payments
  const txnId = isCash ? "" : "UPI2611251516908421"; 

  return (
    <div className={`w-full flex justify-center ${className}`.trim()}>
      {/* PAPER CONTAINER: Pure white, no extra shadows or borders to match the reference perfectly */}
      <div className="bg-white text-[#111827] w-full max-w-[400px] p-6 font-mono text-[12.5px] leading-[1.45]">
        
        {/* --- HEADER --- */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-[42px] h-[42px] border-[1.5px] border-[#111827] rounded-md mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 3v7a2 2 0 0 0 4 0V3" fill="none"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
              <path d="M16 3c2 2 2 7 0 9v9" fill="none"/>
            </svg>
          </div>
          <div className="font-sans text-[18px] font-bold tracking-[0.06em] mb-1 uppercase">
            {business.name}
          </div>
          <div className="flex items-center justify-center gap-2 text-[11px] font-semibold tracking-[0.03em] mb-2">
            <span className="h-px w-5 bg-[#9ca3af]"></span>
            <span>GOOD FOOD. GREAT MEMORIES.</span>
            <span className="h-px w-5 bg-[#9ca3af]"></span>
          </div>
          <div className="text-[#4b5563] mb-1">
            {business.address || "Your Restaurant Address"}<br />
            Bengaluru, Karnataka 560001<br />
            {business.phone ? `Ph: ${business.phone}` : "Ph: 080-4567-8910"}
          </div>
          <div className="font-bold mb-4">
            GSTIN: 29ABCDE1234F1Z5
          </div>
        </div>

        <div className="border-t border-dashed border-[#9ca3af] mb-3"></div>

        {/* --- META --- */}
        <div className="flex flex-col gap-0.5 mb-3">
          <div className="grid grid-cols-[96px_12px_1fr] items-baseline">
            <span className="font-semibold">Bill No.</span><span>:</span><span className="text-right tabular-nums">{orderId}</span>
          </div>
          <div className="grid grid-cols-[96px_12px_1fr] items-baseline">
            <span className="font-semibold">Date</span><span>:</span><span className="text-right tabular-nums">{date}</span>
          </div>
          <div className="grid grid-cols-[96px_12px_1fr] items-baseline">
            <span className="font-semibold">Time</span><span>:</span><span className="text-right tabular-nums">{time}</span>
          </div>
          <div className="grid grid-cols-[96px_12px_1fr] items-baseline">
            <span className="font-semibold">Order Type</span><span>:</span><span className="text-right tabular-nums">Dine In</span>
          </div>
          <div className="grid grid-cols-[96px_12px_1fr] items-baseline">
            <span className="font-semibold">Order No.</span><span>:</span><span className="text-right tabular-nums font-bold">{orderId}</span>
          </div>
        </div>

        {isReprint && (
          <div className="text-center font-bold text-xs tracking-wider uppercase py-1 border-t border-dashed border-[#9ca3af] mb-1">
            Receipt reprint
          </div>
        )}

        <div className="border-t border-dashed border-[#9ca3af] mb-3"></div>

        {/* --- ITEMS TABLE --- */}
        <div className="grid grid-cols-[1fr_28px_64px_66px] gap-1 font-bold pb-1.5 border-b-[1.5px] border-[#111827] mb-1">
          <span>ITEM</span>
          <span className="text-right">QTY</span>
          <span className="text-right">UNIT</span>
          <span className="text-right">TOTAL</span>
        </div>

        <div className="flex flex-col mb-3">
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-[1fr_28px_64px_66px] gap-1 py-1.5 border-b border-dashed border-[#d1d5db] items-start last:border-0 tabular-nums">
              <span className="line-clamp-2 overflow-hidden break-words">
                {i + 1}. {item.name}
              </span>
              <span className="text-right">{item.quantity}</span>
              <span className="text-right">{formatMoney(item.price)}</span>
              <span className="text-right font-bold">{formatMoney(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-[#9ca3af] mb-2"></div>

        {/* --- TOTALS --- */}
        <div className="flex flex-col gap-1 mb-2 tabular-nums">
          <div className="flex justify-between">
            <span>SUBTOTAL</span>
            <span className="font-bold">{formatMoney(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>CGST (2.5%)</span>
            <span>{formatMoney(cgst)}</span>
          </div>
          <div className="flex justify-between">
            <span>SGST (2.5%)</span>
            <span>{formatMoney(sgst)}</span>
          </div>
        </div>

        {/* --- GRAND TOTAL --- */}
        <div className="flex justify-between items-baseline font-sans text-[15px] font-bold py-2 border-t-[1.5px] border-b-[1.5px] border-[#111827] mb-2.5 tabular-nums">
          <span>GRAND TOTAL</span>
          <span>{formatMoney(total)}</span>
        </div>

        {/* --- PAYMENT INFO --- */}
        <div className="flex flex-col gap-1 mb-3 tabular-nums">
          <div className="flex justify-between">
            <span>Payment Mode</span>
            <span className="font-bold uppercase">{paymentMethod}</span>
          </div>
          {!isCash && txnId && (
            <div className="flex justify-between">
              <span>Transaction ID</span>
              <span className="text-right break-all font-semibold">{txnId}</span>
            </div>
          )}
        </div>

        <div className="border-t border-dashed border-[#9ca3af] mb-4"></div>

        {/* --- FOOTER --- */}
        <div className="text-center">
          <div className="font-bold mb-3">THANK YOU, VISIT AGAIN!</div>
          
          {/* BARCODE SVG (Exact reference replica) */}
          <div className="flex flex-col items-center mt-2 mb-4" aria-label={`Order barcode ${orderId}`}>
            <svg className="w-[210px] h-[44px] block" viewBox="0 0 212 44" fill="currentColor" aria-hidden="true">
              <rect x="4" y="0" width="3" height="44"/><rect x="9" y="0" width="1.5" height="44"/><rect x="13" y="0" width="2" height="44"/>
              <rect x="18" y="0" width="1.5" height="44"/><rect x="22" y="0" width="4" height="44"/><rect x="28" y="0" width="1.5" height="44"/>
              <rect x="32" y="0" width="2.5" height="44"/><rect x="37" y="0" width="1.5" height="44"/><rect x="41" y="0" width="3" height="44"/>
              <rect x="47" y="0" width="2" height="44"/><rect x="51" y="0" width="1.5" height="44"/><rect x="55" y="0" width="4" height="44"/>
              <rect x="61" y="0" width="1.5" height="44"/><rect x="65" y="0" width="2" height="44"/><rect x="70" y="0" width="3" height="44"/>
              <rect x="75" y="0" width="1.5" height="44"/><rect x="79" y="0" width="2.5" height="44"/><rect x="84" y="0" width="4" height="44"/>
              <rect x="90" y="0" width="1.5" height="44"/><rect x="94" y="0" width="2" height="44"/><rect x="99" y="0" width="1.5" height="44"/>
              <rect x="103" y="0" width="3.5" height="44"/><rect x="109" y="0" width="2" height="44"/><rect x="113" y="0" width="1.5" height="44"/>
              <rect x="118" y="0" width="3" height="44"/><rect x="123" y="0" width="1.5" height="44"/><rect x="127" y="0" width="4" height="44"/>
              <rect x="133" y="0" width="2" height="44"/><rect x="138" y="0" width="1.5" height="44"/><rect x="142" y="0" width="2.5" height="44"/>
              <rect x="147" y="0" width="3" height="44"/><rect x="152" y="0" width="1.5" height="44"/><rect x="156" y="0" width="2" height="44"/>
              <rect x="161" y="0" width="4" height="44"/><rect x="167" y="0" width="1.5" height="44"/><rect x="171" y="0" width="2.5" height="44"/>
              <rect x="176" y="0" width="1.5" height="44"/><rect x="180" y="0" width="3" height="44"/><rect x="186" y="0" width="2" height="44"/>
              <rect x="190" y="0" width="1.5" height="44"/><rect x="194" y="0" width="3.5" height="44"/><rect x="200" y="0" width="1.5" height="44"/>
              <rect x="204" y="0" width="4" height="44"/>
            </svg>
          </div>
        </div>
        {/* Reprint Meta */}
        {isReprint && reprintedAt && (
          <div className="text-center text-[#4b5563] text-[11px] mt-4 font-mono">
            Reprinted {reprintedAt} · Duplicate copy
          </div>
        )}
      </div>
    </div>
  );
};

export default Receipt;