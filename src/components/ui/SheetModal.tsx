"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, useCallback } from "react";

interface SheetModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export function SheetModal({ open, onClose, title, children, size = "md" }: SheetModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 250);
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, handleClose]);

  // Touch drag to dismiss (mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    currentY.current = e.touches[0].clientY - startY.current;
    if (currentY.current > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${currentY.current}px)`;
    }
  };
  const handleTouchEnd = () => {
    if (currentY.current > 120) {
      handleClose();
    } else if (sheetRef.current) {
      sheetRef.current.style.transform = "";
    }
    currentY.current = 0;
  };

  if (!open && !isClosing) return null;

  const sizes = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-end md:items-center md:justify-center",
        isClosing ? "animate-[fade-in_0.25s_ease_reverse_forwards]" : "animate-[fade-in_0.2s_ease]"
      )}
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Sheet (Mobile) / Modal (Desktop) */}
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={cn(
          "relative z-10 w-full bg-[var(--surface)] overflow-hidden",
          // Mobile: bottom sheet
          "rounded-t-[20px] max-h-[90vh]",
          // Desktop: centered modal
          "md:rounded-[16px] md:mx-4",
          sizes[size],
          isClosing
            ? "animate-[spring-up_0.25s_ease_reverse_forwards]"
            : "animate-[spring-up_0.35s_cubic-bezier(0.32,0.72,0,1)]"
        )}
      >
        {/* Handle bar (mobile only) */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-[5px] rounded-full bg-[var(--muted-light)]/40" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
            <h2 className="text-[17px] font-semibold text-[var(--foreground)]">{title}</h2>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-full hover:bg-[var(--surface-secondary)] transition-colors"
              aria-label="Yopish"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="px-5 py-4 overflow-y-auto max-h-[70vh]">
          {children}
        </div>
      </div>
    </div>
  );
}

export { SheetModal as GlassModal };
export default SheetModal;
