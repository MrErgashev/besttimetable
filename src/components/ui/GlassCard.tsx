"use client";

import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

export function AppleCard({
  children,
  className,
  padding = "md",
  hover = false,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "bg-[var(--surface)] border border-[var(--border)] rounded-[16px] shadow-[var(--shadow-md)]",
        padding === "sm" && "p-4",
        padding === "md" && "p-6",
        padding === "lg" && "p-8",
        padding === "none" && "p-0",
        hover &&
          "transition-apple hover:shadow-[var(--shadow-lg)] hover:-translate-y-[2px] cursor-pointer active:scale-[0.98]",
        className
      )}
    >
      {children}
    </div>
  );
}

// Backward compatibility alias
export const GlassCard = AppleCard;
