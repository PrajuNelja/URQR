import { Package } from "lucide-react";
import type { CatalogProduct } from "./catalogApi";

interface Props {
  product: CatalogProduct;
}

export function BillingProductCard({ product }: Props) {
  return (
    <div className="min-w-0 rounded-md border border-[#e4d5bd] bg-white p-3 text-center shadow-sm">
      <div className="mx-auto mb-3 flex h-20 w-full items-center justify-center rounded-md bg-[#f5efe6]">
        <Package size={30} className="text-[#91816c]" />
      </div>
      <h3 className="truncate text-sm font-semibold text-[#30261d]">
        {product.name}
      </h3>
      <p className="mt-1 text-xs text-[#91816c]">
        {product.category ?? "Demo Product"}
      </p>
      <p className="mt-3 text-base font-bold text-[#30261d]">
        ₹{product.price.toLocaleString("en-IN")}
      </p>
    </div>
  );
}
