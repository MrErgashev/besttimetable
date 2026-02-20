"use client";

import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[12px] font-semibold transition-all duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "active:scale-[0.97]",
        // Variants
        variant === "primary" &&
          "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]",
        variant === "secondary" &&
          "bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--foreground)] shadow-[var(--shadow-xs)]",
        variant === "danger" &&
          "bg-[var(--color-danger)] text-white hover:bg-red-600 shadow-[var(--shadow-sm)]",
        variant === "ghost" &&
          "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]",
        // Sizes
        size === "sm" && "px-3.5 py-1.5 text-sm min-h-[36px]",
        size === "md" && "px-5 py-2.5 text-sm min-h-[40px] md:min-h-[40px]",
        size === "lg" && "px-6 py-3 text-base min-h-[48px]",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
