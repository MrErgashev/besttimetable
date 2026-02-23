/**
 * Excel (.xlsx) fayllardan dars jadvali ma'lumotlarini o'qish.
 *
 * Qo'llab-quvvatlanadigan formatlar:
 *
 * 1) LIST format:
 *    - 1-qator: ustun sarlavhalari (Kun, Vaqt, Guruh, Fan, O'qituvchi, Xona)
 *    - Keyingi qatorlar: ma'lumotlar
 *
 * 2) GRID format:
 *    - 1-qator: bo'sh, Dushanba, Seshanba, ...
 *    - 1-ustun: vaqt slotlari (08:30-10:00, ...)
 *    - Hujayralar: "Fan — O'qituvchi — Xona"
 *
 * 3) SCHEDULE format (universitet dars jadvali):
 *    - Metadata qatorlari (ta'lim shakli, yil, kurs)
 *    - Guruh nomlari ustunlarda (masalan: BR-501, IQT-501, DI-501)
 *    - Kunlar vertikal (chap ustunda)
 *    - Har bir slot 2 qator: dars + xona
 *    - Dars hujayra: "Fan (tur) O'qituvchi"
 *    - Xona hujayra: "Xona No 210"
 *    - Merged cell'lar — umumiy darslar bir nechta guruhga tegishli
 */

import * as XLSX from "xlsx";

export interface ParsedRow {
  day?: string;
  time?: string;
  group?: string;
  subject?: string;
  teacher?: string;
  room?: string;
  lessonType?: string;
  raw: Record<string, string>;
}

export interface ParsedSheet {
  name: string;
  rows: ParsedRow[];
  headers: string[];
  rawData: string[][];
}

export type ParseFormat = "list" | "grid" | "schedule" | "unknown";

export interface ExcelParseResult {
  sheets: ParsedSheet[];
  format: ParseFormat;
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

// ─── Schedule format parser (universitet dars jadvali) ─────────────────────

/**
 * Guruh nomi pattern — kengroq:
 * - "BR-501", "IQT-501", "DI-501" (standart)
 * - "B-501" (1 harfli prefix)
 * - "2IT-101" (raqam bilan boshlanadi)
 * - "M.T-501" (nuqtali)
 * - "MT 101" (bo'shliqli)
 * Kamida 1 ta harf bo'lishi shart (sof raqamlarni oldini olish uchun).
 */
const GROUP_NAME_PATTERN = /^(?=.*[A-Za-z\u0400-\u04FF])[\dA-Za-z.\u0400-\u04FF]+[_\- ]\d{1,4}$/;

/**
 * Dars hujayrasini parse qilish.
 *
 * Qo'llab-quvvatlanadigan formatlar:
 * - "Fan nomi (tur) O'qituvchi ismi" — to'liq format
 * - "Fan nomi O'qituvchi ismi" — tursiz
 * - "Fan nomi\nO'qituvchi ismi" — ko'p qatorli
 * - "Fan nomi (tur)" — o'qituvchisiz
 * - "Fan nomi" — faqat fan
 *
 * Hech qachon null qaytarmaydi — kamida fan nomi sifatida xom matnni qaytaradi.
 */
function parseLessonCell(text: string): {
  subject: string;
  lessonType: string;
  teacher: string;
} {
  const trimmed = text.trim();
  if (!trimmed) return { subject: "", lessonType: "", teacher: "" };

  // Apostrof variantlarini ASCII apostrofga normalizatsiya qilish
  const normalized = trimmed.replace(/[\u2018\u2019\u02BB\u02BC\u0060]/g, "'");

  // Ko'p qatorli hujayra — newline bilan ajratilgan qismlarni sinash
  const lines = normalized.split(/\n/).map((l) => l.trim()).filter(Boolean);

  // Dars tur pattern (kengroq)
  const LESSON_TYPE_PATTERN =
    /\((ma'ruza|amaliy|seminar|laboratoriya|maruza|lab|tajriba|mustaqil(?:\s+ish)?|kurs\s+ishi|mashg'ulot|mashg`ulot|nazariy|amaliyot)\)/i;

  // O'qituvchi nomi pattern (kengroq):
  // "D. Nishonova", "Nishonova D.", "prof. I. Karimov", "dots. A. Sobirov",
  // "Abdullayev Jasur", "Kim S.", "D.Nishonova"
  const TEACHER_PATTERN =
    /(?:(?:prof|dots|doc|PhD|DSc|o'qit)\.?\s+)?(?:[A-Z\u0400-\u04FF][a-z\u0400-\u04FF]*\.?\s*[A-Z\u0400-\u04FF][a-z\u0400-\u04FF']+|[A-Z\u0400-\u04FF][a-z\u0400-\u04FF']+\s+[A-Z\u0400-\u04FF]\.?)/;

  // ─── Pattern 1: "Fan (tur) O'qituvchi" — to'liq format ────────────────
  const fullMatch = normalized.match(
    /^(.+?)\s*\((ma'ruza|amaliy|seminar|laboratoriya|maruza|lab|tajriba|mustaqil(?:\s+ish)?|kurs\s+ishi|mashg'ulot|mashg`ulot|nazariy|amaliyot)\)\s*(.+)$/i
  );
  if (fullMatch) {
    let lessonType = fullMatch[2].toLowerCase();
    if (lessonType === "maruza") lessonType = "ma'ruza";
    if (lessonType === "lab") lessonType = "laboratoriya";
    return {
      subject: fullMatch[1].trim(),
      lessonType,
      teacher: fullMatch[3].trim(),
    };
  }

