import { describe, expect, it } from "vitest";

import {
  formatDashboardCompactRange,
  formatDashboardRange,
  resolveDashboardDatePreset,
} from "./DashboardDateRange";

describe("dashboard date range helpers", () => {
  const now = new Date(2026, 10, 27, 12);

  it("resolves today, yesterday, and rolling presets using local calendar dates", () => {
    expect(resolveDashboardDatePreset("Today", now)).toEqual({
      from: "2026-11-27",
      to: "2026-11-27",
    });
    expect(resolveDashboardDatePreset("Yesterday", now)).toEqual({
      from: "2026-11-26",
      to: "2026-11-26",
    });
    expect(resolveDashboardDatePreset("Last 7D", now)).toEqual({
      from: "2026-11-21",
      to: "2026-11-27",
    });
    expect(resolveDashboardDatePreset("Last 30D", now)).toEqual({
      from: "2026-10-29",
      to: "2026-11-27",
    });
  });

  it("formats the compact trigger and inclusive range summary", () => {
    const range = { from: "2026-10-17", to: "2026-10-23" };
    expect(formatDashboardCompactRange(range)).toBe("17–23 Oct");
    expect(formatDashboardRange(range, true)).toBe(
      "17 Oct 2026 – 23 Oct 2026 (7 days)",
    );
    expect(
      formatDashboardCompactRange({ from: "2026-11-26", to: "2026-11-26" }),
    ).toBe("26 Nov");
    expect(
      formatDashboardRange({ from: "2026-11-26", to: "2026-11-26" }, true),
    ).toBe("26 Nov 2026 – 26 Nov 2026 (1 day)");
  });
});
