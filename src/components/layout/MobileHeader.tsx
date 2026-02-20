"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { NAV_ITEMS } from "@/lib/constants";

export function MobileHeader() {
  const pathname = usePathname();
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsCompact(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Get current page title
  const currentPage = NAV_ITEMS.find((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
  );
  const pageTitle = currentPage?.label || "BestTimetable";

  return (
    <header
      className="md:hidden sticky top-0 z-30 bg-[var(--surface)]/90 backdrop-blur-xl border-b border-[var(--border)] transition-all duration-200"
      style={{ paddingTop: "var(--safe-area-top)" }}
    >
      <div
        className={`flex items-center justify-between px-4 transition-all duration-200 ${
          isCompact ? "h-11" : "h-14"
        }`}
      >
        {/* Left: Page title */}
        <div className="flex items-center gap-2 min-w-0">
          <h1
            className={`font-bold text-[var(--foreground)] truncate transition-all duration-200 ${
              isCompact ? "text-base" : "text-lg"
            }`}
          >
            {pageTitle}
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <ThemeToggle />

          {/* Notification bell */}
          <button
            className="relative p-2 rounded-[10px] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-all active:scale-[0.95]"
            aria-label="Bildirishnomalar"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-danger)] rounded-full" />
          </button>

          {/* Profile avatar */}
          <button className="p-1 rounded-[10px] hover:bg-[var(--surface-hover)] transition-all active:scale-[0.95]">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[#5856D6] flex items-center justify-center text-white text-xs font-semibold">
              A
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
