import { TRACK_LABELS, ROOM_TYPE_LABELS } from "@/lib/constants";

// ─── Field Mapping Definition ────────────────────────────────────────────────

export interface FieldMapping {
  key: string;
  label: string;
  required: boolean;
  type: "string" | "number" | "enum" | "boolean";
  enumValues?: { value: string; label: string }[];
  defaultValue?: string | number | boolean;
  aliases?: string[]; // alternative header names for auto-mapping
}

// ─── Entity Field Definitions ────────────────────────────────────────────────

export const TEACHER_FIELDS: FieldMapping[] = [
  {
    key: "first_name",
    label: "Ism",
    required: true,
    type: "string",
    aliases: ["ism", "name", "firstname", "first name", "ismi"],
  },
  {
    key: "last_name",
    label: "Familiya",
    required: true,
    type: "string",
    aliases: ["familiya", "surname", "lastname", "last name", "familiyasi"],
  },
  {
    key: "email",
    label: "Email",
    required: false,
    type: "string",
    aliases: ["email", "e-mail", "pochta", "elektron pochta"],
  },
  {
    key: "phone",
    label: "Telefon",
    required: false,
    type: "string",
    aliases: ["telefon", "phone", "tel", "telefon raqami", "raqam"],
  },
  {
    key: "max_weekly_hours",
    label: "Max soat/hafta",
    required: false,
    type: "number",
    defaultValue: 18,
    aliases: ["max soat", "soat", "haftalik soat", "max hours", "hours"],
  },
];

export const GROUP_FIELDS: FieldMapping[] = [
  {
    key: "name",
    label: "Guruh nomi",
    required: true,
    type: "string",
    aliases: ["guruh", "nomi", "name", "group", "guruh nomi"],
  },
  {
    key: "course",
    label: "Kurs",
    required: true,
    type: "number",
    defaultValue: 1,
    aliases: ["kurs", "course", "bosqich"],
  },
  {
    key: "track",
    label: "Trek",
    required: false,
    type: "enum",
    enumValues: Object.entries(TRACK_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
    defaultValue: "kunduzgi",
    aliases: ["trek", "track", "ta'lim shakli", "shakl"],
  },
  {
    key: "student_count",
    label: "Talabalar soni",
    required: false,
    type: "number",
    defaultValue: 25,
    aliases: [
      "talabalar",
      "soni",
      "talabalar soni",
      "students",
      "count",
      "o'quvchilar soni",
    ],
  },
];

export const SUBJECT_FIELDS: FieldMapping[] = [
  {
    key: "name",
    label: "Fan nomi",
    required: true,
    type: "string",
    aliases: ["fan", "nomi", "name", "subject", "fan nomi"],
  },
  {
    key: "short_name",
    label: "Qisqa nomi",
    required: false,
    type: "string",
    aliases: ["qisqa", "short", "abbreviation", "qisqartma"],
  },
  {
    key: "requires_lab",
    label: "Laboratoriya",
    required: false,
    type: "boolean",
    defaultValue: false,
    aliases: ["lab", "laboratoriya", "laboratory", "lab talab"],
  },
];

export const ROOM_FIELDS: FieldMapping[] = [
  {
    key: "name",
    label: "Xona nomi",
    required: true,
    type: "string",
    aliases: ["xona", "nomi", "name", "room", "xona nomi"],
  },
  {
    key: "building",
    label: "Bino",
    required: false,
    type: "string",
    aliases: ["bino", "building", "korpus"],
  },
  {
    key: "capacity",
    label: "Sig'imi",
    required: false,
    type: "number",
    defaultValue: 30,
    aliases: ["sig'im", "capacity", "joy", "talabalar soni"],
  },
  {
    key: "type",
    label: "Turi",
    required: false,
    type: "enum",
    enumValues: Object.entries(ROOM_TYPE_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
    defaultValue: "oddiy",
    aliases: ["tur", "type", "xona turi"],
  },
  {
    key: "floor",
    label: "Qavat",
    required: false,
    type: "number",
    aliases: ["qavat", "floor", "etaj"],
  },
];

export const USER_FIELDS: FieldMapping[] = [
  {
    key: "full_name",
    label: "To'liq ism",
    required: true,
    type: "string",
    aliases: ["ism", "name", "fullname", "full name", "ismi", "familiya ism", "f.i.o", "fio"],
  },
  {
    key: "login",
    label: "Login",
    required: true,
    type: "string",
    aliases: ["login", "username", "foydalanuvchi", "email", "e-mail", "pochta"],
  },
  {
    key: "password",
    label: "Parol",
    required: false,
    type: "string",
    aliases: ["parol", "password", "pass", "kod"],
  },
];

// ─── Entity Type Config ──────────────────────────────────────────────────────

export type EntityType = "teachers" | "groups" | "subjects" | "rooms" | "users";

export const ENTITY_CONFIG: Record<
  EntityType,
  {
    fields: FieldMapping[];
    label: string;
    singularLabel: string;
    duplicateCheckKeys: string[];
  }
> = {
  teachers: {
    fields: TEACHER_FIELDS,
    label: "O'qituvchilar",
    singularLabel: "o'qituvchi",
    duplicateCheckKeys: ["first_name", "last_name"],
  },
  groups: {
    fields: GROUP_FIELDS,
    label: "Guruhlar",
    singularLabel: "guruh",
    duplicateCheckKeys: ["name"],
  },
  subjects: {
    fields: SUBJECT_FIELDS,
    label: "Fanlar",
    singularLabel: "fan",
    duplicateCheckKeys: ["name"],
  },
  rooms: {
    fields: ROOM_FIELDS,
    label: "Xonalar",
    singularLabel: "xona",
    duplicateCheckKeys: ["name"],
  },
  users: {
    fields: USER_FIELDS,
    label: "Foydalanuvchilar",
    singularLabel: "foydalanuvchi",
    duplicateCheckKeys: ["login"],
  },
};

// ─── Auto-mapping Logic ──────────────────────────────────────────────────────

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-zA-Z0-9\u0400-\u04FF\u0600-\u06FF]/g, "");
}

