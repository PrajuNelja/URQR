import { PopupModal } from "../../../../components/PopupModal/PopupModal";
import { Receipt } from "../../../../components/PopupModal/Receipt";
import { Button } from "../../../../components/Buttons/Button";
import type { ReceiptData } from "../../Types/billing.types";

interface Props { isOpen: boolean; onClose: () => void; receipt: ReceiptData | null; }

export const BillingReceiptModal = ({ isOpen, onClose, receipt }: Props) => (
  <PopupModal isOpen={isOpen} onClose={onClose} title="Receipt" size="lg"
    footer={<><Button variant="ghost" onClick={onClose}>Close</Button><Button variant="primary" onClick={() => window.print()}>Print receipt</Button></>}>
    {receipt && (
      <Receipt
        business={{ name: "Grand Horizon", address: "18 Harbour View Road", phone: "+91 98765 43210" }}
        orderId={receipt.orderId} date={receipt.date} time={receipt.time}
        items={receipt.items} subtotal={receipt.subtotal} taxRate={receipt.taxRate} tax={receipt.tax} total={receipt.total}
        paymentMethod={receipt.paymentMethod} cashCollected={receipt.cashCollected} change={receipt.change}
      />
    )}
  </PopupModal>
);