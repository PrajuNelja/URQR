// src/components/Header/Header.tsx

// 1. Imports
import React from "react";
import { headerConfig } from "./Header.config";
import { Logo } from "../Logo/Logo"; // Using our reusable Logo!
import type { HeaderProps } from "./Header.types";

// 2. Component
export const Header: React.FC<HeaderProps> = ({
  variant = "dashboard",
  title,
  subtitle,
  actions,
}) => {
  // 3. Handlers (None needed)

  // 4. Render Variables
  const currentVariant = headerConfig.variants[variant];

  // 5. Export / Return
  return (
    <header className={`${headerConfig.base} ${currentVariant.container}`}>
      
      {/* Left Side: Logo and Title */}
      <div className="flex items-center gap-6">
        {/* Show Logo for dashboard, hide for compact */}
        {variant !== "compact" && <Logo size="md" showText={false} />}
        
        <div>
          {title && <h1 className={currentVariant.title}>{title}</h1>}
          {subtitle && <p className={currentVariant.subtitle}>{subtitle}</p>}
        </div>
      </div>

      {/* Right Side: Actions (e.g., Profile, Logout, Date) */}
      {actions && (
        <div className="flex items-center gap-4">
          {actions}
        </div>
      )}

    </header>
  );
};