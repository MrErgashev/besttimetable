"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { useFilteredNotifications } from "@/hooks/useFilteredNotifications";
import type { UserRole } from "@/lib/types";

interface SubMenuItem {
  label: string;
  href: string;
  roles: UserRole[];
}

interface TabItem {
  label: string;
  href: string;
  roles: UserRole[];
  isCenter?: boolean;
  icon: (active: boolean) => React.ReactNode;
  subMenu?: SubMenuItem[];
  showBadge?: boolean;
}

const adminRoles: UserRole[] = ["super_admin", "admin"];

// ─── Icon Components ────────────────────────────────────────────────────────

const HomeIcon = (active: boolean) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const CalendarIcon = (active: boolean) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const SparklesIcon = (_active: boolean) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

const UsersIcon = (active: boolean) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const SettingsIcon = (active: boolean) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const BellIcon = (active: boolean) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

// Clipboard-list icon — O'qituvchi "Darslarim" tabi uchun
const ClipboardListIcon = (active: boolean) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" />
  </svg>
);

// Building icon — Xona jadvali tabi uchun
const BuildingIcon = (active: boolean) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
  </svg>
);

// User icon — Talaba "O'qituvchilar" tabi uchun
const UserIcon = (active: boolean) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// GraduationCap icon — Talaba "Jadvalim" center tabi uchun
const GraduationCapIcon = (_active: boolean) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
    <path d="M22 10v6" />
    <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
  </svg>
);

// ─── Tab Configurations by Role ─────────────────────────────────────────────

const ADMIN_TABS: TabItem[] = [
  {
    label: "Bosh sahifa",
    href: "/",
    roles: adminRoles,
    icon: HomeIcon,
  },
  {
    label: "Jadval",
    href: "/timetable",
    roles: adminRoles,
    icon: CalendarIcon,
  },
  {
    label: "Tuzish",
    href: "/generate",
    isCenter: true,
    roles: adminRoles,
    icon: SparklesIcon,
  },
  {
    label: "Ma'lumotlar",
    href: "/teachers",
    roles: adminRoles,
    icon: UsersIcon,
    subMenu: [
      { label: "O'qituvchilar", href: "/teachers", roles: adminRoles },
      { label: "Guruhlar", href: "/groups", roles: adminRoles },
      { label: "Fanlar", href: "/subjects", roles: adminRoles },
      { label: "Xonalar", href: "/rooms", roles: adminRoles },
    ],
  },
  {
    label: "Boshqaruv",
    href: "/settings",
    roles: adminRoles,
    icon: SettingsIcon,
    subMenu: [
      { label: "Foydalanuvchilar", href: "/users", roles: adminRoles },
      { label: "O'rinbosar", href: "/substitutions", roles: adminRoles },
      { label: "Demo data", href: "/demo-data", roles: ["super_admin"] as UserRole[] },
      { label: "Sozlamalar", href: "/settings", roles: adminRoles },
      { label: "Import", href: "/import", roles: adminRoles },
      { label: "Eksport", href: "/export", roles: adminRoles },
      { label: "O'zgarishlar", href: "/changelog", roles: adminRoles },
    ],
  },
];

const TEACHER_TABS: TabItem[] = [
  {
    label: "Bosh sahifa",
    href: "/",
    roles: ["teacher"],
    icon: HomeIcon,
  },
  {
    label: "Darslarim",
    href: "/timetable/by-teacher",
    roles: ["teacher"],
    icon: ClipboardListIcon,
  },
  {
    label: "Jadval",
    href: "/timetable",
    isCenter: true,
    roles: ["teacher"],
    icon: CalendarIcon,
  },
  {
    label: "Xabarlar",
    href: "/notifications",
    roles: ["teacher"],
    icon: BellIcon,
    showBadge: true,
  },
  {
    label: "Xonalar",
    href: "/timetable/by-room",
    roles: ["teacher"],
    icon: BuildingIcon,
  },
];

