/**
 * Word (.docx) fayllardan dars jadvali jadvallarini o'qish.
 *
 * mammoth kutubxonasi bilan HTML ga aylantirish,
 * keyin <table> lardan ma'lumotlarni ajratib olish.
 */

import mammoth from "mammoth";
import type { ParsedRow } from "./excel-parser";

export interface WordParseResult {
  tables: WordTable[];
  totalRows: number;
  html: string;
}

export interface WordTable {
  index: number;
  rows: ParsedRow[];
  rawRows: string[][];
  headers: string[];
}

// ─── HTML table parser ──────────────────────────────────────────────────────

function parseHtmlTables(html: string): { headers: string[]; rows: string[][] }[] {
  const tables: { headers: string[]; rows: string[][] }[] = [];

  // Simple regex-based table parser (DOM not available in all contexts)
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  let tableMatch;

  while ((tableMatch = tableRegex.exec(html)) !== null) {
    const tableHtml = tableMatch[1];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const allRows: string[][] = [];
    let rowMatch;

    while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
      const rowHtml = rowMatch[1];
      const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
      const cells: string[] = [];
      let cellMatch;

      while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
        // HTML taglarni tozalash
        const text = cellMatch[1]
          .replace(/<[^>]*>/g, "")
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .trim();
        cells.push(text);
      }

      if (cells.length > 0) allRows.push(cells);
    }

    if (allRows.length > 0) {
      tables.push({
        headers: allRows[0],
        rows: allRows,
      });
    }
  }

  return tables;
}

// ─── Day matching ───────────────────────────────────────────────────────────

const DAY_MAP: Record<string, string> = {
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
  return DAY_MAP[text.trim().toLowerCase()] || null;
}

// ─── Column header matching ─────────────────────────────────────────────────

const COLUMN_PATTERNS: [RegExp, keyof ParsedRow][] = [
  [/^(kun|day|hafta)/i, "day"],
  [/^(vaqt|time|soat|pora|juftlik)/i, "time"],
  [/^(guruh|group|sinf)/i, "group"],
  [/^(fan|subject|dars|predmet)/i, "subject"],
  [/^(o.?qituvchi|teacher|ustoz|prepod)/i, "teacher"],
  [/^(xona|room|audi|kabinet)/i, "room"],
];

function matchColumn(header: string): keyof ParsedRow | null {
  const h = header.trim().toLowerCase();
  for (const [pattern, field] of COLUMN_PATTERNS) {
    if (pattern.test(h)) return field;
  }
  return null;
}

// ─── Table interpretation ───────────────────────────────────────────────────

function interpretTable(
  headers: string[],
  rows: string[][]
): ParsedRow[] {
  // Ustun sarlavhalari bilan list format
  const columnMap = new Map<number, keyof ParsedRow>();
  headers.forEach((h, i) => {
    const match = matchColumn(h);
    if (match) columnMap.set(i, match);
  });

  if (columnMap.size >= 2) {
    // List format
    return rows.slice(1).map((row) => {
      const parsed: ParsedRow = { raw: {} };
      row.forEach((cell, i) => {
        const field = columnMap.get(i);
        if (field && field !== "raw") {
          (parsed as unknown as Record<string, string>)[field] = cell.trim();
        }
        parsed.raw[headers[i] || `col_${i}`] = cell;
      });
      return parsed;
    }).filter((row) => Object.values(row.raw).some((v) => v.trim() !== ""));
  }

  // Grid format — 1-qatorda kun nomlari
  const dayColumns = new Map<number, string>();
  headers.forEach((h, i) => {
    if (i === 0) return;
    const day = normalizeDay(h);
    if (day) dayColumns.set(i, day);
  });

  if (dayColumns.size >= 3) {
    const parsedRows: ParsedRow[] = [];
    for (let r = 1; r < rows.length; r++) {
      const timeCell = rows[r][0]?.trim() || "";
      if (!timeCell) continue;

      for (const [col, day] of dayColumns) {
        const cell = rows[r][col]?.trim() || "";
        if (!cell) continue;

        const parts = cell.split(/[—\-\n]+/).map((p) => p.trim()).filter(Boolean);
        parsedRows.push({
          day,
          time: timeCell,
          subject: parts[0] || "",
          teacher: parts[1] || "",
          room: parts[2] || "",
          raw: { day, time: timeCell, cell },
        });
      }
    }
    return parsedRows;
  }

  // Noma'lum format — xom qatorlar sifatida
  return rows.slice(1).map((row) => {
    const raw: Record<string, string> = {};
    row.forEach((cell, i) => {
      raw[headers[i] || `col_${i}`] = cell;
    });
    return { raw };
  });
}

// ─── Main parser ────────────────────────────────────────────────────────────

export async function parseWordFile(buffer: ArrayBuffer): Promise<WordParseResult> {
  const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
  const html = result.value;
  const htmlTables = parseHtmlTables(html);

  const tables: WordTable[] = htmlTables.map((t, index) => {
    const rows = interpretTable(t.headers, t.rows);
    return {
      index,
      rows,
      rawRows: t.rows,
      headers: t.headers,
    };
  });

  const totalRows = tables.reduce((sum, t) => sum + t.rows.length, 0);

  return { tables, totalRows, html };
}
