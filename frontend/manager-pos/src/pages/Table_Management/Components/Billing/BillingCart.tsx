
import { Card } from "../../../../components/DataCard/Card";
import { Button } from "../../../../components/Buttons/Button";
import { CartItemRow } from "../../../../components/Cart/CartItemRow";
import { EmptyState } from "../../../../components/DataCard/EmptyState";
import { TextArea } from "../../../../components/InputField/TextArea";

import type { CartItem } from "../../Types/billing.types";

interface Props {
  items: CartItem[];
  updateQuantity: (
    id: number,
    delta: number
  ) => void;
  clearCart: () => void;
  note: string;
  setNote: (value: string) => void;
}

export function BillingCart({
  items,
  updateQuantity,
  clearCart,
  note,
  setNote,
}: Props) {
  const units = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <Card
      as="section"
      padding="none"
      className="urqr-billing-cart"
    >
      {/* ORDER SUMMARY HEADING */}
      <div className="urqr-billing-cart-heading">
        <div>
          <h2>Order Summary</h2>
          <p>
            {items.length} items · {units} units
          </p>
        </div>

        <span className="urqr-billing-draft-badge">
          Draft order
        </span>
      </div>

      {/* ORDER ITEMS */}
      <div className="urqr-billing-cart-items">
        {items.length === 0 ? (
          <EmptyState
            message="Cart is empty"
            description="Add products from the catalog."
          />
        ) : (
          items.map(({ dish, quantity }) => (
            <CartItemRow
              key={dish.id}
              productName={dish.name}
              unitPricePaise={Math.round(
                dish.price * 100
              )}
              quantity={quantity}
              maxQuantity={Math.min(
                15,
                dish.stock ?? 15
              )}
              onQuantityChange={(value) =>
                updateQuantity(
                  dish.id,
                  value - quantity
                )
              }
              onRemove={() =>
                updateQuantity(
                  dish.id,
                  -quantity
                )
              }
            />
          ))
        )}
      </div>

      {/* PRESERVE EXISTING ORDER NOTE */}
      <div className="urqr-billing-cart-extras">
        <details>
          <summary>Order note</summary>

          <TextArea
            rows={2}
            value={note}
            onChange={(event) =>
              setNote(event.target.value)
            }
            placeholder="e.g., no onions..."
          />
        </details>

        <Button
          variant="ghost"
          size="sm"
          onClick={clearCart}
          disabled={!items.length}
        >
          Clear
        </Button>
      </div>
    </Card>
  );
}
