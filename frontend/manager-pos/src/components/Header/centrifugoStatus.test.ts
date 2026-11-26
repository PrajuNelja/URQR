// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { getCentrifugoStatusPresentation } from "./centrifugoStatus";

describe("Centrifugo Status Presentation", () => {
  it("returns ready presentation when status is connected", () => {
    const pres = getCentrifugoStatusPresentation("connected");
    expect(pres.label).toBe("Live Sync");
    expect(pres.tone).toBe("ready");
  });

  it("returns warning presentation when status is connecting", () => {
    const pres = getCentrifugoStatusPresentation("connecting");
    expect(pres.label).toBe("Reconnecting");
    expect(pres.tone).toBe("warning");
  });

  it("returns disconnected presentation when status is disconnected", () => {
    const pres = getCentrifugoStatusPresentation("disconnected");
    expect(pres.label).toBe("Sync Disconnected");
    expect(pres.tone).toBe("disconnected");
  });
});
