"use client";

import { useState, useMemo } from "react";
import { useTeacherStore } from "@/stores/useTeacherStore";
import { useTimetableStore } from "@/stores/useTimetableStore";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useRoomStore } from "@/stores/useRoomStore";
import { useGroupStore } from "@/stores/useGroupStore";
import { useHydration } from "@/hooks/useHydration";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { GlassModal } from "@/components/ui/GlassModal";
import { Spinner } from "@/components/ui/Spinner";
import { DAYS, TIME_SLOTS } from "@/lib/constants";
import type { ScheduleEntry } from "@/lib/types";

export default function SubstitutionsPage() {
  const hydrated = useHydration();
  const { teachers } = useTeacherStore();
  const { entries, bulkLoad } = useTimetableStore();
  const { getSubjectById } = useSubjectStore();
  const { getRoomById } = useRoomStore();
  const { groups } = useGroupStore();

  const [selectedDay, setSelectedDay] = useState(DAYS[0].key);
  const [showSubModal, setShowSubModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ScheduleEntry | null>(null);
  const [substituteTeacherId, setSubstituteTeacherId] = useState("");

  const dayEntries = useMemo(
    () => entries.filter((e) => e.day === selectedDay),
    [entries, selectedDay]
  );

  // Tanlangan slot uchun band bo'lmagan o'qituvchilar
  const availableTeachers = useMemo(() => {
    if (!selectedEntry) return teachers;
    const busySet = new Set(
      entries
        .filter(
          (e) =>
            e.day === selectedEntry.day &&
            e.slot_id === selectedEntry.slot_id &&
            e.id !== selectedEntry.id
        )
        .map((e) => e.teacher_id)
    );
    return teachers.filter(
      (t) => !busySet.has(t.id) && t.id !== selectedEntry.teacher_id
    );
  }, [selectedEntry, entries, teachers]);

  if (!hydrated) return <Spinner className="py-20" />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-light)] bg-clip-text text-transparent">O&apos;rinbosar boshqaruvi</span>
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          O&apos;qituvchi kelmasa, o&apos;rniga boshqa o&apos;qituvchi tayinlash
        </p>
      </div>

      <div className="w-full sm:w-48">
        <Select
          label="Kun"
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value as typeof selectedDay)}
          options={DAYS.map((d) => ({ value: d.key, label: d.label }))}
        />
      </div>

      {dayEntries.length === 0 ? (
        <GlassCard>
          <div className="text-center py-12 text-[var(--muted)]">
            Bu kunda dars yo&apos;q
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {TIME_SLOTS.map((slot) => {
            const slotEntries = dayEntries.filter((e) => e.slot_id === slot.id);
            if (slotEntries.length === 0) return null;

            return (
              <GlassCard key={slot.id} padding="sm">
                <div className="flex items-center gap-3 mb-2">
                  <Badge>{slot.label}</Badge>
                  <span className="text-xs text-[var(--muted)]">
                    {slot.start}–{slot.end}
                  </span>
                </div>
                <div className="space-y-1">
                  {slotEntries.map((entry) => {
                    const subject = getSubjectById(entry.subject_id);
                    const teacher = teachers.find((t) => t.id === entry.teacher_id);
                    const room = getRoomById(entry.room_id);
                    const entryGroups = entry.group_ids
                      .map((gid) => groups.find((g) => g.id === gid)?.name)
                      .filter(Boolean)
                      .join(", ");

                    return (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between py-2 px-3 rounded-[10px] bg-[var(--surface-secondary)]"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-1 h-8 rounded-full"
                            style={{ backgroundColor: subject?.color || "#6366f1" }}
                          />
                          <div>
                            <div className="text-sm font-medium">
                              {subject?.short_name} — {teacher?.short_name}
                            </div>
                            <div className="text-xs text-[var(--muted)]">
                              {entryGroups} | {room?.name}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedEntry(entry);
                            setSubstituteTeacherId("");
                            setShowSubModal(true);
                          }}
                        >
                          O&apos;rinbosar
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* O'rinbosar tayinlash modali */}
      <GlassModal
        open={showSubModal}
        onClose={() => setShowSubModal(false)}
        title="O'rinbosar tayinlash"
        size="sm"
      >
        {selectedEntry && (
          <div className="space-y-4">
            <div className="text-sm text-[var(--muted)]">
              <span className="font-medium text-[var(--foreground)]">
                {teachers.find((t) => t.id === selectedEntry.teacher_id)?.short_name}
              </span>{" "}
              o&apos;rniga boshqa o&apos;qituvchi tayinlash
            </div>

            <Select
              label={`Bo'sh o'qituvchilar (${availableTeachers.length} ta)`}
              value={substituteTeacherId}
              onChange={(e) => setSubstituteTeacherId(e.target.value)}
              options={availableTeachers.map((t) => ({
                value: t.id,
                label: t.short_name,
              }))}
              placeholder="O'qituvchi tanlang"
            />

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowSubModal(false)}>
                Bekor
              </Button>
              <Button
                disabled={!substituteTeacherId}
                onClick={() => {
                  const updated = entries.map((e) =>
                    e.id === selectedEntry.id
                      ? { ...e, teacher_id: substituteTeacherId, updated_at: new Date().toISOString() }
                      : e
                  );
                  bulkLoad(updated);
                  setShowSubModal(false);
                }}
              >
                Tayinlash
              </Button>
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  );
}
