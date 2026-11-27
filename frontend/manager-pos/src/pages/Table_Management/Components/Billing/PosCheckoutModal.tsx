import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowRight,
  CreditCard,
} from "lucide-react";

import {
  CheckoutRequestSchema,
  type CheckoutRequest,
  type PaymentMode,
} from "@urqr/types";

// REUSABLE COMPONENTS
import { PopupModal } from "../../../../components/PopupModal/PopupModal";
import { Button } from "../../../../components/Buttons/Button";
import { SelectableGroup } from "../../../../components/Header/SelectableGroup";
import { CashAmountInput } from "../../../../components/Payment/CashAmountInput";
import { ChangeSummary } from "../../../../components/Payment/ChangeSummary";
import { NumericKeypad } from "../../../../components/Keypad/NumericKeypad";

// MONEY UTILITIES
import {
  formatINR,
  parseINRToPaise,
} from "../../../../lib/money";

// BILLING TYPES
import type { PaymentMethod } from "../../Types/billing.types";

// CHECKOUT STATUS COMPONENT
import {
  CheckoutStatus,
  type CheckoutStatusType,
} from "./CheckoutStatus";

// CENTRALIZED CHECKOUT ERROR HANDLER
import {
  getCheckoutError,
  type CheckoutErrorDetails,
} from "./checkoutErrors";

// ==========================================
// CHECKOUT PROPS
// ==========================================

interface PosCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;

  subtotal: number;
  tax: number;
  total: number;

  orderId?: string | number;

  initialMode?: PaymentMethod | PaymentMode;

  isSubmitting?: boolean;

  onConfirmPayment: (
    checkout: CheckoutRequest
  ) => Promise<boolean>;

  onViewReceipt: () => void;
}

// ==========================================
// QUICK CASH BUTTON CONFIGURATION
// ==========================================

const QUICK_CASH_AMOUNTS = [
  100,
  500,
  2000,
];

// Existing Style/Theme tokens.
const QUICK_CASH_BUTTON_CLASS = `
  !min-w-0
  !min-h-12
  !px-1
  !py-2
  !rounded-lg
  !border
  !border-primary
  !bg-surface
  !text-primary
  !text-sm
  !font-bold
  whitespace-nowrap
  hover:!bg-surface-alt
  transition-colors
`;

// ==========================================
// DEMO UPI QR
// ==========================================

// Demo QR illustration only.
// Not valid for actual payment.

const DEMO_DOTS = Array.from(
  { length: 29 * 29 },
  (_, index) => ({
    x: index % 29,
    y: Math.floor(index / 29),
  })
).filter(({ x, y }) => {
  const finder =
    (x < 9 && y < 9) ||
    (x > 19 && y < 9) ||
    (x < 9 && y > 19);

  return (
    !finder &&
    (x * 17 + y * 23 + x * y * 3) % 9 < 4
  );
});

function DemoUpiQR() {
  return (
    <svg
      viewBox="0 0 37 37"
      width="172"
      height="172"
      role="img"
      aria-label="Demo QR illustration, not valid for payment"
      className="block max-w-full bg-white"
    >
      <rect
        width="37"
        height="37"
        fill="white"
      />

      <g transform="translate(4 4)">
        {DEMO_DOTS.map(({ x, y }) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width="1"
            height="1"
            fill="#111B2E"
          />
        ))}

        {[
          [0, 0],
          [22, 0],
          [0, 22],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <rect
              x={x}
              y={y}
              width="7"
              height="7"
              fill="#111B2E"
            />

            <rect
              x={x + 1}
              y={y + 1}
              width="5"
              height="5"
              fill="white"
            />

            <rect
              x={x + 2}
              y={y + 2}
              width="3"
              height="3"
              fill="#111B2E"
            />
          </g>
        ))}
      </g>
    </svg>
  );
}

// ==========================================
// PAYMENT MODE TYPES
// ==========================================

type LocalPaymentMode =
  | "Cash"
  | "Card"
  | "UPI";

const normalizePaymentMode = (
  mode: PaymentMethod | PaymentMode | undefined
): LocalPaymentMode =>
  mode === "Card" || mode === "UPI"
    ? mode
    : "Cash";

// ==========================================
// MAIN CHECKOUT COMPONENT
// ==========================================

