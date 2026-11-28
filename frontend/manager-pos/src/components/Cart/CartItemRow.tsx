import { X } from "lucide-react";
import { IconButton } from "../Buttons/IconButton";
import { QuantityStepper } from "../DataTable/QuantityStepper";
import { formatINR } from "../../lib/money";

interface CartItemRowProps {
  productName: string;
  unitPricePaise: number;
  quantity: number;
  // Defaulting to 15 here, but you can override it if a specific item has less stock
  maxQuantity?: number; 
  onQuantityChange: (value: number) => void;
  onRemove: () => void;
}

export function CartItemRow({
  productName, 
  unitPricePaise, 
  quantity,
  maxQuantity = 15, // <--- Limit hardcoded to 15
  onQuantityChange, 
  onRemove,
}: CartItemRowProps) {
  return (
    <div className="pos-cart-row">
      <div className="pos-cart-row__thumbnail" aria-hidden="true" />

      <div className="pos-cart-row__info">
        <h4 title={productName}>{productName}</h4>
        <span>{formatINR(unitPricePaise)} / unit</span>
      </div>

      <div className="pos-cart-row__controls">
        <QuantityStepper
          value={quantity}
          min={1} // <--- Cannot go below 1
          max={maxQuantity} // <--- Cannot go above 15
          size="sm"
          onChange={onQuantityChange}
        />

        <IconButton
          label={`Remove ${productName}`}
          icon={<X size={16} />}
          variant="ghost"
          size="sm"
          onClick={onRemove}
        />
      </div>
    </div>
  );
}