
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
  stock?: number;
  inCartQuantity?: number;
  maxQuantity?: number;
  onAdd: () => void | Promise<void>;
  previewHover?: boolean;
  compact?: boolean;
  className?: string;
  isLoading?: boolean;
}

export function ProductCard({
  name,
  pricePaise,
  imageUrl,
  stockState,
  stock,
  inCartQuantity = 0,
  maxQuantity = 15,
  onAdd,
  previewHover = false,
  compact = false,
  className = "",
  isLoading = false,
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
      ? stock !== undefined
        ? `${stock} in stock`
        : "In stock"
      : stockState === "low-stock"
        ? stock !== undefined
          ? `Only ${stock} left`
          : "Low stock"
        : "Sold out";

  const stockVariant =
    stockState === "in-stock"
      ? "success"
      : stockState === "low-stock"
        ? "warning"
        : "error";

  // CART INDICATORS
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
        ×{qtyLabel}
      </span>
    </div>
  ) : null;

  // ADD HANDLER
  const handleAddClick = (
    e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>
  ) => {
    e.stopPropagation();

    if (soldOut || maxed || isLoading) return;

    onAdd();
  };

  return (
    <Card
      padding="none"
      role="button"
      tabIndex={soldOut || maxed || isLoading ? -1 : 0}
      onClick={handleAddClick}
      className={[
        "pos-product-card",
        `pos-product-card--${state}`,
        compact ? "pos-product-card--compact" : "",
        "cursor-pointer",

        // LOADING CARD DESIGN
        isLoading
          ? "!border-2 !border-[#8B5E3C] !bg-[#F5E7D4]"
          : "",

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

        {/* PRICE AND STOCK */}
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

        {/* ADD / LOADING / SUCCESS BUTTON */}
        <Button
          fullWidth
          variant={inOrder ? "primary" : "outline"}
          disabled={soldOut || maxed || isLoading}
          isLoading={isLoading}
          onClick={handleAddClick}
          aria-pressed={inOrder}
          className={[
            "!flex !min-h-[40px] !w-full",
            "!items-center !justify-center",
            "!gap-2 !rounded-[10px]",
            "!px-3 !text-[14px] !font-semibold",

            // DEFAULT ADD
            !inOrder && !isLoading
              ? "!border-[#E5D5C2] !bg-white !text-[#292524]"
              : "",

            // LOADING - REFERENCE COLORS
            isLoading
              ? "!border-transparent !bg-[#F1E2CF] !text-[#765B42] !opacity-100"
              : "",

            // SUCCESS
            inOrder && !isLoading
              ? "!border-[#875A3B] !bg-[#875A3B] !text-white"
              : "",
          ].join(" ")}
        >
          {isLoading
            ? "Adding..."
            : soldOut
              ? "Unavailable"
              : maxed
                ? "Max quantity reached"
                : inOrder
                  ? `✓ In order · ${qtyLabel}`
                  : "+ Add"}
        </Button>

      </div>
    </Card>
  );
}

export default ProductCard;
