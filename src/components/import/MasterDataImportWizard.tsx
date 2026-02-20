"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import {
  type EntityType,
  ENTITY_CONFIG,
  autoMapColumns,
} from "@/lib/import/column-mapping";
import {
  parseGenericExcel,
  parseCSVBuffer,
  type GenericParsedSheet,
} from "@/lib/import/master-data-parser";
import { validateMasterData } from "@/lib/import/master-data-validator";
import { downloadTemplate } from "@/lib/import/template-generator";

// ─── Types ───────────────────────────────────────────────────────────────────

type WizardStep = "upload" | "mapping" | "validate" | "result";

interface MasterDataImportWizardProps {
  entityType: EntityType;
  existingItems: Record<string, unknown>[];
  onImport: (items: Record<string, unknown>[]) => number;
  onClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MasterDataImportWizard({
  entityType,
  existingItems,
  onImport,
  onClose,
}: MasterDataImportWizardProps) {
  const config = ENTITY_CONFIG[entityType];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<WizardStep>("upload");
  const [sheet, setSheet] = useState<GenericParsedSheet | null>(null);
  const [sheets, setSheets] = useState<GenericParsedSheet[]>([]);
  const [selectedSheetIdx, setSelectedSheetIdx] = useState(0);
  const [columnMap, setColumnMap] = useState<Record<number, string>>({});
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [validationResult, setValidationResult] = useState<ReturnType<
    typeof validateMasterData
  > | null>(null);

  // ─── File handling ───────────────────────────────────────────────────────

  const handleFile = useCallback(
    (file: File) => {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        const isCSV =
          file.name.endsWith(".csv") || file.name.endsWith(".txt");

        let parsedSheets: GenericParsedSheet[];
        if (isCSV) {
          parsedSheets = [parseCSVBuffer(buffer)];
        } else {
          parsedSheets = parseGenericExcel(buffer);
        }

        if (parsedSheets.length === 0 || parsedSheets[0].totalRows === 0) {
          return; // empty file
        }

        setSheets(parsedSheets);
        setSelectedSheetIdx(0);
        const activeSheet = parsedSheets[0];
        setSheet(activeSheet);

        // Auto-map columns
        const autoMap = autoMapColumns(activeSheet.headers, config.fields);
        setColumnMap(autoMap);
        setStep("mapping");
      };
      reader.readAsArrayBuffer(file);
    },
    [config.fields]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  // ─── Sheet selection ─────────────────────────────────────────────────────

  function handleSheetChange(idx: number) {
    setSelectedSheetIdx(idx);
    const activeSheet = sheets[idx];
    setSheet(activeSheet);
    const autoMap = autoMapColumns(activeSheet.headers, config.fields);
    setColumnMap(autoMap);
  }

  // ─── Column mapping ──────────────────────────────────────────────────────

  function handleColumnChange(colIndex: number, fieldKey: string) {
    setColumnMap((prev) => {
      const next = { ...prev };
      if (fieldKey === "") {
        delete next[colIndex];
      } else {
        for (const k of Object.keys(next)) {
          if (next[Number(k)] === fieldKey) delete next[Number(k)];
        }
        next[colIndex] = fieldKey;
      }
      return next;
    });
  }

  // ─── Validation ──────────────────────────────────────────────────────────

  function handleValidate() {
    if (!sheet) return;
    const result = validateMasterData(
      sheet.rows,
      sheet.headers,
      columnMap,
      config.fields,
      existingItems,
      config.duplicateCheckKeys
    );
    setValidationResult(result);
    setStep("validate");
  }

  // ─── Import ──────────────────────────────────────────────────────────────

  function handleImport() {
    if (!validationResult) return;

    // Apply entity-specific transformations
    const items = validationResult.validItems.map((item) => {
      // Teachers: generate short_name
      if (entityType === "teachers" && item.first_name && item.last_name) {
        item.short_name =
          item.short_name ||
          `${item.last_name} ${String(item.first_name).charAt(0)}.`;
      }
      // Subjects: generate short_name
      if (entityType === "subjects" && item.name && !item.short_name) {
        item.short_name = String(item.name).slice(0, 3);
      }
      // Groups: set department_id
      if (entityType === "groups" && !item.department_id) {
        item.department_id = "default";
      }
      return item;
    });

    const count = onImport(items);
    setImportedCount(count);
    setStep("result");
  }

  // ─── Check required mapping ──────────────────────────────────────────────

  const mappedFields = new Set(Object.values(columnMap));
  const unmappedRequired = config.fields.filter(
    (f) => f.required && !mappedFields.has(f.key)
  );

  // ─── Step indicators ─────────────────────────────────────────────────────

  const steps: { key: WizardStep; label: string }[] = [
    { key: "upload", label: "Fayl yuklash" },
    { key: "mapping", label: "Ustun moslash" },
    { key: "validate", label: "Tekshirish" },
    { key: "result", label: "Natija" },
  ];
  const currentStepIdx = steps.findIndex((s) => s.key === step);

  return (
    <div className="space-y-5">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                i <= currentStepIdx
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-[var(--surface-secondary)] text-[var(--muted)]"
              }`}
            >
              {i < currentStepIdx ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`text-xs hidden sm:inline ${
                i <= currentStepIdx ? "text-[var(--foreground)]" : "text-[var(--muted)]"
              }`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`w-6 h-0.5 ${
                  i < currentStepIdx ? "bg-[var(--color-accent)]" : "bg-[var(--border)]"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* ─── Step: Upload ─────────────────────────────────────────────────── */}
      {step === "upload" && (
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-[16px] p-8 text-center transition-colors cursor-pointer ${
              isDragging
                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5"
                : "border-[var(--border)] hover:border-[var(--color-accent)]/50"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Faylni bu yerga tashlang yoki bosing</p>
                <p className="text-sm text-[var(--muted)] mt-1">
                  .xlsx, .csv fayllar qo&apos;llab-quvvatlanadi
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,.txt"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => downloadTemplate(entityType)}
            >
              Shablon yuklab olish
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Bekor
            </Button>
          </div>
        </div>
      )}

      {/* ─── Step: Mapping ────────────────────────────────────────────────── */}
      {step === "mapping" && sheet && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--muted)]">
              <span className="font-medium text-[var(--foreground)]">{fileName}</span>
              {" — "}
              {sheet.totalRows} ta qator
            </p>
            {sheets.length > 1 && (
              <Select
                value={selectedSheetIdx.toString()}
                onChange={(e) => handleSheetChange(Number(e.target.value))}
                options={sheets.map((s, i) => ({
                  value: i.toString(),
                  label: s.name,
                }))}
              />
            )}
          </div>

          <p className="text-sm text-[var(--muted)]">
            Har bir ustunni kerakli maydon bilan moslang
          </p>

          <div className="space-y-2 max-h-[250px] overflow-y-auto">
            {sheet.headers.map((header, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-2 rounded-[10px] bg-[var(--surface-secondary)]"
              >
                <span className="text-sm font-medium min-w-[120px] truncate">
                  {header}
                </span>
                <span className="text-[var(--muted)]">&rarr;</span>
                <Select
                  value={columnMap[idx] || ""}
                  onChange={(e) => handleColumnChange(idx, e.target.value)}
                  options={[
                    { value: "", label: "— O'tkazish —" },
                    ...config.fields.map((f) => ({
                      value: f.key,
                      label: `${f.label}${f.required ? " *" : ""}`,
                    })),
                  ]}
                />
              </div>
            ))}
          </div>

          {unmappedRequired.length > 0 && (
            <div className="text-sm text-[var(--color-danger)] bg-[var(--color-danger)]/10 px-3 py-2 rounded-[10px]">
              Majburiy maydonlar moslanmagan:{" "}
              {unmappedRequired.map((f) => f.label).join(", ")}
            </div>
          )}

          {/* Preview */}
          <div className="overflow-x-auto">
            <p className="text-sm text-[var(--muted)] mb-2">
              Ko&apos;rib chiqish (birinchi 3 qator)
            </p>
            <table className="text-xs w-full border-collapse">
              <thead>
                <tr>
                  {sheet.headers.map((h, i) => (
                    <th
                      key={i}
                      className="border border-[var(--border)] px-2 py-1 text-left bg-[var(--surface-secondary)]"
                    >
                      {columnMap[i]
                        ? config.fields.find((f) => f.key === columnMap[i])?.label || h
                        : <span className="text-[var(--muted)] line-through">{h}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sheet.rows.slice(0, 3).map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className={`border border-[var(--border)] px-2 py-1 ${
                          columnMap[ci] ? "" : "text-[var(--muted)] opacity-50"
                        }`}
                      >
                        {cell || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between gap-3 pt-2">
            <Button variant="ghost" onClick={() => setStep("upload")}>
              Orqaga
            </Button>
            <Button
              onClick={handleValidate}
              disabled={unmappedRequired.length > 0}
            >
              Tekshirish
            </Button>
          </div>
        </div>
      )}

      {/* ─── Step: Validate ───────────────────────────────────────────────── */}
      {step === "validate" && validationResult && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Jami" value={validationResult.stats.total} />
            <StatCard
              label="To'g'ri"
              value={validationResult.stats.valid}
              color="success"
            />
            <StatCard
              label="Xatolik"
              value={validationResult.stats.errors}
              color="danger"
            />
            <StatCard
              label="Dublikat"
              value={validationResult.stats.duplicates}
              color="warning"
            />
          </div>

          {/* Errors list */}
          {validationResult.errors.length > 0 && (
            <div className="max-h-[200px] overflow-y-auto space-y-1">
              {validationResult.errors.slice(0, 20).map((err, i) => (
                <div
                  key={i}
                  className="text-xs text-[var(--color-danger)] bg-[var(--color-danger)]/5 px-3 py-1.5 rounded-[8px]"
                >
                  Qator {err.rowIndex + 1}: {err.message}
                </div>
              ))}
              {validationResult.errors.length > 20 && (
                <p className="text-xs text-[var(--muted)] px-3">
                  ... va yana {validationResult.errors.length - 20} ta xatolik
                </p>
              )}
            </div>
          )}

          {/* Valid items preview */}
          {validationResult.validItems.length > 0 && (
            <div className="overflow-x-auto">
              <p className="text-sm text-[var(--muted)] mb-2">
                Import qilinadigan ma&apos;lumotlar (birinchi 5 ta)
              </p>
              <table className="text-xs w-full border-collapse">
                <thead>
                  <tr>
                    {config.fields
                      .filter((f) => mappedFields.has(f.key) || f.required)
                      .map((f) => (
                        <th
                          key={f.key}
                          className="border border-[var(--border)] px-2 py-1 text-left bg-[var(--surface-secondary)]"
                        >
                          {f.label}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {validationResult.validItems.slice(0, 5).map((item, ri) => (
                    <tr key={ri}>
                      {config.fields
                        .filter((f) => mappedFields.has(f.key) || f.required)
                        .map((f) => (
                          <td
                            key={f.key}
                            className="border border-[var(--border)] px-2 py-1"
                          >
                            {String(item[f.key] ?? "—")}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-between gap-3 pt-2">
            <Button variant="ghost" onClick={() => setStep("mapping")}>
              Orqaga
            </Button>
            <Button
              onClick={handleImport}
              disabled={validationResult.validItems.length === 0}
            >
              {validationResult.validItems.length} ta import qilish
            </Button>
          </div>
        </div>
      )}

      {/* ─── Step: Result ─────────────────────────────────────────────────── */}
      {step === "result" && (
        <div className="space-y-4 text-center py-6">
          <div className="w-16 h-16 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-[var(--color-success)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-lg font-semibold">
            {importedCount} ta {config.singularLabel} muvaffaqiyatli import qilindi!
          </p>
          <Button onClick={onClose}>Yopish</Button>
        </div>
      )}
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: "success" | "danger" | "warning";
}) {
  const colorClass = color
    ? `text-[var(--color-${color})]`
    : "text-[var(--foreground)]";

  return (
    <div className="p-3 rounded-[10px] bg-[var(--surface-secondary)] text-center">
      <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
      <p className="text-xs text-[var(--muted)]">{label}</p>
    </div>
  );
}
