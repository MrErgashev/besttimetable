"use client";

import { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { parsePastedText } from "@/lib/import/paste-parser";
import {
  ENTITY_CONFIG,
  autoMapColumns,
  convertValue,
} from "@/lib/import/column-mapping";
import { downloadTemplate } from "@/lib/import/template-generator";
import {
  Upload,
  ClipboardPaste,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  ArrowLeft,
  ArrowRight,
  X,
  Download,
} from "lucide-react";
import * as XLSX from "xlsx";

type ImportMode = "paste" | "file";
type Step = "choose" | "paste" | "file-upload" | "mapping" | "preview" | "importing" | "result";

interface BulkUserImportProps {
  onImport: (users: { full_name: string; login: string; password: string; role: string }[]) => Promise<{
    success: number;
    failed: number;
    errors: string[];
  }>;
  onClose: () => void;
}

const config = ENTITY_CONFIG["users"];

export function BulkUserImport({ onImport, onClose }: BulkUserImportProps) {
  const [step, setStep] = useState<Step>("choose");
  const [mode, setMode] = useState<ImportMode>("paste");
  const [role, setRole] = useState("teacher");
  const [defaultPassword, setDefaultPassword] = useState("Default123!");
  const [text, setText] = useState("");
  const [columnMap, setColumnMap] = useState<Record<number, string>>({});
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [delimiter, setDelimiter] = useState<"tab" | "comma" | "semicolon">("tab");
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsed = useMemo(() => parsePastedText(text), [text]);

  // Mapping'dan keyin foydalanuvchilar ro'yxatini tuzish
  const mappedUsers = useMemo(() => {
    const fieldMap = new Map(config.fields.map((f) => [f.key, f]));
    const items: { full_name: string; login: string; password?: string }[] = [];

    for (const row of parsedRows) {
      const item: Record<string, unknown> = {};
      for (const [colIdx, fieldKey] of Object.entries(columnMap)) {
        const field = fieldMap.get(fieldKey);
        if (!field) continue;
        const raw = row[Number(colIdx)] || "";
        item[fieldKey] = convertValue(raw, field);
      }
      if (item.full_name && item.login) {
        items.push({
          full_name: String(item.full_name),
          login: String(item.login),
          password: item.password ? String(item.password) : undefined,
        });
      }
    }
    return items;
  }, [parsedRows, columnMap]);

  function handlePaste() {
    if (parsed.rowCount === 0) return;
    setParsedHeaders(parsed.headers);
    setParsedRows(parsed.rows);
    setDelimiter(parsed.delimiter);
    const autoMap = autoMapColumns(parsed.headers, config.fields);
    setColumnMap(autoMap);
    setStep("mapping");
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError("");

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });

        if (json.length < 2) {
          setFileError("Faylda kamida 2 ta qator bo'lishi kerak (1-qator sarlavha)");
          return;
        }

        const headers = (json[0] || []).map((h) => String(h || "").trim());
        const rows = json.slice(1)
          .filter((row) => row.some((cell) => cell !== undefined && cell !== null && String(cell).trim() !== ""))
          .map((row) => headers.map((_, i) => String(row[i] || "").trim()));

        setParsedHeaders(headers);
        setParsedRows(rows);
        setDelimiter("tab");
        const autoMap = autoMapColumns(headers, config.fields);
        setColumnMap(autoMap);
        setStep("mapping");
      } catch {
        setFileError("Faylni o'qishda xatolik. Excel (.xlsx, .xls) yoki CSV fayldan foydalaning.");
      }
    };
    reader.readAsArrayBuffer(file);
  }

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

  async function handleImport() {
    if (defaultPassword.length < 6) return;

    setStep("importing");

    const usersToImport = mappedUsers.map((u) => ({
      full_name: u.full_name,
      login: u.login,
      password: u.password && u.password.length >= 6 ? u.password : defaultPassword,
      role,
    }));

    const res = await onImport(usersToImport);
    setResult(res);
    setStep("result");
  }

  const mappedFields = new Set(Object.values(columnMap));
  const unmappedRequired = config.fields.filter(
    (f) => f.required && !mappedFields.has(f.key)
  );

  // ─── BOSQICH: Usul tanlash ────────────────────────────────────────
  if (step === "choose") {
    return (
      <div className="space-y-5">
        <p className="text-sm text-[var(--muted)]">
          Ko&apos;plab foydalanuvchilarni bir vaqtda qo&apos;shish usulini tanlang
        </p>

        {/* Rol va parol */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Rol"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { value: "teacher", label: "O'qituvchi" },
              { value: "admin", label: "Admin" },
              { value: "student", label: "Talaba" },
            ]}
          />
          <Input
            label="Standart parol"
            type="text"
            value={defaultPassword}
            onChange={(e) => setDefaultPassword(e.target.value)}
            placeholder="Kamida 6 ta belgi"
          />
        </div>
        {defaultPassword.length > 0 && defaultPassword.length < 6 && (
          <p className="text-xs text-[var(--color-danger)]">
            Parol kamida 6 ta belgidan iborat bo&apos;lishi kerak
          </p>
        )}

        {/* Usullar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => { setMode("paste"); setStep("paste"); }}
            disabled={defaultPassword.length < 6}
            className="flex flex-col items-center gap-3 p-6 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center">
              <ClipboardPaste className="w-6 h-6 text-[var(--color-accent)]" />
            </div>
            <div>
              <div className="font-semibold text-sm">Matn orqali</div>
              <div className="text-xs text-[var(--muted)] mt-1">
                Excel/Sheets dan nusxalab qo&apos;ying
              </div>
            </div>
          </button>

          <button
            onClick={() => { setMode("file"); setStep("file-upload"); }}
            disabled={defaultPassword.length < 6}
            className="flex flex-col items-center gap-3 p-6 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--color-success)]/10 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-[var(--color-success)]" />
            </div>
            <div>
              <div className="font-semibold text-sm">Excel fayl</div>
              <div className="text-xs text-[var(--muted)] mt-1">
                .xlsx, .xls yoki .csv faylni yuklang
              </div>
            </div>
          </button>
        </div>

        {/* Shablon yuklab olish */}
        <div className="flex items-center gap-3 p-3 rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[var(--surface-secondary)]">
          <Download className="w-5 h-5 text-[var(--muted)] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Shablon kerakmi?</p>
            <p className="text-xs text-[var(--muted)]">
              Tayyor Excel shablonni yuklab, to&apos;ldirib, yuklang
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => downloadTemplate("users")}
            className="shrink-0"
          >
            <Download className="w-4 h-4" />
            Shablonni yuklash
          </Button>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>Bekor qilish</Button>
        </div>
      </div>
    );
  }

  // ─── BOSQICH: Matn qo'yish ────────────────────────────────────────
  if (step === "paste") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--muted)]">
          Excel yoki Google Sheets dan foydalanuvchilar ro&apos;yxatini nusxalab (Ctrl+C),
          pastga qo&apos;ying (Ctrl+V). Birinchi qator — ustun nomlari.
        </p>
        <textarea
          className="w-full h-[200px] p-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface-secondary)] text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          placeholder={"To'liq ism\tLogin\tParol\nErgashev Sodiq\tergashev_s\tSodiq2024\nKarimov Ali\tkarimov_a\tAli2024\nRahimova Nargiz\trahimova_n\tNargiz2024"}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {parsed.rowCount > 0 && (
          <p className="text-sm text-[var(--color-success)]">
            {parsed.rowCount} ta qator aniqlandi (ajratuvchi:{" "}
            {parsed.delimiter === "tab" ? "tab" : parsed.delimiter === "comma" ? "vergul" : "nuqtali vergul"})
          </p>
        )}
        <div className="flex justify-between gap-3 pt-2">
          <Button variant="ghost" onClick={() => setStep("choose")}>
            <ArrowLeft className="w-4 h-4" />
            Orqaga
          </Button>
          <Button onClick={handlePaste} disabled={parsed.rowCount === 0}>
            Davom etish
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ─── BOSQICH: Fayl yuklash ────────────────────────────────────────
  if (step === "file-upload") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--muted)]">
          Foydalanuvchilar ro&apos;yxati joylashgan Excel faylni yuklang.
          Birinchi qator — ustun nomlari bo&apos;lishi kerak.
        </p>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-3 p-10 rounded-[var(--radius)] border-2 border-dashed border-[var(--border)] bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
        >
          <Upload className="w-10 h-10 text-[var(--muted)]" />
          <div className="text-center">
            <div className="font-medium text-sm">Fayl tanlash uchun bosing</div>
            <div className="text-xs text-[var(--muted)] mt-1">.xlsx, .xls, .csv</div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileUpload}
          className="hidden"
        />

        {fileError && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-danger)] bg-[var(--color-danger)]/10 px-3 py-2 rounded-[10px]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {fileError}
          </div>
        )}

        <button
          onClick={() => downloadTemplate("users")}
          className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1"
        >
          <Download className="w-3 h-3" />
          Namuna shablonni yuklab olish
        </button>

        <div className="flex justify-between gap-3 pt-2">
          <Button variant="ghost" onClick={() => setStep("choose")}>
            <ArrowLeft className="w-4 h-4" />
            Orqaga
          </Button>
        </div>
      </div>
    );
  }

  // ─── BOSQICH: Ustun moslashtirish ─────────────────────────────────
  if (step === "mapping") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--muted)]">
          Har bir ustunni kerakli maydon bilan moslang
        </p>

        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {parsedHeaders.map((header, idx) => (
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
          <div className="flex items-center gap-2 text-sm text-[var(--color-danger)] bg-[var(--color-danger)]/10 px-3 py-2 rounded-[10px]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Majburiy maydonlar moslanmagan: {unmappedRequired.map((f) => f.label).join(", ")}
          </div>
        )}

        {/* Ma'lumot ko'rib chiqish */}
        <div className="overflow-x-auto">
          <p className="text-sm text-[var(--muted)] mb-2">
            Ko&apos;rib chiqish ({Math.min(parsedRows.length, 5)}/{parsedRows.length} qator)
          </p>
          <table className="text-xs w-full border-collapse">
            <thead>
              <tr>
                {parsedHeaders.map((h, i) => (
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
              {parsedRows.slice(0, 5).map((row, ri) => (
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
          <Button variant="ghost" onClick={() => setStep(mode === "paste" ? "paste" : "file-upload")}>
            <ArrowLeft className="w-4 h-4" />
            Orqaga
          </Button>
          <Button onClick={() => setStep("preview")} disabled={unmappedRequired.length > 0}>
            Ko&apos;rib chiqish
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ─── BOSQICH: Yakuniy ko'rib chiqish ──────────────────────────────
  if (step === "preview") {
    const ROLE_LABELS: Record<string, string> = {
      teacher: "O'qituvchi",
      admin: "Admin",
      student: "Talaba",
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-[10px] bg-[var(--color-accent)]/10">
          <div className="text-sm">
            <span className="font-semibold">{mappedUsers.length}</span> ta foydalanuvchi import qilinadi
            &middot; Rol: <span className="font-semibold">{ROLE_LABELS[role] || role}</span>
            &middot; Parol: <span className="font-mono text-xs">{defaultPassword}</span>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
          <table className="text-sm w-full border-collapse">
            <thead className="sticky top-0">
              <tr>
                <th className="border border-[var(--border)] px-3 py-2 text-left bg-[var(--surface-secondary)]">#</th>
                <th className="border border-[var(--border)] px-3 py-2 text-left bg-[var(--surface-secondary)]">To&apos;liq ism</th>
                <th className="border border-[var(--border)] px-3 py-2 text-left bg-[var(--surface-secondary)]">Login</th>
                <th className="border border-[var(--border)] px-3 py-2 text-left bg-[var(--surface-secondary)]">Parol</th>
              </tr>
            </thead>
            <tbody>
              {mappedUsers.map((u, i) => (
                <tr key={i}>
                  <td className="border border-[var(--border)] px-3 py-1.5 text-[var(--muted)]">{i + 1}</td>
                  <td className="border border-[var(--border)] px-3 py-1.5">{u.full_name}</td>
                  <td className="border border-[var(--border)] px-3 py-1.5 font-mono text-xs">{u.login}</td>
                  <td className="border border-[var(--border)] px-3 py-1.5 font-mono text-xs text-[var(--muted)]">{u.password || defaultPassword}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between gap-3 pt-2">
          <Button variant="ghost" onClick={() => setStep("mapping")}>
            <ArrowLeft className="w-4 h-4" />
            Orqaga
          </Button>
          <Button onClick={handleImport} disabled={mappedUsers.length === 0}>
            {mappedUsers.length} ta import qilish
          </Button>
        </div>
      </div>
    );
  }

  // ─── BOSQICH: Import jarayoni ─────────────────────────────────────
  if (step === "importing") {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <div className="w-12 h-12 rounded-full border-4 border-[var(--color-accent)]/30 border-t-[var(--color-accent)] animate-spin" />
        <p className="text-sm text-[var(--muted)]">
          Foydalanuvchilar yaratilmoqda... ({mappedUsers.length} ta)
        </p>
        <p className="text-xs text-[var(--muted)]">
          Iltimos, kutib turing. Bu biroz vaqt olishi mumkin.
        </p>
      </div>
    );
  }

  // ─── BOSQICH: Natija ──────────────────────────────────────────────
  if (step === "result" && result) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-3 py-4">
          {result.failed === 0 ? (
            <div className="w-16 h-16 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-[var(--color-success)]" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-[var(--color-warning)]/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-[var(--color-warning)]" />
            </div>
          )}

          <div className="text-center">
            <p className="text-lg font-semibold">
              {result.success} / {result.success + result.failed} ta muvaffaqiyatli
            </p>
            {result.failed > 0 && (
              <p className="text-sm text-[var(--color-danger)] mt-1">
                {result.failed} ta xatolik bilan yaratilmadi
              </p>
            )}
          </div>
        </div>

        {result.errors.length > 0 && (
          <div className="max-h-[200px] overflow-y-auto space-y-1">
            {result.errors.map((err, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-xs text-[var(--color-danger)] bg-[var(--color-danger)]/5 px-3 py-2 rounded-[8px]"
              >
                <X className="w-3 h-3 shrink-0 mt-0.5" />
                <span>{err}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center pt-2">
          <Button onClick={onClose}>Yopish</Button>
        </div>
      </div>
    );
  }

  return null;
}
