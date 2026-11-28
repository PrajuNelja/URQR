import { getPosDatabase } from "./posDatabase";

// Save catalog products

export async function saveCatalog<T>(
  storeId: string,
  products: T[]
): Promise<void> {
  const db = await getPosDatabase();

  await db.put("catalog", {
    storeId,
    products,
    updatedAt: Date.now(),
  });

  console.info(
    `[IndexedDB] Saved ${products.length} products`
  );
}

// Retrieve catalog products

export async function getCatalog<T>(
  storeId: string
): Promise<T[] | null> {
  const db = await getPosDatabase();

  const record = await db.get(
    "catalog",
    storeId
  );

  if (!record) {
    console.info(
      "[IndexedDB] No cached catalog found"
    );

    return null;
  }

  console.info(
    `[IndexedDB] Loaded ${record.products.length} products`
  );

  return record.products as T[];
}

// Retrieve last catalog update time

export async function getCatalogUpdatedAt(
  storeId: string
): Promise<number | null> {
  const db = await getPosDatabase();

  const record = await db.get(
    "catalog",
    storeId
  );

  return record?.updatedAt ?? null;
}

// Delete catalog for a specific store

export async function clearCatalog(
  storeId: string
): Promise<void> {
  const db = await getPosDatabase();

  await db.delete("catalog", storeId);

  console.info(
    "[IndexedDB] Cached catalog cleared"
  );
}

// Check whether cached catalog exists

export async function hasCachedCatalog(
  storeId: string
): Promise<boolean> {
  const db = await getPosDatabase();

  const record = await db.get(
    "catalog",
    storeId
  );

  return record !== undefined;
}