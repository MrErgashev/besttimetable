"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string;
  variant?: "success" | "error" | "info";
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({
  message,
  variant = "info",
  visible,
  onClose,
  duration = 3000,
}: ToastProps) {
  const [isLeaving, setIsLeaving] = useState(false);

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsLeaving(false);
      onClose();
    }, 200);
  }, [onClose]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(handleClose, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, handleClose]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60]" style={{ paddingTop: "var(--safe-area-top)" }}>
      <div
        className={cn(
          "flex items-center gap-2.5 px-4 py-3 rounded-[14px] shadow-[var(--shadow-lg)] border border-[var(--border)] min-w-[200px] max-w-[90vw]",
          "bg-[var(--surface)] text-[var(--foreground)]",
          isLeaving
            ? "animate-[toast-out_0.2s_ease_forwards]"
            : "animate-[toast-in_0.3s_cubic-bezier(0.32,0.72,0,1)]"
        )}
      >
        {/* Icon */}
        <div className="shrink-0">
          {variant === "success" && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[var(--color-success)]">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {variant === "error" && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[var(--color-danger)]">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
          {variant === "info" && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[var(--color-accent)]">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </div>

        {/* Message */}
        <span className="text-sm font-medium flex-1">{message}</span>

        {/* Close */}
        <button
          onClick={handleClose}
          className="shrink-0 p-0.5 rounded-full text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          aria-label="Yopish"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
