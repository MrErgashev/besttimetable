"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useGroupStore } from "@/stores/useGroupStore";
import { useGuestStore } from "@/stores/useGuestStore";
import { useHydration } from "@/hooks/useHydration";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { GraduationCap, ArrowRight, User, Users } from "lucide-react";

export default function GuestOnboardingPage() {
  const router = useRouter();
  const hydrated = useHydration();
  const { groups } = useGroupStore();
  const { profile, setProfile } = useGuestStore();

  const [fullName, setFullName] = useState("");
  const [groupId, setGroupId] = useState("");
  const [error, setError] = useState("");

  // Agar profil mavjud bo'lsa — to'g'ridan-to'g'ri jadvalga
  useEffect(() => {
    if (hydrated && profile?.groupId) {
      router.replace("/guest/jadval");
    }
  }, [hydrated, profile, router]);

  const sortedGroups = useMemo(
    () => [...groups].sort((a, b) => a.name.localeCompare(b.name, "uz")),
    [groups]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedName = fullName.trim();
    if (trimmedName.length < 2) {
      setError("Ism familiyangizni to'liq kiriting");
      return;
    }
    if (!groupId) {
      setError("Guruhingizni tanlang");
      return;
    }

    const group = sortedGroups.find((g) => g.id === groupId);
    if (!group) {
      setError("Guruh topilmadi");
      return;
    }

    setProfile({
      fullName: trimmedName,
      groupId: group.id,
      groupNameSnapshot: group.name,
    });
    router.replace("/guest/jadval");
  }

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  // Profil mavjud — redirect kutilmoqda
  if (profile?.groupId) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-4rem)] py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/oriental-logo.png"
              alt="Oriental Universiteti"
              width={72}
              height={72}
              priority
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-light)] bg-clip-text text-transparent">
              Talaba kirishi
            </span>
          </h1>
          <p className="text-sm text-[var(--muted)] mt-2">
            Ism familiyangiz va guruhingizni tanlang — keyin har safar
            jadvalingiz to&apos;g&apos;ridan-to&apos;g&apos;ri ochiladi
          </p>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--muted-light)] z-10 pointer-events-none" />
              <Input
                type="text"
                placeholder="Ism familiyangiz"
                aria-label="Ism familiya"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
                className="pl-11"
              />
            </div>

            {/* Group select */}
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--muted-light)] z-10 pointer-events-none" />
              <Select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                options={sortedGroups.map((g) => ({
                  value: g.id,
                  label: g.name,
                }))}
                placeholder={
                  sortedGroups.length === 0
                    ? "Guruhlar yuklanmoqda..."
                    : "Guruhingizni tanlang"
                }
                disabled={sortedGroups.length === 0}
                className="pl-11"
              />
            </div>

            {sortedGroups.length === 0 && (
              <p className="text-xs text-[var(--muted)] text-center">
                Guruhlar ro&apos;yxati yuklanmoqda. Agar ko&apos;p kutsangiz —
                administratorga murojaat qiling.
              </p>
            )}

            {error && (
              <div className="p-3 rounded-[var(--radius)] bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20">
                <p className="text-sm text-[var(--color-danger)]">{error}</p>
              </div>
            )}

            <Button type="submit" size="lg" fullWidth disabled={sortedGroups.length === 0}>
              <GraduationCap className="w-5 h-5" />
              Jadvalimni ko&apos;rish
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </Card>

        <p className="mt-5 text-center text-xs text-[var(--muted-light)]">
          Ma&apos;lumotlaringiz faqat shu qurilmada saqlanadi.
          Hech qanday parol kerak emas.
        </p>
      </div>
    </div>
  );
}
