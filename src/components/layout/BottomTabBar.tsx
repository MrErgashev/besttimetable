"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";

const TABS = [
  {
    label: "Bosh sahifa",
    href: "/",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "Jadval",
    href: "/timetable",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    label: "Tuzish",
    href: "/generate",
    isCenter: true,
    icon: (_active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </svg>
    ),
  },
  {
    label: "Ma'lumotlar",
    href: "/teachers",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    subMenu: [
      { label: "O'qituvchilar", href: "/teachers" },
      { label: "Guruhlar", href: "/groups" },
      { label: "Fanlar", href: "/subjects" },
      { label: "Xonalar", href: "/rooms" },
    ],
  },
  {
    label: "Boshqaruv",
    href: "/settings",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    subMenu: [
      { label: "Sozlamalar", href: "/settings" },
      { label: "Import", href: "/import" },
      { label: "Eksport", href: "/export" },
      { label: "O'zgarishlar", href: "/changelog" },
    ],
  },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const [openSubMenu, setOpenSubMenu] = useState<number | null>(null);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      {/* Sub-menu popup */}
      {openSubMenu !== null && TABS[openSubMenu].subMenu && (
        <>
          <div
            className="fixed inset-0 z-[-1]"
            onClick={() => setOpenSubMenu(null)}
          />
          <div className="absolute bottom-full left-0 right-0 pb-2 px-4">
            <div className="bg-[var(--surface)] rounded-[16px] border border-[var(--border)] shadow-xl p-2">
              {TABS[openSubMenu].subMenu!.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpenSubMenu(null)}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-[12px] text-[15px] font-medium transition-colors",
                    pathname === item.href
                      ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                      : "text-[var(--foreground)] hover:bg-[var(--surface-secondary)]"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Tab bar */}
      <div
        className="flex items-end justify-around bg-[var(--surface)]/80 backdrop-blur-xl border-t border-[var(--border)]"
        style={{
          paddingBottom: "calc(var(--safe-area-bottom) + 8px)",
          height: "calc(var(--tab-bar-height) + var(--safe-area-bottom))",
        }}
      >
        {TABS.map((tab, idx) => {
          const isActive = tab.subMenu
            ? tab.subMenu.some((s) => pathname.startsWith(s.href))
            : pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href));

          if (tab.isCenter) {
            return (
              <Link key={idx} href={tab.href} className="flex flex-col items-center -mt-3">
                <div
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform press-effect",
                    "bg-[var(--color-accent)] text-white",
                    isActive && "scale-110"
                  )}
                >
                  {tab.icon(isActive)}
                </div>
                <span className="text-[10px] font-medium mt-1 text-[var(--color-accent)]">
                  {tab.label}
                </span>
              </Link>
            );
          }

          return (
            <button
              key={idx}
              onClick={() => {
                if (tab.subMenu) {
                  setOpenSubMenu(openSubMenu === idx ? null : idx);
                } else {
                  setOpenSubMenu(null);
                  window.location.href = tab.href;
                }
              }}
              className="flex flex-col items-center gap-0.5 pt-2 min-w-[64px]"
            >
              <div
                className={cn(
                  "transition-all duration-200",
                  isActive ? "text-[var(--color-accent)] scale-110" : "text-[var(--muted)]"
                )}
              >
                {tab.icon(isActive)}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  isActive ? "text-[var(--color-accent)]" : "text-[var(--muted)]"
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
