"use client";

import { cn } from "@/lib/utils";

interface SegmentControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentControlProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 p-1 rounded-[var(--radius)] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur-light)] border border-[var(--glass-border-subtle)]",
        className
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-[calc(var(--radius)-4px)] transition-all duration-300 [transition-timing-function:var(--spring-smooth)]",
            value === opt.value
              ? "bg-[var(--glass-bg-heavy)] backdrop-blur-sm text-[var(--foreground)] shadow-sm border border-[var(--glass-border)] shadow-[0_1px_4px_rgba(0,0,0,0.06),inset_0_1px_0_0_var(--glass-highlight)]"
              : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--glass-bg)]"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
