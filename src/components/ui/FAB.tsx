"use client";

import { cn } from "@/lib/utils";

interface FABProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
}

export function FAB({ onClick, icon, label, className }: FABProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-[calc(var(--tab-bar-height)+var(--safe-area-bottom)+16px)] md:bottom-6 right-4 md:right-6 z-30",
        "w-14 h-14 rounded-full bg-[var(--color-accent)]/85 text-white backdrop-blur-lg",
        "border border-white/25",
        "shadow-[0_8px_32px_rgba(0,122,255,0.3),inset_0_1px_0_0_rgba(255,255,255,0.3)]",
        "flex items-center justify-center press-effect",
        "hover:bg-[var(--color-accent)] transition-all duration-300 [transition-timing-function:var(--spring-smooth)]",
        className
      )}
      aria-label={label || "Qo'shish"}
    >
      {icon || (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      )}
    </button>
  );
}
