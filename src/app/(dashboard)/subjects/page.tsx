"use client";

import { useState } from "react";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useHydration } from "@/hooks/useHydration";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GlassModal } from "@/components/ui/GlassModal";
import { Spinner } from "@/components/ui/Spinner";
import { DataTable, type Column } from "@/components/crud/DataTable";
import { SUBJECT_COLORS } from "@/lib/constants";
import type { Subject } from "@/lib/types";

export default function SubjectsPage() {
  const hydrated = useHydration();
  const { subjects, addSubject, updateSubject, deleteSubject } =
    useSubjectStore();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Subject | null>(null);

  if (!hydrated) return <Spinner className="py-20" />;

  const columns: Column<Subject>[] = [
    {
      key: "name",
      header: "Fan nomi",
      sortable: true,
      render: (s) => (
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: s.color }}
          />
          <div>
            <p className="font-medium">{s.name}</p>
            <p className="text-xs text-[var(--muted)]">{s.short_name}</p>
          </div>
        </div>
      ),
    },
    {
      key: "requires_lab",
      header: "Laboratoriya",
      render: (s) =>
        s.requires_lab ? (
          <span className="text-success text-xs font-medium">Ha</span>
        ) : (
          <span className="text-[var(--muted)] text-xs">Yo&apos;q</span>
        ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight md:text-[32px]">Fanlar</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            {subjects.length} ta fan
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
          data={subjects}
          columns={columns}
          onEdit={(s) => {
            setEditTarget(s);
            setShowForm(true);
          }}
          onDelete={(s) => deleteSubject(s.id)}
          searchKeys={["name", "short_name"]}
          emptyLabel="Fanlar yo'q. Birinchisini qo'shing!"
        />
      </GlassCard>

      <GlassModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editTarget ? "Fanni tahrirlash" : "Yangi fan"}
      >
        <SubjectForm
          initial={editTarget}
          subjectCount={subjects.length}
          onSubmit={(data) => {
            if (editTarget) {
              updateSubject(editTarget.id, data);
            } else {
              addSubject(
                data as Omit<Subject, "id" | "created_at" | "updated_at">
              );
            }
            setShowForm(false);
          }}
        />
      </GlassModal>
    </div>
  );
}

function SubjectForm({
  initial,
  subjectCount,
  onSubmit,
}: {
  initial: Subject | null;
  subjectCount: number;
  onSubmit: (data: Partial<Subject>) => void;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [shortName, setShortName] = useState(initial?.short_name || "");
  const [color, setColor] = useState(
    initial?.color || SUBJECT_COLORS[subjectCount % SUBJECT_COLORS.length]
  );
  const [requiresLab, setRequiresLab] = useState(
    initial?.requires_lab || false
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      name,
      short_name: shortName || name.slice(0, 3),
      color,
      requires_lab: requiresLab,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Fan nomi"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Matematika"
        required
      />
      <Input
        label="Qisqa nomi"
        value={shortName}
        onChange={(e) => setShortName(e.target.value)}
        placeholder="Mat"
      />
      <div className="space-y-1.5">
        <label className="block text-sm font-medium">Rang</label>
        <div className="flex items-center gap-2 flex-wrap">
          {SUBJECT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-lg transition-all ${
                color === c
                  ? "ring-2 ring-offset-2 ring-[var(--color-accent)] scale-110"
                  : "hover:scale-105"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={requiresLab}
          onChange={(e) => setRequiresLab(e.target.checked)}
          className="w-4 h-4 rounded border-[var(--border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
        />
        <span className="text-sm">Laboratoriya talab qilinadi</span>
      </label>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit">{initial ? "Saqlash" : "Qo'shish"}</Button>
      </div>
    </form>
  );
}
