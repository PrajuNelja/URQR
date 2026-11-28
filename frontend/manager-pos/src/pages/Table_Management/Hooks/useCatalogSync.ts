import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../../lib/authStore";
import { getCatalog, saveCatalog } from "../../../lib/indexedDB/catalogStorage";
import { POS_CATALOG_QUERY_KEY } from "../../../queryClient";
import type { Dish } from "../Types/billing.types";

// Only successful API responses are written to IndexedDB.
// Cached data is never written back as though it were fresh.
async function fetchCatalog(signal: AbortSignal, token: string): Promise<Dish[]> {
  const endpoint = import.meta.env.DEV ? "/api/catalog" : "/api/products";
  const response = await fetch(endpoint, {
    signal,
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new CatalogHttpError(response.status);
  }
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error("Invalid catalog response");
  const seen = new Set<number>();
  return data.map((value: unknown): Dish => {
    if (typeof value !== "object" || value === null) {
      throw new Error("Invalid catalog product");
    }
    const item = value as Record<string, unknown>;
    const id = typeof item.id === "number" || typeof item.id === "string" && item.id.trim() !== "" ? Number(item.id) : NaN;
    const price = typeof item.price === "number" || typeof item.price === "string" && item.price.trim() !== "" ? Number(item.price) : NaN;
    if (!Number.isSafeInteger(id) || id <= 0 || seen.has(id) || !Number.isFinite(price) || price < 0 || typeof item.name !== "string" || !item.name.trim()) {
      throw new Error("Invalid catalog product identity or price");
    }
    seen.add(id);
    return {
      id,
      name: item.name,
      category: typeof item.category === "string" ? item.category : "Main Course",
      description: typeof item.description === "string" ? item.description : "",
      price,
      stock: typeof item.stock === "number" ? item.stock : undefined,
      lowStockThreshold: typeof item.lowStockThreshold === "number" ? item.lowStockThreshold : undefined,
      imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : undefined,
    };
  });
}

class CatalogHttpError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Catalog request failed (${status})`);
    this.status = status;
  }
}

export function useCatalogSync() {
  const tenantId = useAuthStore((state) => state.tenantId);
  const token = useAuthStore((state) => state.accessToken);
  // The existing auth store exposes tenantId, not a separate outlet ID.
  const storeId = tenantId ? `${import.meta.env.DEV ? "dev" : "prod"}:${tenantId}` : null;

  return useQuery<Dish[]>({
    queryKey: [...POS_CATALOG_QUERY_KEY, storeId],
    enabled: Boolean(storeId && token),
    networkMode: "always",
    refetchOnReconnect: "always",
    refetchOnMount: "always",
    retry: false,
    queryFn: async ({ signal }) => {
      if (!storeId || !token) throw new Error("Catalog requires an authenticated tenant");
      try {
        if (!navigator.onLine) throw new TypeError("Offline");
        const products = await fetchCatalog(signal, token);
        if (signal.aborted) throw new Error("Catalog request cancelled");
        try {
          await saveCatalog(storeId, products);
          console.info(`[CATALOG SYNC] Saved ${products.length} fresh products for ${storeId}`);
        } catch (error) {
          console.error("[CATALOG SYNC] IndexedDB write failed", error);
        }
        return products;
      } catch (error) {
        if (signal.aborted) throw error;
        // Do not use cached data to bypass authentication or other 4xx failures.
        if (!(error instanceof TypeError) && !(error instanceof CatalogHttpError && error.status >= 500)) throw error;
        const cached = await getCatalog<Dish>(storeId);
        if (cached !== null) {
          console.info(`[CATALOG SYNC] Loaded ${cached.length} cached products from IndexedDB`);
          return cached;
        }
        throw error;
      }
    },
  });
}
