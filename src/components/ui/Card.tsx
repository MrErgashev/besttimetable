"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  pressable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding = "md", hover = false, pressable = false, children, ...props }, ref) => {
    const paddings = { none: "", sm: "p-3", md: "p-5 md:p-6", lg: "p-6 md:p-8" };
    return (
      <div
        ref={ref}
        className={cn(
          "apple-card",
          paddings[padding],
          hover && "hover:shadow-lg hover:-translate-y-0.5 cursor-pointer",
          pressable && "press-effect cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export { Card };
export { Card as GlassCard };
export default Card;
