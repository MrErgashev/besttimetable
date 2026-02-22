"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
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
          Sahifada kutilmagan xatolik yuz berdi. Iltimos, qayta urinib
          ko&apos;ring yoki bosh sahifaga qayting.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset}>Qayta urinish</Button>
          <a href="/">
            <Button variant="secondary">Bosh sahifa</Button>
          </a>
        </div>
      </div>
    </div>
  );
}
