import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { PosIcon } from "../../../../components/Icons/PosIcon";

import {
  CheckoutRequestSchema,
  type CheckoutRequest,
  type PaymentMode,
} from "@urqr/types";

// ==========================================
// REUSABLE COMPONENTS
// ==========================================

import { PopupModal } from "../../../../components/PopupModal/PopupModal";
import { Button } from "../../../../components/Buttons/Button";
import { SelectableGroup } from "../../../../components/Header/SelectableGroup";
import { CashAmountInput } from "../../../../components/Payment/CashAmountInput";
import { ChangeSummary } from "../../../../components/Payment/ChangeSummary";
import { NumericKeypad } from "../../../../components/Keypad/NumericKeypad";

// ==========================================
// MONEY UTILITIES
// ==========================================

import {
  formatINR,
  parseINRToPaise,
} from "../../../../lib/money";

// ==========================================
// BILLING TYPES
// ==========================================

import type {
  PaymentMethod,
} from "../../Types/billing.types";

// ==========================================
// CHECKOUT STATUS COMPONENT
// ==========================================

import {
  CheckoutStatus,
  type CheckoutStatusType,
} from "./CheckoutStatus";

// ==========================================
// DAY 5 AFTERNOON TASK 3
// CENTRALIZED CHECKOUT ERROR HANDLER
// ==========================================

import {
  POS_ERRORS,
  getCheckoutError,
  type CheckoutErrorDetails,
} from "./checkoutErrors";

// ==========================================
// CHECKOUT MODAL PROPS
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
  ) => Promise<boolean | "buffered">;

  // Optional for backward compatibility
  // with existing Vishal test files.
  onViewReceipt?: () => void;
}

// ==========================================
// QUICK CASH CONFIGURATION
// ==========================================

const QUICK_CASH_AMOUNTS = [
  100,
  200,
  500,
];

const QUICK_CASH_BUTTON_CLASS = `
  !min-w-0
  !min-h-11
  !px-1
  !py-1.5
  !rounded-lg
  !border
  !border-primary/40
  !bg-surface
  !text-primary
  !text-sm
  !font-bold
  whitespace-nowrap
  hover:!bg-surface-alt
  dark:!bg-[#241C16]
  dark:!border-[#4D392B]
  dark:!text-[#F5EEE0]
  dark:hover:!bg-[#2E241C]
  transition-colors
`;

// ==========================================
// DEMO UPI QR CONFIGURATION
// ==========================================

