
import { ShoppingCart, X } from "lucide-react";

import { QuantityStepper } from "../../../../components/DataTable/QuantityStepper";
import {
  MAX_CART_QUANTITY,
  useCartStore,
} from "../../../../lib/cartStore";

// Convert paise to rupees
const formatPrice = (paise: number) =>
  (paise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function BillingCartPreview() {
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  // Calculate total quantity
  const itemCount = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Calculate preview subtotal
  const subtotal = items.reduce(
    (total, item) =>
      total + item.unitPricePaise * item.quantity,
    0
  );

  return (
    <aside className="flex min-w-0 flex-col rounded-lg border border-border-subtle bg-surface p-5 lg:min-h-0">

      {/* ORDER HEADER */}
      <div className="border-b border-border-subtle pb-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-primary">
            Order Summary
          </h2>

          <button
            type="button"
            onClick={clearCart}
            disabled={items.length === 0}
            className="rounded-md border border-border-subtle px-3 py-2 text-xs font-medium text-primary hover:bg-app-bg disabled:opacity-40"
          >
            Clear Cart
          </button>
        </div>

        <p className="mt-2 text-xs text-text-muted">
          {items.length} items · {itemCount} units
        </p>
      </div>

      {/* CART ITEMS */}
      <div className="min-h-48 flex-1 space-y-2 overflow-y-auto py-4 lg:min-h-0">

        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-10 text-center">
            <ShoppingCart
              size={42}
              className="mb-4 text-text-muted"
            />

            <p className="font-medium text-primary">
              Your cart is empty
            </p>

            <p className="mt-2 text-sm text-text-muted">
              Add dishes from the catalog.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-3 rounded-md bg-surface p-2"
            >
              {/* PRODUCT THUMBNAIL PLACEHOLDER */}
              <div className="h-10 w-10 shrink-0 rounded-md bg-app-bg" />

              {/* PRODUCT DETAILS */}
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-primary">
                  {item.productName}
                </h3>

                <p className="mt-1 text-xs text-text-muted">
                  ₹{formatPrice(item.unitPricePaise)} / unit
                </p>
              </div>

              {/* COMPACT QUANTITY STEPPER */}
              <div className="shrink-0">
                <QuantityStepper
                  value={item.quantity}
                  min={0}
                  max={MAX_CART_QUANTITY}
                  size="sm"
                  onChange={(quantity) =>
                    setQuantity(item.productId, quantity)
                  }
                />
              </div>

              {/* REMOVE PRODUCT */}
              <button
                type="button"
                onClick={() => removeItem(item.productId)}
                aria-label={`Remove ${item.productName}`}
                title="Remove item"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-app-bg hover:text-error-text"
              >
                <X size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* ORDER SUMMARY */}
      <div className="shrink-0 border-t border-border-subtle pt-4">

        {/* SUBTOTAL */}
        <div className="mb-3 flex justify-between text-sm">
          <span className="text-text-muted">Subtotal</span>
          <span className="font-semibold text-primary">
            ₹{formatPrice(subtotal)}
          </span>
        </div>

        {/* TAX PLACEHOLDER */}
        <div className="mb-3 flex justify-between text-sm">
          <span className="text-text-muted">Tax</span>
          <span className="text-text-muted">
            Pending
          </span>
        </div>

        <p className="mb-4 text-xs text-text-muted">
          Tax and discounts will be calculated
          during checkout integration.
        </p>

        {/* PREVIEW TOTAL */}
        <div className="flex items-center justify-between border-t border-border-subtle pt-4">
          <span className="text-base font-bold text-primary">
            Total before tax
          </span>

          <span className="text-xl font-bold text-primary">
            ₹{formatPrice(subtotal)}
          </span>
        </div>
      </div>
    </aside>
  );
}
