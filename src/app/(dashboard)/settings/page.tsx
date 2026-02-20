"use client";

import { useState } from "react";
import { useTeacherStore } from "@/stores/useTeacherStore";
import { useGroupStore } from "@/stores/useGroupStore";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useRoomStore } from "@/stores/useRoomStore";
import { useTimetableStore } from "@/stores/useTimetableStore";
import { useSubjectLoadStore } from "@/stores/useSubjectLoadStore";
import { useChangelogStore } from "@/stores/useChangelogStore";
import { useHydration } from "@/hooks/useHydration";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GlassModal } from "@/components/ui/GlassModal";
import { Spinner } from "@/components/ui/Spinner";

export default function SettingsPage() {
  const hydrated = useHydration();
  const teacherStore = useTeacherStore();
  const groupStore = useGroupStore();
  const subjectStore = useSubjectStore();
  const roomStore = useRoomStore();
  const timetableStore = useTimetableStore();
  const loadStore = useSubjectLoadStore();
  const changelogStore = useChangelogStore();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearTarget, setClearTarget] = useState<string>("");

  if (!hydrated) return <Spinner className="py-20" />;

  function handleClear() {
    switch (clearTarget) {
      case "timetable":
        timetableStore.clearAll();
        break;
      case "loads":
        loadStore.clearAll();
        break;
      case "changelog":
        changelogStore.clearAll();
        break;
      case "all":
        timetableStore.clearAll();
        loadStore.clearAll();
        changelogStore.clearAll();
        break;
    }
    setShowClearConfirm(false);
  }

  const dataCounts = [
    { label: "O'qituvchilar", count: teacherStore.teachers.length },
    { label: "Guruhlar", count: groupStore.groups.length },
    { label: "Fanlar", count: subjectStore.subjects.length },
    { label: "Xonalar", count: roomStore.rooms.length },
    { label: "Dars jadvali yozuvlari", count: timetableStore.entries.length },
    { label: "Dars yuklamalari", count: loadStore.loads.length },
    { label: "O'zgarishlar tarixi", count: changelogStore.logs.length },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight md:text-[32px]">Sozlamalar</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Tizim sozlamalari va ma&apos;lumotlar boshqaruvi</p>
      </div>

      {/* Tizim haqida */}
      <GlassCard>
        <h2 className="text-lg font-semibold mb-4">Tizim haqida</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--muted)]">Versiya</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--muted)]">Framework</span>
            <span>Next.js 16</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--muted)]">Ma&apos;lumot saqlash</span>
            <Badge>Lokal (localStorage)</Badge>
          </div>
        </div>
      </GlassCard>

      {/* Ma'lumotlar holati */}
      <GlassCard>
        <h2 className="text-lg font-semibold mb-4">Ma&apos;lumotlar holati</h2>
        <div className="space-y-2">
          {dataCounts.map((item) => (
            <div key={item.label} className="flex justify-between items-center text-sm py-1.5 border-b border-[var(--border)] last:border-0">
              <span className="text-[var(--muted)]">{item.label}</span>
              <Badge>{item.count}</Badge>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Tozalash */}
      <GlassCard>
        <h2 className="text-lg font-semibold mb-4">Ma&apos;lumotlarni tozalash</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Jadval yozuvlarini tozalash</p>
              <p className="text-xs text-[var(--muted)]">Barcha dars jadvali yozuvlari o&apos;chiriladi</p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setClearTarget("timetable");
                setShowClearConfirm(true);
              }}
            >
              Tozalash
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Dars yuklamalarini tozalash</p>
              <p className="text-xs text-[var(--muted)]">Avtomatik tuzish uchun yuklamalar</p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setClearTarget("loads");
                setShowClearConfirm(true);
              }}
            >
              Tozalash
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">O&apos;zgarishlar tarixini tozalash</p>
              <p className="text-xs text-[var(--muted)]">Changelog yozuvlari</p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setClearTarget("changelog");
                setShowClearConfirm(true);
              }}
            >
              Tozalash
            </Button>
          </div>
          <hr className="border-[var(--border)]" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-500">Hammasini tozalash</p>
              <p className="text-xs text-[var(--muted)]">Jadval, yuklamalar va tarix</p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setClearTarget("all");
                setShowClearConfirm(true);
              }}
            >
              Hammasini
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Telegram sozlamalari */}
      <GlassCard>
        <h2 className="text-lg font-semibold mb-4">Telegram bildirishnomalar</h2>
        <p className="text-sm text-[var(--muted)] mb-3">
          Supabase backend ulanganidan keyin Telegram bot orqali
          bildirishnoma olish imkoniyati qo&apos;shiladi.
        </p>
        <Badge variant="warning">Supabase kerak</Badge>
      </GlassCard>

      {/* Confirm Modal */}
      <GlassModal
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="Tasdiqlash"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted)]">
            {clearTarget === "all"
              ? "Barcha jadval yozuvlari, yuklamalar va tarix o'chiriladi. Bu amalni qaytarib bo'lmaydi!"
              : "Tanlangan ma'lumotlar o'chiriladi. Bu amalni qaytarib bo'lmaydi!"}
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowClearConfirm(false)}>
              Bekor
            </Button>
            <Button variant="danger" onClick={handleClear}>
              O&apos;chirish
            </Button>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}
