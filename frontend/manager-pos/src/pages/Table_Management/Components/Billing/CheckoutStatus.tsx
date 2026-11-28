import { PosIcon } from "../../../../components/Icons/PosIcon";
import {
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  WifiOff,
  ReceiptText,
} from "lucide-react";

import { Button } from "../../../../components/Buttons/Button";
import { formatINR } from "../../../../lib/money";

import { useCheckoutProgress } from "../../Hooks/useCheckoutProgress";

import type {
  CheckoutErrorDetails,
} from "./checkoutErrors";

export type CheckoutStatusType =
  | "idle"
  | "processing"
  | "buffered"
  | "success"
  | "error";

interface CheckoutStatusProps {
  status: CheckoutStatusType;
  amountPaise: number;
  error?: CheckoutErrorDetails | null;
  onViewReceipt: () => void;
  onBackToCheckout: () => void;
  onContinueBilling?: () => void;
}

export function CheckoutStatus({
  status,
  amountPaise,
  error,
  onViewReceipt,
  onBackToCheckout,
  onContinueBilling,
}: CheckoutStatusProps) {
  const isProcessing =
    status === "processing";

  const progress =
    useCheckoutProgress(isProcessing);

  if (status === "idle") {
    return null;
  }

  const iconClass =
    "shrink-0";

  return (
    <div
      className="
        flex w-full min-w-0
        flex-col items-center
        justify-center gap-4
        px-3 py-5 text-center
      "
    >
      {/* PROCESSING STATE */}

      {status === "processing" && (
        <>
          <div
            className="
              flex h-20 w-20
              items-center
              justify-center
              rounded-full
              bg-surface-alt
            "
          >
            {!progress.isOnline ? (
              <WifiOff
                size={44}
                className={`
                  ${iconClass}
                  text-warning-text
                `}
                aria-hidden="true"
              />
            ) : progress.isDelayed ? (
              <Clock
                size={44}
                className={`
                  ${iconClass}
                  text-warning-text
                `}
                aria-hidden="true"
              />
            ) : (
              <LoaderCircle
                size={44}
                className={`
                  ${iconClass}
                  animate-spin
                  text-primary
                `}
                aria-hidden="true"
              />
            )}
          </div>

          <div
            role="status"
            aria-live="polite"
            className="space-y-3"
          >
            <h2
              className={`
                text-xl font-bold
                ${
                  progress.isDelayed
                    ? "text-warning-text"
                    : "text-primary"
                }
              `}
            >
              {progress.title}
            </h2>

            <p
              className="
                text-3xl font-bold
                text-primary
              "
            >
              {formatINR(amountPaise)}
            </p>

            <p
              className="
                text-sm leading-relaxed
                text-text-muted
              "
            >
              {progress.message}
            </p>
          </div>

          <p
            className="
              text-xs text-text-muted
            "
          >
            Processing time:{" "}
            {progress.elapsedSeconds} seconds
          </p>

          <p
            className="
              text-xs font-semibold
              text-warning-text
            "
          >
            Do not submit another payment.
          </p>

          <Button
            type="button"
            variant="primary"
            fullWidth
            disabled
            isLoading
          >
            Processing Payment...
          </Button>
        </>
      )}

      {/* SUCCESS STATE */}

      {status === "success" && (
        <>
          <CheckCircle2
            size={64}
            className="text-green-700"
            aria-hidden="true"
          />

          <div
            role="status"
            aria-live="polite"
            className="space-y-3"
          >
            <h2
              className="
                text-xl font-bold
                text-green-700
              "
            >
              Demo Payment Successful!
            </h2>

            <p
              className="
                text-3xl font-bold
                text-primary
              "
            >
              {formatINR(amountPaise)}
            </p>

            <p
              className="
                text-sm
                text-text-muted
              "
            >
              Your demo order has been
              confirmed successfully.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            fullWidth
            leftIcon={
              <ReceiptText size={18} />
            }
            onClick={onViewReceipt}
          >
            View Receipt
          </Button>
        </>
      )}

      {status === "buffered" && (
        <>
          <PosIcon name="wifi-off" size={60} className="text-warning-text" />
          <div role="status" aria-live="polite" className="space-y-3">
            <h2 className="text-xl font-bold text-primary">Order Saved Offline</h2>
            <p className="text-2xl font-bold text-primary">{formatINR(amountPaise)}</p>
            <p className="font-semibold text-warning-text">Pending Sync</p>
            <p className="text-sm text-text-muted">Cash order saved on this device. Server confirmation is pending.</p>
          </div>
          <Button type="button" variant="primary" fullWidth onClick={onContinueBilling}>
            Continue Billing
          </Button>
        </>
      )}

      {/* ERROR STATE */}

      {status === "error" && (
        <>
          {error?.title ===
          "No Internet Connection" ||
          error?.title ===
          "Internet Connection Lost" ||
          error?.title ===
          "Connection Interrupted" ? (
            <WifiOff
              size={60}
              className="text-red-700"
              aria-hidden="true"
            />
          ) : (
            <AlertCircle
              size={60}
              className="text-red-700"
              aria-hidden="true"
            />
          )}

          <div
            role="alert"
            className="space-y-3"
          >
            <h2
              className="
                text-xl font-bold
                text-red-700
              "
            >
              {error?.title ??
                "Checkout Unsuccessful"}
            </h2>

            <p
              className="
                break-words
                text-sm leading-relaxed
                text-text-muted
              "
            >
              {error?.message ??
                "Unable to confirm the order."}
            </p>

            {error?.requiresVerification && (
              <p
                className="
                  text-xs leading-relaxed
                  text-warning-text
                "
              >
                Verify the previous transaction
                before submitting another
                payment.
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={onBackToCheckout}
          >
            Back to Checkout
          </Button>
        </>
      )}
    </div>
  );
}