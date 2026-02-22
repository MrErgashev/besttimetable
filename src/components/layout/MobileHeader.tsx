"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { useHydration } from "@/hooks/useHydration";
import { useAuth } from "@/hooks/useAuth";
import { useFilteredNotifications } from "@/hooks/useFilteredNotifications";
import { ROLE_LABELS } from "@/lib/constants";

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
  const router = useRouter();
  const hydrated = useHydration();
  const { profile, role } = useRoleAccess();
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const title = PAGE_TITLES[pathname] || "BestTimetable";

  const displayName = hydrated && profile ? (profile.full_name || profile.email) : "";
  const roleLabel = hydrated ? (ROLE_LABELS[role] || role) : "";
  const initials = hydrated && displayName
    ? displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  // O'qilmagan bildirishnomalar soni (role-based filtrlangan)
  const { unreadCount } = useFilteredNotifications();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <header className="relative z-30 md:hidden shrink-0">
      <div
        className="flex items-center justify-between px-4 glass-primary border-b border-[var(--glass-border)] shadow-[0_1px_0_0_var(--glass-highlight)]"
        style={{ height: "var(--header-height)", paddingTop: "var(--safe-area-top)" }}
      >
        {title === "BestTimetable" ? (
          <>
            <img
              src="/images/logo-light.png"
              alt="Oriental Universiteti"
              className="h-8 w-auto block dark:hidden"
            />
            <img
              src="/images/logo-dark.png"
              alt="Oriental Universiteti"
              className="h-8 w-auto hidden dark:block"
            />
          </>
        ) : (
          <h1 className="text-[17px] font-semibold text-[var(--foreground)]">{title}</h1>
        )}
        <div className="flex items-center gap-2">
          <Link href="/notifications" className="relative p-2 rounded-full hover:bg-[var(--glass-bg)] hover:backdrop-blur-sm transition-all duration-300 [transition-timing-function:var(--spring-smooth)]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-[var(--color-danger)] text-white text-[10px] font-bold px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
          <ThemeToggle />

          {/* User avatar + dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 rounded-full bg-[var(--color-accent)]/80 backdrop-blur-sm flex items-center justify-center text-white text-xs font-semibold border border-white/20"
            >
              {initials}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-[var(--radius-lg)] py-1 z-50 bg-[var(--glass-bg-ultra)] backdrop-blur-[40px] border border-[var(--glass-border)] shadow-[var(--shadow-xl),inset_0_1px_0_0_var(--glass-highlight)]">
                <div className="px-4 py-3 border-b border-[var(--glass-border-subtle)]">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">{displayName}</p>
                  <p className="text-xs text-[var(--muted)]">{roleLabel}</p>
                </div>
                <button
                  onClick={async () => {
                    setMenuOpen(false);
                    await signOut();
                    router.push("/login");
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-all duration-300 [transition-timing-function:var(--spring-smooth)]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Chiqish
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
