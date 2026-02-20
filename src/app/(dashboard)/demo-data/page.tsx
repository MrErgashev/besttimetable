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
import { seedDemoData, clearAllDemoData } from "@/lib/demo-data";

export default function DemoDataPage() {
  const hydrated = useHydration();
  const teacherStore = useTeacherStore();
  const groupStore = useGroupStore();
  const subjectStore = useSubjectStore();
  const roomStore = useRoomStore();
  const timetableStore = useTimetableStore();
  const loadStore = useSubjectLoadStore();
  const changelogStore = useChangelogStore();

  const [showSeedConfirm, setShowSeedConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "cleared";
    message: string;
  } | null>(null);

  if (!hydrated) return <Spinner className="py-20" />;

  const dataCounts = [
    { label: "O'qituvchilar", count: teacherStore.teachers.length },
    { label: "Guruhlar", count: groupStore.groups.length },
    { label: "Fanlar", count: subjectStore.subjects.length },
    { label: "Xonalar", count: roomStore.rooms.length },
    { label: "Dars jadvali yozuvlari", count: timetableStore.entries.length },
    { label: "Dars yuklamalari", count: loadStore.loads.length },
    { label: "O'zgarishlar tarixi", count: changelogStore.logs.length },
  ];

  const totalData = dataCounts.reduce((sum, item) => sum + item.count, 0);
  const hasData = totalData > 0;

  function handleSeed() {
    setShowSeedConfirm(false);
    setLoading(true);
    setResult(null);

    // setTimeout bilan UI yangilanishi uchun
    setTimeout(() => {
      const counts = seedDemoData({
        teacherStore,
        groupStore,
        subjectStore,
        roomStore,
        timetableStore,
        loadStore,
        changelogStore,
      });

      setLoading(false);
      setResult({
        type: "success",
        message: `Demo data yuklandi: ${counts.teachers} o'qituvchi, ${counts.groups} guruh, ${counts.subjects} fan, ${counts.rooms} xona, ${counts.loads} yuklama, ${counts.entries} jadval yozuvi, ${counts.changelog} changelog`,
      });
    }, 100);
  }

  function handleClear() {
    setShowClearConfirm(false);
    setLoading(true);
    setResult(null);

    setTimeout(() => {
      clearAllDemoData({
        teacherStore,
        groupStore,
        subjectStore,
        roomStore,
        timetableStore,
        loadStore,
        changelogStore,
      });

      setLoading(false);
      setResult({
        type: "cleared",
        message: "Barcha ma'lumotlar muvaffaqiyatli o'chirildi",
      });
    }, 100);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Demo ma&apos;lumotlar</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Tizimni ko&apos;rsatish uchun namuna ma&apos;lumotlar yuklash va o&apos;chirish
        </p>
      </div>

      {/* Natija xabari */}
      {result && (
        <GlassCard>
          <div className="flex items-start gap-3">
            <div
              className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                result.type === "success"
                  ? "bg-[var(--color-success)]"
                  : "bg-[var(--color-warning)]"
              }`}
            />
            <p className="text-sm">{result.message}</p>
          </div>
        </GlassCard>
      )}

      {/* Loading */}
      {loading && (
        <GlassCard>
          <div className="flex items-center justify-center gap-3 py-4">
            <Spinner />
            <span className="text-sm text-[var(--muted)]">
              Ma&apos;lumotlar yuklanmoqda...
            </span>
          </div>
        </GlassCard>
      )}

      {/* Ma'lumotlar holati */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Ma&apos;lumotlar holati</h2>
          <Badge variant={hasData ? "default" : "warning"}>
            {hasData ? `${totalData} ta yozuv` : "Bo'sh"}
          </Badge>
        </div>
        <div className="space-y-2">
          {dataCounts.map((item) => (
            <div
              key={item.label}
              className="flex justify-between items-center text-sm py-1.5 border-b border-[var(--border)] last:border-0"
            >
              <span className="text-[var(--muted)]">{item.label}</span>
              <Badge>{item.count}</Badge>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Demo data yuklash */}
      <GlassCard>
        <h2 className="text-lg font-semibold mb-2">Demo data yuklash</h2>
        <p className="text-sm text-[var(--muted)] mb-4">
          10 ta o&apos;qituvchi, 8 ta guruh (kunduzgi/sirtqi/kechki), 10 ta fan, 8 ta xona,
          fan yuklamalari va tayyor dars jadvali yuklanadi. Saytning barcha bo&apos;limlarini
          ko&apos;rsatish uchun yetarli ma&apos;lumotlar.
        </p>
        <Button
          variant="primary"
          onClick={() => setShowSeedConfirm(true)}
          disabled={loading}
        >
          Demo data yuklash
        </Button>
      </GlassCard>

      {/* Ma'lumotlarni tozalash */}
      <GlassCard>
        <h2 className="text-lg font-semibold mb-2">
          Ma&apos;lumotlarni tozalash
        </h2>
        <p className="text-sm text-[var(--muted)] mb-4">
          Barcha ma&apos;lumotlar o&apos;chiriladi: o&apos;qituvchilar, guruhlar, fanlar,
          xonalar, jadval, yuklamalar va o&apos;zgarishlar tarixi. Keyin real
          ma&apos;lumotlar kiritilishi mumkin.
        </p>
        <Button
          variant="danger"
          onClick={() => setShowClearConfirm(true)}
          disabled={loading || !hasData}
        >
          Barcha ma&apos;lumotlarni o&apos;chirish
        </Button>
      </GlassCard>

      {/* Seed Confirm Modal */}
      <GlassModal
        open={showSeedConfirm}
        onClose={() => setShowSeedConfirm(false)}
        title="Demo data yuklash"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted)]">
            {hasData
              ? "Mavjud barcha ma'lumotlar o'chiriladi va demo data yuklanadi. Davom etasizmi?"
              : "Demo ma'lumotlar yuklanadi. Saytning barcha bo'limlari ishlashi uchun yetarli data qo'shiladi."}
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowSeedConfirm(false)}
            >
              Bekor
            </Button>
            <Button variant="primary" onClick={handleSeed}>
              Yuklash
            </Button>
          </div>
        </div>
      </GlassModal>

      {/* Clear Confirm Modal */}
      <GlassModal
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="Tasdiqlash"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted)]">
            Barcha ma&apos;lumotlar o&apos;chiriladi: o&apos;qituvchilar, guruhlar,
            fanlar, xonalar, jadval, yuklamalar va tarix. Bu amalni qaytarib
            bo&apos;lmaydi!
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowClearConfirm(false)}
            >
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
