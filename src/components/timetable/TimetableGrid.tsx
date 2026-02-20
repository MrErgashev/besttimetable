"use client";

import { useState, useCallback, useMemo, Fragment, memo } from "react";
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
  const [mobileDay, setMobileDay] = useState<DayKey>(DAYS[0].key);

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
        {/* Mobile Day Tabs */}
        <div className="md:hidden mb-4 flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
          {DAYS.map((day) => (
            <button
              key={day.key}
              onClick={() => setMobileDay(day.key)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-300 [transition-timing-function:var(--spring-smooth)]",
                mobileDay === day.key
                  ? "bg-[var(--color-accent)]/85 text-white backdrop-blur-sm border border-white/20 shadow-[0_2px_8px_rgba(0,122,255,0.2)]"
                  : "bg-[var(--glass-bg)] backdrop-blur-sm text-[var(--muted)] border border-[var(--glass-border-subtle)]"
              )}
            >
              {day.short}
            </button>
          ))}
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-2">
          {Array.from(trackGroups.entries()).map(([track, slots]) => (
            <div key={track}>
              <div
                className={cn(
                  "text-[11px] font-bold uppercase tracking-wider px-1 py-1.5",
                  track === "kunduzgi" && "text-[var(--color-accent)]",
                  track === "sirtqi" && "text-[var(--color-warning)]",
                  track === "kechki" && "text-purple-500"
                )}
              >
                {TRACK_LABELS[track]}
              </div>
              <div className="space-y-1.5">
                {slots.map((slot) => {
                  const entry = getCell(mobileDay, slot.id, groupId);
                  const hasConflict = entry ? conflictIds.has(entry.id) : false;

                  return (
                    <div
                      key={slot.id}
                      className="flex items-stretch gap-3"
                    >
                      {/* Time label */}
                      <div className="w-14 flex-shrink-0 pt-2">
                        <div className="text-[13px] font-semibold text-[var(--foreground)]">
                          {slot.label}
                        </div>
                        <div className="text-[11px] text-[var(--muted)]">
                          {slot.start}
                        </div>
                      </div>

                      {/* Card or empty */}
                      <div className="flex-1 min-h-[56px]">
                        {entry ? (
                          <div className="group h-full">
                            <LessonCard
                              entry={entry}
                              hasConflict={hasConflict}
                              onRemove={() => removeEntry(entry.id)}
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => setAssignModal({ day: mobileDay, slot })}
                            className="w-full h-full min-h-[56px] rounded-[var(--radius-sm)] border-2 border-dashed border-[var(--glass-border)] flex items-center justify-center text-[var(--muted)] text-xs active:bg-[var(--glass-bg)] transition-all duration-300"
                          >
                            + Qo&apos;shish
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block apple-card rounded-[var(--radius-lg)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px]">
              {/* Header */}
              <thead>
                <tr>
                  <th className="w-28 px-3 py-3 text-left text-xs font-semibold text-[var(--muted)] bg-[var(--glass-bg)]/50 backdrop-blur-sm">
                    Vaqt
                  </th>
                  {DAYS.map((day) => (
                    <th
                      key={day.key}
                      className="px-3 py-3 text-center text-xs font-semibold text-[var(--muted)] bg-[var(--glass-bg)]/50 backdrop-blur-sm"
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
                    <Fragment key={track}>
                      {/* Track separator */}
                      <tr>
                        <td
                          colSpan={6}
                          className={cn(
                            "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider",
                            trackIdx > 0 && "border-t-2 border-[var(--glass-border-subtle)]",
                            track === "kunduzgi" &&
                              "text-[var(--color-accent)] bg-[var(--color-accent)]/8 backdrop-blur-sm",
                            track === "sirtqi" &&
                              "text-[var(--color-warning)] bg-[var(--color-warning)]/8 backdrop-blur-sm",
                            track === "kechki" &&
                              "text-purple-500 bg-purple-500/8 backdrop-blur-sm"
                          )}
                        >
                          {TRACK_LABELS[track]}
                        </td>
                      </tr>

                      {/* Slots */}
                      {slots.map((slot) => (
                        <tr
                          key={slot.id}
                          className="group border-b border-[var(--glass-border-subtle)]"
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
                    </Fragment>
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

const DroppableCell = memo(function DroppableCell({
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
        "relative h-[72px] min-w-[120px] p-1 transition-all duration-200 align-top",
        "border-l border-[var(--glass-border-subtle)]",
        isOver && "bg-[var(--color-accent)]/12 backdrop-blur-sm",
        !entry &&
          "cursor-pointer hover:bg-[var(--glass-bg)] group/cell"
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
          <span className="text-[10px] text-[var(--muted)] bg-[var(--glass-bg)] backdrop-blur-sm rounded-[var(--radius-sm)] px-2 py-1">
            + Qo&apos;shish
          </span>
        </div>
      )}
    </td>
  );
});
