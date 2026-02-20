"use client";

import { useState } from "react";
import { useTeacherStore } from "@/stores/useTeacherStore";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useRoomStore } from "@/stores/useRoomStore";
import { useTimetableStore } from "@/stores/useTimetableStore";
import { GlassModal } from "@/components/ui/GlassModal";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { DayKey, TimeSlot } from "@/lib/types";
import { DAYS } from "@/lib/constants";

interface CellAssignModalProps {
  open: boolean;
  onClose: () => void;
  day: DayKey;
  slot: TimeSlot;
  groupId: string;
}

export function CellAssignModal({
  open,
  onClose,
  day,
  slot,
  groupId,
}: CellAssignModalProps) {
  const { subjects } = useSubjectStore();
  const { teachers } = useTeacherStore();
  const { rooms } = useRoomStore();
  const { placeEntry, entries } = useTimetableStore();

  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [roomId, setRoomId] = useState("");

  // O'qituvchi va xonalardan band bo'lganlarini filtrlash
  const busyTeachers = entries
    .filter((e) => e.day === day && e.slot_id === slot.id)
    .map((e) => e.teacher_id);

  const busyRooms = entries
    .filter((e) => e.day === day && e.slot_id === slot.id)
    .map((e) => e.room_id);

  const availableTeachers = teachers.filter(
    (t) => !busyTeachers.includes(t.id)
  );
  const availableRooms = rooms.filter((r) => !busyRooms.includes(r.id));

  const dayLabel = DAYS.find((d) => d.key === day)?.label || day;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subjectId || !teacherId || !roomId) return;

    placeEntry({
      period_id: "current",
      day,
      slot_id: slot.id,
      group_ids: [groupId],
      subject_id: subjectId,
      teacher_id: teacherId,
      room_id: roomId,
      is_manual: true,
      created_by: "admin",
    });

    setSubjectId("");
    setTeacherId("");
    setRoomId("");
    onClose();
  }

  return (
    <GlassModal
      open={open}
      onClose={onClose}
      title={`Dars qo'shish — ${dayLabel}, ${slot.start}`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Fan"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          options={subjects.map((s) => ({
            value: s.id,
            label: s.name,
          }))}
          placeholder="Fan tanlang"
          required
        />

        <Select
          label={`O'qituvchi (${availableTeachers.length} ta bo'sh)`}
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          options={availableTeachers.map((t) => ({
            value: t.id,
            label: t.short_name,
          }))}
          placeholder="O'qituvchi tanlang"
          required
        />

        <Select
          label={`Xona (${availableRooms.length} ta bo'sh)`}
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          options={availableRooms.map((r) => ({
            value: r.id,
            label: `${r.name}${r.building ? ` (${r.building})` : ""} — ${r.capacity} o'rin`,
          }))}
          placeholder="Xona tanlang"
          required
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Bekor
          </Button>
          <Button type="submit">Qo&apos;shish</Button>
        </div>
      </form>
    </GlassModal>
  );
}
