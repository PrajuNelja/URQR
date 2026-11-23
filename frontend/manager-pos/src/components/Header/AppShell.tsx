// src/components/Header/AppShell.tsx

import type { AppShellProps } from "./Header.types";
import { appShellConfig, APP_SHELL_MAX_WIDTH } from "./Header.config";

/**
 * AppShell — layout wrapper for pages (Dashboard, Billing POS).
 *
 * <AppShell header={<Header ... />}>
 *   <YourPageContent />
 * </AppShell>
 */
export const AppShell = ({
  header,
  children,
  maxWidth = "xl",
  className = "",
}: AppShellProps) => {
  const widthClass = APP_SHELL_MAX_WIDTH[maxWidth];

  return (
    <div className={appShellConfig.wrapper}>
      <div className={`${appShellConfig.main} ${widthClass} ${className}`.trim()}>
        {header}
        {children}
      </div>
    </div>
  );
};

export default AppShell;