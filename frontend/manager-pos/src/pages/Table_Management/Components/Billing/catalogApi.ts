// Small API module for the current MSW endpoint: GET /api/products.
export interface CatalogProduct {
  id: string;
  name: string;
  price: number; // The current mock returns rupee amounts.
  category?: string;
}

function isCatalogProduct(value: unknown): value is CatalogProduct {
  if (typeof value !== "object" || value === null) return false;

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    item.price >= 0 &&
    (item.category === undefined || typeof item.category === "string")
  );
}

export async function fetchProducts(): Promise<CatalogProduct[]> {
  const response = await fetch("/api/products");
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`);
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data) || !data.every(isCatalogProduct)) {
    throw new Error("Invalid product catalog response");
  }
  return data;
}
