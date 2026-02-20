"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, useCallback, useId } from "react";

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
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const titleId = useId();

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  }, [onClose]);

  // Focus trap va keyboard events
  useEffect(() => {
    if (!open) return;

    // Oldingi fokusni saqlash
    previousFocusRef.current = document.activeElement as HTMLElement;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
        return;
      }

      // Focus trap — Tab tugmasi bilan faqat modal ichida harakatlanish
      if (e.key === "Tab" && sheetRef.current) {
        const focusableElements = sheetRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable?.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable?.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";

    // Modal ochilganda birinchi elementga fokus berish
    requestAnimationFrame(() => {
      if (sheetRef.current) {
        const firstFocusable = sheetRef.current.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }
    });

    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
      // Fokusni qaytarish
      previousFocusRef.current?.focus();
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
        isClosing ? "animate-[fade-in_0.3s_ease_reverse_forwards]" : "animate-[fade-in_0.25s_ease]"
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />

      {/* Sheet (Mobile) / Modal (Desktop) */}
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={cn(
          "relative z-10 w-full overflow-hidden",
          "bg-[var(--glass-bg-ultra)] backdrop-blur-[40px]",
          "shadow-[var(--shadow-xl),inset_0_1px_0_0_var(--glass-highlight)]",
          // Mobile: bottom sheet
          "rounded-t-[var(--radius-xl)] max-h-[90vh]",
          "border-t border-[var(--glass-border)]",
          // Desktop: centered modal
          "md:rounded-[var(--radius-lg)] md:mx-4 md:border md:border-[var(--glass-border)]",
          sizes[size],
          isClosing
            ? "animate-[spring-up_0.3s_ease_reverse_forwards]"
            : "animate-[spring-up_0.4s_cubic-bezier(0.22,1,0.36,1)]"
        )}
      >
        {/* Handle bar (mobile only) */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-[5px] rounded-full bg-[var(--foreground)]/15" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--glass-border-subtle)]">
            <h2 id={titleId} className="text-[17px] font-semibold text-[var(--foreground)]">{title}</h2>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-full hover:bg-[var(--glass-bg)] hover:backdrop-blur-sm transition-all duration-300 [transition-timing-function:var(--spring-smooth)]"
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
