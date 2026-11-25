
import { Button } from "../Buttons/Button";
import { StatusBadge } from "../StatusBadge/StatusBadge";
import { Card } from "./Card";
import { formatINR } from "../../lib/money";

export type StockState = "in-stock" | "low-stock" | "sold-out";

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
  name, pricePaise, imageUrl, stockState,
  inCartQuantity = 0, maxQuantity = 15, onAdd,
  previewHover = false, compact = false, className = "",
}: ProductCardProps) {
  const soldOut = stockState === "sold-out";
  const inOrder = inCartQuantity > 0;
  const maxed = inCartQuantity >= maxQuantity;
  const state = soldOut ? "sold-out" : inOrder ? "active" : previewHover ? "hover" : "default";
  const qtyLabel = inCartQuantity >= 5 ? "5+" : inCartQuantity.toString();

  const indicator = inOrder ? (
    <div className="pos-product-card__indicators" aria-label={`${inCartQuantity} in order`}>
      <span className="pos-product-card__check" aria-hidden="true">✓</span>
      <span className="pos-product-card__count" aria-hidden="true">{qtyLabel}</span>
    </div>
  ) : null;

  const stockLabel = stockState === "in-stock" ? "In stock"
    : stockState === "low-stock" ? "Low stock" : "Sold out";
  const stockVariant = stockState === "in-stock" ? "neutral"
    : stockState === "low-stock" ? "warning" : "error";

  return (
    <Card
      padding="none"
      className={`pos-product-card pos-product-card--${state} ${compact ? "pos-product-card--compact" : ""} ${className}`}
    >
      {!compact && (
        <div className="pos-product-card__image">
          {imageUrl ? (
            <img src={imageUrl} alt={name} loading="lazy" />
          ) : (
            <span>PRODUCT IMAGE</span>
          )}
          {indicator}
        </div>
      )}

      <div className="pos-product-card__content">
        <div className="pos-product-card__name-row">
          <h3 className="pos-product-card__name" title={name}>{name}</h3>
          {compact && indicator}
        </div>

        <div className="pos-product-card__price-row">
          <strong className="pos-product-card__price">
            {formatINR(pricePaise)}
          </strong>

          {!compact && stockState && (
            <StatusBadge
              label={stockLabel}
              variant={stockVariant}
              className={`pos-product-card__status pos-product-card__status--${stockState}`}
            />
          )}
        </div>

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
