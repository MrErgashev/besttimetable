"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Icon3D } from "@/components/ui/Icon3D";
import { NAV_ITEMS } from "@/lib/constants";

// Group nav items for visual separation
const NAV_GROUPS = [
  { items: ["/"], label: "Asosiy" },
  { items: ["/teachers", "/groups", "/subjects", "/rooms"], label: "Ma'lumotlar" },
  { items: ["/timetable", "/generate"], label: "Jadval" },
  { items: ["/import", "/export", "/substitutions"], label: "Amallar" },
  { items: ["/users", "/changelog", "/settings"], label: "Tizim" },
];

export function Sidebar() {
  const pathname = usePathname();

  const getGroup = (href: string) => {
    return NAV_GROUPS.findIndex((g) => g.items.includes(href));
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-72 flex-col p-5 z-30 hidden md:flex bg-[var(--surface)] border-r border-[var(--border)]">
      {/* Logo */}
      <div className="mb-8 px-3">
        <h1 className="text-xl font-bold text-[var(--foreground)]">
          BestTimetable
        </h1>
        <p className="text-xs text-[var(--muted)] mt-0.5">
          Dars jadvali tizimi
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto scrollbar-hide">
        {NAV_ITEMS.map((item, index) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          const currentGroup = getGroup(item.href);
          const prevGroup = index > 0 ? getGroup(NAV_ITEMS[index - 1].href) : currentGroup;
          const showDivider = index > 0 && currentGroup !== prevGroup;

          return (
            <div key={item.href}>
              {showDivider && (
                <div className="my-2 mx-3 border-t border-[var(--border)]" />
              )}
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                )}
              >
                <Icon3D
                  name={item.icon}
                  size="sm"
                  flat={!isActive}
                  className={isActive ? "" : "opacity-70"}
                />
                {item.label}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Theme toggle at bottom */}
      <div className="mt-auto pt-4 border-t border-[var(--border)]">
        <div className="flex items-center justify-between px-3">
          <span className="text-xs text-[var(--muted)]">Tema</span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
