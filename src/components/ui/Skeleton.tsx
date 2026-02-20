"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-[var(--surface-hover)] rounded-[10px] animate-[skeleton-pulse_1.5s_ease-in-out_infinite]",
        className
      )}
    />
  );
}

interface SkeletonCardProps {
  lines?: number;
  avatar?: boolean;
  className?: string;
}

export function SkeletonCard({ lines = 3, avatar = false, className }: SkeletonCardProps) {
  return (
    <div className={cn("bg-[var(--surface)] border border-[var(--border)] rounded-[16px] p-6 shadow-[var(--shadow-sm)] space-y-4", className)}>
      {avatar && (
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      )}
      {!avatar && (
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn(
                "h-4",
                i === 0 && "w-3/4",
                i === 1 && "w-full",
                i === 2 && "w-1/2",
                i > 2 && "w-2/3"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
