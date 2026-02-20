// ─── Identity ────────────────────────────────────────────────────────────────
export type ID = string;

// ─── Tracks & Days ───────────────────────────────────────────────────────────
export type TrackKey = "kunduzgi" | "sirtqi" | "kechki";
export type DayKey =
  | "dushanba"
  | "seshanba"
  | "chorshanba"
  | "payshanba"
  | "juma";

export type RoomType =
  | "oddiy"
  | "laboratoriya"
  | "kompyuter_xona"
  | "majlis_xonasi";

export type UserRole = "super_admin" | "admin" | "teacher" | "student";

// ─── Time Slots ──────────────────────────────────────────────────────────────
export interface TimeSlot {
  id: string;
  label: string;
  start: string;
  end: string;
  track: TrackKey;
}

// ─── Core Entities ───────────────────────────────────────────────────────────
export interface Department {
  id: ID;
  name: string;
  created_at: string;
}

export interface AcademicPeriod {
  id: ID;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export interface Teacher {
  id: ID;
  user_id?: ID;
  first_name: string;
  last_name: string;
  short_name: string;
  email?: string;
  phone?: string;
  max_weekly_hours: number;
  created_at: string;
  updated_at: string;
}

export interface TeacherAvailability {
  teacher_id: ID;
  day: DayKey;
  slot_id: string;
  is_available: boolean;
}

export interface Group {
  id: ID;
  name: string;
  course: number;
  department_id: ID;
  track: TrackKey;
  student_count: number;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: ID;
  name: string;
  short_name: string;
  color: string;
  requires_lab: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubjectLoad {
  id: ID;
  group_id: ID;
  subject_id: ID;
  teacher_id: ID;
  weekly_hours: number;
  room_type: RoomType;
}

export interface Room {
  id: ID;
  name: string;
  building?: string;
  capacity: number;
  type: RoomType;
  floor?: number;
  created_at: string;
  updated_at: string;
}

// ─── Schedule ────────────────────────────────────────────────────────────────
export interface ScheduleEntry {
  id: ID;
  period_id: ID;
  day: DayKey;
  slot_id: string;
  group_ids: ID[];
  subject_id: ID;
  teacher_id: ID;
  room_id: ID;
  is_manual: boolean;
  created_by: ID;
  created_at: string;
  updated_at: string;
}

export interface ScheduleChangelog {
  id: ID;
  entry_id: ID;
  action: "create" | "update" | "delete";
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  changed_by: ID;
  changed_at: string;
}

// ─── Notifications ───────────────────────────────────────────────────────────
export interface Notification {
  id: ID;
  user_id: ID;
  type: "schedule_change" | "conflict" | "substitution" | "system";
  message: string;
  is_read: boolean;
  created_at: string;
}

// ─── Substitution ────────────────────────────────────────────────────────────
export interface Substitution {
  id: ID;
  date: string;
  original_entry_id: ID;
  substitute_teacher_id: ID;
  reason: string;
  note?: string;
  created_at: string;
}

// ─── Auth / User ─────────────────────────────────────────────────────────────
export interface AppUser {
  id: ID;
  email: string;
  full_name: string;
  role: UserRole;
  department_id?: ID;
  telegram_chat_id?: string;
  created_at: string;
}

// ─── Constraints ─────────────────────────────────────────────────────────────
export interface ConstraintSet {
  max_consecutive_lessons: number;
  break_after_consecutive: number;
  prefer_morning_for_first_year: boolean;
  avoid_last_slot: boolean;
  distribute_evenly: boolean;
  respect_teacher_availability: boolean;
  max_room_usage_percent: number;
}

// ─── Generator ───────────────────────────────────────────────────────────────
export type GenerationStatus =
  | "idle"
  | "running"
  | "complete"
  | "failed"
  | "partial";

export interface GenerationResult {
  status: GenerationStatus;
  placed: number;
  total: number;
  conflicts: ConflictReport[];
  duration_ms: number;
}

export interface ConflictReport {
  type:
    | "teacher_double"
    | "room_double"
    | "group_double"
    | "capacity_exceeded"
    | "unavailable";
  description: string;
  entry_ids: ID[];
}
