// src/components/Showcase.tsx

// 1. Imports
import { useState } from "react";

import { Save, Mail, DollarSign, ShoppingBag, Trash2, LogOut } from "lucide-react";
import { Notification } from "../Notification/Notification";
import { Button } from "../Buttons/Button";
import { Header } from "../Header/Header";
import { DataTable } from "../DataTable/DataTable";
import { PopupModal } from "../PopupModal/PopupModal";
import { Logo } from "../Logo/Logo";
import { DataCard } from "../DataCard/DataCard";
import { InputField } from "../InputField/InputField";
import { StatusBadge } from "../StatusBadge/StatusBadge";

const MOCK_ORDERS = [
  { id: "ORD-1001", customer: "John Doe", date: "2023-10-24", amount: "$120.00", status: "paid" as const },
  { id: "ORD-1002", customer: "Jane Smith", date: "2023-10-24", amount: "$45.50", status: "pending" as const },
];

// 2. Component
export default function Showcase() {
  // 3. Handlers & State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [notif, setNotif] = useState({
    isOpen: false,
    type: "success" as "success" | "error" | "info" | "warning",
    message: "",
  });

  const showNotification = (type: typeof notif.type, message: string) => {
    setNotif({ isOpen: true, type, message });
  };

  const orderColumns = [
    { key: "id", header: "Order ID" },
    { key: "customer", header: "Customer" },
    { key: "date", header: "Date" },
    { key: "amount", header: "Amount" },
    { key: "status", header: "Status", render: (row: typeof MOCK_ORDERS[0]) => <StatusBadge status={row.status} /> },
  ];

  // 4. Export / Return
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 pb-24">
      
      {/* Global Notification */}
      <Notification 
        isOpen={notif.isOpen} 
        type={notif.type} 
        message={notif.message} 
        onClose={() => setNotif((prev) => ({ ...prev, isOpen: false }))} 
      />

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-serif text-primary mb-2">Component Showcase</h1>
        <p className="text-text-muted">Testing all reusable components with the Ivory Luxe theme.</p>
      </div>

      {/* 1. Notifications */}
      <section className="bg-surface p-6 rounded-md border border-border-subtle shadow-sm">
        <h2 className="text-xl font-serif text-primary mb-4 border-b border-border-subtle pb-2">Notifications (Toasts)</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" onClick={() => showNotification("success", "Bill generated successfully!")}>Success (Bill)</Button>
          <Button variant="primary" onClick={() => showNotification("success", "Payment successful!")}>Success (Payment)</Button>
          <Button variant="outline" onClick={() => showNotification("info", "Order sent to kitchen.")}>Info</Button>
          <Button variant="danger" onClick={() => showNotification("error", "Something went wrong!")}>Error</Button>
        </div>
      </section>

      {/* 2. Headers */}
      <section className="space-y-4">
        <h2 className="text-xl font-serif text-primary border-b border-border-subtle pb-2">Headers</h2>
        <Header variant="dashboard" title="Dashboard" subtitle="Business overview" actions={<Button variant="primary" size="sm">New Order</Button>} />
        <Header variant="billing" title="Billing & Checkout" subtitle="Order #106" actions={<Button variant="outline" size="sm">Print Receipt</Button>} />
      </section>

      {/* 3. Data Tables */}
      <section className="bg-surface p-6 rounded-md border border-border-subtle shadow-sm">
        <h2 className="text-xl font-serif text-primary mb-4 border-b border-border-subtle pb-2">Data Tables</h2>
        <DataTable data={MOCK_ORDERS} columns={orderColumns} rowKey="id" />
      </section>

      {/* 4. Popup Modals */}
      <section className="bg-surface p-6 rounded-md border border-border-subtle shadow-sm">
        <h2 className="text-xl font-serif text-primary mb-4 border-b border-border-subtle pb-2">Popup Modals</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="danger" leftIcon={<Trash2 size={16} />} onClick={() => setIsDeleteModalOpen(true)}>Test Delete Modal</Button>
          <Button variant="outline" leftIcon={<LogOut size={16} />} onClick={() => setIsLogoutModalOpen(true)}>Test Logout Modal</Button>
        </div>
        <PopupModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Record" confirmText="Delete" isDanger={true} onConfirm={() => { showNotification("success", "Record Deleted!"); setIsDeleteModalOpen(false); }}>
          Are you sure you want to delete this record?
        </PopupModal>
        <PopupModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} title="Confirm Logout" confirmText="Logout" onConfirm={() => { showNotification("success", "Logged out!"); setIsLogoutModalOpen(false); }}>
          Are you sure you want to log out?
        </PopupModal>
      </section>

      {/* 5. Logos */}
      <section className="bg-surface p-6 rounded-md border border-border-subtle shadow-sm">
        <h2 className="text-xl font-serif text-primary mb-4 border-b border-border-subtle pb-2">Logo</h2>
        <div className="flex flex-col gap-6">
          <Logo size="sm" />
          <Logo size="md" />
          <Logo size="lg" />
        </div>
      </section>

      {/* 6. Data Cards */}
      <section className="bg-surface p-6 rounded-md border border-border-subtle shadow-sm">
        <h2 className="text-xl font-serif text-primary mb-4 border-b border-border-subtle pb-2">Data Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DataCard variant="summary" title="Total Revenue" value="$1,72,430" trend="↑ +14%" icon={<DollarSign size={20} />} />
          <DataCard variant="summary" title="Total Orders" value="896" trend="↑ +11%" icon={<ShoppingBag size={20} />} />
          <DataCard variant="info" title="Customer Info">
            <div className="space-y-2 text-sm">
              <p><span className="text-text-muted">Name:</span> John Doe</p>
              <p><span className="text-text-muted">Phone:</span> +91 98765 43210</p>
            </div>
          </DataCard>
        </div>
      </section>

      {/* 7. Input Fields */}
      <section className="bg-surface p-6 rounded-md border border-border-subtle shadow-sm">
        <h2 className="text-xl font-serif text-primary mb-4 border-b border-border-subtle pb-2">Input Fields</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Text Input" placeholder="Enter text..." />
          <InputField label="Search Input" type="search" placeholder="Search..." />
          <InputField label="Password Input" type="password" placeholder="••••••••" />
          <InputField label="Date Input" type="date" />
          <InputField label="Error State" placeholder="Invalid input" error="This field is required" />
        </div>
      </section>

      {/* 8. Buttons */}
      <section className="bg-surface p-6 rounded-md border border-border-subtle shadow-sm">
        <h2 className="text-xl font-serif text-primary mb-4 border-b border-border-subtle pb-2">Buttons</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" isLoading>Processing...</Button>
          <Button variant="primary" disabled>Disabled</Button>
          <Button variant="primary" leftIcon={<Save size={16} />}>Save Changes</Button>
        </div>
      </section>

    </div>
  );
}