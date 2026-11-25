
/**
 * Store monetary values as integer paise.
 * Example: ₹220 = 22000 paise.
 */

const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatINR(paise: number): string {
  return formatter.format(paise / 100);
}

export function parseINRToPaise(
  input: string
): number | null {
  if (!/^\d+(?:\.\d{0,2})?$/.test(input)) {
    return null;
  }

  const [rupees, fractional = ""] = input.split(".");

  const amount =
    Number(rupees) * 100 +
    Number(fractional.padEnd(2, "0"));

  return Number.isSafeInteger(amount) && amount >= 0
    ? amount
    : null;
}
