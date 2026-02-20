// ─── Paste Parser ────────────────────────────────────────────────────────────
// Parses tab-separated or comma-separated text (e.g., pasted from Excel/Google Sheets)

export interface PasteParseResult {
  headers: string[];
  rows: string[][];
  delimiter: "tab" | "comma" | "semicolon";
  rowCount: number;
}

function detectDelimiter(text: string): "tab" | "comma" | "semicolon" {
  const lines = text.split("\n").slice(0, 5);
  let tabCount = 0;
  let commaCount = 0;
  let semiCount = 0;

  for (const line of lines) {
    tabCount += (line.match(/\t/g) || []).length;
    commaCount += (line.match(/,/g) || []).length;
    semiCount += (line.match(/;/g) || []).length;
  }

  if (tabCount >= commaCount && tabCount >= semiCount) return "tab";
  if (semiCount >= commaCount) return "semicolon";
  return "comma";
}

function splitLine(line: string, delimiter: "tab" | "comma" | "semicolon"): string[] {
  const sep = delimiter === "tab" ? "\t" : delimiter === "comma" ? "," : ";";
  return line.split(sep).map((cell) => cell.trim());
}

export function parsePastedText(text: string): PasteParseResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { headers: [], rows: [], delimiter: "tab", rowCount: 0 };
  }

  const delimiter = detectDelimiter(trimmed);
  const lines = trimmed.split("\n").filter((l) => l.trim());

  if (lines.length === 0) {
    return { headers: [], rows: [], delimiter, rowCount: 0 };
  }

  const headers = splitLine(lines[0], delimiter);
  const rows = lines.slice(1).map((line) => splitLine(line, delimiter));

  return {
    headers,
    rows,
    delimiter,
    rowCount: rows.length,
  };
}
