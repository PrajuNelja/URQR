import type { CentrifugoStatus } from "../../lib/centrifugo/centrifugoStore";

export type CentrifugoStatusTone = "ready" | "warning" | "disconnected";

export interface CentrifugoStatusPresentation {
  label: string;
  tone: CentrifugoStatusTone;
}

export function getCentrifugoStatusPresentation(
  status: CentrifugoStatus,
): CentrifugoStatusPresentation {
  switch (status) {
    case "connected":
      return { label: "Live Sync", tone: "ready" };
    case "connecting":
      return { label: "Reconnecting", tone: "warning" };
    case "disconnected":
    default:
      return { label: "Sync Disconnected", tone: "disconnected" };
  }
}