export function PosCheckoutModal({
  isOpen,
  onClose,
  total,
  orderId,
  initialMode = "Cash",
  isSubmitting = false,
  onConfirmPayment,
  onViewReceipt,
}: PosCheckoutModalProps) {
  // ==========================================
  // PAYMENT STATES
  // ==========================================

  const [method, setMethod] =
    useState<LocalPaymentMode>(
      normalizePaymentMode(initialMode)
    );

  const [cashReceived, setCashReceived] =
    useState(
      normalizePaymentMode(initialMode) === "Cash"
        ? "0.00"
        : String(total)
    );

  // Structured error details for scenario-based
  // checkout messages.
  const [error, setError] =
    useState<CheckoutErrorDetails | null>(
      null
    );

  const [checkoutStatus, setCheckoutStatus] =
    useState<CheckoutStatusType>("idle");

  // Preserve the original payable amount
  // after successful checkout clears the cart.
  const [
    confirmedAmountPaise,
    setConfirmedAmountPaise,
  ] = useState(0);

  // Immediate protection against repeated clicks.
  const submittingRef = useRef(false);

  // Preserve tender details after an uncertain
  // transaction so the cashier cannot change them.
  const [
    retryLocked,
    setRetryLocked,
  ] = useState(false);

  // ==========================================
  // RESET MODAL WHEN REOPENED
  // ==========================================

  const [prevIsOpen, setPrevIsOpen] =
    useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);

    if (isOpen && !retryLocked) {
      const mode =
        normalizePaymentMode(initialMode);

      setMethod(mode);

      setCashReceived(
        mode === "Cash"
          ? "0.00"
          : String(total)
      );

      setError(null);
      setCheckoutStatus("idle");
      setConfirmedAmountPaise(0);
    }
  }

  // ==========================================
  // INTEGER PAISE CALCULATIONS
  // ==========================================

  const payablePaise = Number.isFinite(total)
    ? Math.max(
        0,
        Math.round(total * 100)
      )
    : 0;

  const receivedPaise =
    parseINRToPaise(cashReceived);

  const enoughCash =
    receivedPaise !== null &&
    Number.isSafeInteger(receivedPaise) &&
    receivedPaise >= payablePaise;

  // ==========================================
  // CHECKOUT LOADING STATE
  // ==========================================

  // Combine local processing state with
  // TanStack Query mutation state.
  const busy =
    checkoutStatus === "processing" ||
    isSubmitting;

  const showStatusPopup =
    busy ||
    checkoutStatus !== "idle";

  // Lock payment details while processing
  // or while a previous result is unresolved.
  const paymentDetailsLocked =
    busy || retryLocked;

  // Current mock API supports Cash only.
  const canConfirm =
    isOpen &&
    !busy &&
    checkoutStatus === "idle" &&
    method === "Cash" &&
    Number.isSafeInteger(payablePaise) &&
    payablePaise > 0 &&
    enoughCash;

  // ==========================================
  // UPDATE CASH AMOUNT
  // ==========================================

  const updateCashAmount = (
    value: string
  ) => {
    if (
      paymentDetailsLocked ||
      submittingRef.current ||
      checkoutStatus !== "idle"
    ) {
      return;
    }

    setCashReceived(value);
    setError(null);
  };

  // ==========================================
  // CONFIRM PAYMENT
  // ==========================================

  const confirmPayment = useCallback(async () => {
    // Prevent duplicate payment submission.
    if (
      submittingRef.current ||
      busy ||
      !canConfirm
    ) {
      return;
    }

    // ======================================
    // SCENARIO 1 - OFFLINE BEFORE SUBMISSION
    // ======================================

    if (!navigator.onLine) {
      setError({
        title: "No Internet Connection",

        message: retryLocked
          ? "Reconnect to the network. Your previous transaction is still unresolved."
          : "Reconnect to the internet before submitting your payment.",

        requiresVerification: retryLocked,
      });

      setCheckoutStatus("error");

      return;
    }

    // ======================================
    // SCENARIO 2 - VALIDATE PAYMENT DETAILS
    // ======================================

    const amountTendered =
      receivedPaise ?? 0;

    const parsed =
      CheckoutRequestSchema.safeParse({
        paymentMode: "Cash",

        payableAmount:
          payablePaise / 100,

        amountTendered:
          amountTendered / 100,

        changeDue:
          Math.max(
            0,
            amountTendered - payablePaise
          ) / 100,
      });

    if (!parsed.success) {
      setError({
        title: "Invalid Payment Details",

        message:
          "Check the payable amount and cash collected.",

        requiresVerification: retryLocked,
      });

      setCheckoutStatus("error");

      return;
    }

    // ======================================
    // SCENARIO 3 - PAYMENT PROCESSING
    // ======================================

    // Lock immediately before API submission.
    submittingRef.current = true;

    // Preserve original payment amount.
    setConfirmedAmountPaise(
      payablePaise
    );

    setError(null);

    // Display centered processing popup.
    setCheckoutStatus("processing");

    try {
      // Execute existing checkout mutation.
      const completed =
        await onConfirmPayment(
          parsed.data
        );

      // Never display success without
      // a confirmed checkout result.
      if (completed !== true) {
        throw new Error(
          "Order confirmation was not completed."
        );
      }

      // ====================================
      // SCENARIO 4 - SUCCESSFUL PAYMENT
      // ====================================

      setRetryLocked(false);

      setError(null);

      // Success remains visible until
      // View Receipt is clicked.
      setCheckoutStatus("success");

    } catch (err) {
      // ====================================
      // SCENARIO 5 - CHECKOUT FAILURE
      // ====================================

      // Detect actual HTTP, network, timeout,
      // server or unresolved checkout errors.
      const errorDetails =
        getCheckoutError(err);

      // Retain existing unresolved state.
      const requiresVerification =
        retryLocked ||
        errorDetails.requiresVerification;

      setError({
        ...errorDetails,
        requiresVerification,
      });

      // Prevent changing original payment
      // details if transaction is uncertain.
      if (requiresVerification) {
        setRetryLocked(true);
      }

      // Display scenario-specific error popup.
      setCheckoutStatus("error");

    } finally {
      // Always release the local submission lock.
      submittingRef.current = false;
    }
  }, [
    busy,
    canConfirm,
    payablePaise,
    receivedPaise,
    retryLocked,
    onConfirmPayment,
  ]);

  // ==========================================
  // VIEW RECEIPT AFTER SUCCESS
  // ==========================================

  const handleViewReceipt =
    useCallback(() => {
      if (
        busy ||
        submittingRef.current ||
        checkoutStatus !== "success"
      ) {
        return;
      }

      // Existing Billing.tsx function
      // opens the confirmed receipt.
      onViewReceipt();

    }, [
      busy,
      checkoutStatus,
      onViewReceipt,
    ]);

  // ==========================================
  // RETURN TO CHECKOUT AFTER ERROR
  // ==========================================

  const handleBackToCheckout = () => {
    if (
      busy ||
      submittingRef.current
    ) {
      return;
    }

    // Preserve error information.
    // Preserve cash amount and retry protection.
    // Never reset the Idempotency-Key here.
    setCheckoutStatus("idle");
  };

  // ==========================================
  // KEYBOARD SHORTCUT - ENTER
  // ==========================================

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key !== "Enter") {
        return;
      }

      // Prevent repeated Enter presses.
      if (
        busy ||
        submittingRef.current ||
        event.repeat
      ) {
        event.preventDefault();
        return;
      }

      // Preserve normal keyboard behavior
      // for focused interactive elements.
      if (
        event.target instanceof HTMLElement &&
        event.target.closest(
          "button, [role='button'], [role='tab']"
        )
      ) {
        return;
      }

      // Enter opens receipt after success.
      if (checkoutStatus === "success") {
        event.preventDefault();

        handleViewReceipt();

        return;
      }

      // Enter confirms valid cash checkout.
      if (
        checkoutStatus === "idle" &&
        canConfirm
      ) {
        event.preventDefault();

        void confirmPayment();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    isOpen,
    busy,
    canConfirm,
    checkoutStatus,
    confirmPayment,
    handleViewReceipt,
  ]);

  // ==========================================
  // PAYMENT METHOD SELECTION
  // ==========================================

  const changePaymentMethod = (
    value: string
  ) => {
    if (
      paymentDetailsLocked ||
      submittingRef.current ||
      checkoutStatus !== "idle"
    ) {
      return;
    }

    if (
      value === "Cash" ||
      value === "Card" ||
      value === "UPI"
    ) {
      setMethod(value);

      setError(null);

      if (value === "Cash") {
        setCashReceived("0.00");
      } else {
        setCashReceived(
          total.toFixed(2)
        );
      }
    }
  };

  // ==========================================
  // MODAL CLOSE HANDLER
  // ==========================================

  const handleClose = () => {
    // Do not close during processing.
    if (
      busy ||
      submittingRef.current
    ) {
      return;
    }

    // Open receipt after successful payment.
    if (checkoutStatus === "success") {
      handleViewReceipt();

      return;
    }

    // Return to unchanged checkout when
    // the previous transaction is unresolved.
    if (retryLocked) {
      setCheckoutStatus("idle");

      return;
    }

    onClose();
  };

  // ==========================================
  // CHECKOUT MODAL UI
  // ==========================================

  return (
    <PopupModal
      isOpen={isOpen}

      onClose={handleClose}

      closeOnEscape={
        !busy &&
        !retryLocked &&
        checkoutStatus !== "success"
      }

      closeOnBackdrop={
        !busy &&
        !retryLocked &&
        checkoutStatus !== "success"
      }

      title={
        showStatusPopup
          ? "Checkout Status"
          : "POS Checkout & Tender"
      }

      size="md"

      className={`
        !min-w-0
        !max-w-md
        !max-h-[calc(100dvh-32px)]

        ${
          showStatusPopup
            ? "!h-auto"
            : "!h-[670px]"
        }
      `}

      footer={
        !showStatusPopup &&
        method === "Cash" ? (
          <Button
            type="button"
            variant="primary"
            size="md"
            fullWidth

            disabled={!canConfirm}

            isLoading={busy}

            className="!min-h-10"

            onClick={() => {
              void confirmPayment();
            }}
          >
            {retryLocked
              ? "Retry Original Checkout"
              : "Confirm & Print Receipt (Enter)"}
          </Button>
        ) : undefined
      }
    >
      {/* =====================================
          CHECKOUT STATUS POPUP
          ===================================== */}

      {showStatusPopup ? (
        <div
          className="
            flex w-full min-w-0
            flex-col items-center
            justify-center
            overflow-y-auto
          "
        >
          <CheckoutStatus
            status={
              busy
                ? "processing"
                : checkoutStatus
            }

            amountPaise={
              confirmedAmountPaise
            }

            error={error}

            onViewReceipt={
              handleViewReceipt
            }

            onBackToCheckout={
              handleBackToCheckout
            }
          />
        </div>
      ) : (
        /* ===================================
           NORMAL CHECKOUT CONTENT
           =================================== */

        <div
          className="
            flex h-full min-h-0
            w-full min-w-0
            flex-col gap-3
            pb-5
          "
        >
          {/* =================================
              1. TOTAL AMOUNT
              ================================= */}

          {method === "Cash" && (
            <section
              className="
                w-full min-w-0
                shrink-0 space-y-1
              "
            >
              <label
                className="
                  block text-xs
                  font-bold uppercase
                  tracking-wide
                  text-primary
                "
              >
                Total Amount
              </label>

              <div
                className="
                  flex min-h-10 w-full
                  items-center rounded-md
                  border border-border-subtle
                  bg-surface-alt px-3
                  font-bold text-primary
                "

                aria-label="Total payable, read only"
              >
                {formatINR(payablePaise)}
              </div>

              <p
                className="
                  text-[11px]
                  text-text-muted
                "
              >
                {orderId !== undefined
                  ? `Order #${orderId} · `
                  : ""}

                Same payable total · Read-only
              </p>
            </section>
          )}

          {/* =================================
              2. UNRESOLVED TRANSACTION WARNING
              ================================= */}

          {retryLocked && (
            <div
              role="alert"
              className="
                shrink-0 rounded-lg
                border border-border-subtle
                bg-surface-alt p-3
                text-xs leading-relaxed
                text-primary
              "
            >
              <p className="font-bold">
                Previous Order Pending
              </p>

              <p className="mt-1">
                Payment details are locked to
                prevent duplicate orders.
                Verify the previous transaction
                before retrying the original
                checkout.
              </p>
            </div>
          )}

          {/* =================================
              3. PAYMENT METHOD
              ================================= */}

          <fieldset
            disabled={paymentDetailsLocked}

            className={`
              m-0 w-full min-w-0
              shrink-0 border-0
              px-0 pt-3 pb-3

              ${
                paymentDetailsLocked
                  ? "pointer-events-none opacity-60"
                  : ""
              }
            `}
          >
            <legend
              className="
                mb-2 text-xs
                font-bold uppercase
                tracking-wide
                text-primary
              "
            >
              Payment Method
            </legend>

            {/* REUSABLE SELECTABLE GROUP */}

            <SelectableGroup
              options={[
                {
                  value: "Cash",
                  label: "Cash",
                },
                {
                  value: "Card",
                  label: "Card",
                },
                {
                  value: "UPI",
                  label: "UPI",
                },
              ]}

              value={method}

              onChange={
                changePaymentMethod
              }

              className="
                !my-0 w-full
                [&>button]:!min-h-9
                [&>button]:!py-2
              "
            />
          </fieldset>

          {/* =================================
              4. CASH PAYMENT
              ================================= */}

          {method === "Cash" && (
            <>
              <fieldset
                disabled={paymentDetailsLocked}

                className={`
                  m-0 w-full min-w-0
                  shrink-0 rounded-lg
                  border border-border-subtle
                  bg-surface-alt p-3

                  [&_.pos-cash-input__field]:!h-10

                  [&_.pos-change-summary]:!min-h-[54px]
                  [&_.pos-change-summary]:!p-2
                  [&_.pos-change-summary_strong]:!text-xl

                  ${
                    paymentDetailsLocked
                      ? "pointer-events-none opacity-60"
                      : ""
                  }
                `}
              >
                {/* CASH COLLECTED HEADER */}

                <div
                  className="
                    mb-2 flex items-center
                    justify-between gap-3
                  "
                >
                  <h3
                    className="
                      text-sm font-bold
                      text-primary
                    "
                  >
                    Cash Collected
                  </h3>

                  {/* REUSABLE CLEAR BUTTON */}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"

                    disabled={
                      paymentDetailsLocked
                    }

                    onClick={() => {
                      updateCashAmount(
                        "0.00"
                      );
                    }}
                  >
                    Clear
                  </Button>
                </div>

                {/* REUSABLE CASH AMOUNT INPUT */}

                <div
                  className="
                    w-full min-w-0
                    [&_.pos-cash-input__quick]:!hidden
                    [&_.pos-cash-input__button]:!hidden
                    [&_button]:!hidden
                  "
                >
                  <CashAmountInput
                    value={cashReceived}

                    onChange={
                      updateCashAmount
                    }
                  />
                </div>

                {/* =================================
                    FOUR OUTLINED QUICK CASH BUTTONS
                    ================================= */}

                <div
                  className="
                    mt-3 mb-3
                    grid w-full min-w-0
                    grid-cols-4 gap-2
                  "
                >
                  {/* EXACT CASH */}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    fullWidth

                    disabled={
                      paymentDetailsLocked ||
                      payablePaise <= 0
                    }

                    className={`
                      ${QUICK_CASH_BUTTON_CLASS}
                      !text-xs
                    `}

                    onClick={() => {
                      updateCashAmount(
                        (
                          payablePaise / 100
                        ).toFixed(2)
                      );
                    }}
                  >
                    Exact Cash
                  </Button>

                  {/* ₹100, ₹500, ₹2000 */}

                  {QUICK_CASH_AMOUNTS.map(
                    (amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant="ghost"
                        size="sm"
                        fullWidth

                        disabled={
                          paymentDetailsLocked
                        }

                        className={
                          QUICK_CASH_BUTTON_CLASS
                        }

                        onClick={() => {
                          updateCashAmount(
                            amount.toFixed(2)
                          );
                        }}
                      >
                        ₹{amount}
                      </Button>
                    )
                  )}
                </div>

                {/* =================================
                    REUSABLE NUMERIC KEYPAD
                    ================================= */}

                <div
                  className="
                    mt-2 scale-90 origin-top
                  "
                >
                  <NumericKeypad
                    onDigit={(digit) => {
                      if (
                        paymentDetailsLocked ||
                        submittingRef.current ||
                        checkoutStatus !== "idle"
                      ) {
                        return;
                      }

                      setCashReceived(
                        (previous) => {
                          if (
                            previous === "0.00" ||
                            previous === "0"
                          ) {
                            return digit;
                          }

                          return previous + digit;
                        }
                      );

                      setError(null);
                    }}

                    onBackspace={() => {
                      if (
                        paymentDetailsLocked ||
                        submittingRef.current ||
                        checkoutStatus !== "idle"
                      ) {
                        return;
                      }

                      setCashReceived(
                        (previous) =>
                          previous.length > 1
                            ? previous.slice(
                                0,
                                -1
                              )
                            : "0"
                      );

                      setError(null);
                    }}

                    onClear={() => {
                      updateCashAmount(
                        "0.00"
                      );
                    }}
                  />
                </div>

                {/* =================================
                    REUSABLE CHANGE SUMMARY
                    ================================= */}

                <div className="mt-2">
                  <div
                    className="
                      mb-1 text-xs
                      font-bold
                      text-primary
                    "
                  >
                    Change Due
                  </div>

                  <ChangeSummary
                    amountDuePaise={
                      payablePaise
                    }

                    amountReceivedPaise={
                      receivedPaise
                    }
                  />
                </div>
              </fieldset>

              {/* AMOUNT TO PAY */}

              <div
                className="
                  flex w-full shrink-0
                  items-center
                  justify-between gap-3
                "
              >
                <span
                  className="
                    text-sm font-semibold
                    text-primary
                  "
                >
                  Amount to pay
                </span>

                <strong
                  className="
                    whitespace-nowrap
                    text-xl font-bold
                    text-primary
                  "
                >
                  {formatINR(payablePaise)}
                </strong>
              </div>

              {/* INSUFFICIENT CASH WARNING */}

              {!enoughCash && (
                <p
                  role="status"

                  className="
                    shrink-0 text-[11px]
                    text-warning-text
                  "
                >
                  Insufficient cash tendered.
                  Negative balance submission
                  prevented.
                </p>
              )}

              {/* PREVIOUS CHECKOUT ERROR */}

              {error && (
                <div
                  role="alert"

                  className="
                    shrink-0 rounded-md
                    border border-red-200
                    p-3 text-xs
                    text-red-700
                  "
                >
                  <p className="font-semibold">
                    {error.title}
                  </p>

                  <p className="mt-1 break-words">
                    {error.message}
                  </p>
                </div>
              )}
            </>
          )}

          {/* =================================
              5. CARD PAYMENT
              ================================= */}

          {method === "Card" && (
            <section
              className="
                flex flex-1 flex-col
                items-center justify-center
                gap-4 rounded-xl
                border border-border-subtle
                bg-surface-alt
                p-6 text-center
              "
            >
              <CreditCard
                size={48}
                className="text-primary"
                aria-hidden="true"
              />

              <h4
                className="
                  text-base font-bold
                  text-primary
                "
              >
                Card Payment EDC Terminal
              </h4>

              <p
                className="
                  max-w-xs text-xs
                  text-text-muted
                "
              >
                Card terminal integration
                is currently unavailable.
              </p>

              <div
                className="
                  rounded-lg
                  border border-border-subtle
                  bg-surface px-6 py-3
                "
              >
                <strong
                  className="
                    text-lg font-bold
                    text-primary
                  "
                >
                  {formatINR(payablePaise)}
                </strong>
              </div>

              <p
                className="
                  text-xs text-warning-text
                "
              >
                Do not collect card payment
                through this demo checkout.
              </p>

              <Button
                type="button"
                variant="primary"
                fullWidth
                disabled
              >
                Confirm Card Payment
              </Button>
            </section>
          )}

          {/* =================================
              6. UPI PAYMENT
              ================================= */}

          {method === "UPI" && (
            <>
              <section
                className="
                  flex w-full min-h-0
                  flex-1 flex-col
                  items-center justify-center
                  gap-4 rounded-lg
                  border border-border-subtle
                  bg-surface-alt p-3
                "
              >
                {/* DEMO QR IMAGE */}

                <div
                  className="
                    rounded-md bg-white p-3
                  "
                >
                  <DemoUpiQR />
                </div>

                <strong
                  className="
                    text-xl font-bold
                    text-primary
                  "
                >
                  {formatINR(payablePaise)}
                </strong>

                {/* UPI PROVIDER LABELS */}

                <div
                  className="
                    flex flex-wrap
                    items-center justify-center
                    gap-x-4 gap-y-1
                  "
                >
                  {[
                    "GPay",
                    "PhonePe",
                    "Paytm",
                    "BHIM",
                  ].map((provider) => (
                    <span
                      key={provider}

                      className="
                        text-[11px]
                        font-medium
                        text-text-muted
                      "
                    >
                      {provider}
                    </span>
                  ))}
                </div>

                <p
                  className="
                    text-center
                    text-[11px]
                    text-text-muted
                  "
                >
                  Demo QR only — not valid
                  for payment.
                </p>
              </section>

              <Button
                type="button"
                variant="primary"
                fullWidth
                disabled

                rightIcon={
                  <ArrowRight size={15} />
                }

                className="
                  !min-h-10 shrink-0
                "
              >
                COMPLETE PAYMENT (
                {formatINR(payablePaise)})
              </Button>
            </>
          )}
        </div>
      )}
    </PopupModal>
  );
}

export default PosCheckoutModal;