
import { Card } from "../../../../components/DataCard/Card";
import { Tabs } from "../../../../components/Header/Tabs";
import { ProductCard } from "../../../../components/DataCard/ProductCard";

import { CATEGORIES } from "../../Config/billing.config";
import type { Dish } from "../../Types/billing.types";

interface BillingCatalogProps {
  searchQuery: string;
  activeTab: string;
  setActiveTab: (value: string) => void;
  filteredDishes: Dish[];
  addToCart: (dishId: number) => void;
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

      {/* REUSABLE PRODUCT CARDS */}
      <div
        className="urqr-billing-product-grid"
        aria-label="Products"
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

            // Determine stock status
            const stockState =
              availableStock === 0
                ? "sold-out"
                : availableStock !== undefined &&
                    availableStock <=
                      (dish.lowStockThreshold ?? 5)
                  ? "low-stock"
                  : "in-stock";

            // Maximum allowed cart quantity
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
                inCartQuantity={
                  cart[dish.id] ?? 0
                }
                maxQuantity={maxQuantity}
                onAdd={() => addToCart(dish.id)}
              />
            );
          })
        )}
      </div>
    </Card>
  );
}

export default BillingCatalog;
