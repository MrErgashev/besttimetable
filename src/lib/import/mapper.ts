/**
 * Import qilingan ma'lumotlarni mavjud entitylarga moslashtirish.
 *
 * ParsedRow dagi string qiymatlarni bazadagi ID larga aylantirish:
 * - "Dushanba" → "dushanba" (DayKey)
 * - "08:30-10:00" → "k1" (slot_id)
 * - "Matematika" → subject.id
 * - "Aliyev I." → teacher.id
 * - "301-xona" → room.id
 *
 * autoCreate rejimda: topilmagan entity'lar avtomatik yaratiladi.
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
import { SUBJECT_COLORS } from "@/lib/constants";
import type { ParsedRow } from "./excel-parser";

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

// ─── Auto-create helpers ────────────────────────────────────────────────────

function createSubject(name: string, colorIndex: number): Subject {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    short_name: name.trim().substring(0, 3).toUpperCase(),
    color: SUBJECT_COLORS[colorIndex % SUBJECT_COLORS.length],
    requires_lab: false,
    created_at: now,
    updated_at: now,
  };
}

function parseTeacherName(text: string): { first_name: string; last_name: string; short_name: string } {
  const trimmed = text.trim();
  // "Aliyev I." yoki "Aliyev Islom" yoki "I. Aliyev" formatlarini parse qilish
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    // Birinchi so'z katta harfdan boshlansa va ikkinchi so'z qisqa bo'lsa → "Familiya I."
    return {
      last_name: parts[0],
      first_name: parts.slice(1).join(" "),
      short_name: trimmed,
    };
  }
  return {
    last_name: trimmed,
    first_name: "",
    short_name: trimmed,
  };
}

function createTeacher(name: string): Teacher {
  const now = new Date().toISOString();
  const parsed = parseTeacherName(name);
  return {
    id: crypto.randomUUID(),
    first_name: parsed.first_name,
    last_name: parsed.last_name,
    short_name: parsed.short_name,
    max_weekly_hours: 18,
    created_at: now,
    updated_at: now,
  };
}

function createRoom(name: string): Room {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    capacity: 30,
    type: "oddiy",
    created_at: now,
    updated_at: now,
  };
}

function createGroup(name: string): Group {
  const now = new Date().toISOString();
  // Kursni guruh nomidan aniqlashga harakat qilish (masalan, "MT-11" → 1-kurs)
  const courseMatch = name.match(/\d+/);
  let course = 1;
  if (courseMatch) {
    const num = parseInt(courseMatch[0]);
    // 2 xonali raqamda birinchi raqam kurs (11→1, 21→2, 31→3)
    if (num >= 10) {
      course = Math.floor(num / 10);
    } else {
      course = num;
    }
    if (course < 1 || course > 6) course = 1;
  }

  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    course,
    department_id: "default",
    track: "kunduzgi",
    student_count: 25,
    created_at: now,
    updated_at: now,
  };
}

// ─── Main mapper ────────────────────────────────────────────────────────────

export interface MappingResult {
  entries: Omit<ScheduleEntry, "id" | "created_at" | "updated_at">[];
  unmapped: { row: ParsedRow; reason: string }[];
  autoCreated: {
    subjects: Subject[];
    teachers: Teacher[];
    rooms: Room[];
    groups: Group[];
  };
  stats: {
    total: number;
    mapped: number;
    unmapped: number;
    autoCreatedCount: number;
  };
}

export interface MapperContext {
  teachers: Teacher[];
  groups: Group[];
  subjects: Subject[];
  rooms: Room[];
  defaultGroupId?: string;
  autoCreate?: boolean;
}

export function mapParsedRows(
  rows: ParsedRow[],
  ctx: MapperContext
): MappingResult {
  const entries: MappingResult["entries"] = [];
  const unmapped: MappingResult["unmapped"] = [];

  // Auto-create tracking — duplikatlarni oldini olish
  const createdSubjects = new Map<string, Subject>();
  const createdTeachers = new Map<string, Teacher>();
  const createdRooms = new Map<string, Room>();
  const createdGroups = new Map<string, Group>();

  // Mutable copies for auto-create lookup
  const allSubjects = [...ctx.subjects];
  const allTeachers = [...ctx.teachers];
  const allRooms = [...ctx.rooms];
  const allGroups = [...ctx.groups];

  let subjectColorIndex = ctx.subjects.length;

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

    // Fan topish (yoki yaratish)
    let subject = row.subject
      ? findBestMatch(row.subject, allSubjects, (s) => [s.name, s.short_name])
      : null;
    if (!subject && row.subject) {
      if (ctx.autoCreate) {
        const key = normalize(row.subject);
        if (createdSubjects.has(key)) {
          subject = createdSubjects.get(key)!;
        } else {
          subject = createSubject(row.subject, subjectColorIndex++);
          createdSubjects.set(key, subject);
          allSubjects.push(subject);
        }
      } else {
        reasons.push(`Fan topilmadi: "${row.subject}"`);
      }
    }

    // O'qituvchi topish (yoki yaratish)
    let teacher = row.teacher
      ? findBestMatch(row.teacher, allTeachers, (t) => [
          t.short_name,
          `${t.last_name} ${t.first_name}`,
          t.last_name,
        ])
      : null;
    if (!teacher && row.teacher) {
      if (ctx.autoCreate) {
        const key = normalize(row.teacher);
        if (createdTeachers.has(key)) {
          teacher = createdTeachers.get(key)!;
        } else {
          teacher = createTeacher(row.teacher);
          createdTeachers.set(key, teacher);
          allTeachers.push(teacher);
        }
      } else {
        reasons.push(`O'qituvchi topilmadi: "${row.teacher}"`);
      }
    }

    // Xona topish (yoki yaratish)
    let room = row.room
      ? findBestMatch(row.room, allRooms, (r) => [
          r.name,
          `${r.name} (${r.building})`,
        ])
      : null;
    if (!room && row.room) {
      if (ctx.autoCreate) {
        const key = normalize(row.room);
        if (createdRooms.has(key)) {
          room = createdRooms.get(key)!;
        } else {
          room = createRoom(row.room);
          createdRooms.set(key, room);
          allRooms.push(room);
        }
      } else {
        reasons.push(`Xona topilmadi: "${row.room}"`);
      }
    }

    // Guruh topish (yoki yaratish)
    let group = row.group
      ? findBestMatch(row.group, allGroups, (g) => [g.name])
      : ctx.defaultGroupId
      ? allGroups.find((g) => g.id === ctx.defaultGroupId) || null
      : null;
    if (!group && row.group && ctx.autoCreate) {
      const key = normalize(row.group);
      if (createdGroups.has(key)) {
        group = createdGroups.get(key)!;
      } else {
        group = createGroup(row.group);
        createdGroups.set(key, group);
        allGroups.push(group);
      }
    }

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

  const autoCreatedSubjects = Array.from(createdSubjects.values());
  const autoCreatedTeachers = Array.from(createdTeachers.values());
  const autoCreatedRooms = Array.from(createdRooms.values());
  const autoCreatedGroups = Array.from(createdGroups.values());

  return {
    entries,
    unmapped,
    autoCreated: {
      subjects: autoCreatedSubjects,
      teachers: autoCreatedTeachers,
      rooms: autoCreatedRooms,
      groups: autoCreatedGroups,
    },
    stats: {
      total: rows.length,
      mapped: entries.length,
      unmapped: unmapped.length,
      autoCreatedCount:
        autoCreatedSubjects.length +
        autoCreatedTeachers.length +
        autoCreatedRooms.length +
        autoCreatedGroups.length,
    },
  };
}
