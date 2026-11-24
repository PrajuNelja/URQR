// src/showcase/Showcase.tsx

import { useState } from "react";

import StatusBadge from "../StatusBadge/StatusBadge";
import IconButton from "../Buttons/IconButton";
import AppShell from "../Header/AppShell";
import Header from "../Header/Header";
import Logo from "../Logo/Logo";
import Avatar from "../DataCard/Avatar";
import Button from "../Buttons/Button";
import Notification from "../Notification/Notification";
import InputField from "../InputField/InputField";
import SearchInput from "../InputField/SearchInput";
import TextArea from "../InputField/TextArea";
import DateInput from "../InputField/DateInput";
import Tabs from "../Header/Tabs";
import SelectableGroup from "../Header/SelectableGroup";
import KPIStat from "../DataCard/KPIStat";
import DataCard from "../DataCard/DataCard";
import Card from "../DataCard/Card";
import Chart from "../DataCard/Chart";
import QuantityStepper from "../DataTable/QuantityStepper";
import Divider from "../DataCard/Divider";
import EmptyState from "../DataCard/EmptyState";
import DateRangePicker from "../DataTable/DateRangePicker";
import DataTable from "../DataTable/DataTable";
import PopupModal from "../PopupModal/PopupModal";
import Receipt from "../PopupModal/Receipt";
import Icon from "../DataCard/Icon";
import { Clock, Download, IndianRupeeIcon, LogOut, Save, Trash2 } from "lucide-react";
import { SessionTimeoutModal } from "../PopupModal/SessionTimeoutModal";



// ═══════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════

const MOCK_ORDERS = [
  { id: "ABC20261118001", customer: "John Doe", date: "18 Nov 2026", amount: "₹120.00", status: "paid" },
  { id: "ABC20261118002", customer: "Jane Smith", date: "18 Nov 2026", amount: "₹45.50", status: "pending" },
  { id: "ABC20261118003", customer: "Bob Lee", date: "17 Nov 2026", amount: "₹380.00", status: "cancelled" },
];

const TOP_ITEMS = [
  { name: "Veg Burger", qty: 142 },
  { name: "Chicken Pizza", qty: 108 },
  { name: "French Fries", qty: 97 },
  { name: "Cold Coffee", qty: 76 },
  { name: "Brownie", qty: 62 },
];

const PAYMENT_SPLIT = [
  { name: "UPI", value: 62 },
  { name: "Card", value: 24 },
  { name: "Cash", value: 14 },
];

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "starters", label: "Starters" },
  { key: "main", label: "Main Course" },
  { key: "desserts", label: "Desserts" },
  { key: "beverages", label: "Beverages" },
];

// ═══════════════════════════════════════════
// SHOWCASE
// ═══════════════════════════════════════════

