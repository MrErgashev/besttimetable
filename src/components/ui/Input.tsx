"use client";

import { cn } from "@/lib/utils";
import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13px] font-medium text-[var(--muted)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-12 md:h-11 w-full rounded-[10px] border bg-[var(--surface)] px-4 text-[15px] text-[var(--foreground)] placeholder:text-[var(--muted-light)] transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)]",
            error ? "border-[var(--color-danger)]" : "border-[var(--border)]",
            className
          )}
          {...props}
        />
        {error && <p className="text-[12px] text-[var(--color-danger)]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
export default Input;
