"use client";

export function Topbar() {
  return (
    <header className="hidden md:flex fixed top-0 left-0 lg:left-[var(--sidebar-width)] right-0 z-20 items-center justify-between px-6 bg-[var(--surface)]/80 backdrop-blur-xl border-b border-[var(--border)]" style={{ height: "var(--header-height)" }}>
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
            className="w-full pl-9 pr-16 py-2 rounded-[10px] text-sm bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:outline-none transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[10px] text-[var(--muted)] font-medium">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button
          className="relative p-2 rounded-[10px] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-colors"
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

        {/* Profile */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] hover:bg-[var(--surface-secondary)] transition-colors">
          <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white text-sm font-semibold">
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
