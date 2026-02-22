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
import { PasteBulkEntry } from "@/components/import/PasteBulkEntry";
import { MasterDataImportWizard } from "@/components/import/MasterDataImportWizard";
import { SUBJECT_COLORS } from "@/lib/constants";
import type { Subject } from "@/lib/types";

export default function SubjectsPage() {
  const hydrated = useHydration();
  const {
    subjects,
    addSubject,
    addSubjects,
    updateSubject,
    deleteSubject,
    deleteSubjects,
    bulkUpdateSubjects,
  } = useSubjectStore();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Subject | null>(null);
  const [showPaste, setShowPaste] = useState(false);
  const [showImport, setShowImport] = useState(false);

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
        title="Fanlarni import qilish"
        size="lg"
      >
        <MasterDataImportWizard
          entityType="subjects"
          existingItems={subjects as unknown as Record<string, unknown>[]}
          onImport={(items) =>
            addSubjects(
              items as Omit<Subject, "id" | "created_at" | "updated_at">[]
            )
          }
          onClose={() => setShowImport(false)}
        />
      </GlassModal>

      {/* Paste Modal */}
      <GlassModal
        open={showPaste}
        onClose={() => setShowPaste(false)}
        title="Fanlarni qo'yish (Paste)"
        size="lg"
      >
        <PasteBulkEntry
          entityType="subjects"
          onImport={(items) =>
            addSubjects(
              items as Omit<Subject, "id" | "created_at" | "updated_at">[]
            )
          }
          onClose={() => setShowPaste(false)}
        />
      </GlassModal>

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
          selectable
          onBulkDelete={(items) => deleteSubjects(items.map((s) => s.id))}
          onBulkEdit={(items, changes) =>
            bulkUpdateSubjects(
              items.map((s) => s.id),
              changes as Partial<Subject>
            )
          }
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
          onSubmitAndContinue={editTarget ? undefined : (data) => {
            addSubject(data as Omit<Subject, "id" | "created_at" | "updated_at">);
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
  onSubmitAndContinue,
}: {
  initial: Subject | null;
  subjectCount: number;
  onSubmit: (data: Partial<Subject>) => void;
  onSubmitAndContinue?: (data: Partial<Subject>) => void;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [shortName, setShortName] = useState(initial?.short_name || "");
  const [color, setColor] = useState(
    initial?.color || SUBJECT_COLORS[subjectCount % SUBJECT_COLORS.length]
  );
  const [requiresLab, setRequiresLab] = useState(
    initial?.requires_lab || false
  );
  const [addedCount, setAddedCount] = useState(0);

  function buildData() {
    return {
      name,
      short_name: shortName || name.slice(0, 3),
      color,
      requires_lab: requiresLab,
    };
  }

  function resetForm() {
    setName("");
    setShortName("");
    setColor(SUBJECT_COLORS[(subjectCount + addedCount + 1) % SUBJECT_COLORS.length]);
    setRequiresLab(false);
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
          {addedCount} ta fan qo&apos;shildi
        </div>
      )}
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
