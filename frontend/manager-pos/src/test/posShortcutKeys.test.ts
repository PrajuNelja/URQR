
import {
  describe,
  expect,
  it,
} from "vitest";

import {
  POS_FUNCTION_KEYS,
  toPosFunctionKey,
} from "../pages/Table_Management/Hooks/posShortcutKeys";

describe("POS Function Keys", () => {
  it.each(POS_FUNCTION_KEYS)(
    "recognizes %s",
    (key) => {
      expect(toPosFunctionKey(key)).toBe(key);
    }
  );

  it.each(["F0", "F13", "Escape", "Enter", "A"])(
    "ignores invalid key %s",
    (key) => {
      expect(toPosFunctionKey(key)).toBeNull();
    }
  );
});
