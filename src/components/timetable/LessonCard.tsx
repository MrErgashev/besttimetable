"use client";

import { useDraggable } from "@dnd-kit/core";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useTeacherStore } from "@/stores/useTeacherStore";
import { useRoomStore } from "@/stores/useRoomStore";
import { cn } from "@/lib/utils";
import type { ScheduleEntry } from "@/lib/types";

interface LessonCardProps {
  entry: ScheduleEntry;
  isDragging?: boolean;
  hasConflict?: boolean;
  onRemove?: () => void;
}

export function LessonCard({
  entry,
  isDragging = false,
  hasConflict = false,
  onRemove,
}: LessonCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: entry.id,
    data: entry,
  });

  const subject = useSubjectStore((s) => s.getSubjectById(entry.subject_id));
  const teacher = useTeacherStore((s) => s.getTeacherById(entry.teacher_id));
  const room = useRoomStore((s) => s.getRoomById(entry.room_id));

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, borderLeftColor: subject?.color || "#6366f1" }}
      {...listeners}
      {...attributes}
      className={cn(
        "relative rounded-lg border-l-4 p-2 cursor-grab active:cursor-grabbing",
        "glass-subtle text-xs select-none transition-all h-full",
        isDragging && "opacity-60 shadow-2xl rotate-1 scale-105 z-50",
        hasConflict && "ring-2 ring-red-500/50 ring-inset"
      )}
    >
      {/* Fan nomi */}
      <div className="font-semibold truncate text-[var(--foreground)]">
        {subject?.short_name || "?"}
      </div>

      {/* O'qituvchi */}
      <div className="truncate text-[var(--muted)] mt-0.5">
        {teacher?.short_name || "?"}
      </div>

      {/* Xona */}
      <div className="truncate text-[var(--muted-light)]">
        {room?.name || "?"}
      </div>

      {/* Manual indicator */}
      {entry.is_manual && (
        <div
          className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400"
          title="Qo'lda qo'yilgan"
        />
      )}

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute top-0.5 right-0.5 p-0.5 rounded text-[var(--muted-light)] hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
          title="O'chirish"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

/** Drag overlay versiyasi — store bilan bog'lanmagan */
export function LessonCardOverlay({ entry }: { entry: ScheduleEntry }) {
  const subject = useSubjectStore((s) => s.getSubjectById(entry.subject_id));
  const teacher = useTeacherStore((s) => s.getTeacherById(entry.teacher_id));
  const room = useRoomStore((s) => s.getRoomById(entry.room_id));

  return (
    <div
      style={{ borderLeftColor: subject?.color || "#6366f1" }}
      className="rounded-lg border-l-4 p-2 glass-strong text-xs select-none shadow-2xl rotate-2 scale-110 w-32"
    >
      <div className="font-semibold truncate text-[var(--foreground)]">
        {subject?.short_name || "?"}
      </div>
      <div className="truncate text-[var(--muted)] mt-0.5">
        {teacher?.short_name || "?"}
      </div>
      <div className="truncate text-[var(--muted-light)]">
        {room?.name || "?"}
      </div>
    </div>
  );
}
