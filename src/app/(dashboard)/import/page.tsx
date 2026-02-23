"use client";

import { useState, useCallback, useRef } from "react";
import { useTeacherStore } from "@/stores/useTeacherStore";
import { useGroupStore } from "@/stores/useGroupStore";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useRoomStore } from "@/stores/useRoomStore";
import { useTimetableStore } from "@/stores/useTimetableStore";
import { useHydration } from "@/hooks/useHydration";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";

import { mapParsedRows, type MappingResult } from "@/lib/import/mapper";
import type { ParsedRow } from "@/lib/import/excel-parser";
import { nanoid } from "nanoid";

// ─── Types ─────────────────────────────────────────────────────────────────

type Step = "upload" | "preview" | "mapping" | "result";

interface FileEntry {
  id: string;
  file: File;
  name: string;
  size: number;
  type: "xlsx" | "docx";
  status: "pending" | "parsing" | "parsed" | "error";
  parsedRows: ParsedRow[];
  formatInfo: string;
  error?: string;
}

interface Conflict {
  type: "teacher" | "room";
  day: string;
  slotId: string;
  entityName: string;
  count: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function detectConflicts(
  entries: MappingResult["entries"],
  existingEntries: { day: string; slot_id: string; teacher_id: string; room_id: string }[]
): Conflict[] {
  const conflicts: Conflict[] = [];

  // O'qituvchi ziddiyatlari (import ichida)
  const teacherMap = new Map<string, number>();
  for (const e of entries) {
    const key = `${e.teacher_id}::${e.day}::${e.slot_id}`;
    teacherMap.set(key, (teacherMap.get(key) || 0) + 1);
  }
  for (const [key, count] of teacherMap) {
    if (count > 1) {
      const [teacherId, day, slotId] = key.split("::");
      conflicts.push({ type: "teacher", day, slotId, entityName: teacherId, count });
    }
  }

  // Xona ziddiyatlari (import ichida)
  const roomMap = new Map<string, number>();
  for (const e of entries) {
    const key = `${e.room_id}::${e.day}::${e.slot_id}`;
    roomMap.set(key, (roomMap.get(key) || 0) + 1);
  }
  for (const [key, count] of roomMap) {
    if (count > 1) {
      const [roomId, day, slotId] = key.split("::");
      conflicts.push({ type: "room", day, slotId, entityName: roomId, count });
    }
  }

  // Mavjud jadval bilan ziddiyatlar
  for (const e of entries) {
    const teacherConflict = existingEntries.find(
      (ex) => ex.teacher_id === e.teacher_id && ex.day === e.day && ex.slot_id === e.slot_id
    );
    if (teacherConflict) {
      conflicts.push({
        type: "teacher",
        day: e.day,
        slotId: e.slot_id,
        entityName: e.teacher_id,
        count: 2,
      });
    }
    const roomConflict = existingEntries.find(
      (ex) => ex.room_id === e.room_id && ex.day === e.day && ex.slot_id === e.slot_id
    );
    if (roomConflict) {
      conflicts.push({
        type: "room",
        day: e.day,
        slotId: e.slot_id,
        entityName: e.room_id,
        count: 2,
      });
    }
  }

  // Takroriy ziddiyatlarni olib tashlash
  const seen = new Set<string>();
  return conflicts.filter((c) => {
    const key = `${c.type}::${c.entityName}::${c.day}::${c.slotId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Step labels ───────────────────────────────────────────────────────────

const STEP_LABELS: Record<Step, string> = {
  upload: "Yuklash",
  preview: "Ko'rish",
  mapping: "Moslashtirish",
  result: "Natija",
};

// ─── Component ─────────────────────────────────────────────────────────────

export default function ImportPage() {
  const hydrated = useHydration();
  const { teachers } = useTeacherStore();
  const { groups } = useGroupStore();
  const { subjects } = useSubjectStore();
  const { rooms } = useRoomStore();
  const { placeEntry, entries: existingEntries } = useTimetableStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [mappingResult, setMappingResult] = useState<MappingResult | null>(null);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [clearBefore, setClearBefore] = useState(true);

  // ─── File handling ─────────────────────────────────────────────────────

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const toAdd: FileEntry[] = [];
      for (const file of Array.from(newFiles)) {
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (ext !== "xlsx" && ext !== "docx") continue;

        // Takroriy fayl nomini tekshirish
        if (files.some((f) => f.name === file.name && f.size === file.size)) continue;

        toAdd.push({
          id: nanoid(),
          file,
          name: file.name,
          size: file.size,
          type: ext as "xlsx" | "docx",
          status: "pending",
          parsedRows: [],
          formatInfo: "",
        });
      }

      if (toAdd.length === 0 && newFiles.length > 0) {
        setError("Faqat .xlsx va .docx fayllar qo'llab-quvvatlanadi");
        return;
      }

      setError("");
      setFiles((prev) => [...prev, ...toAdd]);
    },
    [files]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
      }
      // Input ni tozalash (bir xil faylni qayta tanlash imkoniyati)
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [addFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  // ─── Parse all files ───────────────────────────────────────────────────

  const parseAllFiles = useCallback(async () => {
    setParsing(true);
    setError("");

    const updated = [...files];

    await Promise.all(
      updated.map(async (entry, idx) => {
        if (entry.status === "parsed") return; // Avval parse qilingan bo'lsa o'tkazib yuborish

        updated[idx] = { ...entry, status: "parsing" };

        try {
          const buffer = await entry.file.arrayBuffer();

          if (entry.type === "xlsx") {
            const { parseExcelFile } = await import("@/lib/import/excel-parser");
            const result = parseExcelFile(buffer);
            const allRows = result.sheets.flatMap((s) => s.rows);
            updated[idx] = {
              ...entry,
              status: "parsed",
              parsedRows: allRows,
              formatInfo: `${result.sheets.length} varoq, ${result.format} format, ${result.totalRows} qator`,
            };
          } else {
            const { parseWordFile } = await import("@/lib/import/word-parser");
            const result = await parseWordFile(buffer);
            const allRows = result.tables.flatMap((t) => t.rows);
            updated[idx] = {
              ...entry,
              status: "parsed",
              parsedRows: allRows,
              formatInfo: `${result.tables.length} jadval, ${result.totalRows} qator`,
            };
          }
        } catch (err) {
          updated[idx] = {
            ...entry,
            status: "error",
            error: err instanceof Error ? err.message : "Noma'lum xatolik",
          };
        }
      })
    );

    setFiles(updated);
    setParsing(false);
    setStep("preview");
  }, [files]);

  // ─── Mapping ───────────────────────────────────────────────────────────

  const handleMapping = useCallback(() => {
    const allRows = files
      .filter((f) => f.status === "parsed")
      .flatMap((f) => f.parsedRows);

    const result = mapParsedRows(allRows, {
      teachers,
      groups,
      subjects,
      rooms,
      defaultGroupId: selectedGroupId || undefined,
      autoCreate: true,
    });

    setMappingResult(result);

    // Ziddiyatlarni aniqlash
    // Agar "tozalash" yoqilgan bo'lsa, mavjud jadval bilan solishtirish kerak emas
    const entriesToCheck = clearBefore ? [] : existingEntries;
    const detectedConflicts = detectConflicts(result.entries, entriesToCheck);
    setConflicts(detectedConflicts);

    setStep("mapping");
  }, [files, teachers, groups, subjects, rooms, selectedGroupId, existingEntries, clearBefore]);

  // ─── Import ────────────────────────────────────────────────────────────

  const handleImport = useCallback(() => {
    if (!mappingResult) return;
    setImporting(true);

    // Import oldidan mavjud jadval darslarini tozalash
    if (clearBefore) {
      useTimetableStore.getState().clearAll();
    }

    // Avval auto-created entity'larni store'larga qo'shish
    const { autoCreated } = mappingResult;
    if (autoCreated.subjects.length > 0) {
      useSubjectStore.setState((s) => ({
        subjects: [...s.subjects, ...autoCreated.subjects],
      }));
    }
    if (autoCreated.teachers.length > 0) {
      useTeacherStore.setState((s) => ({
        teachers: [...s.teachers, ...autoCreated.teachers],
      }));
    }
    if (autoCreated.rooms.length > 0) {
      useRoomStore.setState((s) => ({
        rooms: [...s.rooms, ...autoCreated.rooms],
      }));
    }
    if (autoCreated.groups.length > 0) {
      useGroupStore.setState((s) => ({
        groups: [...s.groups, ...autoCreated.groups],
      }));
    }

    // Keyin dars yozuvlarni jadvalga qo'shish
    let count = 0;
    for (const entry of mappingResult.entries) {
      placeEntry(entry);
      count++;
    }

    setImportedCount(count);
    setImporting(false);
    setStep("result");
  }, [mappingResult, placeEntry, clearBefore]);

  // ─── Reset ─────────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    setStep("upload");
    setFiles([]);
    setSelectedGroupId("");
    setMappingResult(null);
    setConflicts([]);
    setImportedCount(0);
    setError("");
    setParsing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // ─── Computed ──────────────────────────────────────────────────────────

  const totalParsedRows = files
    .filter((f) => f.status === "parsed")
    .reduce((sum, f) => sum + f.parsedRows.length, 0);
  const parsedFileCount = files.filter((f) => f.status === "parsed").length;
  const errorFileCount = files.filter((f) => f.status === "error").length;
  const hasGrouplessRows = files
    .filter((f) => f.status === "parsed")
    .some((f) => f.parsedRows.some((r) => !r.group));

  if (!hydrated) return <Spinner className="py-20" />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Import</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Excel (.xlsx) yoki Word (.docx) fayllardan dars jadvalini yuklash.
          Ko&apos;plab fayllarni bir vaqtda yuklash mumkin.
        </p>
      </div>

      {/* Bosqich ko'rsatkichi */}
      <div className="flex items-center gap-2 text-xs">
        {(["upload", "preview", "mapping", "result"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <div className="w-8 h-px bg-[var(--border)]" />}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                step === s
                  ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-semibold"
                  : "text-[var(--muted)]"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-current/10 flex items-center justify-center text-[10px] font-bold">
                {i + 1}
              </span>
              {STEP_LABELS[s]}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <GlassCard>
          <div className="text-sm text-red-500 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            {error}
          </div>
        </GlassCard>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          1-BOSQICH: FAYL YUKLASH
          ════════════════════════════════════════════════════════════════════ */}
      {step === "upload" && (
        <>
          <GlassCard>
            <div
              className={`border-2 border-dashed rounded-[16px] p-12 text-center cursor-pointer transition-colors ${
                dragOver
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5"
                  : "border-[var(--border)] hover:border-[var(--color-accent)]"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.docx"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="text-4xl mb-3 opacity-30">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="mx-auto"
                >
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
              </div>
              <p className="text-sm text-[var(--muted)]">
                {dragOver
                  ? "Fayllarni shu yerga tashlang"
                  : "Fayllar tanlash uchun bosing yoki shu yerga tashlang"}
              </p>
              <p className="text-xs text-[var(--muted-light)] mt-1">
                .xlsx va .docx fayllar qo&apos;llab-quvvatlanadi — ko&apos;plab fayllarni bir vaqtda tanlash mumkin
              </p>
            </div>
          </GlassCard>

          {/* Yuklangan fayllar ro'yxati */}
          {files.length > 0 && (
            <GlassCard>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">
                    Tanlangan fayllar ({files.length})
                  </h2>
                  <Button
                    variant="ghost"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs"
                  >
                    + Yana qo&apos;shish
                  </Button>
                </div>

                <div className="space-y-2">
                  {files.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-sm)] bg-[var(--surface-secondary)]"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-[var(--color-accent)] uppercase">
                          {f.type}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{f.name}</p>
                        <p className="text-xs text-[var(--muted)]">
                          {formatFileSize(f.size)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(f.id);
                        }}
                        className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-[var(--surface-hover)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--danger)]"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <Button onClick={parseAllFiles} disabled={files.length === 0 || parsing}>
                  {parsing ? (
                    <span className="flex items-center gap-2">
                      <Spinner /> O&apos;qilmoqda...
                    </span>
                  ) : (
                    `${files.length} ta faylni o'qish`
                  )}
                </Button>
              </div>
            </GlassCard>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          2-BOSQICH: KO'RISH (PREVIEW)
          ════════════════════════════════════════════════════════════════════ */}
      {step === "preview" && (
        <>
          {/* Umumiy statistika */}
          <GlassCard>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{files.length}</div>
                <div className="text-xs text-[var(--muted)]">Jami fayllar</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--color-success)]">
                  {parsedFileCount}
                </div>
                <div className="text-xs text-[var(--muted)]">Muvaffaqiyatli</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{totalParsedRows}</div>
                <div className="text-xs text-[var(--muted)]">Jami qatorlar</div>
              </div>
            </div>
          </GlassCard>

          {/* Har bir fayl uchun natija */}
          {files.map((f) => (
            <GlassCard key={f.id}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-[var(--color-accent)] uppercase">
                        {f.type}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{f.name}</p>
                      <p className="text-xs text-[var(--muted)]">{f.formatInfo || formatFileSize(f.size)}</p>
                    </div>
                  </div>
                  {f.status === "parsed" && (
                    <Badge variant="success">{f.parsedRows.length} qator</Badge>
                  )}
                  {f.status === "error" && <Badge variant="danger">Xatolik</Badge>}
                  {f.status === "parsing" && <Spinner />}
                </div>

                {f.status === "error" && f.error && (
                  <p className="text-xs text-[var(--color-danger)]">{f.error}</p>
                )}

                {/* Birinchi 5 qator preview */}
                {f.status === "parsed" && f.parsedRows.length > 0 && (
                  <div className="overflow-x-auto max-h-40 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-[var(--surface)]">
                        <tr>
                          <th className="text-left px-2 py-1 text-[var(--muted)]">#</th>
                          <th className="text-left px-2 py-1 text-[var(--muted)]">Kun</th>
                          <th className="text-left px-2 py-1 text-[var(--muted)]">Vaqt</th>
                          <th className="text-left px-2 py-1 text-[var(--muted)]">Guruh</th>
                          <th className="text-left px-2 py-1 text-[var(--muted)]">Fan</th>
                          <th className="text-left px-2 py-1 text-[var(--muted)]">O&apos;qituvchi</th>
                          <th className="text-left px-2 py-1 text-[var(--muted)]">Xona</th>
                        </tr>
                      </thead>
                      <tbody>
                        {f.parsedRows.slice(0, 5).map((row, i) => (
                          <tr key={i} className="border-t border-[var(--border)]">
                            <td className="px-2 py-1 text-[var(--muted)]">{i + 1}</td>
                            <td className="px-2 py-1">{row.day || "-"}</td>
                            <td className="px-2 py-1">{row.time || "-"}</td>
                            <td className="px-2 py-1">{row.group || "-"}</td>
                            <td className="px-2 py-1">{row.subject || "-"}</td>
                            <td className="px-2 py-1">{row.teacher || "-"}</td>
                            <td className="px-2 py-1">{row.room || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {f.parsedRows.length > 5 && (
                      <p className="text-xs text-[var(--muted)] text-center py-1">
                        ...va yana {f.parsedRows.length - 5} ta qator
                      </p>
                    )}
                  </div>
                )}
              </div>
            </GlassCard>
          ))}

          {/* Guruh tanlash + davom etish */}
          <GlassCard>
            <div className="space-y-4">
              {hasGrouplessRows && (
                <Select
                  label="Standart guruh (faylda ko'rsatilmagan qatorlar uchun)"
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  options={groups.map((g) => ({ value: g.id, label: g.name }))}
                  placeholder="Guruh tanlang"
                />
              )}

              {errorFileCount > 0 && (
                <p className="text-xs text-[var(--color-warning)]">
                  {errorFileCount} ta faylni o&apos;qib bo&apos;lmadi. Muvaffaqiyatli o&apos;qilgan {parsedFileCount} ta fayl bilan davom etish mumkin.
                </p>
              )}

              <div className="flex gap-3">
                <Button onClick={handleMapping} disabled={totalParsedRows === 0}>
                  Moslashtirish ({totalParsedRows} qator)
                </Button>
                <Button variant="ghost" onClick={handleReset}>
                  Bekor
                </Button>
              </div>
            </div>
          </GlassCard>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          3-BOSQICH: MOSLASHTIRISH (MAPPING)
          ════════════════════════════════════════════════════════════════════ */}
      {step === "mapping" && mappingResult && (
        <GlassCard>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Moslashtirish natijasi</h2>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{mappingResult.stats.total}</div>
                <div className="text-xs text-[var(--muted)]">Jami qatorlar</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--color-success)]">
                  {mappingResult.stats.mapped}
                </div>
                <div className="text-xs text-[var(--muted)]">Dars yozuvlari</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--color-warning)]">
                  {mappingResult.stats.unmapped}
                </div>
                <div className="text-xs text-[var(--muted)]">Moslashtirilmadi</div>
              </div>
            </div>

            {/* Birlashtirish haqida tushuntirish */}
            {mappingResult.stats.total > mappingResult.stats.mapped + mappingResult.stats.unmapped && (
              <div className="text-xs text-[var(--color-accent)] bg-[var(--color-accent)]/5 rounded-[var(--radius-sm)] px-3 py-2">
                {mappingResult.stats.total} qatordan {mappingResult.stats.total - mappingResult.stats.mapped - mappingResult.stats.unmapped} ta
                umumiy dars (bir nechta guruhga) birlashtirildi — natija: {mappingResult.stats.mapped} ta dars yozuvi
              </div>
            )}

            {/* Fayllar bo'yicha statistika */}
            <div className="text-xs text-[var(--muted)]">
              {parsedFileCount} ta fayldan ({files.filter((f) => f.status === "parsed").map((f) => f.name).join(", ")})
            </div>

            {/* Avtomatik yaratiladigan entity'lar */}
            {mappingResult.stats.autoCreatedCount > 0 && (
              <div className="rounded-[var(--radius-sm)] bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 p-3">
                <h3 className="text-sm font-semibold text-[var(--color-accent)] mb-1.5">
                  Avtomatik yaratiladigan ma&apos;lumotlar:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {mappingResult.autoCreated.subjects.length > 0 && (
                    <Badge variant="accent">
                      {mappingResult.autoCreated.subjects.length} ta fan
                    </Badge>
                  )}
                  {mappingResult.autoCreated.teachers.length > 0 && (
                    <Badge variant="accent">
                      {mappingResult.autoCreated.teachers.length} ta o&apos;qituvchi
                    </Badge>
                  )}
                  {mappingResult.autoCreated.rooms.length > 0 && (
                    <Badge variant="accent">
                      {mappingResult.autoCreated.rooms.length} ta xona
                    </Badge>
                  )}
                  {mappingResult.autoCreated.groups.length > 0 && (
                    <Badge variant="accent">
                      {mappingResult.autoCreated.groups.length} ta guruh
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-[var(--muted)] mt-1.5">
                  Topilmagan ma&apos;lumotlar import paytida avtomatik yaratiladi.
                  Keyinroq Fanlar, O&apos;qituvchilar, Xonalar sahifalaridan tahrirlash mumkin.
                </p>
              </div>
            )}

            {/* Ziddiyatlar */}
            {conflicts.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-warning)] mb-2">
                  Ziddiyatlar aniqlandi ({conflicts.length}):
                </h3>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {conflicts.slice(0, 15).map((c, i) => (
                    <div key={i} className="text-xs text-[var(--muted)] flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-warning)] flex-shrink-0 mt-1" />
                      <span>
                        {c.type === "teacher" ? "O'qituvchi" : "Xona"} ziddiyati: {c.day}, {c.slotId} ({c.count} marta)
                      </span>
                    </div>
                  ))}
                  {conflicts.length > 15 && (
                    <p className="text-xs text-[var(--muted)]">
                      ...va yana {conflicts.length - 15} ta ziddiyat
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Moslashtirilmagan qatorlar */}
            {mappingResult.unmapped.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-warning)] mb-2">
                  Moslashtirilmagan qatorlar:
                </h3>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {mappingResult.unmapped.slice(0, 20).map((u, i) => (
                    <div key={i} className="text-xs text-[var(--muted)] flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-warning)] flex-shrink-0 mt-1" />
                      <span>{u.reason}</span>
                    </div>
                  ))}
                  {mappingResult.unmapped.length > 20 && (
                    <p className="text-xs text-[var(--muted)]">
                      ...va yana {mappingResult.unmapped.length - 20} ta
                    </p>
                  )}
                </div>
              </div>
            )}

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={clearBefore}
                onChange={(e) => setClearBefore(e.target.checked)}
                className="rounded"
              />
              Import qilishdan oldin mavjud jadval darslarini tozalash
            </label>

            <div className="flex gap-3">
              <Button
                onClick={handleImport}
                disabled={mappingResult.stats.mapped === 0 || importing}
              >
                {importing ? (
                  <span className="flex items-center gap-2">
                    <Spinner /> Import qilinmoqda...
                  </span>
                ) : (
                  `${mappingResult.stats.mapped} ta darsni import qilish`
                )}
              </Button>
              <Button variant="ghost" onClick={() => setStep("preview")}>
                Orqaga
              </Button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          4-BOSQICH: NATIJA
          ════════════════════════════════════════════════════════════════════ */}
      {step === "result" && (
        <GlassCard>
          <div className="text-center py-8 space-y-4">
            <div className="text-4xl">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mx-auto text-[var(--color-success)]"
              >
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">Import yakunlandi!</h2>
              <p className="text-sm text-[var(--muted)] mt-1">
                {importedCount} ta dars {files.length} ta fayldan muvaffaqiyatli import qilindi
              </p>
              {mappingResult && mappingResult.stats.autoCreatedCount > 0 && (
                <p className="text-xs text-[var(--color-accent)] mt-1">
                  {mappingResult.autoCreated.subjects.length > 0 && `${mappingResult.autoCreated.subjects.length} ta fan, `}
                  {mappingResult.autoCreated.teachers.length > 0 && `${mappingResult.autoCreated.teachers.length} ta o'qituvchi, `}
                  {mappingResult.autoCreated.rooms.length > 0 && `${mappingResult.autoCreated.rooms.length} ta xona, `}
                  {mappingResult.autoCreated.groups.length > 0 && `${mappingResult.autoCreated.groups.length} ta guruh `}
                  avtomatik yaratildi
                </p>
              )}
              {conflicts.length > 0 && (
                <p className="text-xs text-[var(--color-warning)] mt-2">
                  {conflicts.length} ta ziddiyat aniqlangan edi — jadvalda tekshiring
                </p>
              )}
            </div>
            <div className="flex justify-center gap-3">
              <Button onClick={handleReset}>Yana import qilish</Button>
              <a href="/timetable">
                <Button variant="secondary">Jadvalga o&apos;tish</Button>
              </a>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
