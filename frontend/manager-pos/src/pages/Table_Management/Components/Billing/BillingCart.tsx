
import { useEffect, useRef, useState } from "react";

import { Card } from "../../../../components/DataCard/Card";
import { CartItemRow } from "../../../../components/Cart/CartItemRow";
import { EmptyState } from "../../../../components/DataCard/EmptyState";

import type { CartItem } from "../../Types/billing.types";

interface BillingCartProps {
  items: CartItem[];
  updateQuantity: (id: number, delta: number) => void;

  // Will receive the real ID after backend integration
  orderId?: string | number | null;
}

// Temporary 4-digit order ID
const generateOrderId = (): string => {
  return String(Math.floor(1000 + Math.random() * 9000));
};

export function BillingCart({
  items,
  updateQuantity,
  orderId,
}: BillingCartProps) {
  const [temporaryOrderId, setTemporaryOrderId] =
    useState<string>(generateOrderId);

  const previouslyHadItems = useRef(items.length > 0);

  useEffect(() => {
    // Generate an ID for the next order
    // after the current cart is emptied
    if (
      previouslyHadItems.current &&
      items.length === 0
    ) {
      setTemporaryOrderId(generateOrderId());
    }

    previouslyHadItems.current = items.length > 0;
  }, [items.length]);

  const hasBackendOrderId =
    orderId !== null &&
    orderId !== undefined &&
    String(orderId).trim() !== "";

  const displayedOrderId = hasBackendOrderId
    ? String(orderId).trim().replace(/^#/, "")
    : temporaryOrderId;

  const totalUnits = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <Card
      as="section"
      padding="none"
      className="urqr-billing-cart"
    >
      {/* ORDER SUMMARY HEADER */}
      <div className="urqr-billing-cart-heading">
        <div className="urqr-billing-cart-heading-info">
          <h2>Order Summary</h2>

          <p>
            {items.length}{" "}
            {items.length === 1 ? "item" : "items"}
            {" · "}
            {totalUnits}{" "}
            {totalUnits === 1 ? "unit" : "units"}
          </p>
        </div>

        {/* ORDER ID - TOP RIGHT */}
        <span
          className="urqr-billing-order-id"
          title={
            hasBackendOrderId
              ? "Order ID from backend"
              : "Temporary order ID"
          }
        >
          Order #{displayedOrderId}
        </span>
      </div>

      {/* REUSABLE CART ITEM ROWS */}
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
              onQuantityChange={(newQuantity) => {
                updateQuantity(
                  dish.id,
                  newQuantity - quantity
                );
              }}
              onRemove={() => {
                updateQuantity(
                  dish.id,
                  -quantity
                );
              }}
            />
          ))
        )}
      </div>
    </Card>
  );
}

export default BillingCart;
