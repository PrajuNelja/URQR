
import { Button } from "../Buttons/Button";
import { StatusBadge } from "../StatusBadge/StatusBadge";
import { Card } from "./Card";
import { formatINR } from "../../lib/money";

export type StockState =
  | "in-stock"
  | "low-stock"
  | "sold-out";

interface ProductCardProps {
  name: string;
  pricePaise: number;
  imageUrl?: string;
  stockState?: StockState;
  inCartQuantity?: number;
  maxQuantity?: number;
  onAdd: () => void;
  previewHover?: boolean;
  compact?: boolean;
  className?: string;
}

export function ProductCard({
  name,
  pricePaise,
  imageUrl,
  stockState,
  inCartQuantity = 0,
  maxQuantity = 15,
  onAdd,
  previewHover = false,
  compact = false,
  className = "",
}: ProductCardProps) {
  const soldOut = stockState === "sold-out";
  const inOrder = inCartQuantity > 0;
  const maxed = inCartQuantity >= maxQuantity;

  const state = soldOut
    ? "sold-out"
    : inOrder
      ? "active"
      : previewHover
        ? "hover"
        : "default";

  const qtyLabel =
    inCartQuantity >= 5
      ? "5+"
      : String(inCartQuantity);

  const stockLabel =
    stockState === "in-stock"
      ? "In stock"
      : stockState === "low-stock"
        ? "Low stock"
        : "Sold out";

  const stockVariant =
    stockState === "in-stock"
      ? "success"
      : stockState === "low-stock"
        ? "warning"
        : "error";

  // Green circles overlap the image's top edge.
  // Half is above the image; half is inside.
  const indicator = inOrder ? (
    <div
      className="pos-product-card__indicators"
      aria-label={`${inCartQuantity} in order`}
      style={
        compact
          ? {
              position: "static",
              display: "flex",
              alignItems: "center",
              gap: 9,
              flexShrink: 0,
            }
          : {
              position: "absolute",
              top: 0,
              right: 10,
              transform: "translateY(-50%)",
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 9,
              pointerEvents: "none",
            }
      }
    >
      <span
        className="pos-product-card__check"
        aria-hidden="true"
      >
        ✓
      </span>

      <span
        className="pos-product-card__count"
        aria-hidden="true"
      >
        {qtyLabel}
      </span>
    </div>
  ) : null;

  return (
    <Card
      padding="none"
      className={[
        "pos-product-card",
        `pos-product-card--${state}`,
        compact ? "pos-product-card--compact" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* PRODUCT IMAGE */}
      {!compact && (
        <div
          className="pos-product-card__image"
          style={{
            position: "relative",
            overflow: "visible",
            isolation: "isolate",
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              loading="lazy"
            />
          ) : (
            <span>PRODUCT IMAGE</span>
          )}

          {/* GREEN CIRCLES OVERLAP IMAGE TOP EDGE */}
          {indicator}
        </div>
      )}

      {/* PRODUCT DETAILS */}
      <div className="pos-product-card__content">
        <div className="pos-product-card__name-row">
          <h3
            className="pos-product-card__name"
            title={name}
          >
            {name}
          </h3>

          {compact && indicator}
        </div>

        {/* PRICE AND STOCK STATUS */}
        <div className="pos-product-card__price-row">
          <strong className="pos-product-card__price">
            {formatINR(pricePaise)}
          </strong>

          {!compact && stockState && (
            <StatusBadge
              label={stockLabel}
              variant={stockVariant}
              className={[
                "pos-product-card__status",
                `pos-product-card__status--${stockState}`,
              ].join(" ")}
            />
          )}
        </div>

        {/* REUSABLE ADD BUTTON */}
        <Button
          fullWidth
          variant={inOrder ? "primary" : "outline"}
          disabled={soldOut || maxed}
          onClick={onAdd}
          aria-pressed={inOrder}
          className="pos-product-card__action"
        >
          {soldOut
            ? "Unavailable"
            : inOrder
              ? `✓ In order · ${qtyLabel}`
              : "+ Add"}
        </Button>
      </div>
    </Card>
  );
}

export default ProductCard;
