import { useMutation } from "@tanstack/react-query";

import {
  submitOrder,
  type OrderPayload,
} from "../Components/Billing/orderApi";

export function useOrderMutation() {
  return useMutation({
    mutationKey: ["pos", "orders", "checkout"],

    mutationFn: ({
      payload,
      headers,
    }: {
      payload: OrderPayload;

      headers: {
        "Idempotency-Key": string;
      };
    }) => {
      return submitOrder(payload, headers);
    },

    // Prevent uncontrolled automatic checkout retries.
    retry: false,

    // Allow network failures to be reported immediately.
    networkMode: "always",
  });
}