"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { useHydration } from "@/hooks/useHydration";
import { Spinner } from "@/components/ui/Spinner";

export default function NotificationsPage() {
  const hydrated = useHydration();

  if (!hydrated) return <Spinner className="py-20" />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight md:text-[32px]">Bildirishnomalar</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Jadval o&apos;zgarishlari haqida bildirishnomalar
        </p>
      </div>

      <GlassCard>
        <div className="text-center py-12">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-[var(--muted-light)] mb-3">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <p className="text-[var(--muted)] mb-2">Bildirishnomalar tizimi</p>
          <p className="text-xs text-[var(--muted-light)] max-w-sm mx-auto">
            Supabase backend ulanganidan keyin real-time bildirishnomalar
            (Telegram bot + Web Push) ishlaydi.
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="accent">Telegram Bot</Badge>
            <Badge variant="accent">Web Push</Badge>
            <Badge variant="warning">Supabase kerak</Badge>
          </div>
        </div>
      </GlassCard>

      {/* Qanday ishlaydi */}
      <GlassCard>
        <h2 className="text-lg font-semibold mb-3">Qanday ishlaydi?</h2>
        <div className="space-y-3 text-sm">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-[var(--color-accent)] flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-medium">Jadval o&apos;zgarishi</p>
              <p className="text-xs text-[var(--muted)]">
                Admin dars qo&apos;shganda, o&apos;chirganda yoki ko&apos;chirganda
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-[var(--color-accent)] flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-medium">Telegram xabar</p>
              <p className="text-xs text-[var(--muted)]">
                Tegishli o&apos;qituvchi va talabalar Telegram bot orqali xabar oladi
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-[var(--color-accent)] flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-medium">Web Push</p>
              <p className="text-xs text-[var(--muted)]">
                Brauzer orqali ham bildirishnoma keladi
              </p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
