import { Card } from "../../../../components/DataCard/Card";
import { Button } from "../../../../components/Buttons/Button";
import { SelectableGroup } from "../../../../components/Header/SelectableGroup";
import { PAYMENT_METHODS, TAX_RATE } from "../../Config/billing.config";
import type { PaymentMethod } from "../../Types/billing.types";

interface Props {
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (m: PaymentMethod) => void;
  handleCompletePayment: () => void;
  itemsCount: number;
  isSubmitting?: boolean;
}

export const BillingPayment = ({
  subtotal,
  tax,
  total,
  paymentMethod,
  setPaymentMethod,
  handleCompletePayment,
  itemsCount,
  isSubmitting = false,
}: Props) => (
  <Card className="h-full flex flex-col bg-white border border-[#e4d5bd] shadow-sm">
    <h3 className="font-serif text-lg font-bold text-[#30261d] mb-4">
      3. Direct 1-Tap Checkout
    </h3>

    {/* Breakdown */}
    <div className="space-y-2 mb-4 text-sm">
      <div className="flex justify-between text-[#705e4b]">
        <span>Subtotal</span>
        <b className="text-[#30261d]">₹{subtotal.toFixed(2)}</b>
      </div>
      <div className="flex justify-between text-[#705e4b]">
        <span>Tax ({TAX_RATE}%)</span>
        <b className="text-[#30261d]">₹{tax.toFixed(2)}</b>
      </div>
      <div className="flex justify-between border-t border-dashed border-[#dfcdb4] pt-3 mt-2 font-serif text-xl font-bold">
        <span className="text-[#30261d]">Payable Total</span>
        <span className="text-[#a46714]">₹{total.toFixed(2)}</span>
      </div>
    </div>

    {/* Payment Method Selector */}
    <label className="text-[11px] font-bold tracking-widest text-[#91816c] uppercase mb-2">
      Select Payment Method
    </label>
    <SelectableGroup
      options={PAYMENT_METHODS}
      value={paymentMethod}
      onChange={(v) => setPaymentMethod(v as PaymentMethod)}
      className="mb-4"
    />

    {/* Checkout Action Button */}
    <div className="mt-auto pt-4">
      <Button
        variant="primary"
        fullWidth
        size="lg"
        onClick={handleCompletePayment}
        disabled={itemsCount === 0 || isSubmitting}
        className="h-14 font-bold text-base shadow-md"
      >
        {isSubmitting
          ? "PROCESSING ORDER..."
          : `COMPLETE ${paymentMethod.toUpperCase()} (₹${total.toFixed(2)})`}
      </Button>
    </div>
  </Card>
);
