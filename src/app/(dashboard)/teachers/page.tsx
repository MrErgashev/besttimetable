"use client";

import { useState } from "react";
import { useTeacherStore } from "@/stores/useTeacherStore";
import { useHydration } from "@/hooks/useHydration";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GlassModal } from "@/components/ui/GlassModal";
import { Spinner } from "@/components/ui/Spinner";
import { DataTable, type Column } from "@/components/crud/DataTable";
import { PasteBulkEntry } from "@/components/import/PasteBulkEntry";
import { MasterDataImportWizard } from "@/components/import/MasterDataImportWizard";
import type { Teacher } from "@/lib/types";

export default function TeachersPage() {
  const hydrated = useHydration();
  const {
    teachers,
    addTeacher,
    addTeachers,
    updateTeacher,
    deleteTeacher,
    deleteTeachers,
    bulkUpdateTeachers,
  } = useTeacherStore();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Teacher | null>(null);
  const [showPaste, setShowPaste] = useState(false);
  const [showImport, setShowImport] = useState(false);

  if (!hydrated) return <Spinner className="py-20" />;

  const columns: Column<Teacher>[] = [
    {
      key: "short_name",
      header: "F.I.O",
      sortable: true,
      render: (t) => (
        <div>
          <p className="font-medium">{t.short_name}</p>
          <p className="text-xs text-[var(--muted)]">
            {t.first_name} {t.last_name}
          </p>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (t) => t.email || "—",
    },
    {
      key: "phone",
      header: "Telefon",
      render: (t) => t.phone || "—",
    },
    {
      key: "max_weekly_hours",
      header: "Max soat/hafta",
      sortable: true,
    },
  ];

  function openAdd() {
    setEditTarget(null);
    setShowForm(true);
  }

  function openEdit(t: Teacher) {
    setEditTarget(t);
    setShowForm(true);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight md:text-[32px]">O&apos;qituvchilar</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            {teachers.length} ta o&apos;qituvchi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setShowImport(true)}>
            Import
          </Button>
          <Button variant="secondary" onClick={() => setShowPaste(true)}>
            Paste
          </Button>
          <Button onClick={openAdd}>+ Qo&apos;shish</Button>
        </div>
      </div>

      {/* Table */}
      <GlassCard padding="none">
        <DataTable
          data={teachers}
          columns={columns}
          onEdit={openEdit}
          onDelete={(t) => deleteTeacher(t.id)}
          searchKeys={["first_name", "last_name", "short_name", "email"]}
          emptyLabel="O'qituvchilar yo'q. Birinchisini qo'shing!"
          selectable
          onBulkDelete={(items) => deleteTeachers(items.map((t) => t.id))}
          onBulkEdit={(items, changes) =>
            bulkUpdateTeachers(
              items.map((t) => t.id),
              changes as Partial<Teacher>
            )
          }
          bulkEditFields={[
            { key: "max_weekly_hours", label: "Max soat/hafta", type: "number" },
          ]}
        />
      </GlassCard>

      {/* Import Modal */}
      <GlassModal
        open={showImport}
        onClose={() => setShowImport(false)}
        title="O'qituvchilarni import qilish"
        size="lg"
      >
        <MasterDataImportWizard
          entityType="teachers"
          existingItems={teachers as unknown as Record<string, unknown>[]}
          onImport={(items) =>
            addTeachers(
              items as Omit<Teacher, "id" | "created_at" | "updated_at">[]
            )
          }
          onClose={() => setShowImport(false)}
        />
      </GlassModal>

      {/* Paste Modal */}
      <GlassModal
        open={showPaste}
        onClose={() => setShowPaste(false)}
        title="O'qituvchilarni qo'yish (Paste)"
        size="lg"
      >
        <PasteBulkEntry
          entityType="teachers"
          onImport={(items) =>
            addTeachers(
              items as Omit<Teacher, "id" | "created_at" | "updated_at">[]
            )
          }
          onClose={() => setShowPaste(false)}
        />
      </GlassModal>

      {/* Form Modal */}
      <GlassModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={
          editTarget ? "O'qituvchini tahrirlash" : "Yangi o'qituvchi"
        }
      >
        <TeacherForm
          initial={editTarget}
          onSuccess={() => setShowForm(false)}
          onSubmit={(data) => {
            if (editTarget) {
              updateTeacher(editTarget.id, data);
            } else {
              addTeacher(data as Omit<Teacher, "id" | "created_at" | "updated_at">);
            }
            setShowForm(false);
          }}
          onSubmitAndContinue={editTarget ? undefined : (data) => {
            addTeacher(data as Omit<Teacher, "id" | "created_at" | "updated_at">);
          }}
        />
      </GlassModal>
    </div>
  );
}

function TeacherForm({
  initial,
  onSubmit,
  onSubmitAndContinue,
}: {
  initial: Teacher | null;
  onSuccess: () => void;
  onSubmit: (data: Partial<Teacher>) => void;
  onSubmitAndContinue?: (data: Partial<Teacher>) => void;
}) {
  const [firstName, setFirstName] = useState(initial?.first_name || "");
  const [lastName, setLastName] = useState(initial?.last_name || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [phone, setPhone] = useState(initial?.phone || "");
  const [maxHours, setMaxHours] = useState(
    initial?.max_weekly_hours?.toString() || "18"
  );
  const [addedCount, setAddedCount] = useState(0);

  function buildData() {
    const shortName = `${lastName} ${firstName.charAt(0)}.`;
    return {
      first_name: firstName,
      last_name: lastName,
      short_name: shortName,
      email: email || undefined,
      phone: phone || undefined,
      max_weekly_hours: parseInt(maxHours) || 18,
    };
  }

  function resetForm() {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setMaxHours("18");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(buildData());
  }

  function handleSubmitAndContinue() {
    if (!firstName || !lastName) return;
    onSubmitAndContinue?.(buildData());
    setAddedCount((c) => c + 1);
    resetForm();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {addedCount > 0 && (
        <div className="text-sm text-[var(--color-success)] bg-[var(--color-success)]/10 px-3 py-2 rounded-[10px]">
          {addedCount} ta o&apos;qituvchi qo&apos;shildi
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Ism"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Muhammadsodiq"
          required
        />
        <Input
          label="Familiya"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Ergashev"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
        />
        <Input
          label="Telefon"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+998 90 123 45 67"
        />
      </div>
      <Input
        label="Haftalik max soat"
        type="number"
        value={maxHours}
        onChange={(e) => setMaxHours(e.target.value)}
        min="1"
        max="40"
      />
      <div className="flex justify-end gap-3 pt-2">
        {!initial && onSubmitAndContinue && (
          <Button type="button" variant="secondary" onClick={handleSubmitAndContinue}>
            Saqlash va yana qo&apos;shish
          </Button>
        )}
        <Button type="submit">
          {initial ? "Saqlash" : "Qo'shish"}
        </Button>
      </div>
    </form>
  );
}