export function autoMapColumns(
  headers: string[],
  fields: FieldMapping[]
): Record<number, string> {
  const mapping: Record<number, string> = {};
  const usedFields = new Set<string>();

  for (let i = 0; i < headers.length; i++) {
    const h = normalize(headers[i]);
    if (!h) continue;

    for (const field of fields) {
      if (usedFields.has(field.key)) continue;

      const matchTargets = [field.label, field.key, ...(field.aliases || [])];
      const match = matchTargets.some((t) => {
        const nt = normalize(t);
        return nt === h || h.includes(nt) || nt.includes(h);
      });

      if (match) {
        mapping[i] = field.key;
        usedFields.add(field.key);
        break;
      }
    }
  }

  return mapping;
}

// ─── Value Conversion ────────────────────────────────────────────────────────

export function convertValue(
  raw: string,
  field: FieldMapping
): string | number | boolean | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return field.defaultValue;

  switch (field.type) {
    case "number": {
      const num = parseFloat(trimmed);
      return isNaN(num) ? (field.defaultValue as number) : num;
    }
    case "boolean": {
      const lower = trimmed.toLowerCase();
      return (
        lower === "ha" ||
        lower === "true" ||
        lower === "1" ||
        lower === "yes" ||
        lower === "+"
      );
    }
    case "enum": {
      if (!field.enumValues) return trimmed;
      const lower = trimmed.toLowerCase();
      const exact = field.enumValues.find(
        (e) => e.value.toLowerCase() === lower || e.label.toLowerCase() === lower
      );
      return exact ? exact.value : (field.defaultValue as string);
    }
    default:
      return trimmed;
  }
}
