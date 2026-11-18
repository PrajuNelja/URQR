// src/components/PopupModal/PopupModal.types.ts

import type { ReactNode } from "react";


export interface PopupModalProps {
  /** Whether the modal is open or not */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** The main title of the modal */
  title: string;
  /** The content inside the modal */
  children: ReactNode;
  /** Text for the confirm button (default: "Confirm") */
  confirmText?: string;
  /** Text for the cancel button (default: "Cancel") */
  cancelText?: string;
  /** Function to run when confirm is clicked */
  onConfirm?: () => void;
  /** Shows a loading spinner on the confirm button */
  isLoading?: boolean;
  /** Changes the confirm button color to red (for delete/logout) */
  isDanger?: boolean;
}