"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { parsePastedText } from "@/lib/import/paste-parser";
import {
  type FieldMapping,
  type EntityType,
  ENTITY_CONFIG,
  autoMapColumns,
  convertValue,
} from "@/lib/import/column-mapping";

interface PasteBulkEntryProps {
  entityType: EntityType;
  onImport: (items: Record<string, unknown>[]) => number;
  onClose: () => void;
}

export function PasteBulkEntry({
  entityType,
  onImport,
  onClose,
}: PasteBulkEntryProps) {
  const config = ENTITY_CONFIG[entityType];
  const [text, setText] = useState("");
  const [step, setStep] = useState<"paste" | "mapping" | "result">("paste");
  const [columnMap, setColumnMap] = useState<Record<number, string>>({});
  const [importedCount, setImportedCount] = useState(0);

  const parsed = useMemo(() => parsePastedText(text), [text]);

  function handleParse() {
    if (parsed.rowCount === 0) return;
    const autoMap = autoMapColumns(parsed.headers, config.fields);
    setColumnMap(autoMap);
    setStep("mapping");
  }

  function handleColumnChange(colIndex: number, fieldKey: string) {
    setColumnMap((prev) => {
      const next = { ...prev };
      if (fieldKey === "") {
        delete next[colIndex];
      } else {
        // Remove field from other columns
        for (const k of Object.keys(next)) {
          if (next[Number(k)] === fieldKey) delete next[Number(k)];
        }
        next[colIndex] = fieldKey;
      }
      return next;
    });
  }

  function handleImport() {
    const fieldMap = new Map<string, FieldMapping>();
    for (const f of config.fields) fieldMap.set(f.key, f);

    const items: Record<string, unknown>[] = [];
    const requiredKeys = config.fields
      .filter((f) => f.required)
      .map((f) => f.key);

    for (const row of parsed.rows) {
      const item: Record<string, unknown> = {};

      // Apply mapped values
      for (const [colIdx, fieldKey] of Object.entries(columnMap)) {
        const field = fieldMap.get(fieldKey);
        if (!field) continue;
        const raw = row[Number(colIdx)] || "";
        item[fieldKey] = convertValue(raw, field);
      }

      // Apply defaults for unmapped fields
      for (const field of config.fields) {
        if (item[field.key] === undefined && field.defaultValue !== undefined) {
          item[field.key] = field.defaultValue;
        }
      }

      // Generate short_name for teachers
      if (entityType === "teachers" && item.first_name && item.last_name) {
        item.short_name =
          item.short_name ||
          `${item.last_name} ${String(item.first_name).charAt(0)}.`;
      }

      // Generate short_name for subjects
      if (entityType === "subjects" && item.name && !item.short_name) {
        item.short_name = String(item.name).slice(0, 3);
      }

      // Set default department_id for groups
      if (entityType === "groups" && !item.department_id) {
        item.department_id = "default";
      }

      // Check required fields
      const hasRequired = requiredKeys.every(
        (k) => item[k] !== undefined && item[k] !== ""
      );
      if (hasRequired) items.push(item);
    }

    const count = onImport(items);
    setImportedCount(count);
    setStep("result");
  }

  const mappedFields = new Set(Object.values(columnMap));
  const unmappedRequired = config.fields.filter(
    (f) => f.required && !mappedFields.has(f.key)
  );

  // Helper to build placeholder text
  const placeholder = config.fields
    .map((f) => f.label)
    .join("\t") + "\n" +
    (entityType === "teachers"
      ? "Muhammadsodiq\tErgashev\temail@example.com\t+998901234567\t18"
      : entityType === "groups"
        ? "MT-21\t2\tKunduzgi\t30"
        : entityType === "subjects"
          ? "Matematika\tMat\tYo'q"
          : "305-xona\tA bino\t30\tOddiy xona\t3");

  if (step === "result") {
    return (
      <div className="space-y-4 text-center py-6">
        <div className="w-16 h-16 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-lg font-semibold">
          {importedCount} ta {config.singularLabel} qo&apos;shildi!
        </p>
        <Button onClick={onClose}>Yopish</Button>
      </div>
    );
  }

  if (step === "mapping") {
    return (
      <div className="space-y-4">
        {/* Column mapping */}
        <p className="text-sm text-[var(--muted)]">
          Har bir ustunni kerakli maydon bilan moslang
        </p>

        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {parsed.headers.map((header, idx) => (
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
            Ko&apos;rib chiqish ({Math.min(parsed.rowCount, 5)}/{parsed.rowCount} qator)
          </p>
          <table className="text-xs w-full border-collapse">
            <thead>
              <tr>
                {parsed.headers.map((h, i) => (
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
              {parsed.rows.slice(0, 5).map((row, ri) => (
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
          <Button variant="ghost" onClick={() => setStep("paste")}>
            Orqaga
          </Button>
          <Button onClick={handleImport} disabled={unmappedRequired.length > 0}>
            {parsed.rowCount} ta import qilish
          </Button>
        </div>
      </div>
    );
  }

  // Paste step
  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--muted)]">
        Excel yoki Google Sheets dan ma&apos;lumotlarni nusxalab (Ctrl+C), pastga
        qo&apos;ying (Ctrl+V). Birinchi qator — ustun nomlari bo&apos;lishi kerak.
      </p>
      <textarea
        className="w-full h-[200px] p-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface-secondary)] text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {parsed.rowCount > 0 && (
        <p className="text-sm text-[var(--color-success)]">
          {parsed.rowCount} ta qator aniqlandi (ajratuvchi:{" "}
          {parsed.delimiter === "tab"
            ? "tab"
            : parsed.delimiter === "comma"
              ? "vergul"
              : "nuqtali vergul"}
          )
        </p>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" onClick={onClose}>
          Bekor
        </Button>
        <Button onClick={handleParse} disabled={parsed.rowCount === 0}>
          Davom etish
        </Button>
      </div>
    </div>
  );
}
