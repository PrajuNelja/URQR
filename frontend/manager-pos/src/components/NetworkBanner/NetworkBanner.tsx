import { WifiOff } from "lucide-react";
import { useNetworkStatus } from "../../pages/Table_Management/Hooks/useNetworkStatus";

export function NetworkBanner() {
  const isOnline = useNetworkStatus();

  // If online, don't render anything
  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 bg-error text-white py-2 px-4 text-sm font-bold shadow-md">
      <WifiOff size={16} />
      <span>You are currently offline. Changes will not be saved until connection is restored.</span>
    </div>
  );
}