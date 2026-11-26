import { useCentrifugoStore } from "../../lib/centrifugo/centrifugoStore";
import { getCentrifugoStatusPresentation } from "./centrifugoStatus";

interface CentrifugoStatusPillProps {
  className?: string;
}

export function CentrifugoStatusPill({ className = "" }: CentrifugoStatusPillProps) {
  const status = useCentrifugoStore((state) => state.status);
  const presentation = getCentrifugoStatusPresentation(status);

  return (
    <span
      role="status"
      aria-live="polite"
      data-status={status}
      data-tone={presentation.tone}
      className={`urqr-network-pill urqr-centrifugo-pill ${className}`}
      title={`Real-time Stream: ${presentation.label}`}
    >
      <span
        aria-hidden="true"
        className={`urqr-network-pill__dot ${
          presentation.tone === "ready"
            ? "bg-emerald-500"
            : presentation.tone === "warning"
              ? "bg-amber-500 animate-pulse"
              : "bg-slate-400"
        }`}
      />
      <span className="urqr-network-pill__label">
        {presentation.label}
      </span>
    </span>
  );
}

export default CentrifugoStatusPill;
