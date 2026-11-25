
import { useNetworkStatus } from "../../pages/Table_Management/Hooks/useNetworkStatus";

interface NetworkStatusPillProps {
  className?: string;
}

export function NetworkStatusPill({
  className = "",
}: NetworkStatusPillProps) {
  const isOnline = useNetworkStatus();

  return (
    <span
      role="status"
      aria-live="polite"
      data-status={isOnline ? "online" : "offline"}
      className={`urqr-network-pill ${className}`}
    >
      <span
        aria-hidden="true"
        className="urqr-network-pill__dot"
      />

      <span className="urqr-network-pill__label">
        {isOnline ? "Online" : "Offline"}
      </span>
    </span>
  );
}