const STUDENT_TABS: TabItem[] = [
  {
    label: "Bosh sahifa",
    href: "/",
    roles: ["student"],
    icon: HomeIcon,
  },
  {
    label: "O'qituvchilar",
    href: "/timetable/by-teacher",
    roles: ["student"],
    icon: UserIcon,
  },
  {
    label: "Jadvalim",
    href: "/timetable",
    isCenter: true,
    roles: ["student"],
    icon: GraduationCapIcon,
  },
  {
    label: "Xabarlar",
    href: "/notifications",
    roles: ["student"],
    icon: BellIcon,
    showBadge: true,
  },
  {
    label: "Xonalar",
    href: "/timetable/by-room",
    roles: ["student"],
    icon: BuildingIcon,
  },
];

// ─── Component ──────────────────────────────────────────────────────────────

export function BottomTabBar() {
  const pathname = usePathname();
  const [openSubMenu, setOpenSubMenu] = useState<number | null>(null);
  const { role } = useRoleAccess();
  const { unreadCount } = useFilteredNotifications();

  const visibleTabs = useMemo(() => {
    if (role === "teacher") return TEACHER_TABS;
    if (role === "student") return STUDENT_TABS;
    // admin, super_admin
    return ADMIN_TABS.map((tab) => ({
      ...tab,
      subMenu: tab.subMenu?.filter((item) => item.roles.includes(role)),
    }));
  }, [role]);

  return (
    <nav className="relative z-40 md:hidden shrink-0">
      {/* Sub-menu popup */}
      {openSubMenu !== null && visibleTabs[openSubMenu]?.subMenu && (
        <>
          <div
            className="fixed inset-0 z-[-1]"
            onClick={() => setOpenSubMenu(null)}
          />
          <div className="absolute bottom-full left-0 right-0 pb-2 px-4">
            <div className="bg-[var(--glass-bg-ultra)] backdrop-blur-[40px] rounded-[var(--radius-lg)] border border-[var(--glass-border)] shadow-[var(--shadow-xl),inset_0_1px_0_0_var(--glass-highlight)] p-2">
              {visibleTabs[openSubMenu].subMenu!.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpenSubMenu(null)}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-[var(--radius)] text-[15px] font-medium transition-all duration-300 [transition-timing-function:var(--spring-smooth)]",
                    pathname === item.href
                      ? "bg-[var(--color-accent)]/12 text-[var(--color-accent)] backdrop-blur-sm"
                      : "text-[var(--foreground)] hover:bg-[var(--glass-bg)]"
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
        className="flex items-end justify-around glass-primary border-t border-[var(--glass-border)] shadow-[0_-1px_0_0_var(--glass-highlight),var(--shadow-lg)]"
        style={{
          paddingBottom: "calc(var(--safe-area-bottom) + 8px)",
          height: "calc(var(--tab-bar-height) + var(--safe-area-bottom))",
        }}
      >
        {visibleTabs.map((tab, idx) => {
          const isActive = tab.subMenu?.length
            ? tab.subMenu.some((s) => pathname.startsWith(s.href))
            : pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href));

          if (tab.isCenter) {
            return (
              <Link key={idx} href={tab.href} className="flex flex-col items-center -mt-3">
                <div
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center press-effect",
                    "bg-[var(--color-accent)]/85 backdrop-blur-lg text-white",
                    "border border-white/25",
                    "shadow-[0_4px_20px_rgba(0,122,255,0.25),inset_0_1px_0_0_rgba(255,255,255,0.3)]",
                    "transition-all duration-300 [transition-timing-function:var(--spring-bounce)]",
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
                if (tab.subMenu?.length) {
                  setOpenSubMenu(openSubMenu === idx ? null : idx);
                } else {
                  setOpenSubMenu(null);
                  window.location.href = tab.href;
                }
              }}
              className="flex flex-col items-center gap-0.5 pt-2 min-w-[64px] relative"
            >
              <div
                className={cn(
                  "relative transition-all duration-300 [transition-timing-function:var(--spring-bounce)]",
                  isActive ? "text-[var(--color-accent)] scale-110 drop-shadow-[0_0_4px_rgba(0,122,255,0.3)]" : "text-[var(--muted)]"
                )}
              >
                {tab.icon(isActive)}
                {/* Notification badge */}
                {tab.showBadge && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[var(--color-danger)] text-white text-[10px] font-bold px-1 shadow-[0_2px_8px_rgba(255,59,48,0.4)]">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
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
