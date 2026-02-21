/**
 * Import qilingan ma'lumotlarni mavjud entitylarga moslashtirish.
 *
 * ParsedRow dagi string qiymatlarni bazadagi ID larga aylantirish:
 * - "Dushanba" → "dushanba" (DayKey)
 * - "08:30-10:00" → "k1" (slot_id)
 * - "Matematika" → subject.id
 * - "Aliyev I." → teacher.id
 * - "301-xona" → room.id
 */

import type {
  Teacher,
  Group,
  Subject,
  Room,
  DayKey,
  ScheduleEntry,
} from "@/lib/types";
import { DAYS, TIME_SLOTS } from "@/lib/constants";
import type { ParsedRow } from "./excel-parser";
import { nanoid } from "nanoid";

// ─── Fuzzy matching ─────────────────────────────────────────────────────────

/** Oddiy fuzzy match — lowercase, bo'shliqlarni normallashtirish */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[''`ʻʼ]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Ikki string orasidagi o'xshashlik (0-1) */
function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.8;

  // Simple character overlap
  const setA = new Set(na.split(""));
  const setB = new Set(nb.split(""));
  let common = 0;
  for (const c of setA) if (setB.has(c)) common++;
  return common / Math.max(setA.size, setB.size);
}

function findBestMatch<T extends { id: string }>(
  text: string,
  items: T[],
  getNames: (item: T) => string[]
): T | null {
  if (!text.trim()) return null;

  let best: T | null = null;
  let bestScore = 0;

  for (const item of items) {
    const names = getNames(item);
    for (const name of names) {
      const score = similarity(text, name);
      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    }
  }

  return bestScore >= 0.5 ? best : null;
}

// ─── Day matching ───────────────────────────────────────────────────────────

const DAY_ALIASES: Record<string, DayKey> = {
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
  "1": "dushanba",
  "2": "seshanba",
  "3": "chorshanba",
  "4": "payshanba",
  "5": "juma",
};

function matchDay(text: string): DayKey | null {
  const lower = text.trim().toLowerCase();
  if (DAY_ALIASES[lower]) return DAY_ALIASES[lower];

  // Partial match
  for (const day of DAYS) {
    if (lower.includes(day.key) || day.label.toLowerCase().includes(lower)) {
      return day.key;
    }
  }
  return null;
}

// ─── Time slot matching ─────────────────────────────────────────────────────

function matchSlot(text: string): string | null {
  const cleaned = text.trim();

  // To'g'ridan-to'g'ri ID tekshirish
  const directSlot = TIME_SLOTS.find((s) => s.id === cleaned);
  if (directSlot) return directSlot.id;

  // Vaqt oralig'i tekshirish (08:30-10:00)
  const timeMatch = cleaned.match(/(\d{1,2})[:.h](\d{2})/);
  if (timeMatch) {
    const hour = parseInt(timeMatch[1]);
    const minute = parseInt(timeMatch[2]);
    const startStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    const slot = TIME_SLOTS.find((s) => s.start === startStr);
    if (slot) return slot.id;
  }

  // Juftlik raqami (1-juftlik, 2-juftlik, ...)
  const poraMatch = cleaned.match(/(\d+)/);
  if (poraMatch) {
    const num = parseInt(poraMatch[1]);
    if (num >= 1 && num <= 8) {
      return TIME_SLOTS[num - 1]?.id || null;
    }
  }

  // Label bo'yicha
  const slot = TIME_SLOTS.find(
    (s) => normalize(s.label) === normalize(cleaned)
  );
  return slot?.id || null;
}

// ─── Main mapper ────────────────────────────────────────────────────────────

export interface MappingResult {
  entries: Omit<ScheduleEntry, "id" | "created_at" | "updated_at">[];
  unmapped: { row: ParsedRow; reason: string }[];
  stats: {
    total: number;
    mapped: number;
    unmapped: number;
  };
}

export interface MapperContext {
  teachers: Teacher[];
  groups: Group[];
  subjects: Subject[];
  rooms: Room[];
  defaultGroupId?: string;
}

export function mapParsedRows(
  rows: ParsedRow[],
  ctx: MapperContext
): MappingResult {
  const entries: MappingResult["entries"] = [];
  const unmapped: MappingResult["unmapped"] = [];

  for (const row of rows) {
    const reasons: string[] = [];

    // Kunni topish
    const day = row.day ? matchDay(row.day) : null;
    if (!day) {
      reasons.push("Kun topilmadi");
    }

    // Vaqt slotni topish
    const slotId = row.time ? matchSlot(row.time) : null;
    if (!slotId) {
      reasons.push("Vaqt sloti topilmadi");
    }

    // Fan topish
    const subject = row.subject
      ? findBestMatch(row.subject, ctx.subjects, (s) => [s.name, s.short_name])
      : null;
    if (!subject && row.subject) {
      reasons.push(`Fan topilmadi: "${row.subject}"`);
    }

    // O'qituvchi topish
    const teacher = row.teacher
      ? findBestMatch(row.teacher, ctx.teachers, (t) => [
          t.short_name,
          `${t.last_name} ${t.first_name}`,
          t.last_name,
        ])
      : null;
    if (!teacher && row.teacher) {
      reasons.push(`O'qituvchi topilmadi: "${row.teacher}"`);
    }

    // Xona topish
    const room = row.room
      ? findBestMatch(row.room, ctx.rooms, (r) => [
          r.name,
          `${r.name} (${r.building})`,
        ])
      : null;
    if (!room && row.room) {
      reasons.push(`Xona topilmadi: "${row.room}"`);
    }

    // Guruh topish
    const group = row.group
      ? findBestMatch(row.group, ctx.groups, (g) => [g.name])
      : ctx.defaultGroupId
      ? ctx.groups.find((g) => g.id === ctx.defaultGroupId) || null
      : null;

    if (reasons.length > 0 || !day || !slotId || !subject || !teacher || !room) {
      unmapped.push({
        row,
        reason: reasons.join("; ") || "Kerakli ma'lumotlar to'liq emas",
      });
      continue;
    }

    entries.push({
      period_id: "current",
      day,
      slot_id: slotId,
      group_ids: group ? [group.id] : [],
      subject_id: subject.id,
      teacher_id: teacher.id,
      room_id: room.id,
      is_manual: true,
      created_by: "import",
    });
  }

  return {
    entries,
    unmapped,
    stats: {
      total: rows.length,
      mapped: entries.length,
      unmapped: unmapped.length,
    },
  };
}
