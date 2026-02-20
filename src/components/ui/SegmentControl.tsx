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
        "inline-flex items-center gap-0.5 p-0.5 rounded-[10px] bg-[var(--surface-secondary)]",
        className
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-[8px] transition-all duration-200",
            value === opt.value
              ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
