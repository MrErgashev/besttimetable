-- ============================================================================
-- Test foydalanuvchilar (4 ta rol)
-- ============================================================================
-- Bu migratsiya 003_triggers_and_functions.sql dan KEYIN bajarilishi kerak!
-- handle_new_user() trigger auth.users ga INSERT bo'lganda
-- avtomatik app_users ga yozadi
-- ============================================================================

-- Avval mavjud test userlarni tozalash (qayta ishga tushirish uchun)
DELETE FROM public.app_users WHERE email IN (
  'superadmin@timetable.uz',
  'admin@timetable.uz',
  'teacher@timetable.uz',
  'student@timetable.uz'
);
DELETE FROM auth.users WHERE email IN (
  'superadmin@timetable.uz',
  'admin@timetable.uz',
  'teacher@timetable.uz',
  'student@timetable.uz'
);

DO $$
DECLARE
  _super_admin_id uuid := gen_random_uuid();
  _admin_id uuid := gen_random_uuid();
  _teacher_id uuid := gen_random_uuid();
  _student_id uuid := gen_random_uuid();
  _dept_id uuid;
BEGIN
  -- Birinchi department ID ni olish
  SELECT id INTO _dept_id FROM public.departments LIMIT 1;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 1. SUPER ADMIN — Tizim boshqaruvchisi
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, confirmation_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    _super_admin_id,
    'authenticated', 'authenticated',
    'superadmin@timetable.uz',
    crypt('Test1234!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', 'Super Admin', 'role', 'super_admin'),
    false, ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), _super_admin_id,
    jsonb_build_object('sub', _super_admin_id::text, 'email', 'superadmin@timetable.uz', 'email_verified', true),
    'email', _super_admin_id::text,
    now(), now(), now()
  );

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 2. ADMIN — Yo'nalish boshlig'i (bo'lim admini)
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, confirmation_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    _admin_id,
    'authenticated', 'authenticated',
    'admin@timetable.uz',
    crypt('Test1234!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', 'Admin Foydalanuvchi', 'role', 'admin'),
    false, ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), _admin_id,
    jsonb_build_object('sub', _admin_id::text, 'email', 'admin@timetable.uz', 'email_verified', true),
    'email', _admin_id::text,
    now(), now(), now()
  );

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 3. TEACHER — O'qituvchi
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, confirmation_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    _teacher_id,
    'authenticated', 'authenticated',
    'teacher@timetable.uz',
    crypt('Test1234!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', 'Aliyev Vohid', 'role', 'teacher'),
    false, ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), _teacher_id,
    jsonb_build_object('sub', _teacher_id::text, 'email', 'teacher@timetable.uz', 'email_verified', true),
    'email', _teacher_id::text,
    now(), now(), now()
  );

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 4. STUDENT — Talaba
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, confirmation_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    _student_id,
    'authenticated', 'authenticated',
    'student@timetable.uz',
    crypt('Test1234!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', 'Karimov Jasur', 'role', 'student'),
    false, ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), _student_id,
    jsonb_build_object('sub', _student_id::text, 'email', 'student@timetable.uz', 'email_verified', true),
    'email', _student_id::text,
    now(), now(), now()
  );

  -- ═══════════════════════════════════════════════════════════════════════════
  -- app_users dagi department ni o'rnatish (admin uchun)
  -- ═══════════════════════════════════════════════════════════════════════════
  UPDATE public.app_users SET department_id = _dept_id WHERE id = _admin_id;

  RAISE NOTICE '✅ Test foydalanuvchilar yaratildi!';
  RAISE NOTICE '  Super Admin: superadmin@timetable.uz / Test1234!';
  RAISE NOTICE '  Admin:       admin@timetable.uz / Test1234!';
  RAISE NOTICE '  Teacher:     teacher@timetable.uz / Test1234!';
  RAISE NOTICE '  Student:     student@timetable.uz / Test1234!';

END $$;
