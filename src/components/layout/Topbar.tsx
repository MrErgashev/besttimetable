"use client";

import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Topbar() {
  return (
    <header className="glass fixed top-0 left-0 lg:left-64 right-0 h-16 z-20 flex items-center justify-between px-6">
      {/* Mobile logo */}
      <div className="lg:hidden">
        <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
          BestTimetable
        </h1>
      </div>

      {/* Search */}
      <div className="hidden sm:flex items-center gap-2 flex-1 max-w-md">
        <div className="relative w-full">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-light)]"
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
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-[var(--surface-solid)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-light)] focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          className="relative p-2 rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-all"
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
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
        </button>

        {/* Theme toggle (mobile) */}
        <div className="lg:hidden">
          <ThemeToggle />
        </div>

        {/* Profile */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[var(--surface)] transition-all">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-medium">
            A
          </div>
          <span className="hidden sm:block text-sm font-medium text-[var(--foreground)]">
            Admin
          </span>
        </button>
      </div>
    </header>
  );
}
