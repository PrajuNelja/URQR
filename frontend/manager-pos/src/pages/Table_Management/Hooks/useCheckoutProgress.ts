import {
  useEffect,
  useState,
} from "react";

export function useCheckoutProgress(
  isProcessing: boolean
) {
  const [elapsedSeconds, setElapsedSeconds] =
    useState(0);

  const [isOnline, setIsOnline] =
    useState(() => navigator.onLine);

  // Monitor browser connection status.
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener(
      "online",
      handleOnline
    );

    window.addEventListener(
      "offline",
      handleOffline
    );

    return () => {
      window.removeEventListener(
        "online",
        handleOnline
      );

      window.removeEventListener(
        "offline",
        handleOffline
      );
    };
  }, []);

  // Track checkout processing duration.
  useEffect(() => {
    setElapsedSeconds(0);

    if (!isProcessing) {
      return;
    }

    const startedAt = Date.now();

    const timer = window.setInterval(() => {
      setElapsedSeconds(
        Math.floor(
          (Date.now() - startedAt) / 1000
        )
      );
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isProcessing]);

  const seconds = isProcessing
    ? elapsedSeconds
    : 0;

  let title = "Processing Payment";

  let message =
    "Submitting your order. Please wait.";

  let isDelayed = false;

  if (isProcessing && !isOnline) {
    title = "Internet Connection Lost";

    message =
      "Connection interrupted during checkout. Payment status is not yet confirmed.";

    isDelayed = true;
  } else if (seconds >= 15) {
    title = "Confirmation Still Pending";

    message =
      "Order confirmation is taking unusually long. Do not submit another payment.";

    isDelayed = true;
  } else if (seconds >= 8) {
    title = "Confirmation Delayed";

    message =
      "The order confirmation is taking longer than expected.";

    isDelayed = true;
  } else if (seconds >= 3) {
    title = "Waiting for Confirmation";

    message =
      "Waiting for the server to confirm your order.";
  }

  return {
    title,
    message,
    isOnline,
    isDelayed,
    elapsedSeconds: seconds,
  };
}