"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
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
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useTeacherStore } from "@/stores/useTeacherStore";
import { useRoomStore } from "@/stores/useRoomStore";
import { DAYS, TIME_SLOTS, TRACK_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { LessonCard, LessonCardOverlay } from "./LessonCard";
import { CellAssignModal } from "./CellAssignModal";
import type { ScheduleEntry, DayKey, TimeSlot, TrackKey } from "@/lib/types";

// ─── Mobile Hook ────────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

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
  const [selectedDay, setSelectedDay] = useState<DayKey>("dushanba");
  const isMobile = useIsMobile();

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
      const tMap = new Map<string, string[]>();
      for (const e of slotEntries) {
        const arr = tMap.get(e.teacher_id) ?? [];
        arr.push(e.id);
        tMap.set(e.teacher_id, arr);
      }
      for (const [, eids] of tMap) {
        if (eids.length > 1) eids.forEach((id) => ids.add(id));
      }
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

  // ─── Mobile View ────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <MobileView
          groupId={groupId}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          trackGroups={trackGroups}
          getCell={getCell}
          conflictIds={conflictIds}
          onAddLesson={(day, slot) => setAssignModal({ day, slot })}
          onRemove={removeEntry}
        />

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

  // ─── Desktop View ──────────────────────────────────────────────────────
  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[16px] shadow-[var(--shadow-md)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px]">
              <thead>
                <tr>
                  <th className="w-28 px-3 py-3 text-left text-xs font-semibold text-[var(--muted)] bg-[var(--surface-hover)]">
                    Vaqt
                  </th>
                  {DAYS.map((day) => (
                    <th
                      key={day.key}
                      className="px-3 py-3 text-center text-xs font-semibold text-[var(--muted)] bg-[var(--surface-hover)]"
                    >
                      {day.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from(trackGroups.entries()).map(
                  ([track, slots], trackIdx) => (
                    <>
                      <tr key={`sep-${track}`}>
                        <td
                          colSpan={6}
                          className={cn(
                            "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider",
                            trackIdx > 0 && "border-t-2 border-[var(--border-strong)]",
                            track === "kunduzgi" &&
                              "text-blue-600 bg-blue-50/50 dark:bg-blue-950/20 dark:text-blue-400",
                            track === "sirtqi" &&
                              "text-amber-600 bg-amber-50/50 dark:bg-amber-950/20 dark:text-amber-400",
                            track === "kechki" &&
                              "text-purple-600 bg-purple-50/50 dark:bg-purple-950/20 dark:text-purple-400"
                          )}
                        >
                          {TRACK_LABELS[track]}
                        </td>
                      </tr>

                      {slots.map((slot) => (
                        <tr
                          key={slot.id}
                          className="group border-b border-[var(--border)]"
                        >
                          <td className="px-3 py-1 text-left align-top">
                            <div className="text-xs font-semibold text-[var(--foreground)]">
                              {slot.label}
                            </div>
                            <div className="text-[10px] text-[var(--muted)]">
                              {slot.start}–{slot.end}
                            </div>
                          </td>

                          {DAYS.map((day) => {
                            const entry = getCell(day.key, slot.id, groupId);
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

        <DragOverlay>
          {activeEntry && <LessonCardOverlay entry={activeEntry} />}
        </DragOverlay>
      </DndContext>

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

// ─── Mobile View Component ───────────────────────────────────────────────────
interface MobileViewProps {
  groupId: string;
  selectedDay: DayKey;
  onSelectDay: (day: DayKey) => void;
  trackGroups: Map<TrackKey, TimeSlot[]>;
  getCell: (day: DayKey, slotId: string, groupId: string) => ScheduleEntry | undefined;
  conflictIds: Set<string>;
  onAddLesson: (day: DayKey, slot: TimeSlot) => void;
  onRemove: (id: string) => void;
}

function MobileView({
  groupId,
  selectedDay,
  onSelectDay,
  trackGroups,
  getCell,
  conflictIds,
  onAddLesson,
  onRemove,
}: MobileViewProps) {
  return (
    <div className="space-y-4">
      {/* Day pill tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {DAYS.map((day) => (
          <button
            key={day.key}
            onClick={() => onSelectDay(day.key)}
            className={cn(
              "px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap shrink-0 transition-all duration-150 active:scale-[0.95]",
              selectedDay === day.key
                ? "bg-[var(--color-accent)] text-white shadow-[var(--shadow-sm)]"
                : "bg-[var(--surface-hover)] text-[var(--muted)]"
            )}
          >
            {day.label}
          </button>
        ))}
      </div>

      {/* Slots list */}
      <div className="space-y-2">
        {Array.from(trackGroups.entries()).map(([track, slots]) => (
          <div key={track}>
            {/* Track header */}
            <div
              className={cn(
                "text-[11px] font-bold uppercase tracking-wider px-1 py-2",
                track === "kunduzgi" && "text-blue-600 dark:text-blue-400",
                track === "sirtqi" && "text-amber-600 dark:text-amber-400",
                track === "kechki" && "text-purple-600 dark:text-purple-400"
              )}
            >
              {TRACK_LABELS[track]}
            </div>

            <div className="space-y-2">
              {slots.map((slot) => {
                const entry = getCell(selectedDay, slot.id, groupId);
                const hasConflict = entry ? conflictIds.has(entry.id) : false;

                return (
                  <MobileSlotCard
                    key={slot.id}
                    slot={slot}
                    entry={entry}
                    hasConflict={hasConflict}
                    onAdd={() => onAddLesson(selectedDay, slot)}
                    onRemove={entry ? () => onRemove(entry.id) : undefined}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Mobile Slot Card ────────────────────────────────────────────────────────
function MobileSlotCard({
  slot,
  entry,
  hasConflict,
  onAdd,
  onRemove,
}: {
  slot: TimeSlot;
  entry?: ScheduleEntry;
  hasConflict: boolean;
  onAdd: () => void;
  onRemove?: () => void;
}) {
  const subject = useSubjectStore((s) =>
    entry ? s.getSubjectById(entry.subject_id) : undefined
  );
  const teacher = useTeacherStore((s) =>
    entry ? s.getTeacherById(entry.teacher_id) : undefined
  );
  const room = useRoomStore((s) =>
    entry ? s.getRoomById(entry.room_id) : undefined
  );

  if (!entry) {
    return (
      <button
        onClick={onAdd}
        className="w-full flex items-center gap-3 px-4 py-4 rounded-[14px] border-2 border-dashed border-[var(--border)] text-[var(--muted)] hover:border-[var(--color-accent)]/30 hover:text-[var(--color-accent)] transition-all active:scale-[0.98]"
      >
        <div className="text-left">
          <div className="text-[11px] font-medium">{slot.label}</div>
          <div className="text-[10px] opacity-60">{slot.start}–{slot.end}</div>
        </div>
        <div className="ml-auto flex items-center gap-1 text-xs">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Qo&apos;shish
        </div>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3.5 rounded-[14px] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] transition-all active:scale-[0.98]",
        hasConflict && "ring-2 ring-[var(--color-danger)]/40"
      )}
    >
      {/* Color indicator */}
      <div
        className="w-1 h-10 rounded-full shrink-0"
        style={{ backgroundColor: subject?.color || "#007AFF" }}
      />

      {/* Time */}
      <div className="shrink-0 text-center min-w-[44px]">
        <div className="text-[11px] font-semibold text-[var(--foreground)]">{slot.label}</div>
        <div className="text-[10px] text-[var(--muted)]">{slot.start}</div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-[var(--foreground)] truncate">
          {subject?.short_name || subject?.name || "?"}
        </div>
        <div className="text-xs text-[var(--muted)] truncate">
          {teacher?.short_name || "?"} · {room?.name || "?"}
        </div>
      </div>

      {/* Remove */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="shrink-0 p-2 rounded-[8px] text-[var(--muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-all"
          aria-label="O'chirish"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ─── Droppable Cell (Desktop only) ──────────────────────────────────────────
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
        isOver && "bg-blue-50/60 dark:bg-blue-900/20",
        !entry &&
          "cursor-pointer hover:bg-[var(--surface-hover)] group/cell"
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
          <span className="text-[10px] text-[var(--muted-light)] bg-[var(--surface-hover)] rounded-[8px] px-2 py-1">
            + Qo&apos;shish
          </span>
        </div>
      )}
    </td>
  );
}
