"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const PAGE_TITLES: Record<string, string> = {
  "/": "BestTimetable",
  "/teachers": "O'qituvchilar",
  "/groups": "Guruhlar",
  "/subjects": "Fanlar",
  "/rooms": "Xonalar",
  "/timetable": "Dars jadvali",
  "/timetable/by-room": "Xona bo'yicha",
  "/timetable/by-teacher": "O'qituvchi bo'yicha",
  "/generate": "Avtomatik tuzish",
  "/import": "Import",
  "/export": "Eksport",
  "/substitutions": "O'rinbosar",
  "/changelog": "O'zgarishlar",
  "/settings": "Sozlamalar",
  "/notifications": "Bildirishnomalar",
  "/users": "Foydalanuvchilar",
};

export function MobileHeader() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || "BestTimetable";

  return (
    <header className="sticky top-0 z-30 md:hidden">
      <div
        className="flex items-center justify-between px-4 bg-[var(--surface)]/80 backdrop-blur-xl border-b border-[var(--border)]"
        style={{ height: "var(--header-height)", paddingTop: "var(--safe-area-top)" }}
      >
        <h1 className="text-[17px] font-semibold text-[var(--foreground)]">{title}</h1>
        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-full hover:bg-[var(--surface-secondary)] transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-danger)] rounded-full" />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
