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
import { GlassModal } from "@/components/ui/GlassModal";
import { parseExcelFile } from "@/lib/import/excel-parser";
import { parseWordFile } from "@/lib/import/word-parser";
import { mapParsedRows, type MappingResult } from "@/lib/import/mapper";
import type { ParsedRow } from "@/lib/import/excel-parser";

type Step = "upload" | "preview" | "mapping" | "result";

export default function ImportPage() {
  const hydrated = useHydration();
  const { teachers } = useTeacherStore();
  const { groups } = useGroupStore();
  const { subjects } = useSubjectStore();
  const { rooms } = useRoomStore();
  const { placeEntry } = useTimetableStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState<"xlsx" | "docx" | "">("");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [formatInfo, setFormatInfo] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [mappingResult, setMappingResult] = useState<MappingResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [error, setError] = useState("");

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError("");
      setFileName(file.name);

      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext !== "xlsx" && ext !== "docx") {
        setError("Faqat .xlsx va .docx fayllar qo'llab-quvvatlanadi");
        return;
      }

      setFileType(ext as "xlsx" | "docx");

      try {
        const buffer = await file.arrayBuffer();

        if (ext === "xlsx") {
          const result = parseExcelFile(buffer);
          const allRows = result.sheets.flatMap((s) => s.rows);
          setParsedRows(allRows);
          setFormatInfo(
            `${result.sheets.length} ta varoq, ${result.format} format, ${result.totalRows} ta qator`
          );
        } else {
          const result = await parseWordFile(buffer);
          const allRows = result.tables.flatMap((t) => t.rows);
          setParsedRows(allRows);
          setFormatInfo(
            `${result.tables.length} ta jadval, ${result.totalRows} ta qator`
          );
        }

        setStep("preview");
      } catch (err) {
        setError(`Faylni o'qishda xatolik: ${err instanceof Error ? err.message : "noma'lum xatolik"}`);
      }
    },
    []
  );

  const handleMapping = useCallback(() => {
    const result = mapParsedRows(parsedRows, {
      teachers,
      groups,
      subjects,
      rooms,
      defaultGroupId: selectedGroupId || undefined,
    });
    setMappingResult(result);
    setStep("mapping");
  }, [parsedRows, teachers, groups, subjects, rooms, selectedGroupId]);

  const handleImport = useCallback(() => {
    if (!mappingResult) return;
    setImporting(true);
    let count = 0;

    for (const entry of mappingResult.entries) {
      placeEntry(entry);
      count++;
    }

    setImportedCount(count);
    setImporting(false);
    setStep("result");
  }, [mappingResult, placeEntry]);

  const handleReset = useCallback(() => {
    setStep("upload");
    setFileName("");
    setFileType("");
    setParsedRows([]);
    setFormatInfo("");
    setSelectedGroupId("");
    setMappingResult(null);
    setImportedCount(0);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  if (!hydrated) return <Spinner className="py-20" />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Import</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Excel (.xlsx) yoki Word (.docx) fayldan dars jadvalini yuklash
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
                  ? "bg-indigo-500/10 text-indigo-500 font-semibold"
                  : "text-[var(--muted)]"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-current/10 flex items-center justify-center text-[10px] font-bold">
                {i + 1}
              </span>
              {s === "upload" && "Yuklash"}
              {s === "preview" && "Ko'rish"}
              {s === "mapping" && "Moslashtirish"}
              {s === "result" && "Natija"}
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

      {/* 1-bosqich: Fayl yuklash */}
      {step === "upload" && (
        <GlassCard>
          <div
            className="border-2 border-dashed border-[var(--border)] rounded-xl p-12 text-center cursor-pointer hover:border-indigo-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="text-4xl mb-3 opacity-30">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
            </div>
            <p className="text-sm text-[var(--muted)]">
              Fayl tanlash uchun bosing yoki shu yerga tashlang
            </p>
            <p className="text-xs text-[var(--muted-light)] mt-1">
              .xlsx va .docx fayllar qo&apos;llab-quvvatlanadi
            </p>
          </div>
        </GlassCard>
      )}

      {/* 2-bosqich: Preview */}
      {step === "preview" && (
        <GlassCard>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{fileName}</h2>
                <p className="text-xs text-[var(--muted)]">{formatInfo}</p>
              </div>
              <Badge variant={fileType === "xlsx" ? "success" : "accent"}>
                {fileType?.toUpperCase()}
              </Badge>
            </div>

            {/* O'qilgan ma'lumotlar preview */}
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
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
                  {parsedRows.slice(0, 50).map((row, i) => (
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
              {parsedRows.length > 50 && (
                <p className="text-xs text-[var(--muted)] text-center py-2">
                  ...va yana {parsedRows.length - 50} ta qator
                </p>
              )}
            </div>

            {/* Guruh tanlash (agar faylda guruh ko'rsatilmagan bo'lsa) */}
            {parsedRows.some((r) => !r.group) && (
              <Select
                label="Standart guruh (faylda ko'rsatilmagan qatorlar uchun)"
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                options={groups.map((g) => ({ value: g.id, label: g.name }))}
                placeholder="Guruh tanlang"
              />
            )}

            <div className="flex gap-3">
              <Button onClick={handleMapping} disabled={parsedRows.length === 0}>
                Moslashtirish
              </Button>
              <Button variant="ghost" onClick={handleReset}>
                Bekor
              </Button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* 3-bosqich: Mapping natijasi */}
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
                <div className="text-2xl font-bold text-green-500">
                  {mappingResult.stats.mapped}
                </div>
                <div className="text-xs text-[var(--muted)]">Moslashtirildi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-500">
                  {mappingResult.stats.unmapped}
                </div>
                <div className="text-xs text-[var(--muted)]">Moslashtirilmadi</div>
              </div>
            </div>

            {/* Moslashtirilmagan qatorlar */}
            {mappingResult.unmapped.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-amber-500 mb-2">
                  Moslashtirilmagan qatorlar:
                </h3>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {mappingResult.unmapped.slice(0, 20).map((u, i) => (
                    <div key={i} className="text-xs text-[var(--muted)] flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1" />
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

      {/* 4-bosqich: Natija */}
      {step === "result" && (
        <GlassCard>
          <div className="text-center py-8 space-y-4">
            <div className="text-4xl">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-green-500">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">Import yakunlandi!</h2>
              <p className="text-sm text-[var(--muted)] mt-1">
                {importedCount} ta dars muvaffaqiyatli import qilindi
              </p>
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
