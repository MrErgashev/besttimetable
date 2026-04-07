"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGuestStore } from "@/stores/useGuestStore";
import { useGroupStore } from "@/stores/useGroupStore";
import { useHydration } from "@/hooks/useHydration";
import { TimetableGrid } from "@/components/timetable/TimetableGrid";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { LogOut, RefreshCw, User, Users } from "lucide-react";

export default function GuestTimetablePage() {
  const router = useRouter();
  const hydrated = useHydration();
  const { profile, clearProfile } = useGuestStore();
  const { getGroupById } = useGroupStore();

  // Profil yo'q bo'lsa — onboarding'ga qaytarish
  useEffect(() => {
    if (hydrated && !profile?.groupId) {
      router.replace("/guest");
    }
  }, [hydrated, profile, router]);

  if (!hydrated || !profile?.groupId) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const liveGroup = getGroupById(profile.groupId);
  const groupName = liveGroup?.name ?? profile.groupNameSnapshot;

  function handleSwitch() {
    if (
      typeof window !== "undefined" &&
      window.confirm("Guruhni o'zgartirmoqchimisiz? Joriy ma'lumotlar tozalanadi.")
    ) {
      clearProfile();
      router.replace("/guest");
    }
  }

  return (
    <div className="space-y-5">
      {/* Header card */}
      <Card padding="md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-[var(--radius)] bg-[var(--color-accent)]/15 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-[var(--color-accent)]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[20px] md:text-[24px] font-bold tracking-tight truncate">
                {groupName}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] mt-0.5">
                <User className="w-3.5 h-3.5" />
                <span className="truncate">{profile.fullName}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSwitch}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[var(--radius)] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur-light)] border border-[var(--glass-border-subtle)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--glass-bg-heavy)] transition-all duration-300 [transition-timing-function:var(--spring-smooth)] press-effect shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            Guruhni o&apos;zgartirish
          </button>
        </div>
      </Card>

      {/* Timetable grid (read-only) */}
      {liveGroup ? (
        <TimetableGrid groupId={profile.groupId} readOnly />
      ) : (
        <Card padding="lg">
          <div className="text-center py-8 space-y-3">
            <p className="text-sm text-[var(--muted)]">
              Guruh topilmadi yoki o&apos;chirilgan bo&apos;lishi mumkin.
            </p>
            <button
              type="button"
              onClick={handleSwitch}
              className="inline-flex items-center gap-2 text-sm text-[var(--color-accent)] hover:opacity-80"
            >
              <LogOut className="w-4 h-4" />
              Boshqa guruh tanlash
            </button>
          </div>
        </Card>
      )}

      {/* Footer info */}
      <p className="text-center text-xs text-[var(--muted-light)] pt-2">
        O&apos;zgarishlar avtomatik yangilanadi. Faqat ko&apos;rish rejimi.
      </p>
    </div>
  );
}
