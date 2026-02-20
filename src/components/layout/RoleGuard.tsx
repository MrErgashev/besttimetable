"use client";

import { usePathname, useRouter } from "next/navigation";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { useHydration } from "@/hooks/useHydration";
import { Spinner } from "@/components/ui/Spinner";
import { GlassCard } from "@/components/ui/GlassCard";
import { ROLE_LABELS } from "@/lib/constants";

interface RoleGuardProps {
  children: React.ReactNode;
}

export function RoleGuard({ children }: RoleGuardProps) {
  const hydrated = useHydration();
  const pathname = usePathname();
  const router = useRouter();
  const { role, loading, canAccess } = useRoleAccess();

  if (!hydrated || loading) {
    return <Spinner className="py-20" />;
  }

  if (!canAccess(pathname)) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <GlassCard>
          <div className="py-8 space-y-4">
            <div className="text-5xl">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-[var(--color-danger)]">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Ruxsat yo&apos;q
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Bu sahifaga <strong>{ROLE_LABELS[role] || role}</strong> roli bilan kirish mumkin emas.
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 px-6 py-2.5 rounded-[10px] bg-[var(--color-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Bosh sahifaga qaytish
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return <>{children}</>;
}
