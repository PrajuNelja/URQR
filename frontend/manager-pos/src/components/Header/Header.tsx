import { HEADER_VARIANTS, headerConfig } from "./Header.config";
import type { HeaderProps } from "./Header.types";

export const Header = ({
  variant = "dashboard",
  title,
  subtitle,
  logo,
  center,
  titleClassName = "",
  navItems,
  activeNav,
  onNavChange,
  actions,
  className = "",
}: HeaderProps) => {
  const isBilling = variant === "billing";

  return (
    <header
      data-variant={variant}
      className={[
        headerConfig.base,
        HEADER_VARIANTS[variant],
        className,
      ].filter(Boolean).join(" ")}
    >
      {/* LEFT SIDE: TITLE */}
      <div className={`${headerConfig.left} shrink-0`}>
        {logo}

        <div className={headerConfig.titleBlock}>
          {isBilling ? (
            <h1
              className={`${headerConfig.title} ${titleClassName}`}
            >
              {title}
            </h1>
          ) : (
            <span
              className={`${headerConfig.title} ${titleClassName}`}
            >
              {title}
            </span>
          )}

          {subtitle && (
            <span className={headerConfig.subtitle}>
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {/* CENTER: OPTIONAL SEARCH OR CONTENT */}
      {center && (
        <div
          className={
            isBilling
              ? "order-3 w-full min-w-0 flex-1 sm:order-none sm:w-auto"
              : "min-w-0 flex-1"
          }
        >
          {center}
        </div>
      )}

      {/* EXISTING NAVIGATION */}
      {navItems && navItems.length > 0 && (
        <nav
          className={headerConfig.nav}
          aria-label="Primary"
        >
          {navItems.map((item) => {
            const selected = item.key === activeNav;

            return (
              <button
                key={item.key}
                type="button"
                className={
                  selected
                    ? headerConfig.navItemActive
                    : headerConfig.navItem
                }
                onClick={() =>
                  onNavChange?.(item.key)
                }
                aria-current={
                  selected ? "page" : undefined
                }
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      )}

      {/* RIGHT SIDE: REUSABLE ACTIONS */}
      {actions && (
        <div
          className={[
            headerConfig.actions,
            isBilling ? "ml-auto shrink-0" : "",
          ].join(" ")}
        >
          {actions}
        </div>
      )}
    </header>
  );
};

export default Header;