// Illustrative QR only.
// Not valid for actual UPI payments.

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
// MAIN POS CHECKOUT COMPONENT
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
  // ========================================
  // CHECKOUT STATES
  // ========================================

  const [method, setMethod] =
    useState<LocalPaymentMode>(
      normalizePaymentMode(initialMode)
    );

  const [cashReceived, setCashReceived] =
    useState(
      normalizePaymentMode(initialMode) === "Cash"
        ? ""
        : String(total)
    );

  const [error, setError] =
    useState<CheckoutErrorDetails | null>(
      null
    );

  const [checkoutStatus, setCheckoutStatus] =
    useState<CheckoutStatusType>("idle");

  const [
    confirmedAmountPaise,
    setConfirmedAmountPaise,
  ] = useState(0);

  // ========================================
  // DUPLICATE PAYMENT PROTECTION
  // ========================================

  const submittingRef = useRef(false);

  // Preserve original payment details
  // when a previous transaction is unresolved.

  const [retryLocked, setRetryLocked] =
    useState(false);

  // ========================================
  // RESET MODAL WHEN REOPENED
  // ========================================

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
          ? ""
          : String(total)
      );

      setError(null);

      setCheckoutStatus("idle");

      setConfirmedAmountPaise(0);
    }
  }

  // ========================================
  // INTEGER PAISE CALCULATIONS
  // ========================================

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

  // ========================================
  // CHECKOUT PROCESSING STATE
  // ========================================

  const busy =
    checkoutStatus === "processing" ||
    isSubmitting;

  const showStatusPopup =
    busy ||
    checkoutStatus !== "idle";

  const paymentDetailsLocked =
    busy || retryLocked;

  // Current development checkout
  // supports Cash payments only.

  const canConfirm =
    isOpen &&
    !busy &&
    checkoutStatus === "idle" &&
    Number.isSafeInteger(payablePaise) &&
    payablePaise > 0 &&
    (method === "Cash" ? enoughCash : true);

  // ========================================
  // UPDATE CASH AMOUNT
  // ========================================

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

  // ========================================
  // CONFIRM PAYMENT
  // ========================================

  const confirmPayment =
    useCallback(async () => {
      // ====================================
      // ERROR 1:
      // DUPLICATE PAYMENT SUBMISSION
      // ====================================

      if (
        submittingRef.current ||
        busy
      ) {
        if (import.meta.env.DEV) {
          console.warn(
            POS_ERRORS.DUPLICATE_PAYMENT.title,
            POS_ERRORS.DUPLICATE_PAYMENT.message
          );
        }

        // Keep the current processing popup.
        // Do not interrupt an active payment.

        return;
      }

      if (!canConfirm) {
        return;
      }

      // ====================================
      // ERROR 10:
      // INTERNET DISCONNECTED
      // ====================================

      if (!navigator.onLine && (method !== "Cash" || retryLocked)) {
        setError({
          ...POS_ERRORS.INTERNET_DISCONNECTED,

          // No new request was submitted.
          // Preserve any earlier unresolved
          // transaction protection.

          requiresVerification: retryLocked,
        });

        setCheckoutStatus("error");

        return;
      }

      // ====================================
      // VALIDATE CHECKOUT REQUEST
      // ====================================

      const mode = method === "Card" ? "Card" : method === "UPI" ? "UPI" : "Cash";
      const amountTendered =
        method === "Cash" ? (receivedPaise ?? 0) : payablePaise;

      const parsed =
        CheckoutRequestSchema.safeParse({
          paymentMode: mode,

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

      // ====================================
      // START PAYMENT PROCESSING
      // ====================================

      submittingRef.current = true;

      setConfirmedAmountPaise(
        payablePaise
      );

      setError(null);

      setCheckoutStatus("processing");

      try {
        // ==================================
        // EXECUTE CHECKOUT MUTATION
        // ==================================

        const completed =
          await onConfirmPayment(
            parsed.data
          );

        // Show success only after
        // actual order confirmation.

        if (completed === "buffered") {
          setRetryLocked(false);
          setError(null);
          setCheckoutStatus("buffered");
          return;
        }
        if (completed !== true) {
          throw new Error(
            "Order confirmation was not completed."
          );
        }

        // ==================================
        // PAYMENT SUCCESS
        // ==================================

        setRetryLocked(false);

        setError(null);

        setCheckoutStatus("success");

      } catch (cause) {
        // ==================================
        // DAY 5 AFTERNOON TASK 3
        // CENTRALIZED CHECKOUT ERROR HANDLING
        // ==================================

        const errorDetails =
          getCheckoutError(cause);

        // Preserve existing unresolved
        // transaction safety.

        const requiresVerification =
          retryLocked ||
          errorDetails.requiresVerification;

        setError({
          ...errorDetails,

          requiresVerification,
        });

        if (requiresVerification) {
          setRetryLocked(true);
        }

        // Display the actual mapped error
        // using the existing status popup.

        setCheckoutStatus("error");

        // Development debugging only.

        if (import.meta.env.DEV) {
          console.warn(
            "[CHECKOUT ERROR]",
            errorDetails.title
          );

          console.warn(
            "[CHECKOUT ERROR] Message:",
            errorDetails.message
          );

          console.warn(
            "[CHECKOUT ERROR] Verification required:",
            requiresVerification
          );
        }

      } finally {
        // Release local submission lock.

        submittingRef.current = false;
      }
    }, [
      busy,
      canConfirm,
      payablePaise,
      receivedPaise,
      retryLocked,
      onConfirmPayment,
      method,
    ]);

  // ========================================
  // VIEW RECEIPT
  // ========================================

  const handleViewReceipt =
    useCallback(() => {
      if (
        busy ||
        submittingRef.current ||
        checkoutStatus !== "success"
      ) {
        return;
      }

      // Existing Billing.tsx callback.

      if (onViewReceipt) {
        onViewReceipt();
      } else {
        // Backward compatibility
        // with existing test files.

        onClose();
      }
    }, [
      busy,
      checkoutStatus,
      onViewReceipt,
      onClose,
    ]);

  // ========================================
  // RETURN TO CHECKOUT AFTER ERROR
  // ========================================

  const handleBackToCheckout = () => {
    if (
      busy ||
      submittingRef.current
    ) {
      return;
    }

    // Returning to checkout must not
    // automatically submit another payment.
    //
    // Preserve original cash amount and
    // unresolved transaction protection.

    setCheckoutStatus("idle");

    if (!retryLocked) {
      setError(null);
    }
  };

  // ========================================
  // ENTER KEYBOARD SHORTCUT
  // ========================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (
        event.key !== "Enter" ||
        event.defaultPrevented ||
        event.isComposing ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey
      ) {
        return;
      }

      // Prevent repeated submission.

      if (
        busy ||
        submittingRef.current ||
        event.repeat
      ) {
        event.preventDefault();

        return;
      }

      // Preserve existing button behaviour.

      if (
        event.target instanceof HTMLElement &&
        event.target.closest(
          "button, [role='button'], [role='tab'], textarea, select, [contenteditable='true']"
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

      // Enter confirms valid Cash payment.

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

  // ========================================
  // CHANGE PAYMENT METHOD
  // ========================================

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
        setCashReceived("");
      } else {
        setCashReceived(
          total.toFixed(2)
        );
      }
    }
  };

  // ========================================
  // MODAL CLOSE HANDLER
  // ========================================

  const handleClose = () => {
    // Prevent closure during payment.

    if (
      busy ||
      submittingRef.current
    ) {
      return;
    }

    // After successful checkout,
    // open receipt or use fallback.

    if (checkoutStatus === "success") {
      handleViewReceipt();

      return;
    }

    // Preserve unresolved transaction state.

    if (retryLocked) {
      setCheckoutStatus("idle");

      return;
    }

    onClose();
  };

  // ========================================
  // MAIN CHECKOUT MODAL UI
  // ========================================

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
        !h-auto
        pos-checkout-modal-panel
        scrollbar-none
        [&::-webkit-scrollbar]:!hidden
        [-ms-overflow-style:none]
        [scrollbar-width:none]
        [&_*::-webkit-scrollbar]:!hidden
        [&_*]:[scrollbar-width:none]
      `}

      footer={
        !showStatusPopup && (
          <Button
            type="button"
            variant="primary"
            size="md"
            fullWidth
            disabled={!canConfirm}
            isLoading={busy}
            className="!min-h-10"
            aria-label="Confirm & Print Receipt"
            onClick={() => {
              void confirmPayment();
            }}
          >
            {retryLocked
              ? "Retry Original Checkout"
              : "Confirm Payment"}
          </Button>
        )
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
            onContinueBilling={handleClose}
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
            flex-col gap-2
            pb-2
          "
        >
          {/* =================================
              1. TOTAL AMOUNT
              ================================= */}

          <section
            className="
              w-full min-w-0
              shrink-0 space-y-1.5
            "
          >
            <div className="flex items-center justify-between">
              <label
                className="
                  block text-xs
                  font-bold uppercase
                  tracking-wider
                  text-primary dark:text-[#D4A373]
                "
              >
                Total Amount
              </label>

              <span
                className="
                  text-[11px] font-medium
                  text-text-muted dark:text-[#A89888]
                "
              >
                {orderId !== undefined && orderId !== null
                  ? `Order #${String(orderId).replace(/^#/, "")}`
                  : ""}
              </span>
            </div>

            <div
              className="
                flex min-h-12 w-full
                items-center justify-between rounded-xl
                border border-border-subtle
                bg-surface-alt px-4 py-2.5
                font-bold text-primary
                shadow-xs
                dark:bg-[#1C1510] dark:border-[#382B20] dark:text-[#FFF9F0]
              "
              aria-label="Total payable, read only"
            >
              <span className="text-xs uppercase tracking-wider text-text-muted dark:text-[#A89888] font-semibold">
                Amount Payable
              </span>
              <span className="text-xl font-extrabold text-primary dark:text-[#F3B77B]">
                {formatINR(payablePaise)}
              </span>
            </div>
          </section>

          {/* =================================
              2. UNRESOLVED PAYMENT WARNING
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
              3. PAYMENT METHOD SELECTION
              ================================= */}

          <fieldset
            disabled={paymentDetailsLocked}

            className={`
              m-0 w-full min-w-0
              shrink-0 border-0
              px-0 pt-3 pb-3 !mt-3

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
                tracking-wider
                text-primary dark:text-[#D4A373]
              "
            >
              Payment Method
            </legend>

            <SelectableGroup
              options={[
                {
                  value: "Cash",
                  label: "Cash",
                  icon: <PosIcon name="cash" size={24} aria-hidden="true" />,
                },
                {
                  value: "UPI",
                  label: "UPI",
                  icon: <PosIcon name="upi" size={24} aria-hidden="true" />,
                },
                {
                  value: "Card",
                  label: "Card",
                  icon: <PosIcon name="card" size={24} aria-hidden="true" />,
                },
              ]}

              value={method}

              onChange={
                changePaymentMethod
              }

              className="
                !my-0 w-full
                [&>button]:!min-h-12
                [&>button]:!py-2
                [&>button]:gap-2
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
                  dark:bg-[#1A140F] dark:border-[#382C22]

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
                {/* CASH AMOUNT INPUT */}

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
                    label="CASH RECEIVED (₹)"
                    placeholder={
                      payablePaise > 0
                        ? `₹${(payablePaise / 100).toFixed(2)}`
                        : "₹0.00"
                    }
                    onChange={
                      updateCashAmount
                    }
                  />
                </div>

                {/* QUICK CASH BUTTONS */}

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

                  {/* QUICK TENDER AMOUNTS */}

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

                {/* NUMERIC KEYPAD */}

                <div className="mt-2 w-full">
                  <NumericKeypad
                    className="gap-1.5 p-0 border-0 bg-transparent shadow-none"
                    buttonClassName="!min-h-[46px] !h-[46px] !text-lg !rounded-lg border border-border-subtle bg-surface hover:bg-surface-alt active:bg-surface-alt active:scale-95 text-primary font-bold shadow-none dark:!bg-[#241C16] dark:!border-[#3E3024] dark:!text-[#F5EEE0] dark:hover:!bg-[#2E241C] dark:active:!bg-[#382C22]"
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
                            previous === "0" ||
                            previous === ""
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
                            : ""
                      );

                      setError(null);
                    }}

                    onClear={() => {
                      updateCashAmount("");
                    }}
                  />
                </div>

                {/* CHANGE DUE SUMMARY */}

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

              {/* EXISTING CHECKOUT ERROR */}

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
                gap-3.5 rounded-xl
                border border-border-subtle
                bg-surface-alt dark:bg-[#1A140F] dark:border-[#382B20]
                p-6 text-center shadow-xs
              "
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-[#2E2015] dark:text-[#E5A86E] dark:border dark:border-[#523924] shadow-xs">
                <PosIcon
                  name="card"
                  size={28}
                  aria-hidden="true"
                />
              </div>

              <div className="space-y-1">
                <h4
                  className="
                    text-base font-bold
                    text-primary dark:text-[#FFF9F0]
                  "
                >
                  Card Payment (EDC Terminal)
                </h4>

                <p
                  className="
                    max-w-xs text-xs
                    text-text-muted dark:text-[#A89888] leading-relaxed
                  "
                >
                  Swipe, tap, or insert customer card on the terminal. Amount is pre-set and synced.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border dark:border-emerald-800/40">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Terminal Ready
              </div>
            </section>
          )}

          {/* =================================
              6. UPI PAYMENT
              ================================= */}

          {method === "UPI" && (
            <section
              className="
                flex w-full min-h-0
                flex-1 flex-col
                items-center justify-center
                gap-3 rounded-xl
                border border-border-subtle
                bg-surface-alt dark:bg-[#1A140F] dark:border-[#382B20]
                p-4 text-center shadow-xs
              "
            >
              {/* DEMO QR */}

              <div
                className="
                  rounded-2xl bg-white p-3.5 shadow-md
                  border-2 border-primary/20 dark:border-[#4A3728]
                "
              >
                <DemoUpiQR />
              </div>

              {/* UPI PROVIDERS */}

              <div
                className="
                  flex flex-wrap
                  items-center justify-center
                  gap-x-2.5 gap-y-1
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
                      rounded-full bg-surface px-2.5 py-0.5
                      border border-border-subtle
                      text-[11px] font-semibold text-text-muted
                      dark:bg-[#241C15] dark:border-[#3E2F23] dark:text-[#D4C3B3]
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
                  text-text-muted dark:text-[#8C7B6D]
                "
              >
                Scan QR with any UPI app to pay
              </p>
            </section>
          )}
        </div>
      )}
    </PopupModal>
  );
}

export default PosCheckoutModal;