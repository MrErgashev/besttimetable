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
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        // Variants
        variant === "primary" &&
          "bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/25",
        variant === "secondary" &&
          "glass hover:bg-[var(--surface-hover)] text-[var(--foreground)]",
        variant === "danger" &&
          "bg-danger text-white hover:bg-red-600 shadow-lg shadow-danger/25",
        variant === "ghost" &&
          "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]",
        // Sizes
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2.5 text-sm",
        size === "lg" && "px-6 py-3 text-base",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
