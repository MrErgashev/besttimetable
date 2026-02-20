"use client";

import { cn } from "@/lib/utils";

export function Spinner({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-[var(--border-strong)] border-t-[var(--color-accent)]",
          sizes[size]
        )}
      />
    </div>
  );
}
