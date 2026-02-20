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
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" &&
          "bg-[var(--surface-secondary)] text-[var(--muted)] border border-[var(--border)]",
        variant === "success" &&
          "bg-[var(--color-success)]/10 text-[var(--color-success)]",
        variant === "warning" &&
          "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
        variant === "danger" &&
          "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
        variant === "accent" &&
          "bg-[var(--color-accent)]/10 text-[var(--color-accent)]",
        className
      )}
    >
      {children}
    </span>
  );
}
