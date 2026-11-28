// src/components/Header/AppShell.tsx
import type { AppShellProps } from "./Header.types";
import { appShellConfig, APP_SHELL_MAX_WIDTH } from "./Header.config";

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