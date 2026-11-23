// src/components/Header/Header.tsx

import type { HeaderProps } from "./Header.types";
import { headerConfig } from "./Header.config";

/**
 * Header — top bar with logo, title, nav, and right actions.
 *
 * <Header
 *   variant="dashboard"
 *   title="Dashboard"
 *   subtitle="Business overview"
 *   logo={<Logo size="md" />}
 *   navItems={[{ key: "pos", label: "Billing POS" }, { key: "dash", label: "Dashboard" }]}
 *   activeNav="pos"
 *   onNavChange={(k) => setActive(k)}
 *   actions={<Button variant="ghost">Logout</Button>}
 * />
 */
export const Header = ({
  variant = "dashboard",
  title,
  subtitle,
  logo,
  navItems,
  activeNav,
  onNavChange,
  actions,
  className = "",
}: HeaderProps) => {
  return (
    <header
      className={`${headerConfig.base} ${className}`.trim()}
      data-variant={variant}
    >
      {/* Left: logo + title */}
      <div className={headerConfig.left}>
        {logo}
        <div className={headerConfig.titleBlock}>
          <span className={headerConfig.title}>{title}</span>
          {subtitle && (
            <span className={headerConfig.subtitle}>{subtitle}</span>
          )}
        </div>
      </div>

      {/* Center: nav */}
      {navItems && navItems.length > 0 && (
        <nav className={headerConfig.nav} aria-label="Primary">
          {navItems.map((item) => {
            const isActive = item.key === activeNav;
            return (
              <button
                key={item.key}
                type="button"
                className={
                  isActive
                    ? headerConfig.navItemActive
                    : headerConfig.navItem
                }
                onClick={() => onNavChange?.(item.key)}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      )}

      {/* Right: actions */}
      {actions && <div className={headerConfig.actions}>{actions}</div>}
    </header>
  );
};

export default Header;