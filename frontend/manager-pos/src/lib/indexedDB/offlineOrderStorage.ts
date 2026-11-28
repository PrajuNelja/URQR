
import { getPosDatabase } from "./posDatabase";

import type {
  OfflineOrderRecord,
} from "./posDatabase";

// ==========================================
// BUFFER ORDER INPUT
// ==========================================

export interface BufferOfflineOrderInput {
  storeId: string;
  idempotencyKey: string;
  payload: unknown;

  payablePaise: number;
  tenderedPaise: number;
  changeDuePaise: number;
}

// ==========================================
// SAVE OFFLINE CASH ORDER
// ==========================================

export async function bufferOfflineOrder(
  input: BufferOfflineOrderInput
): Promise<OfflineOrderRecord> {
  if (
    !input.storeId.trim() ||
    !input.idempotencyKey.trim()
  ) {
    throw new Error(
      "Store ID and idempotency key are required."
    );
  }

  if (
    !Number.isSafeInteger(input.payablePaise) ||
    !Number.isSafeInteger(input.tenderedPaise) ||
    !Number.isSafeInteger(input.changeDuePaise) ||
    input.payablePaise <= 0 ||
    input.tenderedPaise < input.payablePaise ||
    input.changeDuePaise !==
      input.tenderedPaise - input.payablePaise
  ) {
    throw new Error(
      "Invalid offline cash payment amounts."
    );
  }

  const db = await getPosDatabase();

  const transaction = db.transaction(
    "offlineOrders",
    "readwrite"
  );

  const store = transaction.objectStore(
    "offlineOrders"
  );

  // Prevent duplicate buffering.

  const existing = await store
    .index("by-idempotency-key")
    .get(input.idempotencyKey);

  if (existing) {
    if (
      existing.storeId !== input.storeId ||
      existing.payablePaise !== input.payablePaise ||
      existing.tenderedPaise !== input.tenderedPaise ||
      existing.changeDuePaise !== input.changeDuePaise ||
      JSON.stringify(existing.payload) !==
        JSON.stringify(input.payload)
    ) {
      await transaction.done;

      throw new Error(
        "Idempotency key conflicts with an existing order."
      );
    }

    await transaction.done;

    console.info(
      "[OFFLINE ORDERS] Order already buffered:",
      existing.id
    );

    return existing;
  }

  const now = Date.now();

  const order: OfflineOrderRecord = {
    id: crypto.randomUUID(),

    storeId: input.storeId,

    idempotencyKey: input.idempotencyKey,

    payload: input.payload,

    paymentMode: "Cash",

    payablePaise: input.payablePaise,

    tenderedPaise: input.tenderedPaise,

    changeDuePaise: input.changeDuePaise,

    status: "pending",

    retryCount: 0,

    createdAt: now,

    updatedAt: now,
  };

  await store.add(order);

  await transaction.done;

  console.info(
    "[OFFLINE ORDERS] Order saved locally:",
    order.id
  );

  return order;
}

// ==========================================
// GET ORDERS FOR CURRENT STORE
// ==========================================

export async function getOfflineOrders(
  storeId: string
): Promise<OfflineOrderRecord[]> {
  const db = await getPosDatabase();

  const orders = await db.getAllFromIndex(
    "offlineOrders",
    "by-store",
    storeId
  );

  return orders.sort(
    (first, second) =>
      first.createdAt - second.createdAt
  );
}

// ==========================================
// GET PENDING OFFLINE ORDERS
// ==========================================

export async function getPendingOfflineOrders(
  storeId: string
): Promise<OfflineOrderRecord[]> {
  const orders = await getOfflineOrders(
    storeId
  );

  return orders.filter(
    (order) => order.status === "pending"
  );
}

// ==========================================
// GET PENDING ORDER COUNT
// ==========================================

export async function getPendingOrderCount(
  storeId: string
): Promise<number> {
  const orders =
    await getPendingOfflineOrders(storeId);

  return orders.length;
}

// ==========================================
// GET SINGLE OFFLINE ORDER
// ==========================================

export async function getOfflineOrder(
  id: string,
  storeId: string
): Promise<OfflineOrderRecord | undefined> {
  const db = await getPosDatabase();

  const order = await db.get(
    "offlineOrders",
    id
  );

  return order?.storeId === storeId
    ? order
    : undefined;
}
