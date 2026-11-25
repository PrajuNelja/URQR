
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Card } from "../../../../components/DataCard/Card";
import { ProductCard } from "../../../../components/DataCard/ProductCard";
import { Tabs } from "../../../../components/Header/Tabs";
import { IconButton } from "../../../../components/Buttons/IconButton";

import { CATEGORIES } from "../../Config/billing.config";
import type { Dish } from "../../Types/billing.types";

export interface BillingCatalogProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filteredDishes: Dish[];
  addToCart: (id: number) => void;
  cart?: Record<number, number>;
  className?: string;
}

export function BillingCatalog({
  searchQuery,
  activeTab,
  setActiveTab,
  filteredDishes,
  addToCart,
  cart = {},
  className = "",
}: BillingCatalogProps) {
  const categoriesRef = useRef<HTMLDivElement>(null);

  return (
    <Card
      as="section"
      padding="none"
      className={`flex h-full min-h-0 min-w-0 flex-col !rounded-none !border-0 !bg-bg !shadow-none ${className}`}
    >
      {/* CATEGORY NAVIGATION */}
      <div className="shrink-0 space-y-4 px-5 pb-4 pt-4">
        <div className="flex items-center gap-2">
          <IconButton
            label="Scroll categories left"
            icon={<ChevronLeft size={16} />}
            size="sm"
            variant="outline"
            onClick={() =>
              categoriesRef.current?.scrollBy({
                left: -220,
                behavior: "smooth",
              })
            }
          />

          <div
            ref={categoriesRef}
            className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <Tabs
              className="urqr-billing-tabs"
              items={CATEGORIES}
              value={activeTab}
              onChange={setActiveTab}
            />
          </div>

          <IconButton
            label="Scroll categories right"
            icon={<ChevronRight size={16} />}
            size="sm"
            variant="outline"
            onClick={() =>
              categoriesRef.current?.scrollBy({
                left: 220,
                behavior: "smooth",
              })
            }
          />
        </div>

        {/* ACTIVE CATEGORY AND PRODUCT COUNT */}
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[15px] font-semibold text-text">
            {activeTab === "all"
              ? "All items"
              : CATEGORIES.find(
                  (category) => category.key === activeTab
                )?.label ?? "Items"}
          </h2>

          <span className="shrink-0 text-xs text-text-muted">
            {filteredDishes.length} products
          </span>
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div
        role="region"
        aria-label="Product catalog"
        className="grid min-h-0 flex-1 grid-cols-1 content-start gap-3.5 overflow-y-auto px-5 pb-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
      >
        {filteredDishes.length === 0 ? (
          <div
            className="col-span-full py-14 text-center text-sm text-text-muted"
            role="status"
          >
            No products match{" "}
            {searchQuery
              ? `“${searchQuery}”`
              : "this category"}
            .
          </div>
        ) : (
          filteredDishes.map((dish) => {
            const stock = dish.stock;

            const stockState =
              stock === 0
                ? ("sold-out" as const)
                : stock !== undefined &&
                    stock <= (dish.lowStockThreshold ?? 5)
                  ? ("low-stock" as const)
                  : ("in-stock" as const);

            return (
              <ProductCard
                key={dish.id}
                name={dish.name}
                pricePaise={Math.round(dish.price * 100)}
                imageUrl={dish.imageUrl}
                stockState={stockState}
                inCartQuantity={cart[dish.id] ?? 0}
                maxQuantity={Math.min(15, stock ?? 15)}
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
