"use client";

import { useState } from "react";
import { useGroupStore } from "@/stores/useGroupStore";
import { useHydration } from "@/hooks/useHydration";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { GlassCard } from "@/components/ui/GlassCard";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { TimetableGrid } from "@/components/timetable/TimetableGrid";

export default function TimetablePage() {
  const hydrated = useHydration();
  const { groups } = useGroupStore();
  const { role } = useRoleAccess();
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const isReadOnly = role === "teacher" || role === "student";

  if (!hydrated) return <Spinner className="py-20" />;

  const activeGroupId = selectedGroupId || groups[0]?.id || "";

  return (
    <div className="max-w-full mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight md:text-[32px]">Dars jadvali</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Guruh bo&apos;yicha ko&apos;rinish</p>
        </div>
        <div className="w-full sm:w-64">
          <Select
            value={activeGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            options={groups.map((g) => ({ value: g.id, label: g.name }))}
            placeholder="Guruhni tanlang"
          />
        </div>
      </div>

      {groups.length === 0 ? (
        <GlassCard>
          <div className="text-center py-12">
            <p className="text-[var(--muted)]">Avval guruh qo&apos;shing</p>
            <a href="/groups" className="inline-block mt-2 text-sm text-[var(--color-accent)] hover:opacity-80">Guruhlar sahifasiga o&apos;tish &rarr;</a>
          </div>
        </GlassCard>
      ) : (
        <TimetableGrid groupId={activeGroupId} readOnly={isReadOnly} />
      )}
    </div>
  );
}
