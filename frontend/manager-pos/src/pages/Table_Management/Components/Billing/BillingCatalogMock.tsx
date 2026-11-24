import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { fetchProducts } from "./catalogApi";
import { BillingProductCard } from "./BillingProductCard";

// These tabs are display-only until filtering is implemented.
const categories = [
  "All",
  "Starters",
  "Main Course",
  "Desserts",
  "Beverages",
];

export function BillingCatalogMock() {
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

  return (
    <section className="flex min-w-0 flex-col rounded-md border border-[#e4d5bd] bg-[#fffaf2] p-5 lg:min-h-0">
      <div className="mb-4">
        <h2 className="font-serif text-2xl font-bold text-[#30261d]">
          1. Menu & Dish Catalog
        </h2>
      </div>

      <div className="mb-4 flex items-center gap-3 rounded-sm border border-[#e4d5bd] bg-white px-4 py-4">
        <Search size={20} className="text-[#91816c]" />
        <span className="text-sm text-gray-400">
          Search dishes, beverages...
        </span>
      </div>

      <div className="mb-5 flex shrink-0 gap-2 overflow-x-auto pb-1">
        {categories.map((category) => (
          <span
            key={category}
            className={`shrink-0 rounded-sm border px-4 py-2 text-sm font-semibold ${
              category === "All"
                ? "border-[#2d241b] bg-[#2d241b] text-white"
                : "border-[#e4d5bd] bg-[#fffaf2] text-[#30261d]"
            }`}
          >
            {category}
          </span>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-3 overflow-y-auto pr-1 sm:grid-cols-3 xl:grid-cols-4">
        {isPending ? (
          <p role="status" className="col-span-full p-4 text-sm text-gray-500">
            Loading products...
          </p>
        ) : isError ? (
          <div role="alert" className="col-span-full rounded-md border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error.message}</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 rounded-sm bg-[#2d241b] px-4 py-2 text-sm font-semibold text-white"
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <p className="col-span-full p-4 text-sm text-gray-500">
            No products available.
          </p>
        ) : (
          products.map((product) => (
            <BillingProductCard key={product.id} product={product} />
          ))
        )}
      </div>
    </section>
  );
}
