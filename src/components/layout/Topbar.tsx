"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { useHydration } from "@/hooks/useHydration";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS } from "@/lib/constants";

export function Topbar() {
  const hydrated = useHydration();
  const router = useRouter();
  const { profile, role } = useRoleAccess();
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = hydrated && profile ? (profile.full_name || profile.email) : "";
  const roleLabel = hydrated ? (ROLE_LABELS[role] || role) : "";
  const initials = hydrated && displayName
    ? displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  // Tashqariga bosganda menuni yopish
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
    <header className="hidden md:flex fixed top-0 left-0 lg:left-[var(--sidebar-width)] right-0 z-20 items-center justify-between px-6 glass-primary border-b border-[var(--glass-border)] shadow-[0_1px_0_0_var(--glass-highlight)]" style={{ height: "var(--header-height)" }}>
      {/* Search */}
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <div className="relative w-full">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Qidirish..."
            className="w-full pl-9 pr-16 py-2 rounded-[var(--radius)] text-sm bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur-light)] border border-[var(--glass-border-subtle)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--color-accent)]/50 focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:outline-none transition-all duration-300 [transition-timing-function:var(--spring-smooth)] shadow-[inset_0_1px_2px_var(--glass-inner-shadow)]"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[var(--glass-bg)] backdrop-blur-sm border border-[var(--glass-border-subtle)] text-[10px] text-[var(--muted)] font-medium">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button
          className="relative p-2 rounded-[var(--radius-sm)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--glass-bg)] hover:backdrop-blur-sm transition-all duration-300 [transition-timing-function:var(--spring-smooth)]"
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

        {/* Profile + Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--glass-bg)] hover:backdrop-blur-sm transition-all duration-300 [transition-timing-function:var(--spring-smooth)]"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/80 backdrop-blur-sm flex items-center justify-center text-white text-sm font-semibold border border-white/20">
              {initials}
            </div>
            <span className="hidden sm:block text-sm font-medium text-[var(--foreground)]">
              {displayName || "Foydalanuvchi"}
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--muted)] hidden sm:block">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-[var(--radius-lg)] py-1 z-50 bg-[var(--glass-bg-ultra)] backdrop-blur-[40px] border border-[var(--glass-border)] shadow-[var(--shadow-xl),inset_0_1px_0_0_var(--glass-highlight)]">
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
    </header>
  );
}
