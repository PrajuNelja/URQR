
import { Card } from "../../../../components/DataCard/Card";
import { Tabs } from "../../../../components/Header/Tabs";
import { ProductCard } from "../../../../components/DataCard/ProductCard";

import { CATEGORIES } from "../../Config/billing.config";
import type { Dish } from "../../Types/billing.types";

export interface BillingCatalogProps {
  searchQuery: string;
  setSearchQuery?: (value: string) => void;
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
  const selected = CATEGORIES.find(
    (category) => category.key === activeTab
  );

  return (
    <Card
      as="section"
      padding="none"
      className="urqr-billing-catalog"
    >
      <div className="urqr-billing-catalog-head">
        {/* CATEGORY TABS */}
        <nav
          className="urqr-billing-category-scroll"
          aria-label="Dish categories"
        >
          <Tabs
            className="urqr-billing-tabs"
            items={CATEGORIES}
            value={activeTab}
            onChange={setActiveTab}
          />
        </nav>

        {/* CATEGORY TITLE AND COUNT */}
        <div className="urqr-billing-catalog-heading">
          <h2>
            {activeTab === "all"
              ? "All items"
              : selected?.label ?? "Items"}
          </h2>

          <span>
            {filteredDishes.length} products
          </span>
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div
        className="urqr-billing-product-grid grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4"
        role="region"
        aria-label="Product Catalog Grid"
      >
        {filteredDishes.length === 0 ? (
          <p
            className="urqr-billing-no-results"
            role="status"
          >
            {searchQuery
              ? `No products match “${searchQuery}”`
              : "No products in this category"}
          </p>
        ) : (
          filteredDishes.map((dish) => {
            const stock = dish.stock;

            const stockState =
              stock === 0
                ? "sold-out"
                : stock !== undefined &&
                    stock <=
                      (dish.lowStockThreshold ?? 5)
                  ? "low-stock"
                  : "in-stock";

            return (
              <ProductCard
                key={dish.id}
                name={dish.name}
                pricePaise={Math.round(
                  dish.price * 100
                )}
                imageUrl={dish.imageUrl}
                stockState={stockState}
                stock={stock}
                inCartQuantity={
                  cart[dish.id] ?? 0
                }
                maxQuantity={Math.min(
                  15,
                  stock ?? 15
                )}
                onAdd={() => addToCart(dish.id)}
              />
            );
          })
        )}
      </div>
    </Card>
  );
}
