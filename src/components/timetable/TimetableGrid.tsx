"use client";

import { useState, useCallback, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useTimetableStore } from "@/stores/useTimetableStore";
import { DAYS, TIME_SLOTS, TRACK_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { LessonCard, LessonCardOverlay } from "./LessonCard";
import { CellAssignModal } from "./CellAssignModal";
import type { ScheduleEntry, DayKey, TimeSlot, TrackKey } from "@/lib/types";

// ─── Main Grid ───────────────────────────────────────────────────────────────
interface TimetableGridProps {
  groupId: string;
}

export function TimetableGrid({ groupId }: TimetableGridProps) {
  const { getCell, moveEntry, removeEntry, entries } = useTimetableStore();
  const [activeEntry, setActiveEntry] = useState<ScheduleEntry | null>(null);
  const [assignModal, setAssignModal] = useState<{
    day: DayKey;
    slot: TimeSlot;
  } | null>(null);

  // Conflict detection
  const conflictIds = useMemo(() => {
    const ids = new Set<string>();
    const bySlot = new Map<string, ScheduleEntry[]>();
    for (const e of entries) {
      const key = `${e.day}::${e.slot_id}`;
      if (!bySlot.has(key)) bySlot.set(key, []);
      bySlot.get(key)!.push(e);
    }
    for (const [, slotEntries] of bySlot) {
      // Teacher double-booking
      const tMap = new Map<string, string[]>();
      for (const e of slotEntries) {
        const arr = tMap.get(e.teacher_id) ?? [];
        arr.push(e.id);
        tMap.set(e.teacher_id, arr);
      }
      for (const [, eids] of tMap) {
        if (eids.length > 1) eids.forEach((id) => ids.add(id));
      }
      // Room double-booking
      const rMap = new Map<string, string[]>();
      for (const e of slotEntries) {
        const arr = rMap.get(e.room_id) ?? [];
        arr.push(e.id);
        rMap.set(e.room_id, arr);
      }
      for (const [, eids] of rMap) {
        if (eids.length > 1) eids.forEach((id) => ids.add(id));
      }
    }
    return ids;
  }, [entries]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const entry = entries.find((e) => e.id === event.active.id);
      if (entry) setActiveEntry(entry);
    },
    [entries]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveEntry(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const overId = over.id as string;
      if (!overId.startsWith("cell::")) return;

      const [, day, slotId] = overId.split("::");
      if (day && slotId) {
        moveEntry(active.id as string, day as DayKey, slotId);
      }
    },
    [moveEntry]
  );

  // Group slots by track
  const trackGroups = useMemo(() => {
    const map = new Map<TrackKey, TimeSlot[]>();
    for (const slot of TIME_SLOTS) {
      if (!map.has(slot.track)) map.set(slot.track, []);
      map.get(slot.track)!.push(slot);
    }
    return map;
  }, []);

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px]">
              {/* Header */}
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
                {Array.from(trackGroups.entries()).map(
                  ([track, slots], trackIdx) => (
                    <>
                      {/* Track separator */}
                      <tr key={`sep-${track}`}>
                        <td
                          colSpan={6}
                          className={cn(
                            "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider",
                            trackIdx > 0 && "border-t-2 border-[var(--border-strong)]",
                            track === "kunduzgi" &&
                              "text-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20",
                            track === "sirtqi" &&
                              "text-amber-500 bg-amber-50/50 dark:bg-amber-950/20",
                            track === "kechki" &&
                              "text-violet-500 bg-violet-50/50 dark:bg-violet-950/20"
                          )}
                        >
                          {TRACK_LABELS[track]}
                        </td>
                      </tr>

                      {/* Slots */}
                      {slots.map((slot) => (
                        <tr
                          key={slot.id}
                          className="group border-b border-[var(--border)]"
                        >
                          {/* Time label */}
                          <td className="px-3 py-1 text-left align-top">
                            <div className="text-xs font-semibold text-[var(--foreground)]">
                              {slot.label}
                            </div>
                            <div className="text-[10px] text-[var(--muted)]">
                              {slot.start}–{slot.end}
                            </div>
                          </td>

                          {/* Day cells */}
                          {DAYS.map((day) => {
                            const entry = getCell(
                              day.key,
                              slot.id,
                              groupId
                            );
                            const hasConflict = entry
                              ? conflictIds.has(entry.id)
                              : false;

                            return (
                              <DroppableCell
                                key={`${day.key}-${slot.id}`}
                                day={day.key}
                                slot={slot}
                                entry={entry}
                                groupId={groupId}
                                hasConflict={hasConflict}
                                onClickEmpty={() =>
                                  setAssignModal({ day: day.key, slot })
                                }
                                onRemove={
                                  entry
                                    ? () => removeEntry(entry.id)
                                    : undefined
                                }
                              />
                            );
                          })}
                        </tr>
                      ))}
                    </>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeEntry && <LessonCardOverlay entry={activeEntry} />}
        </DragOverlay>
      </DndContext>

      {/* Assign modal */}
      {assignModal && (
        <CellAssignModal
          open={!!assignModal}
          onClose={() => setAssignModal(null)}
          day={assignModal.day}
          slot={assignModal.slot}
          groupId={groupId}
        />
      )}
    </>
  );
}

// ─── Droppable Cell ──────────────────────────────────────────────────────────
interface DroppableCellProps {
  day: DayKey;
  slot: TimeSlot;
  entry?: ScheduleEntry;
  groupId: string;
  hasConflict: boolean;
  onClickEmpty: () => void;
  onRemove?: () => void;
}

function DroppableCell({
  day,
  slot,
  entry,
  hasConflict,
  onClickEmpty,
  onRemove,
}: DroppableCellProps) {
  const droppableId = `cell::${day}::${slot.id}`;
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });

  return (
    <td
      ref={setNodeRef}
      className={cn(
        "relative h-[72px] min-w-[120px] p-1 transition-colors align-top",
        "border-l border-[var(--border)]",
        isOver && "bg-indigo-100/50 dark:bg-indigo-900/20",
        !entry &&
          "cursor-pointer hover:bg-[var(--surface)] group/cell"
      )}
      onClick={() => !entry && onClickEmpty()}
    >
      {entry ? (
        <div className="group h-full">
          <LessonCard
            entry={entry}
            hasConflict={hasConflict}
            onRemove={onRemove}
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity">
          <span className="text-[10px] text-[var(--muted-light)] bg-[var(--surface)] rounded-md px-2 py-1">
            + Qo&apos;shish
          </span>
        </div>
      )}
    </td>
  );
}
