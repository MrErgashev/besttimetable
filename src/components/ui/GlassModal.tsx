"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface GlassModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

export function GlassModal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: GlassModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [isClosing, setIsClosing] = useState(false);
  const dragStartY = useRef(0);
  const dragCurrentY = useRef(0);
  const isDragging = useRef(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 250);
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, handleClose]);

  // Touch drag-to-dismiss for mobile sheet
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    isDragging.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || !sheetRef.current) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    dragCurrentY.current = delta;
    if (delta > 0) {
      sheetRef.current.style.transform = `translateY(${delta}px)`;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current || !sheetRef.current) return;
    isDragging.current = false;
    if (dragCurrentY.current > 100) {
      handleClose();
    } else {
      sheetRef.current.style.transform = "";
    }
    dragCurrentY.current = 0;
  }, [handleClose]);

  if (!open) return null;

  // Mobile: Bottom Sheet
  if (isMobile) {
    return (
      <div
        ref={overlayRef}
        className={cn(
          "fixed inset-0 z-50 flex items-end",
          isClosing ? "animate-[fade-in_0.25s_ease_reverse_forwards]" : "animate-[fade-in_0.2s_ease]"
        )}
        onClick={(e) => {
          if (e.target === overlayRef.current) handleClose();
        }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Sheet */}
        <div
          ref={sheetRef}
          className={cn(
            "relative bg-[var(--surface)] rounded-t-[20px] w-full max-h-[90vh] overflow-y-auto shadow-[var(--shadow-xl)]",
            isClosing
              ? "animate-[sheet-down_0.25s_ease_forwards]"
              : "animate-[sheet-up_0.35s_cubic-bezier(0.32,0.72,0,1)]"
          )}
          style={{ paddingBottom: "calc(var(--safe-area-bottom) + 16px)" }}
        >
          {/* Handle bar */}
          <div
            className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-10 h-[5px] bg-[var(--muted-light)] rounded-full" />
          </div>

          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-5 pb-4">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                {title}
              </h2>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-full bg-[var(--surface-hover)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                aria-label="Yopish"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Content */}
          <div className="px-5 pb-4">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Desktop: Center Modal
  return (
    <div
      ref={overlayRef}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        isClosing ? "animate-[fade-in_0.2s_ease_reverse_forwards]" : "animate-[fade-in_0.15s_ease]"
      )}
      onClick={(e) => {
        if (e.target === overlayRef.current) handleClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Modal */}
      <div
        className={cn(
          "relative bg-[var(--surface)] border border-[var(--border)] rounded-[20px] p-6 w-full shadow-[var(--shadow-xl)]",
          isClosing
            ? "animate-[scale-in_0.2s_ease_reverse_forwards]"
            : "animate-[scale-in_0.2s_cubic-bezier(0.32,0.72,0,1)]",
          size === "sm" && "max-w-sm",
          size === "md" && "max-w-lg",
          size === "lg" && "max-w-2xl"
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              {title}
            </h2>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-full bg-[var(--surface-hover)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              aria-label="Yopish"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
