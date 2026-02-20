"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth, children, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 press-effect focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/30 disabled:opacity-50 disabled:pointer-events-none";
    const variants = {
      primary:
        "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] shadow-sm",
      secondary:
        "bg-[var(--surface-secondary)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface-hover)]",
      danger: "bg-[var(--color-danger)] text-white hover:opacity-90",
      ghost: "text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10",
    };
    const sizes = {
      sm: "h-9 px-3 text-sm rounded-[10px]",
      md: "h-11 px-5 text-sm rounded-[12px] md:h-10",
      lg: "h-12 px-6 text-base rounded-[14px]",
    };
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
export type { ButtonProps };
export default Button;
