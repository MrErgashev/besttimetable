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
            "h-12 md:h-11 w-full rounded-[var(--radius)] border bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur-light)] px-4 text-[15px] text-[var(--foreground)] placeholder:text-[var(--muted-light)] transition-all duration-300 [transition-timing-function:var(--spring-smooth)]",
            "focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/25 focus:border-[var(--color-accent)]/50",
            "shadow-[inset_0_1px_2px_var(--glass-inner-shadow)]",
            error ? "border-[var(--color-danger)]/50" : "border-[var(--glass-border-subtle)]",
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