  // ─── Pattern 2: "Fan (tur)" — o'qituvchisiz ──────────────────────────
  const typeOnlyMatch = normalized.match(
    /^(.+?)\s*\((ma'ruza|amaliy|seminar|laboratoriya|maruza|lab|tajriba|mustaqil(?:\s+ish)?|kurs\s+ishi|mashg'ulot|mashg`ulot|nazariy|amaliyot)\)\s*$/i
  );
  if (typeOnlyMatch) {
    let lessonType = typeOnlyMatch[2].toLowerCase();
    if (lessonType === "maruza") lessonType = "ma'ruza";
    if (lessonType === "lab") lessonType = "laboratoriya";
    return {
      subject: typeOnlyMatch[1].trim(),
      lessonType,
      teacher: "",
    };
  }

  // ─── Pattern 3: Ko'p qatorli — har bir qismni alohida tekshirish ─────
  if (lines.length >= 2) {
    let subject = "";
    let lessonType = "";
    let teacher = "";

    for (const line of lines) {
      const typeMatch = line.match(LESSON_TYPE_PATTERN);
      const isTeacher = TEACHER_PATTERN.test(line) && !LESSON_TYPE_PATTERN.test(line);

      if (typeMatch && !subject) {
        // Bu qatorda tur bor — fan nomi ham shu yerda
        subject = line.replace(LESSON_TYPE_PATTERN, "").trim();
        lessonType = typeMatch[1].toLowerCase();
        if (lessonType === "maruza") lessonType = "ma'ruza";
        if (lessonType === "lab") lessonType = "laboratoriya";
      } else if (isTeacher && !teacher) {
        teacher = line;
      } else if (!subject) {
        subject = line;
      }
    }

    if (subject) {
      return { subject, lessonType, teacher };
    }
  }

  // ─── Pattern 4: "Fan O'qituvchi" — oxirida o'qituvchi nomi ───────────
  const teacherAtEnd = normalized.match(
    /^(.+?)\s+((?:(?:prof|dots|doc|PhD|DSc|o'qit)\.?\s+)?(?:[A-Z\u0400-\u04FF][a-z\u0400-\u04FF]*\.?\s*[A-Z\u0400-\u04FF][a-z\u0400-\u04FF']+|[A-Z\u0400-\u04FF][a-z\u0400-\u04FF']+\s+[A-Z\u0400-\u04FF]\.?))$/
  );
  if (teacherAtEnd) {
    // Tekshirish: subject qismi kamida 2 belgi bo'lsin (bo'sh bo'lmasin)
    const subjectPart = teacherAtEnd[1].trim();
    if (subjectPart.length >= 2) {
      return {
        subject: subjectPart,
        lessonType: "",
        teacher: teacherAtEnd[2].trim(),
      };
    }
  }

  // ─── Fallback: butun matnni fan nomi sifatida qaytarish ───────────────
  return {
    subject: normalized,
    lessonType: "",
    teacher: "",
  };
}

/**
 * Xona hujayrasidan xona nomini ajratish.
 * Format: "Xona No 210", "210-xona", "210", "A-210" va h.k.
 */
function parseRoomCell(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";

  // "Xona No 210" yoki "Xona №210" yoki "xona 210"
  const xonaMatch = trimmed.match(/xona\s*(?:no|№|#)?\s*(\S+)/i);
  if (xonaMatch) return xonaMatch[1];

  // Agar faqat raqam bo'lsa
  if (/^\d+[A-Za-z]?$/.test(trimmed)) return trimmed;

  return trimmed;
}

/**
 * Merged cell'larni hisobga olib, to'ldirilgan ma'lumot massivini yaratish.
 * XLSX merged cell'larda faqat yuqori-chap katakda qiymat bo'ladi,
 * qolgan kataklar bo'sh bo'ladi.
 */
function fillMergedCells(
  rawData: string[][],
  merges: XLSX.Range[] | undefined
): string[][] {
  if (!merges || merges.length === 0) return rawData;

  // Deep copy
  const filled = rawData.map((row) => [...row]);

  for (const merge of merges) {
    const { s, e } = merge; // s = start, e = end
    const value = filled[s.r]?.[s.c] ?? "";

    for (let r = s.r; r <= e.r; r++) {
      for (let c = s.c; c <= e.c; c++) {
        if (r === s.r && c === s.c) continue; // O'zi allaqachon bor
        if (!filled[r]) filled[r] = [];
        filled[r][c] = value?.toString() || "";
      }
    }
  }

  return filled;
}



/**
 * Schedule format ekanligini aniqlash.
 * Belgilar:
 * - "DARS JADVALI" matni bor (qator 0-10 orasida)
 * - Yoki guruh nomlari pattern (XXX-NNN) 2+ ta topilgan (qator 0-15 orasida)
 * - Va kun nomlari chap ustunlarda bor
 */
function isScheduleFormat(data: string[][]): boolean {
  const searchRows = Math.min(data.length, 15);

  // "DARS JADVALI" matnini qidirish
  for (let r = 0; r < searchRows; r++) {
    const rowText = (data[r] || []).join(" ").toLowerCase();
    if (rowText.includes("dars jadvali")) return true;
  }

  // Guruh nomlari pattern qidirish
  let groupNameCount = 0;
  for (let r = 0; r < searchRows; r++) {
    for (const cell of data[r] || []) {
      const str = cell?.toString().trim() || "";
      if (GROUP_NAME_PATTERN.test(str)) groupNameCount++;
    }
    if (groupNameCount >= 2) return true;
  }

  return false;
}

/**
 * Guruh nomlari qatorini va ustunlarini topish.
 * Qator 0-15 orasida 2+ guruh nomi bor bo'lgan qatorni topadi.
 */
function findGroupRow(
  data: string[][]
): { row: number; groups: { col: number; name: string }[] } | null {
  const searchRows = Math.min(data.length, 15);

  for (let r = 0; r < searchRows; r++) {
    const groups: { col: number; name: string }[] = [];

    for (let c = 0; c < (data[r]?.length || 0); c++) {
      const cell = data[r][c]?.toString().trim() || "";
      if (GROUP_NAME_PATTERN.test(cell)) {
        groups.push({ col: c, name: cell });
      }
    }

    if (groups.length >= 2) {
      return { row: r, groups };
    }
  }

  // Agar 2 ta topilmasa, 1 ta bo'lsa ham qaytarish (bitta guruh uchun jadval)
  for (let r = 0; r < searchRows; r++) {
    for (let c = 0; c < (data[r]?.length || 0); c++) {
      const cell = data[r][c]?.toString().trim() || "";
      if (GROUP_NAME_PATTERN.test(cell)) {
        return { row: r, groups: [{ col: c, name: cell }] };
      }
    }
  }

  return null;
}

/**
 * Kun nomi va vaqt ustunlarini aniqlash.
 * Jadvalda kunlar vertikal — masalan C ustunida "Dushanba", D da slot raqami, E da vaqt.
 * Vaqt ustunini qat'iy offset bilan emas, yaqin ustunlarni skanerlab topadi.
 */
function findDayAndTimeColumns(
  data: string[][],
  startRow: number
): { dayCol: number; slotCol: number; timeCol: number } | null {
  const endRow = Math.min(data.length, startRow + 30);

  for (let r = startRow; r < endRow; r++) {
    for (let c = 0; c < Math.min(data[r]?.length || 0, 8); c++) {
      const cell = data[r][c]?.toString().trim() || "";
      if (!normalizeDay(cell)) continue;

      // Kun topildi — endi yaqin ustunlarda vaqt/slot ma'lumotini qidirish
      const dayCol = c;
      let slotCol = c + 1;
      let timeCol = c + 2;

      // dayCol + 1 dan dayCol + 5 gacha skanerlash — vaqt formatli ustunni topish
      // Quyidagi qatorlarda (r dan r+5 gacha) tekshirish
      let foundTimeCol = -1;
      let foundSlotCol = -1;

      for (let tc = dayCol + 1; tc <= Math.min(dayCol + 5, (data[r]?.length || 0) - 1); tc++) {
        // Bir nechta qatorda tekshirish (ba'zi qatorda bo'sh bo'lishi mumkin)
        for (let tr = r; tr < Math.min(r + 5, endRow); tr++) {
          const testCell = data[tr]?.[tc]?.toString().trim() || "";
          if (!testCell) continue;

          // Vaqt formati: 08:30, 8.30, 08:30-10:00
          if (/\d{1,2}[:.]\d{2}/.test(testCell)) {
            if (foundTimeCol === -1) foundTimeCol = tc;
          }
          // Slot raqam: 1, 2, 3 ... 8 (oddiy raqam)
          else if (/^\d{1,2}$/.test(testCell)) {
            const num = parseInt(testCell);
            if (num >= 1 && num <= 8 && foundSlotCol === -1) {
              foundSlotCol = tc;
            }
          }
        }
      }

      if (foundTimeCol >= 0) {
        timeCol = foundTimeCol;
        slotCol = foundSlotCol >= 0 ? foundSlotCol : (foundTimeCol > dayCol + 1 ? dayCol + 1 : foundTimeCol);
      } else if (foundSlotCol >= 0) {
        // Faqat slot raqam topildi, vaqt yo'q — slotCol ni ishlatamiz
        slotCol = foundSlotCol;
        timeCol = foundSlotCol; // Vaqt o'rniga slot raqamini ishlatamiz
      }

      return { dayCol, slotCol, timeCol };
    }
  }

  return null;
}

/**
 * Dars jadvali formatini parse qilish.
 * Murakkab format: merged cell'lar, vertikal kunlar, 2+ qatorli slotlar.
 *
 * Muhim: rawData (original) dan STRUKTURA aniqlash uchun foydalaniladi
 * (slot qatorlarini topish, dublikat merge qatorlardan qochish),
 * filledData dan esa KONTENT o'qish uchun (merged guruh ustunlarini to'g'ri o'qish).
 */
function parseScheduleFormat(
  rawData: string[][],
  merges: XLSX.Range[] | undefined
): ParsedRow[] {
  // 1. Merged cell'larni to'ldirilgan versiyasini yaratish (kontent uchun)
  const filledData = fillMergedCells(rawData, merges);

  // 2. Guruh qatori va ustunlarini topish (filled data dan — merge ichida ham guruh nomlari bo'lishi mumkin)
  const groupInfo = findGroupRow(filledData);
  if (!groupInfo) return [];

  const { row: groupRow, groups } = groupInfo;

  // 3. Kun va vaqt ustunlarini topish (filled data dan)
  const colInfo = findDayAndTimeColumns(filledData, groupRow + 1);
  if (!colInfo) return [];

  const { dayCol, timeCol } = colInfo;

  // 4. Slot boshlanish qatorlarini aniqlash (ORIGINAL rawData dan!)
  // Merged cell'lar tufayli vaqt ma'lumoti bir nechta qatorda takrorlanadi.
  // Faqat ORIGINAL rawData da vaqt qiymati bor qatorlar = haqiqiy slot boshlangich qatori.
  // Room qatorlarini ham aniqlash — dars qatoridan keyin, "Xona" so'zi bor yoki dars ma'lumoti yo'q qator.
  const rows: ParsedRow[] = [];
  let currentDay = "";

  for (let r = groupRow + 1; r < rawData.length; r++) {
    // Kun nomini ORIGINAL data dan tekshirish (merge bo'lmagan hujayra)
    const rawDayCell = rawData[r]?.[dayCol]?.toString().trim() || "";
    const normalizedRaw = normalizeDay(rawDayCell);
    if (normalizedRaw) {
      currentDay = rawDayCell;
    }

    // Agar filled data da kun bor lekin raw da yo'q — bu merge tufayli,
    // currentDay avvalgi qiymatini saqlab qoladi
    if (!currentDay) {
      // filled data dan ham tekshirish — birinchi marta
      const filledDayCell = filledData[r]?.[dayCol]?.toString().trim() || "";
      const normalizedFilled = normalizeDay(filledDayCell);
      if (normalizedFilled) currentDay = filledDayCell;
    }

    if (!currentDay) continue;

    // ORIGINAL rawData da vaqt tekshirish — faqat haqiqiy slot boshlanish qatorlari
    // Qo'llab-quvvatlanadigan formatlar:
    // - Soat:minut: "08:30", "8.30", "08:30-10:00"
    // - Slot raqam: "1", "2", "3" ... "8"
    // - Slot + pora: "1-juftlik", "2-para"
    const rawTimeCell = rawData[r]?.[timeCol]?.toString().trim() || "";
    const rawSlotCell = rawData[r]?.[colInfo.slotCol]?.toString().trim() || "";

    const hasClockTime = /\d{1,2}[:.]\d{2}/.test(rawTimeCell);
    const hasSlotNumber = /^\d{1,2}$/.test(rawSlotCell) && parseInt(rawSlotCell) >= 1 && parseInt(rawSlotCell) <= 8;
    const hasSlotInTime = /^\d{1,2}$/.test(rawTimeCell) && parseInt(rawTimeCell) >= 1 && parseInt(rawTimeCell) <= 8;
    const hasPoraLabel = /\d+.*(?:juftlik|para|pora)/i.test(rawTimeCell) || /\d+.*(?:juftlik|para|pora)/i.test(rawSlotCell);

    if (!hasClockTime && !hasSlotNumber && !hasSlotInTime && !hasPoraLabel) continue;

    // Vaqtdan boshlanish vaqtini olish
    let startTime: string;
    const timeFromFilled = filledData[r]?.[timeCol]?.toString().trim() || rawTimeCell;
    const clockMatch = timeFromFilled.match(/(\d{1,2}[:.]\d{2})/);

    if (clockMatch) {
      startTime = clockMatch[1].replace(".", ":");
    } else {
      // Slot raqamidan vaqtni olish — mapper.ts dagi matchSlot hal qiladi
      const slotNum = rawSlotCell || rawTimeCell;
      startTime = slotNum;
    }

    // Xona qatorini topish — keyingi 1-3 qator ichida "xona" so'zi bor qator
    let roomRowIdx = -1;
    for (let offset = 1; offset <= 3 && r + offset < filledData.length; offset++) {
      const candidateRow = filledData[r + offset];
      if (!candidateRow) continue;

      // Guruh ustunlarida "xona" so'zi bor-yo'qligini tekshirish
      const hasRoom = groups.some((g) => {
        const cell = candidateRow[g.col]?.toString().trim().toLowerCase() || "";
        return cell.includes("xona") || cell.includes("аудитория") || cell.includes("auditoriya") || /^\d{2,4}[A-Za-z]?$/.test(cell.trim());
      });

      if (hasRoom) {
        roomRowIdx = r + offset;
        break;
      }
    }

    // Har bir guruh ustuni uchun
    for (const group of groups) {
      // FILLED data dan dars hujayrasini o'qish (merged cell'lar to'g'ri ko'rinadi)
      const lessonCell = filledData[r]?.[group.col]?.toString().trim() || "";
      if (!lessonCell) continue;

      // Dars hujayrasini parse qilish (hech qachon null qaytarmaydi)
      const lesson = parseLessonCell(lessonCell);
      if (!lesson.subject) continue;

      // Xona qatoridan xonani olish (FILLED data dan)
      let roomText = "";
      if (roomRowIdx >= 0) {
        const rawRoom = filledData[roomRowIdx]?.[group.col]?.toString().trim() || "";
        roomText = parseRoomCell(rawRoom);
      }

      rows.push({
        day: currentDay,
        time: startTime,
        group: group.name,
        subject: lesson.subject,
        teacher: lesson.teacher,
        room: roomText,
        lessonType: lesson.lessonType,
        raw: {
          day: currentDay,
          time: timeFromFilled,
          group: group.name,
          lesson: lessonCell,
          room: roomText,
        },
      });
    }
  }

  return rows;
}

// ─── Detect format ──────────────────────────────────────────────────────────

function detectFormat(headers: string[], data: string[][]): ParseFormat {
  // Schedule format — universitet dars jadvali
  if (isScheduleFormat(data)) return "schedule";

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
  let detectedFormat: ParseFormat = "unknown";
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
    if (format === "schedule") {
      rows = parseScheduleFormat(rawData, sheet["!merges"]);
    } else if (format === "list") {
      rows = parseListFormat(rawData, headers);
    } else if (format === "grid") {
      rows = parseGridFormat(rawData);
    } else {
      // Barcha formatlarni ketma-ket sinash
      rows = parseScheduleFormat(rawData, sheet["!merges"]);
      if (rows.length === 0) {
        rows = parseListFormat(rawData, headers);
      }
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
