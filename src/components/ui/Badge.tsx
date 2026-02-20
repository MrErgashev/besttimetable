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
        "inline-flex items-center gap-1 rounded-[8px] px-2.5 py-1 text-xs font-medium",
        variant === "default" &&
          "bg-[var(--surface-hover)] text-[var(--muted)] border border-[var(--border)]",
        variant === "success" &&
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        variant === "warning" &&
          "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        variant === "danger" &&
          "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        variant === "accent" &&
          "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        className
      )}
    >
      {children}
    </span>
  );
}
