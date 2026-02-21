/**
 * Excel (.xlsx) fayllardan dars jadvali ma'lumotlarini o'qish.
 *
 * Kutilayotgan format:
 * - 1-qator: ustun sarlavhalari (Kun, Vaqt, Guruh, Fan, O'qituvchi, Xona)
 * - Keyingi qatorlar: ma'lumotlar
 *
 * Yoki jadval formatida:
 * - 1-qator: bo'sh, Dushanba, Seshanba, ...
 * - 1-ustun: vaqt slotlari (08:30-10:00, ...)
 * - Hujayralar: "Fan — O'qituvchi — Xona"
 */

import * as XLSX from "xlsx";

export interface ParsedRow {
  day?: string;
  time?: string;
  group?: string;
  subject?: string;
  teacher?: string;
  room?: string;
  raw: Record<string, string>;
}

export interface ParsedSheet {
  name: string;
  rows: ParsedRow[];
  headers: string[];
  rawData: string[][];
}

export interface ExcelParseResult {
  sheets: ParsedSheet[];
  format: "list" | "grid" | "unknown";
  totalRows: number;
}

// ─── Column header matching ─────────────────────────────────────────────────

const DAY_PATTERNS = /^(kun|day|hafta)/i;
const TIME_PATTERNS = /^(vaqt|time|soat|pora|juftlik)/i;
const GROUP_PATTERNS = /^(guruh|group|sinf)/i;
const SUBJECT_PATTERNS = /^(fan|subject|dars|predmet)/i;
const TEACHER_PATTERNS = /^(o.?qituvchi|teacher|ustoz|prepod)/i;
const ROOM_PATTERNS = /^(xona|room|audi|kabinet)/i;

function matchColumn(header: string): keyof ParsedRow | null {
  const h = header.trim().toLowerCase();
  if (DAY_PATTERNS.test(h)) return "day";
  if (TIME_PATTERNS.test(h)) return "time";
  if (GROUP_PATTERNS.test(h)) return "group";
  if (SUBJECT_PATTERNS.test(h)) return "subject";
  if (TEACHER_PATTERNS.test(h)) return "teacher";
  if (ROOM_PATTERNS.test(h)) return "room";
  return null;
}

// ─── List format parser ─────────────────────────────────────────────────────

function parseListFormat(data: string[][], headers: string[]): ParsedRow[] {
  const columnMap = new Map<number, keyof ParsedRow>();
  headers.forEach((h, i) => {
    const match = matchColumn(h);
    if (match) columnMap.set(i, match);
  });

  if (columnMap.size < 2) return [];

  return data.slice(1).map((row) => {
    const parsed: ParsedRow = { raw: {} };
    row.forEach((cell, i) => {
      const field = columnMap.get(i);
      if (field && field !== "raw") {
        (parsed as unknown as Record<string, string>)[field] = cell?.toString().trim() || "";
      }
      parsed.raw[headers[i] || `col_${i}`] = cell?.toString() || "";
    });
    return parsed;
  }).filter((row) => {
    // Bo'sh qatorlarni o'tkazib yuborish
    return Object.values(row.raw).some((v) => v.trim() !== "");
  });
}

// ─── Grid format parser ─────────────────────────────────────────────────────

const DAY_NAMES: Record<string, string> = {
  dushanba: "dushanba",
  seshanba: "seshanba",
  chorshanba: "chorshanba",
  payshanba: "payshanba",
  juma: "juma",
  monday: "dushanba",
  tuesday: "seshanba",
  wednesday: "chorshanba",
  thursday: "payshanba",
  friday: "juma",
  du: "dushanba",
  se: "seshanba",
  ch: "chorshanba",
  pa: "payshanba",
  ju: "juma",
};

function normalizeDay(text: string): string | null {
  const lower = text.trim().toLowerCase();
  return DAY_NAMES[lower] || null;
}

function parseGridFormat(data: string[][]): ParsedRow[] {
  if (data.length < 2 || data[0].length < 2) return [];

  // 1-qatordagi kun nomlari
  const dayColumns = new Map<number, string>();
  data[0].forEach((cell, i) => {
    if (i === 0) return;
    const day = normalizeDay(cell?.toString() || "");
    if (day) dayColumns.set(i, day);
  });

  if (dayColumns.size === 0) return [];

  const rows: ParsedRow[] = [];

  for (let r = 1; r < data.length; r++) {
    const timeCell = data[r][0]?.toString().trim() || "";
    if (!timeCell) continue;

    for (const [col, day] of dayColumns) {
      const cell = data[r][col]?.toString().trim() || "";
      if (!cell) continue;

      // Hujayrani ajratish — "Fan — O'qituvchi — Xona" yoki "Fan\nO'qituvchi\nXona"
      const parts = cell.split(/[—\-\n]+/).map((p) => p.trim()).filter(Boolean);

      rows.push({
        day,
        time: timeCell,
        subject: parts[0] || "",
        teacher: parts[1] || "",
        room: parts[2] || "",
        raw: { day, time: timeCell, cell },
      });
    }
  }

  return rows;
}

// ─── Detect format ──────────────────────────────────────────────────────────

function detectFormat(headers: string[], data: string[][]): "list" | "grid" | "unknown" {
  // List formatmi? Ustun sarlavhalari bor
  const matchedColumns = headers.filter((h) => matchColumn(h) !== null);
  if (matchedColumns.length >= 3) return "list";

  // Grid formatmi? 1-qatorda kun nomlari bor
  if (data.length > 0) {
    const dayCount = data[0].filter((cell) => normalizeDay(cell?.toString() || "")).length;
    if (dayCount >= 3) return "grid";
  }

  return "unknown";
}

// ─── Main parser ────────────────────────────────────────────────────────────

export function parseExcelFile(buffer: ArrayBuffer): ExcelParseResult {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheets: ParsedSheet[] = [];
  let detectedFormat: "list" | "grid" | "unknown" = "unknown";
  let totalRows = 0;

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rawData: string[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    });

    if (rawData.length === 0) continue;

    const headers = rawData[0].map((h) => h?.toString() || "");
    const format = detectFormat(headers, rawData);

    if (format !== "unknown") detectedFormat = format;

    let rows: ParsedRow[];
    if (format === "list") {
      rows = parseListFormat(rawData, headers);
    } else if (format === "grid") {
      rows = parseGridFormat(rawData);
    } else {
      // Ikkala formatni sinash
      rows = parseListFormat(rawData, headers);
      if (rows.length === 0) {
        rows = parseGridFormat(rawData);
      }
    }

    totalRows += rows.length;

    sheets.push({
      name: sheetName,
      rows,
      headers,
      rawData: rawData.map((row) => row.map((cell) => cell?.toString() || "")),
    });
  }

  return { sheets, format: detectedFormat, totalRows };
}
