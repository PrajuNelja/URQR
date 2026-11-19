// src/components/DataCard/Card.tsx
// Base surface wrapper — used everywhere (catalog, cart, payment, KPIs, charts)

import { forwardRef } from "react";
import type { CardProps } from "./DataCard.types";
import {
  CARD_BASE_CLASSES,
  CARD_PADDING,
  CARD_VARIANTS,
  CARD_INTERACTIVE,
} from "./DataCard.config";

/**
 * Card — base surface wrapper.
 *
 * <Card>Hello</Card>
 * <Card padding="sm" variant="outline">Hello</Card>
 * <Card interactive onClick={...}>Clickable</Card>
 * <Card as="section">Semantic</Card>
 */
export const Card = forwardRef<HTMLElement, CardProps>(
  (
    {
      as: Component = "div",
      padding = "lg",
      variant = "default",
      interactive = false,
      className = "",
      children,
      ...rest
    },
    ref
  ) => {
    const classes = [
      CARD_BASE_CLASSES,
      CARD_VARIANTS[variant],
      CARD_PADDING[padding],
      interactive ? CARD_INTERACTIVE : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <Component ref={ref} className={classes} {...rest}>
        {children}
      </Component>
    );
  }
);

Card.displayName = "Card";

export default Card;