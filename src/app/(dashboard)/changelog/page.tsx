"use client";

import { useMemo, useState } from "react";
import { useChangelogStore } from "@/stores/useChangelogStore";
import { useTeacherStore } from "@/stores/useTeacherStore";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useRoomStore } from "@/stores/useRoomStore";
import { useGroupStore } from "@/stores/useGroupStore";
import { useHydration } from "@/hooks/useHydration";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { DAYS, TIME_SLOTS } from "@/lib/constants";

export default function ChangelogPage() {
  const hydrated = useHydration();
  const { logs, clearAll } = useChangelogStore();
  const { teachers } = useTeacherStore();
  const { subjects } = useSubjectStore();
  const { rooms } = useRoomStore();
  const { groups } = useGroupStore();

  const [showCount, setShowCount] = useState(20);

  const displayedLogs = useMemo(() => logs.slice(0, showCount), [logs, showCount]);

  function getEntityName(type: string, id: string): string {
    if (type === "teacher") return teachers.find((t) => t.id === id)?.short_name || id;
    if (type === "subject") return subjects.find((s) => s.id === id)?.short_name || id;
    if (type === "room") return rooms.find((r) => r.id === id)?.name || id;
    if (type === "group") return groups.find((g) => g.id === id)?.name || id;
    return id;
  }

  function getDayLabel(day: string): string {
    return DAYS.find((d) => d.key === day)?.label || day;
  }

  function getSlotLabel(slotId: string): string {
    const slot = TIME_SLOTS.find((s) => s.id === slotId);
    return slot ? `${slot.label} (${slot.start})` : slotId;
  }

  function formatChange(log: typeof logs[0]): string {
    const data = log.new_data || log.old_data;
    if (!data) return "";
    const parts: string[] = [];
    if (data.day) parts.push(getDayLabel(data.day as string));
    if (data.slot_id) parts.push(getSlotLabel(data.slot_id as string));
    if (data.subject_id) parts.push(getEntityName("subject", data.subject_id as string));
    if (data.teacher_id) parts.push(getEntityName("teacher", data.teacher_id as string));
    if (data.room_id) parts.push(getEntityName("room", data.room_id as string));
    return parts.join(" — ");
  }

  if (!hydrated) return <Spinner className="py-20" />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-light)] bg-clip-text text-transparent">O&apos;zgarishlar tarixi</span>
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Jadvalga kiritilgan barcha o&apos;zgarishlar qayd etiladi
          </p>
        </div>
        {logs.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Barcha tarixni o'chirish?")) clearAll();
            }}
          >
            Tozalash
          </Button>
        )}
      </div>

      {logs.length === 0 ? (
        <GlassCard>
          <div className="text-center py-12">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-[var(--muted-light)] mb-3">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M12 7v5l4 2" />
            </svg>
            <p className="text-[var(--muted)]">Hozircha o&apos;zgarishlar yo&apos;q</p>
            <p className="text-xs text-[var(--muted-light)] mt-1">
              Jadvalga dars qo&apos;shilganda yoki o&apos;chirilganda bu yerda ko&apos;rinadi
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {displayedLogs.map((log) => (
            <GlassCard key={log.id} padding="sm">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <div className={`w-2 h-2 rounded-full ${
                    log.action === "create" ? "bg-green-500" :
                    log.action === "update" ? "bg-amber-500" : "bg-red-500"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge
                      variant={
                        log.action === "create" ? "success" :
                        log.action === "update" ? "warning" : "danger"
                      }
                    >
                      {log.action === "create" ? "Qo'shildi" :
                       log.action === "update" ? "O'zgartirildi" : "O'chirildi"}
                    </Badge>
                    <span className="text-xs text-[var(--muted)]">
                      {log.changed_by === "generator" ? "Avtomatik" :
                       log.changed_by === "import" ? "Import" : log.changed_by}
                    </span>
                  </div>
                  <p className="text-sm truncate">{formatChange(log)}</p>
                </div>
                <div className="text-xs text-[var(--muted)] whitespace-nowrap">
                  {new Date(log.changed_at).toLocaleString("uz", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </GlassCard>
          ))}

          {logs.length > showCount && (
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCount((c) => c + 20)}
              >
                Yana {Math.min(20, logs.length - showCount)} ta ko&apos;rsatish
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
