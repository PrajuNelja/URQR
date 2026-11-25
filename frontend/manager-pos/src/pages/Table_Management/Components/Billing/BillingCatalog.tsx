import React from "react";
import { Card } from "../../../../components/DataCard/Card";
import { QuickItemSearchBar } from "../../../../components/InputField/QuickItemSearchBar";
import { Plus, AlertTriangle, CheckCircle2, Ban } from "lucide-react";
import { CATEGORIES } from "../../Config/billing.config";
import type { Dish } from "../../Types/billing.types";

export interface BillingCatalogProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeTab: string;
  setActiveTab: (t: string) => void;
  filteredDishes: Dish[];
  addToCart: (id: number) => void;
  cart?: Record<number, number>;
  className?: string;
}

/**
 * BillingCatalog — Screen 2 POS Menu & Catalog Grid.
 * - Responsive multi-column grid (2-cols mobile/tablet, 3-cols standard POS, 4-cols widescreen 1080p).
 * - Immediate 1-tap card click to append selected item to active cart.
 * - Comprehensive stock states (In Stock, Low Stock badge, Out-of-Stock disabled state).
 * - Active Cart quantity badges on cards.
 * - Smooth category navigation pills with zero layout jumping.
 */
export const BillingCatalog: React.FC<BillingCatalogProps> = ({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  filteredDishes,
  addToCart,
  cart = {},
  className = "",
}) => {
  return (
    <Card className={`h-full flex flex-col p-4 bg-[#fffaf2] border-[#e4d5bd] shadow-sm ${className}`}>
      {/* 1. Header with Catalog Title and Total Item Count */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h3 className="font-serif text-xl font-bold text-[#2d241b]">
          1. Menu & Dish Catalog
        </h3>
        <span className="text-xs font-semibold text-[#91816c] bg-[#f5efe6] px-2.5 py-1 rounded-md border border-[#e4d5bd]">
          {filteredDishes.length} items
        </span>
      </div>

      {/* 2. Quick-Item Search Bar with Barcode Scanner Support */}
      <div className="mb-3 shrink-0">
        <QuickItemSearchBar
          placeholder="Search dishes or scan barcode…"
          value={searchQuery}
          onSearchChange={setSearchQuery}
          onBarcodeScanned={(barcode) => {
            const found = filteredDishes.find(
              (d) =>
                String(d.id) === barcode.trim() ||
                d.name.toLowerCase().includes(barcode.toLowerCase().trim())
            );
            if (found && (found.stock === undefined || found.stock > 0)) {
              addToCart(found.id);
            }
          }}
        />
      </div>

      {/* 3. Category Horizontal Scroll Navigation (Zero Layout Jumping) */}
      <nav
        aria-label="Dish categories"
        className="flex gap-2 overflow-x-auto pb-2 mb-3 shrink-0 scrollbar-none scroll-smooth"
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeTab.toLowerCase() === cat.key.toLowerCase();
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveTab(cat.key)}
              className={`h-9 shrink-0 flex items-center justify-center px-4 rounded-lg text-xs font-bold transition-all border select-none ${
                isActive
                  ? "bg-[#2d241b] text-white border-[#2d241b] shadow-sm scale-[1.02]"
                  : "bg-white text-[#705e4b] border-[#e4d5bd] hover:bg-[#f5efe6] active:bg-[#e9ddcc]"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </nav>

      {/* 4. Responsive Multi-Column Product Grid */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 overflow-y-auto flex-1 pr-1 pb-2 content-start"
        role="region"
        aria-label="Product Catalog Grid"
      >
        {filteredDishes.length === 0 ? (
          <div className="col-span-full py-12 text-center text-sm font-medium text-[#91816c]">
            No dishes found matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredDishes.map((dish) => {
            const cartQty = cart[dish.id] || 0;
            const stock = dish.stock;
            const isOutOfStock = stock === 0;
            const threshold = dish.lowStockThreshold ?? 5;
            const isLowStock = stock !== undefined && stock > 0 && stock <= threshold;

            return (
              <div
                key={dish.id}
                role="button"
                tabIndex={isOutOfStock ? -1 : 0}
                aria-disabled={isOutOfStock}
                onClick={() => {
                  if (!isOutOfStock) {
                    addToCart(dish.id);
                  }
                }}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !isOutOfStock) {
                    e.preventDefault();
                    addToCart(dish.id);
                  }
                }}
                className={`relative flex flex-col justify-between p-3.5 rounded-xl border transition-all duration-150 select-none ${
                  isOutOfStock
                    ? "bg-[#f9f7f4] border-[#e4d5bd] opacity-55 cursor-not-allowed grayscale-[40%]"
                    : cartQty > 0
                    ? "bg-[#fffdfa] border-[#a46714] ring-2 ring-[#a46714]/20 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-98"
                    : "bg-white border-[#e4d5bd] shadow-xs cursor-pointer hover:border-[#a46714] hover:shadow-md hover:-translate-y-0.5 active:scale-98"
                }`}
              >
                {/* Active Cart Quantity Badge */}
                {cartQty > 0 && (
                  <span className="absolute top-2.5 right-2.5 bg-[#2d241b] text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                    ×{cartQty}
                  </span>
                )}

                {/* Dish Information */}
                <div>
                  <h4 className="font-semibold text-sm text-[#2d241b] leading-snug line-clamp-2 pr-6">
                    {dish.name}
                  </h4>
                  <p className="text-[11px] text-[#91816c] line-clamp-2 mt-1 leading-normal">
                    {dish.description}
                  </p>
                </div>

                {/* Stock State Badges & Price Footer */}
                <div className="mt-3 pt-2 border-t border-[#f2e9dc] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-1">
                    {/* Stock Badges */}
                    {isOutOfStock ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#b3402a] bg-[#fbd9d6] px-1.5 py-0.5 rounded border border-[#f5c2be]">
                        <Ban size={10} />
                        Sold Out
                      </span>
                    ) : isLowStock ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#92400e] bg-[#fef3c7] px-1.5 py-0.5 rounded border border-[#fde68a]">
                        <AlertTriangle size={10} />
                        Only {stock} left
                      </span>
                    ) : stock !== undefined ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#2f7a45]">
                        <CheckCircle2 size={10} />
                        {stock} in stock
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#91816c]">In Stock</span>
                    )}

                    {/* Price */}
                    <span className="font-serif font-bold text-sm text-[#a46714]">
                      ₹{dish.price.toFixed(2)}
                    </span>
                  </div>

                  {/* 1-Tap Action Button */}
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isOutOfStock) addToCart(dish.id);
                    }}
                    className={`w-full h-8 mt-1 flex items-center justify-center gap-1 rounded-lg text-xs font-bold transition-all ${
                      isOutOfStock
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-[#2d241b] text-white hover:bg-[#433628] active:scale-95 shadow-xs"
                    }`}
                  >
                    <Plus size={13} />
                    {isOutOfStock ? "Out of Stock" : "ADD TO CART"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default BillingCatalog;
