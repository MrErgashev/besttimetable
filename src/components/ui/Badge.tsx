"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "accent";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm shadow-[inset_0_0.5px_0_0_var(--glass-highlight)]",
        variant === "default" &&
          "bg-[var(--glass-bg)] text-[var(--muted)] border border-[var(--glass-border-subtle)]",
        variant === "success" &&
          "bg-[var(--color-success)]/12 text-[var(--color-success)] border border-[var(--color-success)]/20",
        variant === "warning" &&
          "bg-[var(--color-warning)]/12 text-[var(--color-warning)] border border-[var(--color-warning)]/20",
        variant === "danger" &&
          "bg-[var(--color-danger)]/12 text-[var(--color-danger)] border border-[var(--color-danger)]/20",
        variant === "accent" &&
          "bg-[var(--color-accent)]/12 text-[var(--color-accent)] border border-[var(--color-accent)]/20",
        className
      )}
    >
      {children}
    </span>
  );
}
