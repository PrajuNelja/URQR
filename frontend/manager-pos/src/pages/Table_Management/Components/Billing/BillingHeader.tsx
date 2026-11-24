import { Link } from "@tanstack/react-router";

// Temporary Grand Horizon branding from the current Billing page.
export function BillingHeader() {
  return (
    <header className="flex w-full shrink-0 flex-wrap items-center justify-between gap-4 bg-[#f5efe6] px-4 py-5 text-[#30261d] lg:px-7">
      <div className="flex items-center gap-4">
        <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-sm bg-[#2d241b] text-2xl text-white">
          ✦
        </div>
        <div>
          <h1 className="font-serif text-xl font-bold leading-tight text-[#30261d] lg:text-2xl">
            GRAND HORIZON
          </h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-[#91816c]">
            Operations Dashboard
          </p>
        </div>
      </div>

      <nav aria-label="POS navigation" className="flex flex-wrap items-center gap-3">
        <Link
          to="/pos/billing"
          aria-current="page"
          className="rounded-sm bg-[#2d241b] px-5 py-3 text-sm font-semibold text-white"
        >
          Billing POS
        </Link>
        <Link
          to="/dashboard"
          className="rounded-sm px-5 py-3 text-sm font-semibold text-[#30261d] transition-colors hover:bg-[#e9ddcc]"
        >
          Dashboard
        </Link>
        <Link
          to="/login"
          className="rounded-sm border border-[#dfcdb4] px-5 py-3 text-sm font-semibold text-[#30261d] transition-colors hover:bg-[#e9ddcc]"
        >
          Logout
        </Link>
      </nav>
    </header>
  );
}
