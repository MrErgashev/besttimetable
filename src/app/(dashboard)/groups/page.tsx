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
import { PasteBulkEntry } from "@/components/import/PasteBulkEntry";
import { MasterDataImportWizard } from "@/components/import/MasterDataImportWizard";
import { TRACK_LABELS } from "@/lib/constants";
import type { Group, TrackKey } from "@/lib/types";

export default function GroupsPage() {
  const hydrated = useHydration();
  const {
    groups,
    addGroup,
    addGroups,
    updateGroup,
    deleteGroup,
    deleteGroups,
    bulkUpdateGroups,
  } = useGroupStore();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Group | null>(null);
  const [showPaste, setShowPaste] = useState(false);
  const [showImport, setShowImport] = useState(false);

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
          <h1 className="text-[28px] font-bold tracking-tight md:text-[32px]">
            <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-light)] bg-clip-text text-transparent">Guruhlar</span>
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            {groups.length} ta guruh
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setShowImport(true)}>
            Import
          </Button>
          <Button variant="secondary" onClick={() => setShowPaste(true)}>
            Paste
          </Button>
          <Button
            onClick={() => {
              setEditTarget(null);
              setShowForm(true);
            }}
          >
            + Qo&apos;shish
          </Button>
        </div>
      </div>

      {/* Import Modal */}
      <GlassModal
        open={showImport}
        onClose={() => setShowImport(false)}
        title="Guruhlarni import qilish"
        size="lg"
      >
        <MasterDataImportWizard
          entityType="groups"
          existingItems={groups as unknown as Record<string, unknown>[]}
          onImport={(items) =>
            addGroups(
              items as Omit<Group, "id" | "created_at" | "updated_at">[]
            )
          }
          onClose={() => setShowImport(false)}
        />
      </GlassModal>

      {/* Paste Modal */}
      <GlassModal
        open={showPaste}
        onClose={() => setShowPaste(false)}
        title="Guruhlarni qo'yish (Paste)"
        size="lg"
      >
        <PasteBulkEntry
          entityType="groups"
          onImport={(items) =>
            addGroups(
              items as Omit<Group, "id" | "created_at" | "updated_at">[]
            )
          }
          onClose={() => setShowPaste(false)}
        />
      </GlassModal>

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
          selectable
          onBulkDelete={(items) => deleteGroups(items.map((g) => g.id))}
          onBulkEdit={(items, changes) =>
            bulkUpdateGroups(
              items.map((g) => g.id),
              changes as Partial<Group>
            )
          }
          bulkEditFields={[
            {
              key: "track",
              label: "Trek",
              type: "select",
              options: Object.entries(TRACK_LABELS).map(([v, l]) => ({
                value: v,
                label: l,
              })),
            },
            { key: "student_count", label: "Talabalar soni", type: "number" },
          ]}
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
          onSubmitAndContinue={editTarget ? undefined : (data) => {
            addGroup(data as Omit<Group, "id" | "created_at" | "updated_at">);
          }}
        />
      </GlassModal>
    </div>
  );
}

function GroupForm({
  initial,
  onSubmit,
  onSubmitAndContinue,
}: {
  initial: Group | null;
  onSubmit: (data: Partial<Group>) => void;
  onSubmitAndContinue?: (data: Partial<Group>) => void;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [course, setCourse] = useState(initial?.course?.toString() || "1");
  const [track, setTrack] = useState<TrackKey>(initial?.track || "kunduzgi");
  const [studentCount, setStudentCount] = useState(
    initial?.student_count?.toString() || "25"
  );
  const [departmentId] = useState(initial?.department_id || "default");
  const [addedCount, setAddedCount] = useState(0);

  function buildData() {
    return {
      name,
      course: parseInt(course) || 1,
      track,
      student_count: parseInt(studentCount) || 25,
      department_id: departmentId,
    };
  }

  function resetForm() {
    setName("");
    setStudentCount("25");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(buildData());
  }

  function handleSubmitAndContinue() {
    if (!name) return;
    onSubmitAndContinue?.(buildData());
    setAddedCount((c) => c + 1);
    resetForm();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {addedCount > 0 && (
        <div className="text-sm text-[var(--color-success)] bg-[var(--color-success)]/10 px-3 py-2 rounded-[10px]">
          {addedCount} ta guruh qo&apos;shildi
        </div>
      )}
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
        {!initial && onSubmitAndContinue && (
          <Button type="button" variant="secondary" onClick={handleSubmitAndContinue}>
            Saqlash va yana qo&apos;shish
          </Button>
        )}
        <Button type="submit">{initial ? "Saqlash" : "Qo'shish"}</Button>
      </div>
    </form>
  );
}
