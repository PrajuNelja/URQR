import { useEffect, useState } from "react";
import { PopupModal } from "./PopupModal";
import { Button } from "../Buttons/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onExtend: () => void;
  onLogout: () => void;
  initialSeconds?: number;
}

export const SessionTimeoutModal = ({
  isOpen,
  onClose,
  onExtend,
  onLogout,
  initialSeconds = 60,
}: Props) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // Reset timer when modal opens
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) setSecondsLeft(initialSeconds);
  }

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Handle logout when timer hits 0 (Auto Expiry)
  useEffect(() => {
    if (isOpen && secondsLeft === 0) {
      onLogout();
    }
  }, [isOpen, secondsLeft, onLogout]);

  const progress = initialSeconds > 0 ? (secondsLeft / initialSeconds) * 100 : 0;

  return (
    <PopupModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      hideCloseButton={true}
      size="md"
      closeOnBackdrop={false}
      footer={
        <>
          <Button variant="outline" onClick={onLogout}>
            Log Out Now
          </Button>
          <Button variant="primary" onClick={onExtend} autoFocus>
            Extend Session
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <span className="inline-flex items-center rounded-full bg-warning-bg px-2.5 py-0.5 text-[11px] font-semibold text-warning border border-warning/20">
            JWT RS256 Expiring
          </span>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-semibold text-text">
            Session Expiring Soon
          </h3>
          <p className="text-xs leading-relaxed text-text-secondary">
            Your Manager POS session token will automatically expire in{" "}
            <strong className="font-mono text-text">{secondsLeft}s</strong>.
            Extend now to stay on the management dashboard.
          </p>
        </div>

        <div className="mt-2 space-y-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-alt">
            <div
              className="h-full rounded-full bg-warning transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-text-secondary">
            <span>Server-side jti revocation pending</span>
            <span>
              Press{" "}
              <kbd className="rounded border border-border bg-surface-alt px-1 font-mono text-[10px]">
                ESC
              </kbd>{" "}
              to dismiss
            </span>
          </div>
        </div>
      </div>
    </PopupModal>
  );
};