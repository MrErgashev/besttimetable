"use client";

import { Button } from "@/components/ui/Button";

interface ErrorDisplayProps {
  /** Error object from Next.js error boundary */
  error: Error & { digest?: string };
  /** Reset function to retry rendering */
  reset: () => void;
  /** Whether to show full-page layout (min-h-screen) or inline (min-h-[60vh]) */
  fullPage?: boolean;
  /** Whether to show a "home" link */
  showHomeLink?: boolean;
}

export function ErrorDisplay({
  reset,
  fullPage = false,
  showHomeLink = false,
}: ErrorDisplayProps) {
  return (
    <div
      className={`flex items-center justify-center px-4 ${
        fullPage ? "min-h-screen bg-[var(--background)]" : "min-h-[60vh]"
      }`}
    >
      <div className="text-center max-w-md space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-[var(--color-danger)]/10 flex items-center justify-center">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-danger)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--foreground)]">
          Xatolik yuz berdi
        </h2>
        <p className="text-sm text-[var(--muted)]">
          {showHomeLink
            ? "Sahifada kutilmagan xatolik yuz berdi. Iltimos, qayta urinib ko\u2018ring yoki bosh sahifaga qayting."
            : "Kutilmagan xatolik yuz berdi. Iltimos, qayta urinib ko\u2018ring."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset}>Qayta urinish</Button>
          {showHomeLink && (
            <a href="/">
              <Button variant="secondary">Bosh sahifa</Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
