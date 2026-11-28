import { Card } from "../../../../components/DataCard/Card";
import { Button } from "../../../../components/Buttons/Button";
import { SelectableGroup } from "../../../../components/Header/SelectableGroup";
import { PAYMENT_METHODS, TAX_RATE } from "../../Config/billing.config";
import type { PaymentMethod } from "../../Types/billing.types";

interface Props {
  subtotal: number; tax: number; total: number;
  paymentMethod: PaymentMethod; setPaymentMethod: (m: PaymentMethod) => void;
  cashCollected: string; setCashCollected: (c: string) => void;
  change: number; handleCompletePayment: () => void; itemsCount: number;
}

export const BillingPayment = (p: Props) => (
  <Card className="h-full flex flex-col">
    <h3 className="font-serif text-lg text-primary mb-4">3. Payment & Checkout</h3>
    <div className="space-y-2 mb-4 text-sm">
      <div className="flex justify-between"><span className="text-text-muted">Subtotal</span><b>₹{p.subtotal.toFixed(2)}</b></div>
      <div className="flex justify-between"><span className="text-text-muted">Tax ({TAX_RATE}%)</span><b>₹{p.tax.toFixed(2)}</b></div>
      <div className="flex justify-between border-t border-dashed border-border-subtle pt-2 mt-2 font-serif text-xl font-bold"><span>Total</span><span className="text-accent-gold">₹{p.total.toFixed(2)}</span></div>
    </div>
    <label className="text-[11px] font-bold tracking-widest text-text-muted uppercase mb-2">Select Payment Method</label>
    <SelectableGroup options={PAYMENT_METHODS} value={p.paymentMethod} onChange={(v) => p.setPaymentMethod(v as PaymentMethod)} className="mb-4" />
    {p.paymentMethod === "Cash" && (
      <div className="mb-4">
        <label className="text-[11px] font-bold tracking-widest text-text-muted uppercase">Cash Collected</label>
        <input type="number" className="w-full bg-input-bg border border-border-subtle rounded-md p-2 mt-1 mb-1 text-sm outline-none focus:border-accent-gold" placeholder="Enter amount" value={p.cashCollected} onChange={(e) => p.setCashCollected(e.target.value)} />
        <div className="flex justify-between text-sm"><span className="text-text-muted">Change to return</span><b className={p.change >= 0 ? "text-success-text" : "text-error-text"}>{isNaN(p.change) ? "—" : `₹${p.change.toFixed(2)}`}</b></div>
      </div>
    )}
    <div className="mt-auto">
      <Button variant="primary" fullWidth size="lg" onClick={p.handleCompletePayment} disabled={p.itemsCount === 0}>
        COMPLETE PAYMENT (₹{p.total.toFixed(2)})
      </Button>
    </div>
  </Card>
);