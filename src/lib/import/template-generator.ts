import * as XLSX from "xlsx";
import { type EntityType, ENTITY_CONFIG } from "./column-mapping";

// ─── Template Generator ──────────────────────────────────────────────────────
// Generates downloadable Excel template files for each entity type

const EXAMPLE_DATA: Record<EntityType, Record<string, string>[]> = {
  teachers: [
    {
      first_name: "Muhammadsodiq",
      last_name: "Ergashev",
      email: "m.ergashev@mail.uz",
      phone: "+998901234567",
      max_weekly_hours: "18",
    },
    {
      first_name: "Dilnoza",
      last_name: "Karimova",
      email: "d.karimova@mail.uz",
      phone: "+998901234568",
      max_weekly_hours: "20",
    },
  ],
  groups: [
    { name: "MT-21", course: "2", track: "kunduzgi", student_count: "30" },
    { name: "AT-31", course: "3", track: "sirtqi", student_count: "25" },
  ],
  subjects: [
    { name: "Matematika", short_name: "Mat", requires_lab: "Yo'q" },
    { name: "Informatika", short_name: "Inf", requires_lab: "Ha" },
  ],
  rooms: [
    { name: "305-xona", building: "A bino", capacity: "30", type: "oddiy", floor: "3" },
    { name: "Lab-1", building: "B bino", capacity: "20", type: "laboratoriya", floor: "1" },
  ],
};

export function downloadTemplate(entityType: EntityType): void {
  const config = ENTITY_CONFIG[entityType];
  const wb = XLSX.utils.book_new();

  // Header row
  const headers = config.fields.map((f) => f.label);

  // Example data rows
  const exampleRows = EXAMPLE_DATA[entityType].map((example) =>
    config.fields.map((f) => example[f.key] || "")
  );

  // Notes row (enum values, defaults, etc.)
  const notes = config.fields.map((f) => {
    const parts: string[] = [];
    if (f.required) parts.push("Majburiy");
    if (f.enumValues) {
      parts.push(`Qiymatlar: ${f.enumValues.map((e) => e.label).join(", ")}`);
    }
    if (f.defaultValue !== undefined) {
      parts.push(`Standart: ${f.defaultValue}`);
    }
    return parts.join(". ") || "";
  });

  const wsData = [headers, ...exampleRows, [], notes.map((n) => n ? `[${n}]` : "")];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws["!cols"] = config.fields.map((f) => ({
    wch: Math.max(f.label.length + 4, 15),
  }));

  XLSX.utils.book_append_sheet(wb, ws, config.label);
  XLSX.writeFile(wb, `${entityType}_shablon.xlsx`);
}
