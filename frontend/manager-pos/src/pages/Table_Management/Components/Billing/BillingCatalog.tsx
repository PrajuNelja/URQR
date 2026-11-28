
import { useRef, useState } from "react";
import { AlertCircle, Search, UtensilsCrossed } from "lucide-react";

import { Card } from "../../../../components/DataCard/Card";
import { Tabs } from "../../../../components/Header/Tabs";
import { ProductCard } from "../../../../components/DataCard/ProductCard";

import { CATEGORIES } from "../../Config/billing.config";
import type { Dish } from "../../Types/billing.types";
import { BillingCatalogSkeleton } from "./BillingSkeleton";

interface BillingCatalogProps {
  searchQuery: string;
  setSearchQuery?: (value: string) => void;
  activeTab: string;
  setActiveTab: (value: string) => void;
  filteredDishes: Dish[];
  addToCart: (dishId: number) => void | Promise<void>;
  cart: Record<number, number>;
  isLoading?: boolean;
}

export function BillingCatalog({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  filteredDishes,
  addToCart,
  cart,
  isLoading = false,
}: BillingCatalogProps) {
  const selectedCategory = CATEGORIES.find(
    (category) => category.key === activeTab
  );

  // LOADING STATE
  const [loadingIds, setLoadingIds] = useState<number[]>([]);

  // PREVENT DUPLICATE API REQUESTS
  const pendingRequests = useRef(new Set<number>());

  // ADD PRODUCT TO CART
  const handleAddToCart = async (dishId: number) => {
    if (pendingRequests.current.has(dishId)) return;

    // Mark request as pending immediately
    pendingRequests.current.add(dishId);

    // SHOW LOADING BUTTON
    setLoadingIds((prev) => [...prev, dishId]);

    try {
      // WAIT FOR ACTUAL BACKEND RESPONSE
      await addToCart(dishId);

      // Cart update should happen after successful API response
    } catch (error) {
      console.error(
        `Failed to add product ${dishId} to cart:`,
        error
      );

      // Request failed. User can try adding again.
    } finally {
      // REMOVE LOADING STATE
      pendingRequests.current.delete(dishId);

      setLoadingIds((prev) =>
        prev.filter((id) => id !== dishId)
      );
    }
  };

  if (isLoading) {
    return <BillingCatalogSkeleton count={filteredDishes.length || 8} />;
  }

  const allSoldOut =
    filteredDishes.length > 0 &&
    filteredDishes.every((dish) => dish.stock === 0);

  return (
    <Card
      as="section"
      padding="none"
      className="urqr-billing-catalog"
    >

      {/* CATEGORY TABS */}
      <div className="urqr-billing-catalog-head">

        <nav
          className="urqr-billing-category-scroll"
          aria-label="Dish categories"
        >
          <Tabs
            items={CATEGORIES}
            value={activeTab}
            onChange={setActiveTab}
            className="urqr-billing-tabs"
          />
        </nav>

        {/* CATEGORY HEADING */}
        <div className="urqr-billing-catalog-heading">
          <h2>
            {activeTab === "all"
              ? "All items"
              : selectedCategory?.label ?? "Items"}
          </h2>

          <span>
            {filteredDishes.length} products
          </span>
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div
        role="region"
        aria-label="Product Catalog Grid"
        className="
          grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4
          urqr-billing-product-grid
        "
      >
        {allSoldOut && (
          <div
            role="status"
            className="col-span-full mb-2 flex items-center justify-between gap-3 rounded-xl border border-warning/40 bg-warning-bg px-4 py-3 text-xs font-medium text-warning"
          >
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-warning" />
              <span>All items in this category are currently sold out.</span>
            </div>
            {activeTab !== "all" && (
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className="font-semibold underline hover:no-underline"
              >
                View all items
              </button>
            )}
          </div>
        )}

        {filteredDishes.length === 0 ? (
          <div
            className="col-span-full flex flex-col items-center justify-center py-16 px-6 text-center my-auto min-h-[360px]"
            role="status"
          >
            {/* BRAND LOGO MARK */}
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-alt border border-border text-primary shadow-sm mb-4">
              {searchQuery ? (
                <Search size={26} className="text-primary" aria-hidden="true" />
              ) : (
                <UtensilsCrossed size={26} className="text-primary" aria-hidden="true" />
              )}
            </div>

            {/* BRAND EYEBROW */}
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>GRAND HORIZON</span>
            </div>

            {/* TITLE */}
            <h3 className="text-lg font-bold text-text sm:text-xl">
              {searchQuery
                ? `No products match "${searchQuery}"`
                : `No dishes in ${selectedCategory?.label ?? "this category"}`}
            </h3>

            {/* SUBTITLE */}
            <p className="mt-1.5 max-w-sm text-sm text-text-secondary leading-relaxed">
              {searchQuery
                ? "Try checking your spelling or search with a different keyword."
                : "There are currently no items available in this category. Select another category or view all items."}
            </p>

            {/* ACTION BUTTON */}
            {searchQuery && setSearchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-5 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-dark"
              >
                Clear Search
              </button>
            ) : activeTab !== "all" ? (
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className="mt-5 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-dark"
              >
                View All Items
              </button>
            ) : null}
          </div>
        ) : (
          filteredDishes.map((dish) => {
            const availableStock = dish.stock;

            // STOCK STATUS
            const stockState =
              availableStock === 0
                ? "sold-out"
                : availableStock !== undefined &&
                    availableStock <=
                      (dish.lowStockThreshold ?? 5)
                  ? "low-stock"
                  : "in-stock";

            // MAXIMUM CART QUANTITY
            const maxQuantity = Math.min(
              15,
              availableStock ?? 15
            );

            return (
              <ProductCard
                key={dish.id}
                name={dish.name}
                pricePaise={Math.round(
                  dish.price * 100
                )}
                imageUrl={dish.imageUrl}
                stockState={stockState}
                stock={dish.stock}
                inCartQuantity={cart[dish.id] ?? 0}
                maxQuantity={maxQuantity}

                // LOADING STATE FOR EACH PRODUCT
                isLoading={loadingIds.includes(dish.id)}

                // ACTUAL API HANDLER
                onAdd={() => handleAddToCart(dish.id)}
              />
            );
          })
        )}
      </div>
    </Card>
  );
}

export default BillingCatalog;
