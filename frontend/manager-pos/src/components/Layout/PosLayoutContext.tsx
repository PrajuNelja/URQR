
import {
  createContext,
  useContext,
  useLayoutEffect,
} from "react";

import type {
  Dispatch,
  SetStateAction,
} from "react";

import type {
  PosHeaderProps,
} from "../Header/PosHeader";

export type PosPageHeader = Omit<
  PosHeaderProps,
  "onMenuClick" | "menuOpen"
> & {
  navigationLocked?: boolean;
};

export interface PosLayoutContextValue {
  setPageHeader: Dispatch<
    SetStateAction<PosPageHeader | null>
  >;

  sidebarCollapsed: boolean;

  setSidebarCollapsed: Dispatch<
    SetStateAction<boolean>
  >;
}

export const PosLayoutContext =
  createContext<PosLayoutContextValue | null>(null);

export function usePosLayout() {
  const context = useContext(PosLayoutContext);

  if (!context) {
    throw new Error(
      "POS page must be rendered inside PosLayout"
    );
  }

  return context;
}

// Pass a memoized header configuration.
export function usePosPageHeader(
  header: PosPageHeader
) {
  const { setPageHeader } = usePosLayout();

  useLayoutEffect(() => {
    setPageHeader(header);

    return () => setPageHeader(null);
  }, [header, setPageHeader]);
}
