"use client";

import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

export function GlassCard({
  children,
  className,
  padding = "md",
  hover = false,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass rounded-2xl",
        padding === "sm" && "p-4",
        padding === "md" && "p-6",
        padding === "lg" && "p-8",
        padding === "none" && "p-0",
        hover &&
          "transition-glass hover:shadow-xl hover:-translate-y-0.5 cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
