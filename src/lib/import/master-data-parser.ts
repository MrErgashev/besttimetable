import * as XLSX from "xlsx";

// ─── Generic Excel/CSV Parser for Master Data ───────────────────────────────

export interface GenericParsedSheet {
  name: string;
  headers: string[];
  rows: string[][];
  totalRows: number;
}

export function parseGenericExcel(buffer: ArrayBuffer): GenericParsedSheet[] {
  const wb = XLSX.read(buffer, { type: "array" });
  const sheets: GenericParsedSheet[] = [];

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;

    const raw: string[][] = XLSX.utils.sheet_to_json(ws, {
      header: 1,
      defval: "",
      raw: false,
    });

    if (raw.length < 2) continue; // need at least header + 1 data row

    const headers = raw[0].map((h) => String(h).trim());
    const rows = raw
      .slice(1)
      .filter((row) => row.some((cell) => String(cell).trim() !== ""))
      .map((row) => row.map((cell) => String(cell).trim()));

    sheets.push({
      name: sheetName,
      headers,
      rows,
      totalRows: rows.length,
    });
  }

  return sheets;
}

export function parseCSVBuffer(buffer: ArrayBuffer): GenericParsedSheet {
  const text = new TextDecoder("utf-8").decode(buffer);
  return parseCSVText(text);
}

export function parseCSVText(text: string): GenericParsedSheet {
  const lines = text.trim().split("\n").filter((l) => l.trim());
  if (lines.length < 2) {
    return { name: "CSV", headers: [], rows: [], totalRows: 0 };
  }

  // Detect delimiter
  const firstLine = lines[0];
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  const delimiter =
    tabCount >= commaCount && tabCount >= semiCount
      ? "\t"
      : semiCount >= commaCount
        ? ";"
        : ",";

  const headers = lines[0].split(delimiter).map((h) => h.trim());
  const rows = lines
    .slice(1)
    .filter((l) => l.trim())
    .map((line) => line.split(delimiter).map((cell) => cell.trim()));

  return {
    name: "CSV",
    headers,
    rows,
    totalRows: rows.length,
  };
}
