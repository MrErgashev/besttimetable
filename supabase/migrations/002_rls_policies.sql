-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_changelog ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE substitutions ENABLE ROW LEVEL SECURITY;

-- ─── Helper function: Get user role ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.app_users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── Helper function: Get user department ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_user_department()
RETURNS UUID AS $$
  SELECT department_id FROM public.app_users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── Helper function: Is admin or super_admin ───────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.app_users
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- Departments — hamma ko'ra oladi, faqat super_admin o'zgartira oladi
-- ============================================================================
CREATE POLICY "departments_select" ON departments FOR SELECT USING (true);
CREATE POLICY "departments_admin" ON departments FOR ALL
  USING (public.get_user_role() = 'super_admin');

-- ============================================================================
-- Academic Periods — hamma ko'ra oladi, admin o'zgartira oladi
-- ============================================================================
CREATE POLICY "periods_select" ON academic_periods FOR SELECT USING (true);
CREATE POLICY "periods_admin" ON academic_periods FOR ALL
  USING (public.is_admin());

-- ============================================================================
-- App Users — o'zini ko'ra oladi, admin hammasini ko'ra oladi
-- ============================================================================
CREATE POLICY "users_select_self" ON app_users FOR SELECT
  USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "users_update_self" ON app_users FOR UPDATE
  USING (id = auth.uid());
CREATE POLICY "users_admin" ON app_users FOR ALL
  USING (public.get_user_role() = 'super_admin');

-- ============================================================================
-- Teachers — hamma ko'ra oladi, admin CRUD qila oladi
-- ============================================================================
CREATE POLICY "teachers_select" ON teachers FOR SELECT USING (true);
CREATE POLICY "teachers_admin" ON teachers FOR INSERT
  WITH CHECK (public.is_admin());
CREATE POLICY "teachers_update" ON teachers FOR UPDATE
  USING (public.is_admin());
CREATE POLICY "teachers_delete" ON teachers FOR DELETE
  USING (public.is_admin());

-- ============================================================================
-- Teacher Availability — hamma ko'ra oladi, teacher o'zini o'zgartira oladi
-- ============================================================================
CREATE POLICY "availability_select" ON teacher_availability FOR SELECT USING (true);
CREATE POLICY "availability_teacher" ON teacher_availability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teachers t
      WHERE t.id = teacher_availability.teacher_id
        AND t.user_id = auth.uid()
    )
    OR public.is_admin()
  );

-- ============================================================================
-- Subjects — hamma ko'ra oladi, admin CRUD qila oladi
-- ============================================================================
CREATE POLICY "subjects_select" ON subjects FOR SELECT USING (true);
CREATE POLICY "subjects_admin" ON subjects FOR ALL
  USING (public.is_admin());

-- ============================================================================
-- Teacher-Subjects — hamma ko'ra oladi, admin CRUD qila oladi
-- ============================================================================
CREATE POLICY "teacher_subjects_select" ON teacher_subjects FOR SELECT USING (true);
CREATE POLICY "teacher_subjects_admin" ON teacher_subjects FOR ALL
  USING (public.is_admin());

-- ============================================================================
-- Groups — hamma ko'ra oladi, admin CRUD qila oladi
-- ============================================================================
CREATE POLICY "groups_select" ON groups FOR SELECT USING (true);
CREATE POLICY "groups_admin" ON groups FOR ALL
  USING (public.is_admin());

-- ============================================================================
-- Rooms — hamma ko'ra oladi, admin CRUD qila oladi
-- ============================================================================
CREATE POLICY "rooms_select" ON rooms FOR SELECT USING (true);
CREATE POLICY "rooms_admin" ON rooms FOR ALL
  USING (public.is_admin());

-- ============================================================================
-- Subject Loads — hamma ko'ra oladi, admin CRUD qila oladi
-- ============================================================================
CREATE POLICY "subject_loads_select" ON subject_loads FOR SELECT USING (true);
CREATE POLICY "subject_loads_admin" ON subject_loads FOR ALL
  USING (public.is_admin());

-- ============================================================================
-- Time Slots — hamma ko'ra oladi
-- ============================================================================
CREATE POLICY "time_slots_select" ON time_slots FOR SELECT USING (true);
CREATE POLICY "time_slots_admin" ON time_slots FOR ALL
  USING (public.is_admin());

-- ============================================================================
-- Schedule Entries — ASOSIY JADVAL
-- Hamma ko'ra oladi, admin CRUD qila oladi
-- Admin faqat o'z yo'nalishi guruhlariga dars qo'sha oladi (super_admin hammaga)
-- ============================================================================
CREATE POLICY "schedule_select" ON schedule_entries FOR SELECT USING (true);

CREATE POLICY "schedule_insert" ON schedule_entries FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "schedule_update" ON schedule_entries FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "schedule_delete" ON schedule_entries FOR DELETE
  USING (public.is_admin());

-- ============================================================================
-- Schedule Changelog — hamma ko'ra oladi, tizim yozadi
-- ============================================================================
CREATE POLICY "changelog_select" ON schedule_changelog FOR SELECT USING (true);
CREATE POLICY "changelog_insert" ON schedule_changelog FOR INSERT
  WITH CHECK (public.is_admin());

-- ============================================================================
-- Notifications — faqat o'z bildirishnomalarini ko'ra oladi
-- ============================================================================
CREATE POLICY "notifications_select" ON notifications FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "notifications_update" ON notifications FOR UPDATE
  USING (user_id = auth.uid());
CREATE POLICY "notifications_admin" ON notifications FOR INSERT
  WITH CHECK (public.is_admin());

-- ============================================================================
-- Substitutions — hamma ko'ra oladi, admin CRUD qila oladi
-- ============================================================================
CREATE POLICY "substitutions_select" ON substitutions FOR SELECT USING (true);
CREATE POLICY "substitutions_admin" ON substitutions FOR ALL
  USING (public.is_admin());
