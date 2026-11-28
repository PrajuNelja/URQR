
import {
  openDB,
  type DBSchema,
  type IDBPDatabase,
} from "idb";

export const POS_DB_NAME = "urqr-manager-pos";

export const POS_DB_VERSION = 2;

// ==========================================
// EXISTING CATALOG STORAGE
// ==========================================

export interface CatalogRecord {
  storeId: string;
  products: unknown[];
  updatedAt: number;
}

// ==========================================
// OFFLINE ORDER STORAGE
// ==========================================

export type OfflineOrderStatus =
  | "pending"
  | "syncing"
  | "synced"
  | "failed";

export interface OfflineOrderRecord {
  id: string;
  storeId: string;
  idempotencyKey: string;
  payload: unknown;

  paymentMode: "Cash";

  payablePaise: number;
  tenderedPaise: number;
  changeDuePaise: number;

  status: OfflineOrderStatus;

  retryCount: number;

  createdAt: number;
  updatedAt: number;

  lastError?: string;
  serverOrderId?: string;
}

// ==========================================
// INDEXEDDB SCHEMA
// ==========================================

interface PosDatabaseSchema extends DBSchema {
  catalog: {
    key: string;
    value: CatalogRecord;
  };

  offlineOrders: {
    key: string;
    value: OfflineOrderRecord;

    indexes: {
      "by-store": string;
      "by-status": OfflineOrderStatus;
      "by-created-at": number;
      "by-idempotency-key": string;
    };
  };
}

let databasePromise:
  | Promise<IDBPDatabase<PosDatabaseSchema>>
  | undefined;

// ==========================================
// INITIALIZE DATABASE
// ==========================================

export function getPosDatabase() {
  if (!databasePromise) {
    databasePromise = openDB<PosDatabaseSchema>(
      POS_DB_NAME,
      POS_DB_VERSION,
      {
        upgrade(db) {
          // Preserve existing catalog data.

          if (
            !db.objectStoreNames.contains("catalog")
          ) {
            db.createObjectStore("catalog", {
              keyPath: "storeId",
            });
          }

          // Create offline order queue.

          if (
            !db.objectStoreNames.contains(
              "offlineOrders"
            )
          ) {
            const store = db.createObjectStore(
              "offlineOrders",
              {
                keyPath: "id",
              }
            );

            store.createIndex(
              "by-store",
              "storeId"
            );

            store.createIndex(
              "by-status",
              "status"
            );

            store.createIndex(
              "by-created-at",
              "createdAt"
            );

            store.createIndex(
              "by-idempotency-key",
              "idempotencyKey",
              {
                unique: true,
              }
            );

            console.info(
              "[IndexedDB] Offline order store created"
            );
          }
        },
      }
    ).catch((error) => {
      databasePromise = undefined;
      throw error;
    });
  }

  return databasePromise;
}
