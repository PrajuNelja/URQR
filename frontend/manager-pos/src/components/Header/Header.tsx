// src/components/Header/Header.tsx
import type { HeaderProps } from "./Header.types";
import { headerConfig } from "./Header.config";

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
      <div className={headerConfig.left}>
        {logo}
        <div className={headerConfig.titleBlock}>
          <span className={headerConfig.title}>{title}</span>
          {subtitle && (
            <span className={headerConfig.subtitle}>{subtitle}</span>
          )}
        </div>
      </div>

      {navItems && navItems.length > 0 && (
        <nav className={headerConfig.nav} aria-label="Primary">
          {navItems.map((item) => {
            const isActive = item.key === activeNav;
            return (
              <button
                key={item.key}
                type="button"
                className={
                  isActive ? headerConfig.navItemActive : headerConfig.navItem
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

      {actions && <div className={headerConfig.actions}>{actions}</div>}
    </header>
  );
};

export default Header;