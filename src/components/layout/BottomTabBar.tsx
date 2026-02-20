"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ICON_PATHS } from "@/components/ui/Icon3D";

interface TabItem {
  key: string;
  href?: string;
  label: string;
  icon: string;
  center?: boolean;
  children?: { href: string; label: string; icon: string }[];
}

const BOTTOM_TABS: TabItem[] = [
  { key: "home", href: "/", label: "Bosh sahifa", icon: "Home" },
  { key: "timetable", href: "/timetable", label: "Jadval", icon: "Calendar" },
  { key: "generate", href: "/generate", label: "Tuzish", icon: "Sparkles", center: true },
  {
    key: "data",
    label: "Ma'lumotlar",
    icon: "Database",
    children: [
      { href: "/teachers", label: "O'qituvchilar", icon: "Users" },
      { href: "/groups", label: "Guruhlar", icon: "GraduationCap" },
      { href: "/subjects", label: "Fanlar", icon: "BookOpen" },
      { href: "/rooms", label: "Xonalar", icon: "Door" },
    ],
  },
  {
    key: "manage",
    label: "Boshqaruv",
    icon: "Settings",
    children: [
      { href: "/settings", label: "Sozlamalar", icon: "Settings" },
      { href: "/changelog", label: "O'zgarishlar", icon: "History" },
      { href: "/export", label: "Eksport", icon: "Download" },
      { href: "/import", label: "Import", icon: "Upload" },
      { href: "/substitutions", label: "O'rinbosar", icon: "ArrowLeftRight" },
    ],
  },
];

function haptic() {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(10);
  }
}

export function BottomTabBar() {
  const pathname = usePathname();
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const isTabActive = useCallback(
    (tab: TabItem) => {
      if (tab.href) {
        return tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
      }
      if (tab.children) {
        return tab.children.some((c) =>
          c.href === "/" ? pathname === "/" : pathname.startsWith(c.href)
        );
      }
      return false;
    },
    [pathname]
  );

  // Close popover when clicking outside
  useEffect(() => {
    if (!openSubMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpenSubMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick as unknown as EventListener);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick as unknown as EventListener);
    };
  }, [openSubMenu]);

  // Close submenu on browser back/forward navigation
  useEffect(() => {
    const handler = () => setOpenSubMenu(null);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40" ref={popoverRef}>
      {/* Sub-menu Popover */}
      {openSubMenu && (
        <div className="absolute bottom-full left-3 right-3 mb-2 animate-[popover-in_0.2s_cubic-bezier(0.32,0.72,0,1)]">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[16px] shadow-[var(--shadow-xl)] p-2">
            {BOTTOM_TABS.find((t) => t.key === openSubMenu)?.children?.map((child) => {
              const isChildActive = pathname.startsWith(child.href);
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-[10px] text-sm font-medium transition-all active:scale-[0.97]",
                    isChildActive
                      ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                      : "text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                  )}
                  onClick={haptic}
                >
                  <span className="w-5 h-5 shrink-0">{ICON_PATHS[child.icon]}</span>
                  {child.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Bar */}
      <div
        className="bg-[var(--surface)]/95 backdrop-blur-xl border-t border-[var(--border)] flex items-end justify-around"
        style={{ paddingBottom: "var(--safe-area-bottom)" }}
      >
        {BOTTOM_TABS.map((tab) => {
          const active = isTabActive(tab);
          const isCenter = tab.center;

          if (isCenter) {
            return (
              <Link
                key={tab.key}
                href={tab.href!}
                className="flex flex-col items-center justify-center -mt-3 active:scale-[0.90] transition-transform duration-100"
                onClick={haptic}
              >
                <div
                  className={cn(
                    "w-[52px] h-[52px] rounded-[16px] flex items-center justify-center shadow-[var(--shadow-md)] text-white",
                    active
                      ? "bg-gradient-to-br from-[#AF52DE] to-[#5856D6]"
                      : "bg-gradient-to-br from-[var(--color-accent)] to-[#5856D6]"
                  )}
                >
                  <span className="w-6 h-6">{ICON_PATHS[tab.icon]}</span>
                </div>
                <span className={cn(
                  "text-[10px] font-medium mt-1",
                  active ? "text-[var(--color-accent)]" : "text-[var(--muted)]"
                )}>
                  {tab.label}
                </span>
              </Link>
            );
          }

          const tabClassName = "flex flex-col items-center justify-center py-2 px-3 min-w-[64px] active:scale-[0.92] transition-transform duration-100";

          const tabContent = (
            <>
              <span
                className={cn(
                  "w-6 h-6 transition-colors",
                  active ? "text-[var(--color-accent)]" : "text-[var(--muted)]"
                )}
              >
                {ICON_PATHS[tab.icon]}
              </span>
              <span
                className={cn(
                  "text-[10px] font-medium mt-0.5 transition-colors",
                  active ? "text-[var(--color-accent)]" : "text-[var(--muted)]"
                )}
              >
                {tab.label}
              </span>
            </>
          );

          if (tab.href) {
            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={tabClassName}
                onClick={haptic}
              >
                {tabContent}
              </Link>
            );
          }

          return (
            <button
              key={tab.key}
              className={tabClassName}
              onClick={() => {
                haptic();
                setOpenSubMenu(openSubMenu === tab.key ? null : tab.key);
              }}
            >
              {tabContent}
            </button>
          );
        })}
      </div>
    </div>
  );
}
