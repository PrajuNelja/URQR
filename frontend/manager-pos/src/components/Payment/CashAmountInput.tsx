import { Button } from "../Buttons/Button";
import { InputField } from "../InputField/InputField";
import { parseINRToPaise } from "../../lib/money";

interface CashAmountInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
}

const QUICK_AMOUNTS = [50, 100, 200] as const;

export function CashAmountInput({
  value,
  onChange,
  disabled = false,
  placeholder = "Enter cash amount",
  label = "CASH RECEIVED (₹)",
}: CashAmountInputProps) {
  function addCash(rupees: number) {
    const currentPaise = parseINRToPaise(value) ?? 0;
    const nextPaise = currentPaise + rupees * 100;

    if (Number.isSafeInteger(nextPaise)) {
      onChange((nextPaise / 100).toFixed(2));
    }
  }

  return (
    <div className="pos-cash-input">
      <InputField
        label={label}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => {
          const next = event.target.value;
          if (/^\d*(?:\.\d{0,2})?$/.test(next)) {
            onChange(next);
          }
        }}
        // Let components.css handle the 52px height and font-size
        className="pos-cash-input__field"
        wrapperClassName="pos-cash-input__wrapper"
      />

      <div className="pos-cash-input__quick">
        {QUICK_AMOUNTS.map((amount) => (
          <Button
            key={amount}
            variant="outline"
            disabled={disabled}
            // Removing size prop so components.css `.pos-cash-input__button` controls the 48px height completely
            className="pos-cash-input__button"
            onClick={() => addCash(amount)}
          >
            +₹{amount}
          </Button>
        ))}
      </div>
    </div>
  );
}