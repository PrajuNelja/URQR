
import { useEffect, useState } from "react";

export function useNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    () =>
      typeof navigator !== "undefined"
        ? navigator.onLine
        : true
  );

  useEffect(() => {
    const updateStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    window.addEventListener("focus", updateStatus);

    updateStatus();

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
      window.removeEventListener("focus", updateStatus);
    };
  }, []);

  return isOnline;
}
