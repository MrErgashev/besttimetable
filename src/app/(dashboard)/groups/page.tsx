"use client";

import { useState } from "react";
import { useGroupStore } from "@/stores/useGroupStore";
import { useHydration } from "@/hooks/useHydration";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { GlassModal } from "@/components/ui/GlassModal";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { DataTable, type Column } from "@/components/crud/DataTable";
import { TRACK_LABELS } from "@/lib/constants";
import type { Group, TrackKey } from "@/lib/types";

export default function GroupsPage() {
  const hydrated = useHydration();
  const { groups, addGroup, updateGroup, deleteGroup } = useGroupStore();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Group | null>(null);

  if (!hydrated) return <Spinner className="py-20" />;

  const columns: Column<Group>[] = [
    { key: "name", header: "Guruh nomi", sortable: true },
    { key: "course", header: "Kurs", sortable: true },
    {
      key: "track",
      header: "Trek",
      render: (g) => (
        <Badge
          variant={
            g.track === "kunduzgi"
              ? "accent"
              : g.track === "sirtqi"
                ? "warning"
                : "default"
          }
        >
          {TRACK_LABELS[g.track]}
        </Badge>
      ),
    },
    { key: "student_count", header: "Talabalar soni", sortable: true },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight md:text-[32px]">Guruhlar</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            {groups.length} ta guruh
          </p>
        </div>
        <Button
          onClick={() => {
            setEditTarget(null);
            setShowForm(true);
          }}
        >
          + Qo&apos;shish
        </Button>
      </div>

      <GlassCard padding="none">
        <DataTable
          data={groups}
          columns={columns}
          onEdit={(g) => {
            setEditTarget(g);
            setShowForm(true);
          }}
          onDelete={(g) => deleteGroup(g.id)}
          searchKeys={["name"]}
          emptyLabel="Guruhlar yo'q. Birinchisini qo'shing!"
        />
      </GlassCard>

      <GlassModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editTarget ? "Guruhni tahrirlash" : "Yangi guruh"}
      >
        <GroupForm
          initial={editTarget}
          onSubmit={(data) => {
            if (editTarget) {
              updateGroup(editTarget.id, data);
            } else {
              addGroup(data as Omit<Group, "id" | "created_at" | "updated_at">);
            }
            setShowForm(false);
          }}
        />
      </GlassModal>
    </div>
  );
}

function GroupForm({
  initial,
  onSubmit,
}: {
  initial: Group | null;
  onSubmit: (data: Partial<Group>) => void;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [course, setCourse] = useState(initial?.course?.toString() || "1");
  const [track, setTrack] = useState<TrackKey>(initial?.track || "kunduzgi");
  const [studentCount, setStudentCount] = useState(
    initial?.student_count?.toString() || "25"
  );
  const [departmentId] = useState(initial?.department_id || "default");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      name,
      course: parseInt(course) || 1,
      track,
      student_count: parseInt(studentCount) || 25,
      department_id: departmentId,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Guruh nomi"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="MT-21"
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Kurs"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          options={[
            { value: "1", label: "1-kurs" },
            { value: "2", label: "2-kurs" },
            { value: "3", label: "3-kurs" },
            { value: "4", label: "4-kurs" },
            { value: "5", label: "5-kurs (magistr)" },
          ]}
        />
        <Select
          label="Trek"
          value={track}
          onChange={(e) => setTrack(e.target.value as TrackKey)}
          options={Object.entries(TRACK_LABELS).map(([value, label]) => ({
            value,
            label,
          }))}
        />
      </div>
      <Input
        label="Talabalar soni"
        type="number"
        value={studentCount}
        onChange={(e) => setStudentCount(e.target.value)}
        min="1"
        max="500"
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit">{initial ? "Saqlash" : "Qo'shish"}</Button>
      </div>
    </form>
  );
}
