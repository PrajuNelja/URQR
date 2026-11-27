// src/pages/Table_Management/Components/Billing/BillingSkeleton.tsx

/**
 * ProductCardSkeleton
 * Matches the exact 210px height, 16px radius, and layout of ProductCard.tsx
 * with floating shimmer sweep animation.
 */
export function ProductCardSkeleton() {
  return (
    <div
      className="pos-product-card flex flex-col justify-between p-3.5 bg-surface border border-border rounded-[16px] h-[210px] overflow-hidden"
      aria-hidden="true"
    >
      {/* IMAGE PLACEHOLDER WITH FLOATING SHIMMER */}
      <div className="h-[80px] w-full rounded-[12px] billing-skeleton-pulse shrink-0" />

      {/* DETAILS PLACEHOLDER */}
      <div className="flex-1 flex flex-col justify-between mt-2.5 min-h-0">
        <div className="space-y-2">
          {/* TITLE PLACEHOLDER */}
          <div className="h-4 w-3/4 rounded-md billing-skeleton-pulse" />

          {/* PRICE + BADGE PLACEHOLDER */}
          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="h-3.5 w-1/3 rounded-md billing-skeleton-pulse" />
            <div className="h-4 w-16 rounded-full billing-skeleton-pulse" />
          </div>
        </div>

        {/* BUTTON PLACEHOLDER */}
        <div className="h-[32px] w-full rounded-[8px] billing-skeleton-pulse mt-2 shrink-0" />
      </div>
    </div>
  );
}

interface BillingCatalogSkeletonProps {
  count?: number;
}

/**
 * BillingCatalogSkeleton
 * Full skeleton for menu items catalog:
 * - Category tab pills matching realistic widths (85px, 110px, 95px...)
 * - Heading and product count placeholders
 * - Multi-column responsive product card grid
 */
export function BillingCatalogSkeleton({ count = 8 }: BillingCatalogSkeletonProps) {
  // Pill widths mapped directly to the actual categories (All items, Starters, Main Course, Beverages, Desserts, Breads)
  const categoryPillWidths = [85, 85, 110, 95, 90, 80, 100];
  const itemsCount = Math.max(8, count);

  return (
    <div
      className="urqr-billing-catalog flex flex-col h-full w-full bg-bg"
      aria-label="Loading catalog"
    >
      {/* HEAD SKELETON */}
      <div className="urqr-billing-catalog-head">
        {/* REALISTIC CATEGORY TAB PILLS SKELETON */}
        <div
          className="flex gap-2 overflow-x-hidden pb-2"
          aria-label="Loading category pills"
        >
          {categoryPillWidths.map((width, i) => (
            <div
              key={i}
              style={{ width: `${width}px` }}
              className="h-[34px] shrink-0 rounded-lg border border-border/50 billing-skeleton-pulse"
            />
          ))}
        </div>

        {/* HEADING PLACEHOLDER */}
        <div className="flex items-center justify-between mt-4">
          <div className="h-6 w-32 rounded-md billing-skeleton-pulse" />
          <div className="h-4 w-20 rounded-md billing-skeleton-pulse" />
        </div>
      </div>

      {/* GRID SKELETON WITH FLOATING CARDS */}
      <div className="urqr-billing-product-grid">
        {Array.from({ length: itemsCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

interface OrderSummarySkeletonProps {
  itemCount?: number;
}

/**
 * OrderSummarySkeleton
 * Matches the exact layout of BillingCart + OrderTotals in the right column
 */
export function OrderSummarySkeleton({ itemCount = 3 }: OrderSummarySkeletonProps) {
  const count = Math.max(1, itemCount);

  return (
    <aside
      className="urqr-billing-summary flex flex-col h-full bg-surface border-l border-border"
      aria-label="Loading order summary"
    >
      {/* HEADER SKELETON */}
      <div className="urqr-billing-cart-heading flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-5 w-32 rounded-md billing-skeleton-pulse" />
          <div className="h-3.5 w-24 rounded-md billing-skeleton-pulse" />
        </div>
        <div className="h-6 w-28 rounded-full billing-skeleton-pulse" />
      </div>

      {/* CART ITEMS SKELETON */}
      <div className="urqr-billing-cart-items space-y-3.5 flex-1 p-6">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 pb-3 border-b border-border/40"
          >
            <div className="w-9 h-9 rounded-[8px] billing-skeleton-pulse shrink-0" />
            <div className="flex-1 space-y-1.5 min-w-0">
              <div className="h-3.5 w-3/4 rounded-md billing-skeleton-pulse" />
              <div className="h-3 w-1/3 rounded-md billing-skeleton-pulse" />
            </div>
            <div className="h-6 w-16 rounded-md billing-skeleton-pulse shrink-0" />
          </div>
        ))}
      </div>

      {/* FOOTER SKELETON */}
      <div className="urqr-billing-summary-footer p-6 border-t border-border bg-surface-alt space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-3.5 w-16 rounded-md billing-skeleton-pulse" />
            <div className="h-3.5 w-16 rounded-md billing-skeleton-pulse" />
          </div>
          <div className="flex justify-between">
            <div className="h-3.5 w-20 rounded-md billing-skeleton-pulse" />
            <div className="h-3.5 w-14 rounded-md billing-skeleton-pulse" />
          </div>
          <div className="flex justify-between pt-2 border-t border-border/40">
            <div className="h-5 w-24 rounded-md billing-skeleton-pulse" />
            <div className="h-6 w-28 rounded-md billing-skeleton-pulse" />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <div className="h-10 flex-1 rounded-lg billing-skeleton-pulse" />
          <div className="h-10 flex-1 rounded-lg billing-skeleton-pulse" />
        </div>
        <div className="h-12 w-full rounded-lg billing-skeleton-pulse" />
      </div>
    </aside>
  );
}