export default function Showcase() {
  // State
  const [activeNav, setActiveNav] = useState("pos");
  const [cat, setCat] = useState("all");
  const [pay, setPay] = useState("cash");
  const [qty, setQty] = useState(1);
  const [range, setRange] = useState({ from: "2026-11-01", to: "2026-11-18" });
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [isReceiptOpen, setReceiptOpen] = useState(false);
   // ── NEW: Timeout Modal State ──
  const [isTimeoutOpen, setIsTimeoutOpen] = useState(false);

  const [notif, setNotif] = useState({
    isOpen: false,
    type: "success" as "success" | "error" | "info" | "warning",
    message: "",
  });

  const showNotif = (type: typeof notif.type, message: string) =>
    setNotif({ isOpen: true, type, message });

  // Table columns
  const orderColumns = [
    { key: "id", header: "Order ID" },
    { key: "customer", header: "Customer" },
    { key: "date", header: "Date" },
    { key: "amount", header: "Amount", align: "right" as const },
    {
      key: "status",
      header: "Status",
      render: (row: typeof MOCK_ORDERS[0]) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "",
      align: "right" as const,
      render: () => (
        <IconButton
          variant="outline"
          size="sm"
          label="View receipt"
          icon={<Icon name="Eye" size="sm" />}
        />
      ),
    },
  ];

  return (
    <AppShell
      maxWidth="xl"
      header={
        <Header
          variant="dashboard"
          title="Component Showcase"
          subtitle="Ivory Luxe theme"
          logo={<Logo size="md" />}
          navItems={[
            { key: "pos", label: "Billing POS" },
            { key: "dash", label: "Dashboard" },
          ]}
          activeNav={activeNav}
          onNavChange={setActiveNav}
          actions={
            <>
              <Avatar name="Manager" size="sm" />
              <Button variant="ghost" size="sm" leftIcon={<LogOut size={14} />}>
                Logout
              </Button>
            </>
          }
        />
      }
    >
      {/* Global single toast */}
      <Notification
        isOpen={notif.isOpen}
        type={notif.type}
        message={notif.message}
        onClose={() => setNotif((p) => ({ ...p, isOpen: false }))}
      />

      <div className="space-y-10">
        {/* 1. FOUNDATIONS */}
        <section>
          <h2 className="font-serif text-xl text-primary border-b border-border-subtle pb-2 mb-4">
            1. Logo
          </h2>
          <div className="flex flex-col gap-4">
            <Logo size="sm" />
            <Logo size="md" />
            <Logo size="lg" />
            <Logo size="md" variant="outline" showText={false} />
            <Logo size="md" label="GRAND HORIZON" subLabel="Operations Dashboard" />
          </div>
        </section>

        {/* 2. BUTTONS */}
        <section>
          <h2 className="font-serif text-xl text-primary border-b border-border-subtle pb-2 mb-4">
            2. Buttons
          </h2>
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger" leftIcon={<Trash2 size={14} />}>Danger</Button>
            <Button isLoading>Processing...</Button>
            <Button disabled>Disabled</Button>
            <Button variant="primary" leftIcon={<Save size={14} />}>Save</Button>
            <Button fullWidth size="lg">Full Width</Button>
          </div>
          <div className="flex gap-2 mt-4">
            <IconButton label="Eye" icon={<Icon name="Eye" />} />
            <IconButton variant="primary" label="Download" icon={<Download size={16} />} />
            <IconButton size="sm" label="Close" icon={<Icon name="X" size="sm" />} />
          </div>
        </section>

        {/* 3. INPUTS */}
        <section>
          <h2 className="font-serif text-xl text-primary border-b border-border-subtle pb-2 mb-4">
            3. Inputs
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <InputField label="MANAGER ID" placeholder="e.g., MGR-8902" />
            <InputField label="PASSWORD" type="password" placeholder="••••••••" />
            <SearchInput placeholder="Search dishes…" />
            <InputField label="Error" error="This field is required" placeholder="Invalid" />
            <TextArea label="NOTE" placeholder="e.g., no onions…" rows={2} />
            <DateInput label="Date" defaultValue="2026-11-18" />
          </div>
        </section>

        {/* 4. TABS + SELECTABLE GROUP */}
        <section>
          <h2 className="font-serif text-xl text-primary border-b border-border-subtle pb-2 mb-4">
            4. Tabs & Selectable Group
          </h2>
          <Tabs items={CATEGORIES} value={cat} onChange={setCat} />
          <p className="text-xs text-text-muted mt-1">Active: {cat}</p>

          <div className="mt-4 max-w-xs">
            <SelectableGroup
              options={[
                { value: "cash", label: "Cash" },
                { value: "upi", label: "UPI" },
                { value: "others", label: "Others" },
              ]}
              value={pay}
              onChange={setPay}
            />
            <p className="text-xs text-text-muted mt-2">Selected: {pay}</p>
          </div>
        </section>

        {/* 5. CARDS & KPI */}
        <section>
          <h2 className="font-serif text-xl text-primary border-b border-border-subtle pb-2 mb-4">
            5. Cards & KPI
          </h2>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <KPIStat label="Total Revenue" value="₹1,73,332" trend="+14%" icon={<Icon name="IndianRupee" size="lg" />} />
            <KPIStat label="Total Orders" value={897} trend="+11%" icon={<Icon name="ShoppingBag" size="lg" />} />
            <KPIStat label="Profit" value="₹25,995" trend="-3%" trendDirection="down" icon={<Icon name="TrendingUp" size="lg" />} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <DataCard
              variant="summary"
              title="Total Revenue"
              value="₹1,72,430"
              trend="↑ +14%"
              icon={<IndianRupeeIcon size={20} />}
            />
            <DataCard variant="info" title="Customer Info">
              <p className="text-sm"><span className="text-text-muted">Name:</span> John Doe</p>
              <p className="text-sm"><span className="text-text-muted">Phone:</span> +91 98765 43210</p>
            </DataCard>
          </div>
        </section>

        {/* 6. CHARTS */}
        <section>
          <h2 className="font-serif text-xl text-primary border-b border-border-subtle pb-2 mb-4">
            6. Charts (recharts)
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <h3 className="font-serif text-lg text-primary mb-2">Top 5 Selling Items</h3>
              <Chart type="bar" layout="vertical" data={TOP_ITEMS} xKey="name" series={[{ key: "qty", name: "Sold", color: "var(--color-chart-1)" }]} height={240} />
            </Card>
            <Card>
              <h3 className="font-serif text-lg text-primary mb-2">Payment Methods</h3>
              <Chart type="pie" data={PAYMENT_SPLIT} xKey="name" pieDataKey="value" pieNameKey="name" height={240} />
            </Card>
          </div>
        </section>

        {/* 7. STATUS BADGES */}
        <section>
          <h2 className="font-serif text-xl text-primary border-b border-border-subtle pb-2 mb-4">
            7. Status Badges
          </h2>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status="paid" />
            <StatusBadge status="pending" />
            <StatusBadge status="completed" />
            <StatusBadge status="cancelled" />
            <StatusBadge status="refunded" />
            <StatusBadge status="in_progress" />
            <StatusBadge variant="neutral" label="Draft" />
            <StatusBadge variant="info" label="New" size="md" />
          </div>
        </section>

        {/* 8. STEPPER + DIVIDER + EMPTY */}
        <section>
          <h2 className="font-serif text-xl text-primary border-b border-border-subtle pb-2 mb-4">
            8. Stepper, Divider, Empty
          </h2>
          <div className="flex items-center gap-4">
            <QuantityStepper value={qty} onChange={setQty} min={1} max={10} />
            <span className="text-xs text-text-muted">Qty: {qty}</span>
          </div>
          <Divider className="my-4" />
          <Divider variant="dashed" label="Summary" />
          <EmptyState
            message="Cart is empty"
            description="Add dishes from the catalog to get started."
            icon={<Icon name="ShoppingBag" size="xl" />}
          />
        </section>

        {/* 9. AVATARS */}
        <section>
          <h2 className="font-serif text-xl text-primary border-b border-border-subtle pb-2 mb-4">
            9. Avatars
          </h2>
          <div className="flex items-center gap-3">
            <Avatar name="John Doe" size="sm" />
            <Avatar name="Jane Smith" size="md" />
            <Avatar name="Manager" size="lg" />
            <Avatar />
          </div>
        </section>

        {/* 10. DATE RANGE */}
        <section>
          <h2 className="font-serif text-xl text-primary border-b border-border-subtle pb-2 mb-4">
            10. Date Range
          </h2>
          <DateRangePicker value={range} onChange={setRange} />
          <p className="text-xs text-text-muted mt-2">
            {range.from} → {range.to}
          </p>
        </section>

        {/* 11. DATA TABLE */}
        <section>
          <h2 className="font-serif text-xl text-primary border-b border-border-subtle pb-2 mb-4">
            11. Data Table
          </h2>
          <DataTable data={MOCK_ORDERS} columns={orderColumns} rowKey="id" striped />
        </section>

{/* 12. MODALS + RECEIPT */}
<section>
  <h2 className="font-serif text-xl text-primary border-b border-border-subtle pb-2 mb-4">
    12. Modals & Receipt
  </h2>

  <div className="flex flex-wrap gap-3">
    <Button
      variant="danger"
      leftIcon={<Trash2 size={14} />}
      onClick={() => setDeleteOpen(true)}
    >
      Delete Modal
    </Button>

    <Button
      variant="outline"
      onClick={() => setReceiptOpen(true)}
    >
      View Receipt
    </Button>

    <Button
      variant="primary"
      leftIcon={<Clock size={14} />}
      onClick={() => setIsTimeoutOpen(true)}
    >
      Launch Session Timeout Dialog
    </Button>
  </div>

  {/* Delete Modal */}
  <PopupModal
    isOpen={isDeleteOpen}
    onClose={() => setDeleteOpen(false)}
    title="Delete Record"
    confirmText="Delete"
    isDanger
    onConfirm={() => {
      showNotif("success", "Record deleted!");
      setDeleteOpen(false);
    }}
  >
    Are you sure you want to delete this record?
  </PopupModal>

  {/* Receipt Modal */}
  <PopupModal
    isOpen={isReceiptOpen}
    onClose={() => setReceiptOpen(false)}
    title="Receipt"
    size="lg"
    hideCloseButton={false}
    footer={
      <>
        <Button
          variant="ghost"
          onClick={() => setReceiptOpen(false)}
        >
          Close
        </Button>

        <Button
          variant="primary"
          onClick={() => window.print()}
        >
          Print receipt
        </Button>
      </>
    }
  >
    <Receipt
      business={{
        name: "Grand Horizon",
        address: "18 Harbour View Road",
        phone: "+91 98765 43210",
        email: "dining@grandhorizon.example",
      }}
      orderId="ABC20261118001"
      date="18 Nov 2026"
      time="12:05 PM"
      items={[
        { name: "Veg Burger", price: 220, quantity: 2 },
        { name: "Chicken Pizza", price: 380, quantity: 1 },
      ]}
      subtotal={820}
      taxRate={5}
      tax={41}
      total={861}
      paymentMethod="Cash"
      cashCollected={900}
      change={39}
    />
  </PopupModal>

  {/* Session Timeout Modal - IMPORTANT: OUTSIDE PopupModal */}
  <SessionTimeoutModal
    isOpen={isTimeoutOpen}
    onClose={() => setIsTimeoutOpen(false)}
    initialSeconds={60}
    onExtend={() => {
      showNotif("success", "Session extended successfully!");
      setIsTimeoutOpen(false);
    }}
    onLogout={() => {
      showNotif("info", "Logged out.");
      setIsTimeoutOpen(false);
    }}
  />
</section>


        {/* 13. NOTIFICATIONS */}
        <section>
          <h2 className="font-serif text-xl text-primary border-b border-border-subtle pb-2 mb-4">
            13. Notifications
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => showNotif("success", "Payment successful!")}>
              Success
            </Button>
            <Button variant="danger" onClick={() => showNotif("error", "Something went wrong!")}>
              Error
            </Button>
            <Button variant="outline" onClick={() => showNotif("info", "Order sent to kitchen.")}>
              Info
            </Button>
            <Button variant="secondary" onClick={() => showNotif("warning", "Low stock alert.")}>
              Warning
            </Button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
