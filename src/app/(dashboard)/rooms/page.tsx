"use client";

import { useState } from "react";
import { useRoomStore } from "@/stores/useRoomStore";
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
import { ROOM_TYPE_LABELS } from "@/lib/constants";
import type { Room, RoomType } from "@/lib/types";

export default function RoomsPage() {
  const hydrated = useHydration();
  const {
    rooms,
    addRoom,
    addRooms,
    updateRoom,
    deleteRoom,
    deleteRooms,
    bulkUpdateRooms,
  } = useRoomStore();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Room | null>(null);
  const [showPaste, setShowPaste] = useState(false);
  const [showImport, setShowImport] = useState(false);

  if (!hydrated) return <Spinner className="py-20" />;

  const columns: Column<Room>[] = [
    { key: "name", header: "Xona nomi", sortable: true },
    {
      key: "building",
      header: "Bino",
      render: (r) => r.building || "—",
    },
    { key: "capacity", header: "Sig'imi", sortable: true },
    {
      key: "type",
      header: "Turi",
      render: (r) => (
        <Badge
          variant={
            r.type === "laboratoriya"
              ? "success"
              : r.type === "kompyuter_xona"
                ? "accent"
                : "default"
          }
        >
          {ROOM_TYPE_LABELS[r.type]}
        </Badge>
      ),
    },
    {
      key: "floor",
      header: "Qavat",
      render: (r) => (r.floor ? `${r.floor}-qavat` : "—"),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight md:text-[32px]">Xonalar</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            {rooms.length} ta xona
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
        title="Xonalarni import qilish"
        size="lg"
      >
        <MasterDataImportWizard
          entityType="rooms"
          existingItems={rooms as unknown as Record<string, unknown>[]}
          onImport={(items) =>
            addRooms(
              items as Omit<Room, "id" | "created_at" | "updated_at">[]
            )
          }
          onClose={() => setShowImport(false)}
        />
      </GlassModal>

      {/* Paste Modal */}
      <GlassModal
        open={showPaste}
        onClose={() => setShowPaste(false)}
        title="Xonalarni qo'yish (Paste)"
        size="lg"
      >
        <PasteBulkEntry
          entityType="rooms"
          onImport={(items) =>
            addRooms(
              items as Omit<Room, "id" | "created_at" | "updated_at">[]
            )
          }
          onClose={() => setShowPaste(false)}
        />
      </GlassModal>

      <GlassCard padding="none">
        <DataTable
          data={rooms}
          columns={columns}
          onEdit={(r) => {
            setEditTarget(r);
            setShowForm(true);
          }}
          onDelete={(r) => deleteRoom(r.id)}
          searchKeys={["name", "building"]}
          emptyLabel="Xonalar yo'q. Birinchisini qo'shing!"
          selectable
          onBulkDelete={(items) => deleteRooms(items.map((r) => r.id))}
          onBulkEdit={(items, changes) =>
            bulkUpdateRooms(
              items.map((r) => r.id),
              changes as Partial<Room>
            )
          }
          bulkEditFields={[
            { key: "building", label: "Bino", type: "string" },
            {
              key: "type",
              label: "Turi",
              type: "select",
              options: Object.entries(ROOM_TYPE_LABELS).map(([v, l]) => ({
                value: v,
                label: l,
              })),
            },
            { key: "capacity", label: "Sig'imi", type: "number" },
          ]}
        />
      </GlassCard>

      <GlassModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editTarget ? "Xonani tahrirlash" : "Yangi xona"}
      >
        <RoomForm
          initial={editTarget}
          onSubmit={(data) => {
            if (editTarget) {
              updateRoom(editTarget.id, data);
            } else {
              addRoom(data as Omit<Room, "id" | "created_at" | "updated_at">);
            }
            setShowForm(false);
          }}
          onSubmitAndContinue={editTarget ? undefined : (data) => {
            addRoom(data as Omit<Room, "id" | "created_at" | "updated_at">);
          }}
        />
      </GlassModal>
    </div>
  );
}

function RoomForm({
  initial,
  onSubmit,
  onSubmitAndContinue,
}: {
  initial: Room | null;
  onSubmit: (data: Partial<Room>) => void;
  onSubmitAndContinue?: (data: Partial<Room>) => void;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [building, setBuilding] = useState(initial?.building || "");
  const [capacity, setCapacity] = useState(
    initial?.capacity?.toString() || "30"
  );
  const [type, setType] = useState<RoomType>(initial?.type || "oddiy");
  const [floor, setFloor] = useState(initial?.floor?.toString() || "");
  const [addedCount, setAddedCount] = useState(0);

  function buildData() {
    return {
      name,
      building: building || undefined,
      capacity: parseInt(capacity) || 30,
      type,
      floor: floor ? parseInt(floor) : undefined,
    };
  }

  function resetForm() {
    setName("");
    setFloor("");
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
          {addedCount} ta xona qo&apos;shildi
        </div>
      )}
      <Input
        label="Xona nomi"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="305-xona"
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Bino"
          value={building}
          onChange={(e) => setBuilding(e.target.value)}
          placeholder="A bino"
        />
        <Input
          label="Qavat"
          type="number"
          value={floor}
          onChange={(e) => setFloor(e.target.value)}
          placeholder="3"
          min="0"
          max="20"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Sig'imi (talabalar soni)"
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          min="1"
          max="1000"
        />
        <Select
          label="Xona turi"
          value={type}
          onChange={(e) => setType(e.target.value as RoomType)}
          options={Object.entries(ROOM_TYPE_LABELS).map(([value, label]) => ({
            value,
            label,
          }))}
        />
      </div>
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
