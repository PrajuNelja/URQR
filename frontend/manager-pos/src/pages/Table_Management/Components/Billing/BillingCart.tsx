import { Card } from "../../../../components/DataCard/Card";
import { Button } from "../../../../components/Buttons/Button";
import { QuantityStepper } from "../../../../components/DataTable/QuantityStepper";
import { TextArea } from "../../../../components/InputField/TextArea";
import type { CartItem } from "../../Types/billing.types";

interface Props {
  items: CartItem[]; updateQuantity: (id: number, delta: number) => void;
  clearCart: () => void; note: string; setNote: (n: string) => void;
}

export const BillingCart = ({ items, updateQuantity, clearCart, note, setNote }: Props) => (
  <Card className="h-full">
    <div className="flex justify-between items-center mb-3">
      <h3 className="font-serif text-lg text-primary">2. Order Details</h3>
      <Button variant="ghost" size="sm" onClick={clearCart}>Clear</Button>
    </div>
    <div className="space-y-2 mb-4">
      {items.length === 0 ? (
        <p className="text-center text-sm text-text-muted py-6">Cart is empty — add dishes.</p>
      ) : (
        items.map((item) => (
          <div key={item.dish.id} className="flex justify-between items-center p-3 border border-border-subtle rounded-md bg-surface">
            <div>
              <b className="text-sm block">{item.dish.name}</b>
              <small className="text-xs text-text-muted">₹{item.dish.price.toFixed(2)} each</small>
            </div>
            <QuantityStepper value={item.quantity} onChange={(v) => updateQuantity(item.dish.id, v - item.quantity)} />
          </div>
        ))
      )}
    </div>
    <TextArea placeholder="Note: e.g., no onions..." rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
  </Card>
);