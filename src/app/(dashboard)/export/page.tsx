"use client";

import { useState } from "react";
import { useTeacherStore } from "@/stores/useTeacherStore";
import { useGroupStore } from "@/stores/useGroupStore";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useRoomStore } from "@/stores/useRoomStore";
import { useTimetableStore } from "@/stores/useTimetableStore";
import { useHydration } from "@/hooks/useHydration";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";

type ExportView = "group" | "teacher" | "room" | "all";
type ExportFormat = "pdf" | "excel";

export default function ExportPage() {
  const hydrated = useHydration();
  const { teachers } = useTeacherStore();
  const { groups } = useGroupStore();
  const { subjects } = useSubjectStore();
  const { rooms } = useRoomStore();
  const { entries } = useTimetableStore();

  const [view, setView] = useState<ExportView>("group");
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [selectedId, setSelectedId] = useState("");
  const [exporting, setExporting] = useState(false);

  const ctx = { entries, teachers, subjects, rooms, groups };

  async function handleExport() {
    setExporting(true);
    try {
      if (view === "all") {
        const { exportAllGroupsExcel } = await import("@/lib/export/excel");
        exportAllGroupsExcel(ctx);
      } else if (view === "group" && selectedId) {
        if (format === "pdf") {
          const { exportGroupPDF } = await import("@/lib/export/pdf");
          exportGroupPDF(selectedId, ctx);
        } else {
          const { exportGroupExcel } = await import("@/lib/export/excel");
          exportGroupExcel(selectedId, ctx);
        }
      } else if (view === "teacher" && selectedId) {
        if (format === "pdf") {
          const { exportTeacherPDF } = await import("@/lib/export/pdf");
          exportTeacherPDF(selectedId, ctx);
        } else {
          const { exportTeacherExcel } = await import("@/lib/export/excel");
          exportTeacherExcel(selectedId, ctx);
        }
      } else if (view === "room" && selectedId) {
        if (format === "pdf") {
          const { exportRoomPDF } = await import("@/lib/export/pdf");
          exportRoomPDF(selectedId, ctx);
        } else {
          const { exportRoomExcel } = await import("@/lib/export/excel");
          exportRoomExcel(selectedId, ctx);
        }
      }
    } catch (err) {
      console.error("Export error:", err);
    }
    setExporting(false);
  }

  if (!hydrated) return <Spinner className="py-20" />;

  const viewOptions = [
    { value: "group", label: "Guruh bo'yicha" },
    { value: "teacher", label: "O'qituvchi bo'yicha" },
    { value: "room", label: "Xona bo'yicha" },
    { value: "all", label: "Barcha guruhlar (Excel)" },
  ];

  const entityOptions =
    view === "group"
      ? groups.map((g) => ({ value: g.id, label: g.name }))
      : view === "teacher"
      ? teachers.map((t) => ({ value: t.id, label: t.short_name }))
      : view === "room"
      ? rooms.map((r) => ({
          value: r.id,
          label: `${r.name}${r.building ? ` (${r.building})` : ""}`,
        }))
      : [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Eksport</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Dars jadvalini PDF yoki Excel formatida yuklab olish
        </p>
      </div>

      <GlassCard>
        <div className="space-y-4">
          <Select
            label="Ko'rinish"
            value={view}
            onChange={(e) => {
              setView(e.target.value as ExportView);
              setSelectedId("");
            }}
            options={viewOptions}
          />

          {view !== "all" && (
            <>
              <Select
                label={
                  view === "group"
                    ? "Guruh"
                    : view === "teacher"
                    ? "O'qituvchi"
                    : "Xona"
                }
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                options={entityOptions}
                placeholder="Tanlang..."
              />

              <div>
                <label className="block text-sm font-medium mb-2">Format</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value="pdf"
                      checked={format === "pdf"}
                      onChange={() => setFormat("pdf")}
                      className="accent-[#007AFF]"
                    />
                    <span className="flex items-center gap-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                      </svg>
                      PDF
                    </span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value="excel"
                      checked={format === "excel"}
                      onChange={() => setFormat("excel")}
                      className="accent-[#007AFF]"
                    />
                    <span className="flex items-center gap-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
                      </svg>
                      Excel
                    </span>
                  </label>
                </div>
              </div>
            </>
          )}

          <Button
            onClick={handleExport}
            disabled={
              exporting ||
              entries.length === 0 ||
              (view !== "all" && !selectedId)
            }
            size="lg"
            className="w-full"
          >
            {exporting ? (
              <span className="flex items-center gap-2">
                <Spinner /> Eksport qilinmoqda...
              </span>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-2" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                Yuklab olish
              </>
            )}
          </Button>

          {entries.length === 0 && (
            <p className="text-xs text-center text-amber-500">
              Jadvalda darslar yo&apos;q. Avval dars qo&apos;shing.
            </p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
