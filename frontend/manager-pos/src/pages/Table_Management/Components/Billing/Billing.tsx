import { Link } from "@tanstack/react-router";
import { Package, Search, ShoppingCart } from "lucide-react";

// Temporary product data
const products = [
  { id: 1, name: "Coffee", price: 80, category: "Beverages" },
  { id: 2, name: "Burger", price: 150, category: "Fast Food" },
  { id: 3, name: "Pizza", price: 250, category: "Fast Food" },
  { id: 4, name: "Tea", price: 40, category: "Beverages" },
  { id: 5, name: "Sandwich", price: 120, category: "Snacks" },
  { id: 6, name: "Juice", price: 100, category: "Beverages" },
];

const categories = ["All", "Starters", "Main Course", "Desserts", "Beverages"];

// --------------------------------------------------
// HEADER - Temporary Grand Horizon Design
// --------------------------------------------------

function Header() {
  return (
    <header className="flex w-full shrink-0 flex-wrap items-center justify-between gap-4 bg-[#f5efe6] px-4 py-5 text-[#30261d] lg:px-7">
      {/* Logo and Branding */}
      <div className="flex items-center gap-4">
        <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-sm bg-[#2d241b] text-2xl text-white">✦</div>
        <div>
          <h1 className="font-serif text-xl font-bold leading-tight text-[#30261d] lg:text-2xl">GRAND HORIZON</h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-[#91816c]">Operations Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <nav aria-label="POS navigation" className="flex flex-wrap items-center gap-3">
        <Link to="/pos/billing" aria-current="page" className="rounded-sm bg-[#2d241b] px-5 py-3 text-sm font-semibold text-white">
          Billing POS
        </Link>
        <Link to="/dashboard" className="rounded-sm px-5 py-3 text-sm font-semibold text-[#30261d] transition-colors hover:bg-[#e9ddcc]">
          Dashboard
        </Link>
        <Link to="/login" className="rounded-sm border border-[#dfcdb4] px-5 py-3 text-sm font-semibold text-[#30261d] transition-colors hover:bg-[#e9ddcc]">
          Logout
        </Link>
      </nav>
    </header>
  );
}

// --------------------------------------------------
// LEFT PANEL - PRODUCT CATALOG (60%)
// --------------------------------------------------

function ProductCatalog() {
  return (
    <section className="flex min-w-0 flex-col rounded-md border border-[#e4d5bd] bg-[#fffaf2] p-5 lg:min-h-0">
      {/* Catalog Header */}
      <div className="mb-4">
        <h2 className="font-serif text-2xl font-bold text-[#30261d]">1. Menu & Dish Catalog</h2>
      </div>

      {/* Search Bar - Visual Placeholder */}
      <div className="mb-4 flex items-center gap-3 rounded-sm border border-[#e4d5bd] bg-white px-4 py-4">
        <Search size={20} className="text-[#91816c]" />
        <span className="text-sm text-gray-400">Search dishes, beverages...</span>
      </div>

      {/* Category Navigation - Display Only */}
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

      {/* Product Grid */}
      <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-3 overflow-y-auto pr-1 sm:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <div key={product.id} className="min-w-0 rounded-md border border-[#e4d5bd] bg-white p-3 text-center shadow-sm">
            {/* Product Icon */}
            <div className="mx-auto mb-3 flex h-20 w-full items-center justify-center rounded-md bg-[#f5efe6]">
              <Package size={30} className="text-[#91816c]" />
            </div>
            {/* Product Name */}
            <h3 className="truncate text-sm font-semibold text-[#30261d]">{product.name}</h3>
            {/* Category */}
            <p className="mt-1 text-xs text-[#91816c]">{product.category}</p>
            {/* Price */}
            <p className="mt-3 text-base font-bold text-[#30261d]">₹{product.price}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// --------------------------------------------------
// RIGHT PANEL - ACTIVE ORDER CART (40%)
// --------------------------------------------------

function ActiveOrderCart() {
  return (
    <aside className="flex min-w-0 flex-col rounded-md border border-[#e4d5bd] bg-[#fffaf2] p-5 lg:min-h-0">
      {/* Cart Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4d5bd] pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#30261d]">2. Order Details / Cart</h2>
          <p className="mt-1 text-xs text-[#91816c]">0 items in cart</p>
        </div>
        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded-sm border border-[#e4d5bd] px-4 py-2 text-sm font-semibold text-[#91816c] opacity-70"
        >
          Clear Cart
        </button>
      </div>

      {/* Empty Cart */}
      <div className="flex min-h-48 flex-1 flex-col items-center justify-center overflow-y-auto py-8 text-center lg:min-h-0">
        <ShoppingCart size={45} className="mb-4 text-[#d3c2a9]" />
        <p className="font-medium text-[#30261d]">Your cart is empty</p>
        <p className="mt-2 text-sm text-[#91816c]">Add dishes from the catalog.</p>
      </div>

      {/* Order Summary */}
      <div className="shrink-0 border-t border-[#e4d5bd] pt-4">
        {/* Subtotal */}
        <div className="mb-3 flex justify-between text-sm text-[#30261d]">
          <span>Subtotal</span>
          <span>₹0.00</span>
        </div>
        {/* Tax */}
        <div className="mb-3 flex justify-between text-sm text-[#30261d]">
          <span>Tax</span>
          <span>₹0.00</span>
        </div>
        {/* Grand Total */}
        <div className="flex justify-between border-t border-[#e4d5bd] pt-4 text-lg font-bold text-[#30261d]">
          <span>Grand Total</span>
          <span>₹0.00</span>
        </div>
      </div>
    </aside>
  );
}

// --------------------------------------------------
// MAIN BILLING PAGE
// --------------------------------------------------

export default function Billing() {
  return (
    <main className="flex min-h-dvh w-full flex-col bg-[#f5efe6] lg:h-dvh lg:overflow-hidden">
      <Header />
      <div className="grid w-full flex-1 grid-cols-1 gap-4 px-4 pb-4 lg:min-h-0 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:px-7">
        <ProductCatalog />
        <ActiveOrderCart />
      </div>
    </main>
  );
}