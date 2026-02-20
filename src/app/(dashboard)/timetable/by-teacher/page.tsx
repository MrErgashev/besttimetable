"use client";

import { useState, useMemo } from "react";
import { useTeacherStore } from "@/stores/useTeacherStore";
import { useTimetableStore } from "@/stores/useTimetableStore";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useRoomStore } from "@/stores/useRoomStore";
import { useGroupStore } from "@/stores/useGroupStore";
import { useHydration } from "@/hooks/useHydration";
import { GlassCard } from "@/components/ui/GlassCard";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import { DAYS, TIME_SLOTS, TRACK_LABELS } from "@/lib/constants";
import type { TrackKey } from "@/lib/types";

export default function ByTeacherPage() {
  const hydrated = useHydration();
  const { teachers } = useTeacherStore();
  const { entries } = useTimetableStore();
  const { getSubjectById } = useSubjectStore();
  const { getRoomById } = useRoomStore();
  const { groups } = useGroupStore();

  const [selectedTeacherId, setSelectedTeacherId] = useState("");

  const activeTeacherId = selectedTeacherId || teachers[0]?.id || "";
  const teacher = teachers.find((t) => t.id === activeTeacherId);

  const teacherEntries = useMemo(
    () => entries.filter((e) => e.teacher_id === activeTeacherId),
    [entries, activeTeacherId]
  );

  // Haftalik yuklamani hisoblash (soatda)
  const weeklyHours = teacherEntries.length * 1.5;

  // Track bo'yicha guruhlash
  const trackGroups = useMemo(() => {
    const map = new Map<TrackKey, typeof TIME_SLOTS>();
    for (const slot of TIME_SLOTS) {
      if (!map.has(slot.track)) map.set(slot.track, []);
      map.get(slot.track)!.push(slot);
    }
    return map;
  }, []);

  if (!hydrated) return <Spinner className="py-20" />;

  return (
    <div className="max-w-full mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight md:text-[32px]">O&apos;qituvchi bo&apos;yicha jadval</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            O&apos;qituvchining haftalik dars jadvali va yuklamasi
          </p>
        </div>
        <div className="w-full sm:w-64">
          <Select
            value={activeTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            options={teachers.map((t) => ({
              value: t.id,
              label: t.short_name,
            }))}
            placeholder="O'qituvchi tanlang"
          />
        </div>
      </div>

      {teachers.length === 0 ? (
        <GlassCard>
          <div className="text-center py-12">
            <p className="text-[var(--muted)]">Avval o&apos;qituvchi qo&apos;shing</p>
            <a href="/teachers" className="inline-block mt-2 text-sm text-[var(--color-accent)] hover:opacity-80">
              O&apos;qituvchilar sahifasiga o&apos;tish &rarr;
            </a>
          </div>
        </GlassCard>
      ) : (
        <>
          {/* Statistika */}
          {teacher && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <GlassCard padding="sm">
                <div className="text-center">
                  <div className="text-2xl font-bold">{teacherEntries.length}</div>
                  <div className="text-xs text-[var(--muted)]">Jami darslar</div>
                </div>
              </GlassCard>
              <GlassCard padding="sm">
                <div className="text-center">
                  <div className="text-2xl font-bold">{weeklyHours}</div>
                  <div className="text-xs text-[var(--muted)]">Soat/hafta</div>
                </div>
              </GlassCard>
              <GlassCard padding="sm">
                <div className="text-center">
                  <div className="text-2xl font-bold">{teacher.max_weekly_hours}</div>
                  <div className="text-xs text-[var(--muted)]">Maks. soat</div>
                </div>
              </GlassCard>
              <GlassCard padding="sm">
                <div className="text-center">
                  <div className={cn(
                    "text-2xl font-bold",
                    weeklyHours > teacher.max_weekly_hours ? "text-red-500" : "text-green-500"
                  )}>
                    {weeklyHours <= teacher.max_weekly_hours ? (
                      <Badge variant="success">Normal</Badge>
                    ) : (
                      <Badge variant="danger">Oshib ketdi!</Badge>
                    )}
                  </div>
                  <div className="text-xs text-[var(--muted)]">Holat</div>
                </div>
              </GlassCard>
            </div>
          )}

          {/* Jadval */}
          <div className="rounded-[16px] border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[700px]">
                <thead>
                  <tr>
                    <th className="w-28 px-3 py-3 text-left text-xs font-semibold text-[var(--muted)] bg-[var(--surface)]">
                      Vaqt
                    </th>
                    {DAYS.map((day) => (
                      <th
                        key={day.key}
                        className="px-3 py-3 text-center text-xs font-semibold text-[var(--muted)] bg-[var(--surface)]"
                      >
                        <span className="hidden sm:inline">{day.label}</span>
                        <span className="sm:hidden">{day.short}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from(trackGroups.entries()).map(([track, slots], trackIdx) => (
                    <>
                      <tr key={`sep-${track}`}>
                        <td
                          colSpan={6}
                          className={cn(
                            "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider",
                            trackIdx > 0 && "border-t-2 border-[var(--border-strong)]",
                            track === "kunduzgi" && "text-[var(--color-accent)] bg-blue-50/50 dark:bg-blue-950/20",
                            track === "sirtqi" && "text-amber-500 bg-amber-50/50 dark:bg-amber-950/20",
                            track === "kechki" && "text-[#5856D6] bg-purple-50/50 dark:bg-purple-950/20"
                          )}
                        >
                          {TRACK_LABELS[track]}
                        </td>
                      </tr>
                      {slots.map((slot) => (
                        <tr key={slot.id} className="border-b border-[var(--border)]">
                          <td className="px-3 py-1 text-left align-top">
                            <div className="text-xs font-semibold">{slot.label}</div>
                            <div className="text-[10px] text-[var(--muted)]">
                              {slot.start}–{slot.end}
                            </div>
                          </td>
                          {DAYS.map((day) => {
                            const entry = teacherEntries.find(
                              (e) => e.day === day.key && e.slot_id === slot.id
                            );
                            if (!entry) {
                              return (
                                <td
                                  key={`${day.key}-${slot.id}`}
                                  className="h-[60px] min-w-[120px] p-1 border-l border-[var(--border)]"
                                />
                              );
                            }
                            const subject = getSubjectById(entry.subject_id);
                            const room = getRoomById(entry.room_id);
                            const entryGroups = entry.group_ids
                              .map((gid) => groups.find((g) => g.id === gid)?.name)
                              .filter(Boolean)
                              .join(", ");
                            return (
                              <td
                                key={`${day.key}-${slot.id}`}
                                className="h-[60px] min-w-[120px] p-1 border-l border-[var(--border)]"
                              >
                                <div
                                  className="rounded-lg border-l-4 p-1.5 bg-[var(--surface)] text-xs h-full"
                                  style={{ borderLeftColor: subject?.color || "#007AFF" }}
                                >
                                  <div className="font-semibold truncate">
                                    {subject?.short_name || "?"}
                                  </div>
                                  <div className="truncate text-[var(--muted)] mt-0.5">
                                    {entryGroups || "?"}
                                  </div>
                                  <div className="truncate text-[var(--muted-light)]">
                                    {room?.name || "?"}
                                  </div>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
