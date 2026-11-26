
import { ChevronDown } from "lucide-react";
import { Divider } from "../DataCard/Divider";
import { formatINR } from "../../lib/money";

export interface TaxLine {
  label: string;
  amountPaise: number;
}

interface OrderTotalsProps {
  subtotalPaise: number;
  grandTotalPaise?: number | null;
  taxLines?: TaxLine[];
  collapsibleTaxes?: boolean;
  note?: string;
}

export function OrderTotals({
  subtotalPaise,
  grandTotalPaise = null,
  taxLines = [],
  collapsibleTaxes = false,
  note,
}: OrderTotalsProps) {
  const taxes = taxLines.reduce(
    (sum, row) => sum + row.amountPaise, 0
  );

  const taxRows = taxLines.map((row) => (
    <div className="pos-total-row" key={row.label}>
      <span>{row.label}</span>
      <strong>{formatINR(row.amountPaise)}</strong>
    </div>
  ));

  return (
    <div className="pos-order-totals">
      <div className="pos-total-row">
        <span>Subtotal</span>
        <strong>{formatINR(subtotalPaise)}</strong>
      </div>

      {taxLines.length > 0 && collapsibleTaxes ? (
        <details className="pos-order-totals__details">
          <summary>
            <span>Tax breakdown</span>
            <span className="pos-order-totals__tax-label">
              {formatINR(taxes)}
              <ChevronDown size={16} aria-hidden="true" />
            </span>
          </summary>
          <div className="pos-order-totals__tax-rows">
            {taxRows}
          </div>
        </details>
      ) : taxLines.length > 0 ? (
        taxRows
      ) : (
        <div className="pos-total-row">
          <span>Tax</span>
          <span>Not provided</span>
        </div>
      )}

      {note && (
        <p className="pos-order-totals__note">{note}</p>
      )}

      <Divider />

      <div className="pos-total-row pos-total-row--grand">
        <span>
          {grandTotalPaise === null
            ? "Subtotal (before tax)"
            : "Grand Total"}
        </span>
        <strong>
          {formatINR(grandTotalPaise ?? subtotalPaise)}
        </strong>
      </div>
    </div>
  );
}
