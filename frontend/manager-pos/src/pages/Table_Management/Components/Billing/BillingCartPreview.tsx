import { ShoppingCart } from "lucide-react";

// Temporary empty-cart UI: integration with cartStore comes later.
export function BillingCartPreview() {
  return (
    <aside className="flex min-w-0 flex-col rounded-md border border-[#e4d5bd] bg-[#fffaf2] p-5 lg:min-h-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4d5bd] pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#30261d]">
            2. Order Details / Cart
          </h2>
          <p className="mt-1 text-xs text-[#91816c]">0 items in cart</p>
        </div>
        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded-sm border border-[#e4d5bd] px-4 py-2 text-sm font-semibold text-[#91816c] opacity-70"
        >
          Clear Cart
        </button>
      </div>

      <div className="flex min-h-48 flex-1 flex-col items-center justify-center overflow-y-auto py-8 text-center lg:min-h-0">
        <ShoppingCart size={45} className="mb-4 text-[#d3c2a9]" />
        <p className="font-medium text-[#30261d]">Your cart is empty</p>
        <p className="mt-2 text-sm text-[#91816c]">
          Add dishes from the catalog.
        </p>
      </div>

      <div className="shrink-0 border-t border-[#e4d5bd] pt-4">
        <div className="mb-3 flex justify-between text-sm text-[#30261d]">
          <span>Subtotal</span>
          <span>₹0.00</span>
        </div>
        <div className="mb-3 flex justify-between text-sm text-[#30261d]">
          <span>Tax</span>
          <span>₹0.00</span>
        </div>
        <div className="flex justify-between border-t border-[#e4d5bd] pt-4 text-lg font-bold text-[#30261d]">
          <span>Grand Total</span>
          <span>₹0.00</span>
        </div>
      </div>
    </aside>
  );
}
