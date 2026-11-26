import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";
import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;

// Added a variant prop to handle the specific tenant-combobox spacing
interface PopoverContentProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
  variant?: "default" | "tenant";
}

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(({ align = "center", sideOffset = 4, variant = "default", className, ...props }, ref) => {
  const baseClasses = "z-50 outline-none data-[state=open]:animate-[fadeIn_150ms_cubic-bezier(0.16,1,0.3,1)]";
  
  const variantClasses = variant === "tenant"
    ? "w-[var(--radix-popover-trigger-width)] rounded-lg border border-primary bg-surface p-1"
    : "w-72 rounded-xl border border-border bg-surface p-4 text-text shadow-md";

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(baseClasses, variantClasses, className)}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

const PopoverArrow = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Arrow>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Arrow>
>(({ className, ...props }, ref) => (
  <PopoverPrimitive.Arrow
    ref={ref}
    className={cn("fill-surface", className)}
    {...props}
  />
));
PopoverArrow.displayName = PopoverPrimitive.Arrow.displayName;

export { Popover, PopoverAnchor, PopoverArrow, PopoverContent, PopoverTrigger };