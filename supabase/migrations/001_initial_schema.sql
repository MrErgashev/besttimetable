-- ============================================================================
-- BestTimetable — Asosiy database sxemasi
-- ============================================================================

-- 1. Departments (Yo'nalishlar)
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Academic Periods (Semestrlar)
CREATE TABLE IF NOT EXISTS academic_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Faqat bitta aktiv davr bo'lishi mumkin
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_period
  ON academic_periods (is_active) WHERE is_active = true;

-- 3. Users (Foydalanuvchilar — Supabase Auth bilan bog'langan)
CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'student'
    CHECK (role IN ('super_admin', 'admin', 'teacher', 'student')),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  telegram_chat_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Teachers (O'qituvchilar)
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  max_weekly_hours INTEGER NOT NULL DEFAULT 18,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);

-- 5. Teacher Availability (O'qituvchi mavjudligi)
CREATE TABLE IF NOT EXISTS teacher_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  day TEXT NOT NULL CHECK (day IN ('dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma')),
  slot_id TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (teacher_id, day, slot_id)
);

-- 6. Subjects (Fanlar)
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  requires_lab BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Teacher-Subject (O'qituvchi-Fan bog'lanishi)
CREATE TABLE IF NOT EXISTS teacher_subjects (
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  PRIMARY KEY (teacher_id, subject_id)
);

-- 8. Groups (Guruhlar)
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  course INTEGER NOT NULL DEFAULT 1 CHECK (course BETWEEN 1 AND 6),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  track TEXT NOT NULL DEFAULT 'kunduzgi'
    CHECK (track IN ('kunduzgi', 'sirtqi', 'kechki')),
  student_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_groups_department ON groups(department_id);

-- 9. Rooms (Xonalar)
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  building TEXT,
  capacity INTEGER NOT NULL DEFAULT 30,
  type TEXT NOT NULL DEFAULT 'oddiy'
    CHECK (type IN ('oddiy', 'laboratoriya', 'kompyuter_xona', 'majlis_xonasi')),
  floor INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Subject Loads (Dars yuklamalari)
CREATE TABLE IF NOT EXISTS subject_loads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  weekly_hours NUMERIC(4,1) NOT NULL DEFAULT 3,
  room_type TEXT NOT NULL DEFAULT 'oddiy'
    CHECK (room_type IN ('oddiy', 'laboratoriya', 'kompyuter_xona', 'majlis_xonasi'))
);

CREATE INDEX IF NOT EXISTS idx_subject_loads_group ON subject_loads(group_id);
CREATE INDEX IF NOT EXISTS idx_subject_loads_teacher ON subject_loads(teacher_id);

-- 11. Time Slots (Vaqt slotlari)
CREATE TABLE IF NOT EXISTS time_slots (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  track TEXT NOT NULL CHECK (track IN ('kunduzgi', 'sirtqi', 'kechki'))
);

-- 12. Schedule Entries (Dars jadvali yozuvlari) — ASOSIY JADVAL
CREATE TABLE IF NOT EXISTS schedule_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID NOT NULL REFERENCES academic_periods(id) ON DELETE CASCADE,
  day TEXT NOT NULL CHECK (day IN ('dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma')),
  slot_id TEXT NOT NULL REFERENCES time_slots(id),
  group_ids UUID[] NOT NULL DEFAULT '{}',
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  is_manual BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- UNIQUE constraintlar — KONFLIKT OLDINI OLISH
-- Bir o'qituvchi bir vaqtda faqat bitta darsda
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_teacher_slot
  ON schedule_entries (period_id, day, slot_id, teacher_id);

-- Bir xona bir vaqtda faqat bitta darsda
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_room_slot
  ON schedule_entries (period_id, day, slot_id, room_id);

-- Tezkor qidirish uchun indekslar
CREATE INDEX IF NOT EXISTS idx_schedule_day_slot ON schedule_entries(day, slot_id);
CREATE INDEX IF NOT EXISTS idx_schedule_teacher ON schedule_entries(teacher_id);
CREATE INDEX IF NOT EXISTS idx_schedule_room ON schedule_entries(room_id);
CREATE INDEX IF NOT EXISTS idx_schedule_period ON schedule_entries(period_id);

-- 13. Schedule Changelog (O'zgarishlar tarixi)
CREATE TABLE IF NOT EXISTS schedule_changelog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES schedule_entries(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  old_data JSONB,
  new_data JSONB,
  changed_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_changelog_entry ON schedule_changelog(entry_id);
CREATE INDEX IF NOT EXISTS idx_changelog_date ON schedule_changelog(changed_at DESC);

-- 14. Notifications (Bildirishnomalar)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'system'
    CHECK (type IN ('schedule_change', 'conflict', 'substitution', 'system')),
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- 15. Substitutions (O'rinbosarlar)
CREATE TABLE IF NOT EXISTS substitutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  original_entry_id UUID REFERENCES schedule_entries(id) ON DELETE CASCADE,
  substitute_teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  reason TEXT NOT NULL DEFAULT '',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_substitutions_date ON substitutions(date);
