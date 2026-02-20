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
      "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 [transition-timing-function:var(--spring-smooth)] press-effect focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/30 disabled:opacity-50 disabled:pointer-events-none";
    const variants = {
      primary:
        "bg-[var(--color-accent)]/85 text-white backdrop-blur-sm hover:bg-[var(--color-accent)] shadow-sm border border-white/20",
      secondary:
        "bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur-light)] text-[var(--foreground)] border border-[var(--glass-border-subtle)] hover:bg-[var(--glass-bg-heavy)]",
      danger: "bg-[var(--color-danger)]/85 text-white backdrop-blur-sm hover:bg-[var(--color-danger)] border border-white/20",
      ghost: "text-[var(--color-accent)] hover:bg-[var(--glass-bg)] hover:backdrop-blur-sm",
    };
    const sizes = {
      sm: "h-9 px-3 text-sm rounded-[var(--radius-sm)]",
      md: "h-11 px-5 text-sm rounded-[var(--radius)] md:h-10",
      lg: "h-12 px-6 text-base rounded-[var(--radius)]",
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
