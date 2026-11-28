import { useCallback, useRef } from "react";

export function useCheckoutIdempotency() {
  const idempotencyKeyRef = useRef<string | null>(null);

  // Generate UUID v4 for a new checkout transaction
  const getIdempotencyKey = useCallback((): string => {
    if (idempotencyKeyRef.current === null) {
      idempotencyKeyRef.current = crypto.randomUUID();
    }

    return idempotencyKeyRef.current;
  }, []);

  // Generate checkout request headers
  const getCheckoutHeaders = useCallback(() => {
    return {
      "Idempotency-Key": getIdempotencyKey(),
    };
  }, [getIdempotencyKey]);

  // Reset UUID after successful checkout
  const resetIdempotencyKey = useCallback(() => {
    idempotencyKeyRef.current = null;
  }, []);

  return {
    getIdempotencyKey,
    getCheckoutHeaders,
    resetIdempotencyKey,
  };
}