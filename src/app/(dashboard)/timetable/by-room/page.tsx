"use client";

import { useState, useMemo, Fragment } from "react";
import { useRoomStore } from "@/stores/useRoomStore";
import { useTimetableStore } from "@/stores/useTimetableStore";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useTeacherStore } from "@/stores/useTeacherStore";
import { useGroupStore } from "@/stores/useGroupStore";
import { useHydration } from "@/hooks/useHydration";
import { GlassCard } from "@/components/ui/GlassCard";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import { DAYS, TIME_SLOTS, TRACK_LABELS, ROOM_TYPE_LABELS } from "@/lib/constants";
import type { TrackKey } from "@/lib/types";

export default function ByRoomPage() {
  const hydrated = useHydration();
  const { rooms } = useRoomStore();
  const { entries } = useTimetableStore();
  const { getSubjectById } = useSubjectStore();
  const { getTeacherById } = useTeacherStore();
  const { groups } = useGroupStore();

  const [selectedRoomId, setSelectedRoomId] = useState("");

  const activeRoomId = selectedRoomId || rooms[0]?.id || "";
  const room = rooms.find((r) => r.id === activeRoomId);

  const roomEntries = useMemo(
    () => entries.filter((e) => e.room_id === activeRoomId),
    [entries, activeRoomId]
  );

  // Bandlik foizi
  const totalSlots = DAYS.length * TIME_SLOTS.length;
  const usagePercent = totalSlots > 0 ? Math.round((roomEntries.length / totalSlots) * 100) : 0;

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
          <h1 className="text-[28px] font-bold tracking-tight md:text-[32px]">
            <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-light)] bg-clip-text text-transparent">Xona bo&apos;yicha jadval</span>
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Xonaning haftalik bandligi va dars jadvali
          </p>
        </div>
        <div className="w-full sm:w-64">
          <Select
            value={activeRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            options={rooms.map((r) => ({
              value: r.id,
              label: `${r.name}${r.building ? ` (${r.building})` : ""}`,
            }))}
            placeholder="Xona tanlang"
          />
        </div>
      </div>

      {rooms.length === 0 ? (
        <GlassCard>
          <div className="text-center py-12">
            <p className="text-[var(--muted)]">Avval xona qo&apos;shing</p>
            <a href="/rooms" className="inline-block mt-2 text-sm text-[var(--color-accent)] hover:opacity-80">
              Xonalar sahifasiga o&apos;tish &rarr;
            </a>
          </div>
        </GlassCard>
      ) : (
        <>
          {/* Statistika */}
          {room && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <GlassCard padding="sm">
                <div className="text-center">
                  <div className="text-2xl font-bold">{roomEntries.length}</div>
                  <div className="text-xs text-[var(--muted)]">Jami darslar</div>
                </div>
              </GlassCard>
              <GlassCard padding="sm">
                <div className="text-center">
                  <div className={cn(
                    "text-2xl font-bold",
                    usagePercent > 90 ? "text-red-500" : usagePercent > 70 ? "text-amber-500" : "text-green-500"
                  )}>
                    {usagePercent}%
                  </div>
                  <div className="text-xs text-[var(--muted)]">Bandlik</div>
                </div>
              </GlassCard>
              <GlassCard padding="sm">
                <div className="text-center">
                  <div className="text-2xl font-bold">{room.capacity}</div>
                  <div className="text-xs text-[var(--muted)]">Sig&apos;im</div>
                </div>
              </GlassCard>
              <GlassCard padding="sm">
                <div className="text-center">
                  <Badge variant="default">
                    {ROOM_TYPE_LABELS[room.type] || room.type}
                  </Badge>
                  <div className="text-xs text-[var(--muted)] mt-1">Turi</div>
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
                    <Fragment key={track}>
                      <tr>
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
                            const entry = roomEntries.find(
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
                            const teacher = getTeacherById(entry.teacher_id);
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
                                    {teacher?.short_name || "?"}
                                  </div>
                                  <div className="truncate text-[var(--muted-light)]">
                                    {entryGroups || "?"}
                                  </div>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </Fragment>
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
