
import { useRef, useState } from "react";

import { Card } from "../../../../components/DataCard/Card";
import { Tabs } from "../../../../components/Header/Tabs";
import { ProductCard } from "../../../../components/DataCard/ProductCard";

import { CATEGORIES } from "../../Config/billing.config";
import type { Dish } from "../../Types/billing.types";

interface BillingCatalogProps {
  searchQuery: string;
  setSearchQuery?: (value: string) => void;
  activeTab: string;
  setActiveTab: (value: string) => void;
  filteredDishes: Dish[];
  addToCart: (dishId: number) => void | Promise<void>;
  cart: Record<number, number>;
}

export function BillingCatalog({
  searchQuery,
  activeTab,
  setActiveTab,
  filteredDishes,
  addToCart,
  cart,
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
        {filteredDishes.length === 0 ? (
          <p
            className="urqr-billing-no-results"
            role="status"
          >
            {searchQuery
              ? `No products match "${searchQuery}"`
              : "No products in this category"}
          </p>
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
