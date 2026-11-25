
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useDebouncedValue } from "../../Hooks/useDebouncedValue";

import { fetchProducts } from "./catalogApi";
import { BillingProductCard } from "./BillingProductCard";

// Display-only category tabs
const categories = [
  "All",
  "Starters",
  "Main Course",
  "Desserts",
  "Beverages",
];

interface BillingCatalogMockProps {
  searchText: string;
}

export function BillingCatalogMock({
  searchText,
}: BillingCatalogMockProps) {
  const debouncedSearch = useDebouncedValue(
    searchText,
    300
  );

  const {
    data: products = [],
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["pos", "catalog", "products"],
    queryFn: fetchProducts,
  });

  // Search by product name only
  const filteredProducts = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();

    if (!query) return products;

    return products.filter((product) =>
      product.name.toLowerCase().includes(query)
    );
  }, [products, debouncedSearch]);

  return (
    <section className="flex min-w-0 flex-col rounded-lg border border-border-subtle bg-surface p-5 lg:min-h-0">

      {/* CATEGORIES */}
      <div className="mb-5 flex shrink-0 gap-2 overflow-x-auto pb-1">
        {categories.map((category) => (
          <span
            key={category}
            className={`shrink-0 rounded-md border px-4 py-2 text-sm font-semibold ${
              category === "All"
                ? "border-primary bg-primary text-white"
                : "border-border-subtle bg-surface text-primary"
            }`}
          >
            {category}
          </span>
        ))}
      </div>

      {/* CATALOG HEADING */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-primary">
          All Items
        </h2>

        <span className="text-xs text-text-muted">
          {filteredProducts.length} products
        </span>
      </div>

      {/* PRODUCT GRID */}
      <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-3 overflow-y-auto pr-1 sm:grid-cols-3 xl:grid-cols-4">

        {isPending ? (
          <p role="status" className="col-span-full p-4 text-sm text-text-muted">
            Loading products...
          </p>

        ) : isError ? (
          <div
            role="alert"
            className="col-span-full rounded-md border border-error-text bg-error-bg p-4"
          >
            <p className="text-sm text-error-text">
              {error.message}
            </p>

            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white"
            >
              Retry
            </button>
          </div>

        ) : products.length === 0 ? (
          <p className="col-span-full p-4 text-sm text-text-muted">
            No products available.
          </p>

        ) : filteredProducts.length === 0 ? (
          <p
            role="status"
            className="col-span-full p-4 text-center text-sm text-text-muted"
          >
            No products match your search.
          </p>

        ) : (
          filteredProducts.map((product) => (
            <BillingProductCard
              key={product.id}
              product={product}
            />
          ))
        )}
      </div>
    </section>
  );
}
