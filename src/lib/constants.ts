import type { TimeSlot, DayKey, TrackKey, ConstraintSet, UserRole } from "./types";

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
  { id: "k1", label: "1-juftlik", start: "08:30", end: "10:00", track: "kunduzgi" },
  { id: "k2", label: "2-juftlik", start: "10:00", end: "11:30", track: "kunduzgi" },
  { id: "k3", label: "3-juftlik", start: "12:00", end: "13:30", track: "kunduzgi" },
  { id: "s1", label: "4-juftlik", start: "13:30", end: "15:00", track: "sirtqi" },
  { id: "s2", label: "5-juftlik", start: "15:00", end: "16:30", track: "sirtqi" },
  { id: "s3", label: "6-juftlik", start: "16:30", end: "18:00", track: "sirtqi" },
  { id: "e1", label: "7-juftlik", start: "18:00", end: "19:30", track: "kechki" },
  { id: "e2", label: "8-juftlik", start: "19:30", end: "21:00", track: "kechki" },
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
const allRoles: UserRole[] = ["super_admin", "admin", "teacher", "student"];
const adminRoles: UserRole[] = ["super_admin", "admin"];

export const NAV_ITEMS: { href: string; icon: string; label: string; roles: UserRole[] }[] = [
  { href: "/", icon: "LayoutDashboard", label: "Bosh sahifa", roles: allRoles },
  { href: "/teachers", icon: "Users", label: "O'qituvchilar", roles: adminRoles },
  { href: "/groups", icon: "GraduationCap", label: "Guruhlar", roles: adminRoles },
  { href: "/subjects", icon: "BookOpen", label: "Fanlar", roles: adminRoles },
  { href: "/rooms", icon: "Door", label: "Xonalar", roles: adminRoles },
  { href: "/timetable", icon: "Calendar", label: "Dars jadvali", roles: allRoles },
  { href: "/timetable/by-teacher", icon: "ClipboardList", label: "Darslarim", roles: ["teacher"] as UserRole[] },
  { href: "/timetable/by-teacher", icon: "UserSearch", label: "O'qituvchi jadvali", roles: ["student"] as UserRole[] },
  { href: "/timetable/by-room", icon: "Building", label: "Xona jadvali", roles: ["teacher", "student"] as UserRole[] },
  { href: "/generate", icon: "Sparkles", label: "Avtomatik tuzish", roles: adminRoles },
  { href: "/import", icon: "Upload", label: "Import", roles: adminRoles },
  { href: "/export", icon: "Download", label: "Eksport", roles: adminRoles },
  { href: "/substitutions", icon: "ArrowLeftRight", label: "O'rinbosar", roles: adminRoles },
  { href: "/notifications", icon: "Bell", label: "Bildirishnomalar", roles: allRoles },
  { href: "/users", icon: "UsersRound", label: "Foydalanuvchilar", roles: adminRoles },
  { href: "/changelog", icon: "History", label: "O'zgarishlar", roles: adminRoles },
  { href: "/demo-data", icon: "Database", label: "Demo data", roles: ["super_admin"] as UserRole[] },
  { href: "/settings", icon: "Settings", label: "Sozlamalar", roles: adminRoles },
];

// ─── Role Labels ─────────────────────────────────────────────────────────────
export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  teacher: "O'qituvchi",
  student: "Talaba",
};
