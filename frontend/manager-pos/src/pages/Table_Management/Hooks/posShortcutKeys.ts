
export const POS_FUNCTION_KEYS = [
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
  "F6",
  "F7",
  "F8",
  "F9",
  "F10",
  "F11",
  "F12",
] as const;

export type PosFunctionKey =
  (typeof POS_FUNCTION_KEYS)[number];

// Check whether a pressed key belongs to F1-F12
export function toPosFunctionKey(
  key: string
): PosFunctionKey | null {
  return POS_FUNCTION_KEYS.find(
    (shortcut) => shortcut === key
  ) ?? null;
}
