import { useState } from "react";
import { PopupModal } from "../../../../components/PopupModal/PopupModal";
import { Receipt } from "../../../../components/PopupModal/Receipt";
import { Button } from "../../../../components/Buttons/Button";
import { useNotification } from "../../../../components/Notification/useNotification";
import { useBridgeHeartbeat } from "../../Hooks/useBridgeHeartbeat";
import type { ReceiptData } from "../../Types/billing.types";
import {
  RECEIPT_BUSINESS,
  serializeReceiptForBridge,
} from "../../../../lib/bridge/printPayload";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  receipt: ReceiptData | null;
}

interface ReprintState {
  orderId: string;
  printedAt: string;
}

export const BillingReceiptModal = ({
  isOpen,
  onClose,
  receipt,
}: Props) => {
  const { printReceipt } = useBridgeHeartbeat(false);
  const { success, error, info } = useNotification();
  const [isReprinting, setIsReprinting] = useState(false);
  const [reprintState, setReprintState] = useState<ReprintState | null>(null);
  const currentReprint =
    reprintState?.orderId === receipt?.orderId ? reprintState : null;

  const handleReprint = async () => {
    if (!receipt || isReprinting) return;

    setIsReprinting(true);
    try {
      const request = serializeReceiptForBridge(
        receipt,
        localStorage.getItem("tenant_id"),
      );
      const response = await printReceipt(
        { ...request, action: "reprint" },
        performance.now(),
      );

      if (!response.success) {
        error(
          `Receipt reprint failed: ${response.message ?? response.status}`,
        );
        return;
      }

      if (["SPOOLED", "PRINTING"].includes(response.status.toUpperCase())) {
        info("Receipt reprint queued.");
        return;
      }

      const printedAt = new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setReprintState({ orderId: receipt.orderId, printedAt });
      success("Receipt reprinted successfully.");
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Unknown bridge error";
      error(`Receipt reprint failed: ${message}`);
    } finally {
      setIsReprinting(false);
    }
  };

  return (
    <PopupModal
      isOpen={isOpen}
      onClose={onClose}
      title="Receipt"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => void handleReprint()}
            disabled={!receipt || isReprinting}
          >
            {isReprinting ? "Sending reprint..." : "Reprint receipt"}
          </Button>
        </>
      }
    >
      {receipt && (
        <Receipt
          business={RECEIPT_BUSINESS}
          orderId={receipt.orderId}
          date={receipt.date}
          time={receipt.time}
          items={receipt.items}
          subtotal={receipt.subtotal}
          taxRate={receipt.taxRate}
          tax={receipt.tax}
          total={receipt.total}
          paymentMethod={receipt.paymentMethod}
          cashCollected={receipt.cashCollected}
          change={receipt.change}
          isReprint={Boolean(currentReprint)}
          reprintedAt={currentReprint?.printedAt}
        />
      )}
    </PopupModal>
  );
};