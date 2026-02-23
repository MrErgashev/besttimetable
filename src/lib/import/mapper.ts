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

/** Levenshtein edit distance */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

/** Ikki string orasidagi o'xshashlik (0-1), Levenshtein asosida */
function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  if (na.length >= 3 && nb.length >= 3) {
    if (na.includes(nb) || nb.includes(na)) return 0.85;
  }
  const maxLen = Math.max(na.length, nb.length);
  if (maxLen === 0) return 1;
  const dist = levenshteinDistance(na, nb);
  return 1 - dist / maxLen;
}

function findBestMatch<T extends { id: string }>(
  text: string,
  items: T[],
  getNames: (item: T) => string[],
  minScore: number = 0.5
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

  return bestScore >= minScore ? best : null;
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
  if (!cleaned) return null;

  // To'g'ridan-to'g'ri ID tekshirish
  const directSlot = TIME_SLOTS.find((s) => s.id === cleaned);
  if (directSlot) return directSlot.id;

  // Vaqt oralig'i tekshirish (08:30-10:00, 8.30, 08:30)
  const timeMatch = cleaned.match(/(\d{1,2})[:.h](\d{2})/);
  if (timeMatch) {
    const hour = parseInt(timeMatch[1]);
    const minute = parseInt(timeMatch[2]);
    const startStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

    // Aniq start vaqti bo'yicha
    const slotByStart = TIME_SLOTS.find((s) => s.start === startStr);
    if (slotByStart) return slotByStart.id;

    // End vaqti bo'yicha (ba'zi faylda tugash vaqti yozilgan bo'lishi mumkin)
    const slotByEnd = TIME_SLOTS.find((s) => s.end === startStr);
    if (slotByEnd) return slotByEnd.id;

    // 30 daqiqa toleransiya bilan eng yaqin slotni topish
    const inputMinutes = hour * 60 + minute;
    let bestSlot: (typeof TIME_SLOTS)[number] | null = null;
    let bestDiff = Infinity;
    for (const s of TIME_SLOTS) {
      const [sh, sm] = s.start.split(":").map(Number);
      const slotMinutes = sh * 60 + sm;
      const diff = Math.abs(inputMinutes - slotMinutes);
      if (diff < bestDiff && diff <= 30) {
        bestDiff = diff;
        bestSlot = s;
      }
    }
    if (bestSlot) return bestSlot.id;
  }

  // Juftlik raqami (1-juftlik, 2-juftlik, 1-para, ...)
  const poraMatch = cleaned.match(/(\d+)/);
  if (poraMatch) {
    const num = parseInt(poraMatch[1]);
    if (num >= 1 && num <= TIME_SLOTS.length) {
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

  // autoCreate rejimda faqat aniq moslik (0.95+) qabul qilinadi.
  // Bu "D. Nishonova" vs "Ergashev M." kabi noto'g'ri mosliklarni oldini oladi.
  const matchThreshold = ctx.autoCreate ? 0.85 : 0.6;

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
      ? findBestMatch(row.subject, allSubjects, (s) => [s.name, s.short_name], matchThreshold)
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
        ], matchThreshold)
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
        ], matchThreshold)
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
      ? findBestMatch(row.group, allGroups, (g) => [g.name], matchThreshold)
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

    // Minimal talab: kun + vaqt slot + fan (o'qituvchi va xona ixtiyoriy)
    if (!day || !slotId || !subject) {
      if (!day) reasons.push("Kun topilmadi");
      if (!slotId) reasons.push("Vaqt sloti topilmadi");
      if (!subject && !row.subject) reasons.push("Fan topilmadi");
      unmapped.push({
        row,
        reason: reasons.join("; ") || "Kerakli ma'lumotlar to'liq emas (kun, vaqt, fan kerak)",
      });
      continue;
    }

    // O'qituvchi yoki xona topilmasa, autoCreate rejimda placeholder yaratish
    if (!teacher && ctx.autoCreate && !row.teacher) {
      const placeholderKey = "__belgilanmagan_teacher__";
      if (createdTeachers.has(placeholderKey)) {
        teacher = createdTeachers.get(placeholderKey)!;
      } else {
        teacher = createTeacher("Belgilanmagan");
        createdTeachers.set(placeholderKey, teacher);
        allTeachers.push(teacher);
      }
    }

    if (!room && ctx.autoCreate && !row.room) {
      const placeholderKey = "__belgilanmagan_room__";
      if (createdRooms.has(placeholderKey)) {
        room = createdRooms.get(placeholderKey)!;
      } else {
        room = createRoom("Belgilanmagan");
        createdRooms.set(placeholderKey, room);
        allRooms.push(room);
      }
    }

    // Agar hali ham teacher/room yo'q bo'lsa, unmapped ga qo'shish
    if (!teacher || !room) {
      if (!teacher) reasons.push("O'qituvchi topilmadi");
      if (!room) reasons.push("Xona topilmadi");
      unmapped.push({
        row,
        reason: reasons.join("; "),
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

  // ─── Umumiy darslarni birlashtirish (potok/merged cell) ──────────────────
  // Bir xil day + slot + subject + teacher + room bo'lgan entry'lar = bitta dars,
  // bir nechta guruhga berilgan. group_ids massivini birlashtiramiz.
  const mergedEntries = mergeSharedLessons(entries);

  const autoCreatedSubjects = Array.from(createdSubjects.values());
  const autoCreatedTeachers = Array.from(createdTeachers.values());
  const autoCreatedRooms = Array.from(createdRooms.values());
  const autoCreatedGroups = Array.from(createdGroups.values());

  return {
    entries: mergedEntries,
    unmapped,
    autoCreated: {
      subjects: autoCreatedSubjects,
      teachers: autoCreatedTeachers,
      rooms: autoCreatedRooms,
      groups: autoCreatedGroups,
    },
    stats: {
      total: rows.length,
      mapped: mergedEntries.length,
      unmapped: unmapped.length,
      autoCreatedCount:
        autoCreatedSubjects.length +
        autoCreatedTeachers.length +
        autoCreatedRooms.length +
        autoCreatedGroups.length,
    },
  };
}

// ─── Umumiy darslarni birlashtirish ──────────────────────────────────────────

/**
 * Bir xil day + slot_id + subject_id + teacher_id + room_id bo'lgan
 * entry'larni bitta entry'ga birlashtirish.
 * Masalan: D. Nishonova bir vaqtda BR-501, IQT-501, DI-501 ga dars bersa,
 * 3 ta alohida entry emas, 1 ta entry group_ids: [br, iqt, di] bo'ladi.
 */
function mergeSharedLessons(
  entries: MappingResult["entries"]
): MappingResult["entries"] {
  const merged = new Map<string, MappingResult["entries"][number]>();

  for (const entry of entries) {
    const key = `${entry.day}::${entry.slot_id}::${entry.subject_id}::${entry.teacher_id}::${entry.room_id}`;

    if (merged.has(key)) {
      const existing = merged.get(key)!;
      // group_ids larni birlashtirish (duplikat bo'lmasin)
      for (const gid of entry.group_ids) {
        if (!existing.group_ids.includes(gid)) {
          existing.group_ids.push(gid);
        }
      }
    } else {
      merged.set(key, { ...entry, group_ids: [...entry.group_ids] });
    }
  }

  return Array.from(merged.values());
}
