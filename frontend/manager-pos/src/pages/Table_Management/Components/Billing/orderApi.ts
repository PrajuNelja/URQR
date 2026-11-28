import { apiClient } from "../../../../lib/apiClient";
import { isTauriRuntime } from "../../../../lib/bridge/bridgeClient";

export interface OrderPayload {
  items: {
    menuItemId: string;
    quantity: number;
  }[];

  payments: {
    method: "CASH";
    amount: number;
  }[];
}

export interface OrderResult {
  orderNumber: string;
  demo: boolean;
}

// Submit checkout order using existing Axios API client.
export async function submitOrder(
  payload: OrderPayload,
  headers: {
    "Idempotency-Key": string;
  }
): Promise<OrderResult> {
  // Development checkout only until backend contract is verified.
  if (!import.meta.env.DEV || isTauriRuntime()) {
    throw new Error(
      "Live checkout is blocked until catalog UUIDs and backend idempotency are verified."
    );
  }

  const response = await apiClient.post<unknown>(
    "/orders",
    payload,
    {
      baseURL: "/api/v1",
      headers,
    }
  );

  const data = response.data;

  // Validate backend response.
  if (
    typeof data !== "object" ||
    data === null ||
    !("status" in data) ||
    data.status !== "CONFIRMED" ||
    !("id" in data) ||
    typeof data.id !== "number" ||
    !Number.isSafeInteger(data.id)
  ) {
    throw new Error(
      "Unexpected mock order response. Do not treat this as a paid order."
    );
  }

  return {
    orderNumber: `DEMO-${data.id}`,
    demo: true,
  };
}