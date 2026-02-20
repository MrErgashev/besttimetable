"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/Badge";
import type { Teacher, Room, ScheduleEntry } from "@/lib/types";
import { DAYS, TIME_SLOTS } from "@/lib/constants";

interface AlertsPanelProps {
  teachers: Teacher[];
  rooms: Room[];
  entries: ScheduleEntry[];
}

interface Conflict {
  type: "teacher" | "room";
  day: string;
  slot: string;
  name: string;
  detail: string;
}

export function AlertsPanel({ teachers, rooms, entries }: AlertsPanelProps) {
  const conflicts = useMemo(() => {
    const result: Conflict[] = [];
    const bySlot = new Map<string, ScheduleEntry[]>();

    for (const e of entries) {
      const key = `${e.day}::${e.slot_id}`;
      if (!bySlot.has(key)) bySlot.set(key, []);
      bySlot.get(key)!.push(e);
    }

    for (const [key, slotEntries] of bySlot) {
      const [dayKey, slotId] = key.split("::");
      const dayLabel =
        DAYS.find((d) => d.key === dayKey)?.label || dayKey;
      const slotLabel =
        TIME_SLOTS.find((s) => s.id === slotId)?.label || slotId;

      // Teacher conflicts
      const teacherCounts = new Map<string, number>();
      for (const e of slotEntries) {
        teacherCounts.set(
          e.teacher_id,
          (teacherCounts.get(e.teacher_id) || 0) + 1
        );
      }
      for (const [tid, count] of teacherCounts) {
        if (count > 1) {
          const teacher = teachers.find((t) => t.id === tid);
          result.push({
            type: "teacher",
            day: dayLabel,
            slot: slotLabel,
            name: teacher?.short_name || "Noma'lum",
            detail: `${count} ta darsga tayinlangan`,
          });
        }
      }

      // Room conflicts
      const roomCounts = new Map<string, number>();
      for (const e of slotEntries) {
        roomCounts.set(
          e.room_id,
          (roomCounts.get(e.room_id) || 0) + 1
        );
      }
      for (const [rid, count] of roomCounts) {
        if (count > 1) {
          const room = rooms.find((r) => r.id === rid);
          result.push({
            type: "room",
            day: dayLabel,
            slot: slotLabel,
            name: room?.name || "Noma'lum",
            detail: `${count} ta guruhga berilgan`,
          });
        }
      }
    }

    return result;
  }, [entries, teachers, rooms]);

  const overloadedTeachers = useMemo(() => {
    return teachers
      .map((t) => {
        const actual = entries.filter((e) => e.teacher_id === t.id).length;
        const percent =
          t.max_weekly_hours > 0
            ? Math.round((actual / t.max_weekly_hours) * 100)
            : 0;
        return { ...t, actual, percent };
      })
      .filter((t) => t.actual > t.max_weekly_hours)
      .sort((a, b) => b.percent - a.percent);
  }, [teachers, entries]);

  const hasIssues = conflicts.length > 0 || overloadedTeachers.length > 0;

  if (!hasIssues) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <div className="w-12 h-12 rounded-full bg-[var(--color-success)]/12 flex items-center justify-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-success)"
            strokeWidth="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">Hammasi yaxshi!</p>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Konflikt va muammo topilmadi
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Conflicts */}
      {conflicts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-danger)"
                strokeWidth="2"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Konfliktlar
            </span>
            <Badge variant="danger">{conflicts.length}</Badge>
          </div>
          <div className="space-y-1.5">
            {conflicts.slice(0, 4).map((c, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-2.5 rounded-[10px] bg-[var(--color-danger)]/6 border border-[var(--color-danger)]/10"
              >
                <div className="shrink-0 mt-0.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-danger)"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">
                    {c.day}, {c.slot}: {c.name}
                  </p>
                  <p className="text-[11px] text-[var(--muted)]">{c.detail}</p>
                </div>
              </div>
            ))}
            {conflicts.length > 4 && (
              <p className="text-[11px] text-[var(--muted)] text-center pt-1">
                +{conflicts.length - 4} ta boshqa konflikt
              </p>
            )}
          </div>
        </div>
      )}

      {/* Overloaded teachers */}
      {overloadedTeachers.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-warning)"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Yuklamasi oshgan
            </span>
            <Badge variant="warning">{overloadedTeachers.length}</Badge>
          </div>
          <div className="space-y-1.5">
            {overloadedTeachers.slice(0, 4).map((t) => (
              <div
                key={t.id}
                className="p-2.5 rounded-[10px] bg-[var(--color-warning)]/6 border border-[var(--color-warning)]/10"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium">{t.short_name}</span>
                  <span className="text-[11px] text-[var(--color-warning)]">
                    {t.actual}/{t.max_weekly_hours} soat ({t.percent}%)
                  </span>
                </div>
                <div className="h-1.5 bg-[var(--surface-secondary)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, t.percent)}%`,
                      backgroundColor:
                        t.percent > 100
                          ? "var(--color-danger)"
                          : "var(--color-warning)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
