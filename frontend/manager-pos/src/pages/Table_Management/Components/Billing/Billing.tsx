import { useState } from "react";
import { AppShell } from "../../../../components/Header/AppShell";
import { Header } from "../../../../components/Header/Header";
import { Logo } from "../../../../components/Logo/Logo";
import { Avatar } from "../../../../components/DataCard/Avatar";
import { Button } from "../../../../components/Buttons/Button"; 
import { LogOut } from "lucide-react";
import { BillingCatalog } from "./BillingCatalog";
import { BillingCart } from "./BillingCart";
import { BillingPayment } from "./BillingPayment";
import { BillingReceiptModal } from "./BillingReceiptModal";
import { useBilling } from "../../Hooks/useBilling";

export const Billing = () => {
  const b = useBilling();
  const [note, setNote] = useState("");
  const [activeNav, setActiveNav] = useState("billing");

  return (
    <AppShell
      maxWidth="xl"
      header={
        <Header
          variant="dashboard"
          title="Grand Horizon"
          subtitle="Operations Dashboard"
          logo={<Logo size="md" />}
          navItems={[{ key: "billing", label: "Billing POS" }, { key: "dashboard", label: "Dashboard" }]}
          activeNav={activeNav}
          onNavChange={setActiveNav}
          actions={<><Avatar name="Manager" size="sm" /><Button variant="ghost" size="sm" leftIcon={<LogOut size={14} />}>Logout</Button></>}
        />
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_0.8fr] gap-4 items-start">
        <BillingCatalog
          searchQuery={b.searchQuery} setSearchQuery={b.setSearchQuery}
          activeTab={b.activeTab} setActiveTab={b.setActiveTab}
          filteredDishes={b.filteredDishes} addToCart={b.addToCart}
        />
        <BillingCart
          items={b.totals.items} updateQuantity={b.updateQuantity} clearCart={b.clearCart}
          note={note} setNote={setNote}
        />
        <BillingPayment
          subtotal={b.totals.subtotal} tax={b.totals.tax} total={b.totals.total}
          paymentMethod={b.paymentMethod} setPaymentMethod={b.setPaymentMethod}
          cashCollected={b.cashCollected} setCashCollected={b.setCashCollected}
          change={b.change} handleCompletePayment={b.handleCompletePayment}
          itemsCount={b.totals.items.length}
        />
        <BillingReceiptModal isOpen={b.isReceiptOpen} onClose={() => b.setIsReceiptOpen(false)} receipt={b.receipt} />
      </div>
    </AppShell>
  );
};

export default Billing;