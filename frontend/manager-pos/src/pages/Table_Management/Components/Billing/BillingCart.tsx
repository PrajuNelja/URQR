
import { useEffect, useRef, useState } from "react";

import { PosIcon } from "../../../../components/Icons/PosIcon";
import { Card } from "../../../../components/DataCard/Card";
import { CartItemRow } from "../../../../components/Cart/CartItemRow";

import type { CartItem } from "../../Types/billing.types";

interface BillingCartProps {
  items: CartItem[];

  updateQuantity: (
    id: number,
    delta: number
  ) => void;

  orderId?: string | number | null;
}

// Temporary 4-digit order reference

const generateOrderId = (): string => {
  return String(
    Math.floor(1000 + Math.random() * 9000)
  );
};

export function BillingCart({
  items,
  updateQuantity,
  orderId,
}: BillingCartProps) {

  const [temporaryOrderId, setTemporaryOrderId] =
    useState<string>(generateOrderId);

  const previouslyHadItems =
    useRef(items.length > 0);

  useEffect(() => {
    if (
      previouslyHadItems.current &&
      items.length === 0
    ) {
      setTemporaryOrderId(generateOrderId());
    }

    previouslyHadItems.current =
      items.length > 0;

  }, [items.length]);

  const hasBackendOrderId =
    orderId !== null &&
    orderId !== undefined &&
    String(orderId).trim() !== "";

  const displayedOrderId =
    hasBackendOrderId
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

      {/* CART ITEMS */}

      <div className="urqr-billing-cart-items">

        {items.length === 0 ? (

          /* EMPTY CART STATE */

          <div
            className="
              flex flex-col
              items-center justify-center
              py-16 px-4
              text-center my-auto
              min-h-[260px]
            "
          >

            {/* SVG CART ICON WITHOUT BACKGROUND */}

            <div
              className="
                flex items-center justify-center
                mb-4
              "
              style={{
                background: "transparent",
                border: "none",
                borderRadius: 0,
                boxShadow: "none",
              }}
            >
              <PosIcon
                name="cart"
                size={36}
                strokeWidth={1.8}
                className="text-primary"
                aria-hidden="true"
                style={{
                  background: "transparent",
                  border: "none",
                  borderRadius: 0,
                  boxShadow: "none",
                }}
              />
            </div>

            <p className="text-base font-bold text-text">
              Your cart is empty
            </p>

            <p
              className="
                mt-1.5 text-xs
                text-text-secondary
                max-w-[240px]
                leading-relaxed
              "
            >
              Select dishes from the menu catalog
              to begin adding items to this order.
            </p>

          </div>

        ) : (

          /* REUSABLE CART ITEM ROWS */

          items.map(({ dish, quantity }) => (

            <CartItemRow
              key={dish.id}

              productName={dish.name}

              unitPricePaise={
                Math.round(dish.price * 100)
              }

              quantity={quantity}

              maxQuantity={
                Math.min(15, dish.stock ?? 15)
              }

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
