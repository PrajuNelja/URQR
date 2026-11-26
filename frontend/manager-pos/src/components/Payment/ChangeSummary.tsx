import { formatINR } from "../../lib/money";

interface ChangeSummaryProps {
  amountDuePaise: number;
  amountReceivedPaise: number | null;
}

export function ChangeSummary({
  amountDuePaise,
  amountReceivedPaise,
}: ChangeSummaryProps) {
  if (amountReceivedPaise === null) {
    return (
      <div
        className="pos-change-summary pos-change-summary--empty"
        role="status"
        aria-live="polite"
      >
        Enter the received amount to see the balance.
      </div>
    );
  }

  const balance = amountReceivedPaise - amountDuePaise;

  const label =
    balance < 0
      ? "Remaining Amount"
      : balance === 0
        ? "Exact Amount"
        : "Change to Return";

  const state = balance < 0 ? "warning" : "success";

  return (
    <div
      className={`pos-change-summary pos-change-summary--${state}`}
      role="status"
      aria-live="polite"
    >
      <div>
        <p>{label}</p>
        {balance === 0 && <small>Payment is exact</small>}
      </div>

      <strong>{formatINR(Math.abs(balance))}</strong>
    </div>
  );
}