import type { TimeSlot, DayKey, TrackKey, ConstraintSet } from "./types";

// ─── Days ────────────────────────────────────────────────────────────────────
export const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: "dushanba", label: "Dushanba", short: "Du" },
  { key: "seshanba", label: "Seshanba", short: "Se" },
  { key: "chorshanba", label: "Chorshanba", short: "Ch" },
  { key: "payshanba", label: "Payshanba", short: "Pa" },
  { key: "juma", label: "Juma", short: "Ju" },
];

// ─── Time Slots ──────────────────────────────────────────────────────────────
export const TIME_SLOTS: TimeSlot[] = [
  { id: "k1", label: "1-pora", start: "08:30", end: "10:00", track: "kunduzgi" },
  { id: "k2", label: "2-pora", start: "10:00", end: "11:30", track: "kunduzgi" },
  { id: "k3", label: "3-pora", start: "12:00", end: "13:30", track: "kunduzgi" },
  { id: "s1", label: "4-pora", start: "13:30", end: "15:00", track: "sirtqi" },
  { id: "s2", label: "5-pora", start: "15:00", end: "16:30", track: "sirtqi" },
  { id: "s3", label: "6-pora", start: "16:30", end: "18:00", track: "sirtqi" },
  { id: "e1", label: "7-pora", start: "18:00", end: "19:30", track: "kechki" },
  { id: "e2", label: "8-pora", start: "19:30", end: "21:00", track: "kechki" },
];

// ─── Track Labels ────────────────────────────────────────────────────────────
export const TRACK_LABELS: Record<TrackKey, string> = {
  kunduzgi: "Kunduzgi",
  sirtqi: "Sirtqi",
  kechki: "Kechki",
};

// ─── Room Type Labels ────────────────────────────────────────────────────────
export const ROOM_TYPE_LABELS: Record<string, string> = {
  oddiy: "Oddiy xona",
  laboratoriya: "Laboratoriya",
  kompyuter_xona: "Kompyuter xona",
  majlis_xonasi: "Majlis xonasi",
};

// ─── Subject Colors ──────────────────────────────────────────────────────────
export const SUBJECT_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#14b8a6",
  "#f59e0b", "#10b981", "#3b82f6", "#ef4444",
  "#84cc16", "#f97316", "#06b6d4", "#a855f7",
];

// ─── Default Constraints ─────────────────────────────────────────────────────
export const DEFAULT_CONSTRAINTS: ConstraintSet = {
  max_consecutive_lessons: 3,
  break_after_consecutive: 1,
  prefer_morning_for_first_year: true,
  avoid_last_slot: false,
  distribute_evenly: true,
  respect_teacher_availability: true,
  max_room_usage_percent: 90,
};

// ─── Navigation Items ────────────────────────────────────────────────────────
export const NAV_ITEMS = [
  { href: "/", icon: "LayoutDashboard", label: "Bosh sahifa" },
  { href: "/teachers", icon: "Users", label: "O'qituvchilar" },
  { href: "/groups", icon: "GraduationCap", label: "Guruhlar" },
  { href: "/subjects", icon: "BookOpen", label: "Fanlar" },
  { href: "/rooms", icon: "Door", label: "Xonalar" },
  { href: "/timetable", icon: "Calendar", label: "Dars jadvali" },
  { href: "/generate", icon: "Sparkles", label: "Avtomatik tuzish" },
  { href: "/import", icon: "Upload", label: "Import" },
  { href: "/export", icon: "Download", label: "Eksport" },
  { href: "/substitutions", icon: "ArrowLeftRight", label: "O'rinbosar" },
  { href: "/users", icon: "UsersRound", label: "Foydalanuvchilar" },
  { href: "/changelog", icon: "History", label: "O'zgarishlar" },
  { href: "/settings", icon: "Settings", label: "Sozlamalar" },
] as const;

// ─── Role Labels ─────────────────────────────────────────────────────────────
export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  teacher: "O'qituvchi",
  student: "Talaba",
};
