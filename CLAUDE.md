# BestTimetable

Ta'lim muassasalari uchun dars jadvalini yaratish, boshqarish va optimallashtirish tizimi. O'zbek tilida interfeys.

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router) + React 19.2.3 + TypeScript 5.9.3
- **Styling:** Tailwind CSS 4 (PostCSS plugin orqali, `@tailwindcss/postcss`)
- **Database:** Supabase (PostgreSQL + Auth + RLS) — `@supabase/supabase-js` ^2.97.0, `@supabase/ssr` ^0.8.0
- **State:** Zustand 5 (persist middleware bilan localStorage ga saqlaydi)
- **Drag & Drop:** @dnd-kit (core ^6.3.1 + sortable ^10.0.0 + utilities ^3.2.2)
- **Validation:** Zod 4 (`^4.3.6`)
- **Export:** xlsx ^0.18.5 (Excel), jspdf ^4.2.0 + jspdf-autotable ^5.0.7 (PDF)
- **Import:** xlsx (Excel), mammoth ^1.11.0 (Word .docx)
- **Icons:** lucide-react ^0.575.0
- **Theme:** next-themes ^0.4.6 (dark/light)
- **Dates:** date-fns ^4.1.0
- **IDs:** nanoid ^5.1.6
- **Class names:** clsx ^2.1.1

## Buyruqlar

```bash
npm run dev      # Development server
npm run build    # Production build (xotira yetmasa: NODE_OPTIONS="--max-old-space-size=8192" npm run build)
npm run start    # Production server
npm run lint     # ESLint (flat config, ESLint 9+)
```

## Loyiha Tuzilishi

```
src/
  app/
    (auth)/             # Autentifikatsiya
      layout.tsx        # Auth layout
      login/page.tsx    # Kirish sahifasi
      register/page.tsx # Ro'yxatdan o'tish sahifasi
    (dashboard)/        # Asosiy sahifalar (layout bilan)
      layout.tsx        # Dashboard layout (Sidebar, Topbar, BottomTabBar, SupabaseDataProvider, force-dynamic)
      error.tsx         # Dashboard error boundary
      page.tsx          # Bosh sahifa (Dashboard — statistika, grafiklar)
      timetable/        # Jadval ko'rishlar
        page.tsx        # Guruh bo'yicha jadval
        by-room/page.tsx    # Xona bo'yicha jadval
        by-teacher/page.tsx # O'qituvchi bo'yicha jadval
      teachers/page.tsx     # O'qituvchilar CRUD
      groups/page.tsx       # Guruhlar CRUD
      subjects/page.tsx     # Fanlar CRUD
      rooms/page.tsx        # Xonalar CRUD
      generate/page.tsx     # Avtomatik jadval generatsiyasi
      import/page.tsx       # Excel/Word/CSV import
      export/page.tsx       # Excel/PDF eksport
      substitutions/page.tsx # O'rinbosar o'qituvchilar
      users/page.tsx        # Foydalanuvchilar boshqaruvi
      notifications/page.tsx # Bildirishnomalar
      changelog/page.tsx    # O'zgarishlar tarixi
      settings/page.tsx     # Sozlamalar
      demo-data/page.tsx    # Demo ma'lumotlar boshqaruvi (faqat super_admin)
    layout.tsx          # Root layout (lang="uz", PWA metadata)
    error.tsx           # Global error boundary
    not-found.tsx       # 404 sahifa
    globals.css         # Global CSS (Liquid Glass dizayn tizimi, @theme inline)
    providers.tsx       # ThemeProvider + SpecularLightProvider
    fonts/              # Lokal shriftlar
      GeistVF.woff      # Geist variable font
      GeistMonoVF.woff  # Geist Mono variable font
  components/
    layout/             # Sidebar, Topbar, BottomTabBar, MobileHeader, RoleGuard
    timetable/          # TimetableGrid, CellAssignModal, LessonCard
    dashboard/          # QuickStats, AlertsPanel, TeacherWorkloadChart, RoomUtilizationChart, ScheduleHeatmap
    import/             # MasterDataImportWizard, PasteBulkEntry, BulkUserImport
    providers/          # SupabaseDataProvider (Supabase dan ma'lumot yuklash va realtime sync)
    crud/               # DataTable (umumiy CRUD jadval, mobil karta + desktop jadval)
    ui/                 # Card, SheetModal, Button, Input, Select, Badge, FAB, SegmentControl, Skeleton, Spinner, ThemeToggle, MeshBackground, GlassCard (re-export), GlassModal (re-export)
  stores/               # Zustand store'lar (barchasi persist bilan, localStorage key: besttimetable-{entity})
  hooks/                # useAuth, useHydration, useMediaQuery, useRealtimeSchedule, useRoleAccess, useSpecularLight, useFilteredNotifications, useSupabaseData
  lib/
    types.ts            # Barcha TypeScript tiplar
    constants.ts        # DAYS, TIME_SLOTS, TRACK_LABELS, ROOM_TYPE_LABELS, SUBJECT_COLORS, NAV_ITEMS, ROLE_LABELS, DEFAULT_CONSTRAINTS
    utils.ts            # cn(), formatDate(), formatShortDate(), getCurrentWeekRange(), truncate(), getColorByIndex()
    demo-data.ts        # Demo ma'lumotlar generatori
    supabase/           # client.ts, server.ts, middleware.ts, database.types.ts, helpers.ts, sync.ts
    generator/          # Jadval generatsiya algoritmlari
    export/             # excel.ts, pdf.ts
    import/             # excel-parser.ts, word-parser.ts, mapper.ts, column-mapping.ts, master-data-parser.ts, master-data-validator.ts, paste-parser.ts, template-generator.ts
  middleware.ts         # Auth middleware (demo rejimda o'tkazib yuboradi)
scripts/
  create-test-users.mjs # Supabase test foydalanuvchilarni yaratish skripti
supabase/
  migrations/           # SQL migratsiyalar
    001_initial_schema.sql
    002_rls_policies.sql
    003_triggers_and_functions.sql
    004_test_users.sql
  seed.sql              # Namuna ma'lumotlar
public/
  manifest.json         # PWA manifest
  icons/                # icon-192.png, icon-512.png
  images/               # oriental-logo.png, oriental-logo.svg
```

## Konfiguratsiya Fayllari

| Fayl | Vazifa |
|------|--------|
| `next.config.ts` | Next.js config (output: standalone, compress, reactStrictMode, poweredByHeader: false, security headers: X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy) |
| `tsconfig.json` | TypeScript strict mode, `@/*` → `./src/*` path alias, ES2017 target, react-jsx |
| `postcss.config.mjs` | Tailwind CSS 4 via `@tailwindcss/postcss` plugin |
| `eslint.config.mjs` | ESLint 9 flat config — `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript` |
| `package.json` | Node.js loyiha konfiguratsiyasi (v0.1.0) |

## Path Alias

`@/*` → `./src/*` (tsconfig.json da sozlangan)

```typescript
import { cn } from "@/lib/utils";
import type { Teacher } from "@/lib/types";
import { DAYS, TIME_SLOTS } from "@/lib/constants";
```

## Ma'lumotlar Bazasi

15 ta jadval. Asosiy jadvallar:

| Jadval | Vazifa |
|--------|--------|
| `schedule_entries` | **Asosiy jadval** — dars yozuvlari (kun, slot, guruh, fan, o'qituvchi, xona) |
| `teachers` | O'qituvchilar (ism, max haftalik soat) |
| `groups` | Talaba guruhlari (kurs, bo'lim, track) |
| `subjects` | Fanlar (rang, lab talabi) |
| `rooms` | Xonalar (tur, sig'im, bino) |
| `subject_loads` | Fan yuklama — qaysi fan, qaysi guruhga, qaysi o'qituvchi, haftalik soat |
| `teacher_availability` | O'qituvchi mavjudligi (kun + slot) |
| `teacher_subjects` | O'qituvchi-fan ko'pga-ko'p bog'lanishi |
| `time_slots` | Vaqt oraliqari (8 ta slot, 3 ta track bo'yicha) |
| `academic_periods` | Semestrlar (faqat bitta aktiv) |
| `departments` | Bo'limlar |
| `substitutions` | O'rinbosar o'qituvchilar |
| `schedule_changelog` | O'zgarishlar audit logi |
| `notifications` | Bildirishnomalar |
| `app_users` | Foydalanuvchi profillari |

**Muhim cheklovlar:**
- O'qituvchi bir vaqtda ikki joyda bo'la olmaydi (unique index)
- Xona bir vaqtda ikki guruhga berilmaydi (unique index)
- Faqat bitta akademik davr aktiv bo'ladi

**RLS (Row Level Security):**
- Barcha 15 ta jadvalda RLS yoqilgan
- `get_user_role()`, `get_user_department()`, `is_admin()` yordamchi funksiyalar
- Rol asosida select/insert/update/delete huquqlari

## TypeScript Tiplar (`src/lib/types.ts`)

```typescript
type ID = string;
type TrackKey = "kunduzgi" | "sirtqi" | "kechki";
type DayKey = "dushanba" | "seshanba" | "chorshanba" | "payshanba" | "juma";
type RoomType = "oddiy" | "laboratoriya" | "kompyuter_xona" | "majlis_xonasi";
type UserRole = "super_admin" | "admin" | "teacher" | "student";
type GenerationStatus = "idle" | "running" | "complete" | "failed" | "partial";
```

Asosiy interfeyslar: `TimeSlot`, `Department`, `AcademicPeriod`, `Teacher`, `TeacherAvailability`, `Group`, `Subject`, `SubjectLoad`, `Room`, `ScheduleEntry`, `ScheduleChangelog`, `Notification`, `Substitution`, `AppUser`, `ConstraintSet`, `GenerationResult`, `ConflictReport`.

**Muhim:** `ScheduleEntry.group_ids` — `string[]` massivi (bitta dars bir nechta guruhga tegishli bo'lishi mumkin).

## Track Tizimi (Ta'lim shakllari)

```typescript
type TrackKey = "kunduzgi" | "sirtqi" | "kechki";
```

| Track | Vaqt oraliq | Slotlar |
|-------|------------|---------|
| kunduzgi | 08:30 — 13:30 | k1, k2, k3 (1-3 pora) |
| sirtqi | 13:30 — 18:00 | s1, s2, s3 (4-6 pora) |
| kechki | 18:00 — 21:00 | e1, e2 (7-8 pora) |

## Kunlar

```typescript
type DayKey = "dushanba" | "seshanba" | "chorshanba" | "payshanba" | "juma";
```

Dushanba — Juma, 5 kunlik hafta.

## Zustand Store'lar

Barcha store'lar `zustand/middleware` dan `persist` ishlatadi — ma'lumotlar localStorage da saqlanadi. localStorage key formati: `besttimetable-{entity}`.

| Store | Fayl | State | Asosiy metodlar |
|-------|------|-------|-----------------|
| `useTimetableStore` | `stores/useTimetableStore.ts` | `entries: ScheduleEntry[]` | `placeEntry()`, `moveEntry()`, `removeEntry()`, `clearAll()`, `bulkLoad()`, `getCell()`, `getEntriesForGroup()`, `getEntriesForTeacher()`, `getEntriesForRoom()` |
| `useTeacherStore` | `stores/useTeacherStore.ts` | `teachers: Teacher[]` | `addTeacher()`, `addTeachers()`, `updateTeacher()`, `bulkUpdateTeachers()`, `deleteTeacher()`, `deleteTeachers()`, `getTeacherById()`, `bulkLoad()` |
| `useGroupStore` | `stores/useGroupStore.ts` | `groups: Group[]` | `addGroup()`, `addGroups()`, `updateGroup()`, `bulkUpdateGroups()`, `deleteGroup()`, `deleteGroups()`, `getGroupById()`, `bulkLoad()` |
| `useSubjectStore` | `stores/useSubjectStore.ts` | `subjects: Subject[]` | `addSubject()`, `addSubjects()`, `updateSubject()`, `bulkUpdateSubjects()`, `deleteSubject()`, `deleteSubjects()`, `getSubjectById()`, `bulkLoad()` |
| `useRoomStore` | `stores/useRoomStore.ts` | `rooms: Room[]` | `addRoom()`, `addRooms()`, `updateRoom()`, `bulkUpdateRooms()`, `deleteRoom()`, `deleteRooms()`, `getRoomById()`, `bulkLoad()` |
| `useSubjectLoadStore` | `stores/useSubjectLoadStore.ts` | `loads: SubjectLoad[]` | `addLoad()`, `updateLoad()`, `removeLoad()`, `getLoadsForGroup()`, `getLoadsForTeacher()`, `clearAll()`, `bulkLoad()` |
| `useChangelogStore` | `stores/useChangelogStore.ts` | `logs: ScheduleChangelog[]` | `addLog()`, `getLogs()`, `getLogsByEntry()`, `clearAll()`, `bulkLoad()` |

## Autentifikatsiya va Rollar

- Supabase Auth (email/password)
- 4 ta rol: `super_admin`, `admin`, `teacher`, `student`
- Middleware: Supabase URL sozlanmagan bo'lsa demo rejimda ishlaydi (auth tekshirmaydi)
- `useAuth()` hook orqali foydalanuvchi konteksti:
  - `user`, `profile`, `loading`, `error`
  - `signIn()`, `signUp()`, `signOut()` metodlar
  - `isAdmin`, `isSuperAdmin`, `isTeacher`, `isStudent` boolean helper'lar
- `useRoleAccess()` hook — rol asosida navigatsiya filtrlash (demo rejimda super_admin):
  - `role`, `profile`, `loading`
  - `filteredNavItems` — foydalanuvchi roli uchun ko'rinadigan navigatsiya elementlari
  - `canAccess(href)` — berilgan sahifaga kirish mumkinligini tekshiradi
- `RoleGuard` komponent — sahifaga kirishni rol bo'yicha cheklaydi
- `NAV_ITEMS` da har bir sahifa uchun `roles` massivi belgilangan (14 ta navigatsiya elementi)
- `ROLE_LABELS` — rollarning o'zbekcha nomlari

## Jadval Generatsiya

`src/lib/generator/` papkasida:

- `greedy.ts` — Greedy algoritm (tez, yetarli natija). Asosiy funksiya: `generateGreedyWithEntries()`
- `backtrack.ts` — Backtracking algoritm (optimallash/ta'mirlash)
- `constraints.ts` — Cheklovlar tekshiruvi (o'qituvchi, xona, guruh ziddiyatlari)
- `index.ts` — Umumiy interfeys

Standart cheklovlar (`DEFAULT_CONSTRAINTS`): max 3 ketma-ket dars, 1 tanaffus, 1-kurs uchun ertalab, tekis taqsimlash.

## Import Tizimi

`src/lib/import/` papkasida:

| Fayl | Vazifa |
|------|--------|
| `excel-parser.ts` | Excel fayllarni parse qilish |
| `word-parser.ts` | Word (.docx) fayllarni parse qilish |
| `mapper.ts` | Parse qilingan ma'lumotlarni store formatiga moslashtirish |
| `column-mapping.ts` | Ustun nomlari → entity field'lar mapping (EntityType konfiguratsiyasi) |
| `master-data-parser.ts` | Umumiy Excel/CSV parser (ma'lumotnomalar uchun) |
| `master-data-validator.ts` | Import qilinadigan ma'lumotlarni validatsiya qilish |
| `paste-parser.ts` | Clipboard'dan nusxa ko'chirilgan matnni parse qilish |
| `template-generator.ts` | Import uchun namuna Excel shablon yaratish |

Import komponentlari (`src/components/import/`):

| Komponent | Vazifa |
|-----------|--------|
| `MasterDataImportWizard` | Bosqichma-bosqich import wizard (upload → mapping → validate → result) |
| `PasteBulkEntry` | Matn qo'yish orqali ko'plab yozuvlarni import qilish |
| `BulkUserImport` | Ko'plab foydalanuvchilarni matn yoki Excel fayl orqali import qilish (rol va parol bilan) |

## Eksport Tizimi

`src/lib/export/` papkasida:

| Fayl | Vazifa |
|------|--------|
| `excel.ts` | Excel eksport (guruh/o'qituvchi/xona/barchasi bo'yicha) |
| `pdf.ts` | PDF eksport (guruh/o'qituvchi/xona bo'yicha) |

## Dashboard Komponentlari

`src/components/dashboard/` papkasida — bosh sahifadagi statistika va grafiklar:

| Komponent | Vazifa |
|-----------|--------|
| `QuickStats` | Jadval to'ldirish foizi, manual/avto hisobi, track taqsimoti |
| `AlertsPanel` | Ziddiyatlar va ogohlantirishlar paneli |
| `TeacherWorkloadChart` | O'qituvchilar ish yuklama grafigi |
| `RoomUtilizationChart` | Xonalar bandlik grafigi |
| `ScheduleHeatmap` | Jadval issiqlik xaritasi (kun × slot) |

## Utility Funksiyalar (`src/lib/utils.ts`)

| Funksiya | Vazifa |
|----------|--------|
| `cn(...inputs)` | Tailwind class name birlashtirish (clsx asosida) |
| `formatDate(date)` | Sanani o'zbek locale formatida ko'rsatish |
| `formatShortDate(date)` | Sanani DD.MM.YYYY formatida ko'rsatish |
| `getCurrentWeekRange()` | Joriy haftaning Dushanba-Juma oralig'ini qaytarish |
| `truncate(str, maxLength)` | Matnni kerakli uzunlikda kesish (ellipsis bilan) |
| `getColorByIndex(index, palette)` | Palitradagi rang indeksi bo'yicha olish |

## Dizayn Tizimi (iOS 26 Liquid Glass)

Mobile-first PWA dizayn. **Liquid Glass** yondashuvi — shaffof, blur effektli yuzalar, specular highlight, mesh gradient fon.

### Dizayn Konseptsiyasi

- **Glass morphism:** `backdrop-filter: blur()` orqali shaffof kartalar
- **Specular highlight:** Mouse/gyroscope/auto-drift orqali dinamik yorug'lik effekti
- **Mesh gradient:** 5 ta harakatlanuvchi orb bilan fon gradient (parallax effekt)
- **Spring physics:** iOS-style elastik animatsiyalar
- **OLED qora:** Dark mode da `#000000` fon
- **Aksent rang:** `#007AFF` (Apple Blue)

### CSS O'zgaruvchilari (globals.css)

Ranglar va glass token'lar CSS custom properties orqali boshqariladi (`@theme inline` Tailwind CSS 4 formatida):

**Asosiy ranglar:**

| O'zgaruvchi | Light | Dark | Vazifa |
|-------------|-------|------|--------|
| `--color-accent` | #007AFF | #0A84FF | Asosiy aksent (Apple Blue) |
| `--color-accent-hover` | #0056CC | #409CFF | Aksent hover holati |
| `--color-accent-light` | #4DA3FF | #64B5F6 | Ochiq aksent |
| `--color-danger` | #FF3B30 | #FF453A | Xatolik/o'chirish |
| `--color-success` | #34C759 | #30D158 | Muvaffaqiyat |
| `--color-warning` | #FF9500 | #FF9F0A | Ogohlantirish |
| `--background` | #F5F5F7 | #000000 | Sahifa foni |
| `--foreground` | #1D1D1F | #F5F5F7 | Asosiy matn |
| `--muted` | #86868B | #98989D | Ikkinchi darajali matn |
| `--muted-light` | #AEAEB2 | #636366 | Uchinchi darajali matn |

**Glass yuzalar:**

| O'zgaruvchi | Light | Dark | Vazifa |
|-------------|-------|------|--------|
| `--surface` | rgba(255,255,255,0.55) | rgba(44,44,46,0.55) | Asosiy glass yuza |
| `--surface-hover` | rgba(255,255,255,0.7) | rgba(58,58,60,0.6) | Hover holati |
| `--surface-solid` | #FFFFFF | #1C1C1E | Opaque yuza (fallback) |
| `--surface-secondary` | rgba(242,242,247,0.6) | rgba(44,44,46,0.4) | Ichki element foni |
| `--border` | rgba(255,255,255,0.3) | rgba(255,255,255,0.12) | Glass chegaralar |
| `--border-strong` | rgba(0,0,0,0.08) | rgba(255,255,255,0.2) | Kuchli chegara |
| `--glass-bg` | rgba(255,255,255,0.55) | rgba(60,60,67,0.35) | Glass fon |
| `--glass-bg-heavy` | rgba(255,255,255,0.72) | rgba(60,60,67,0.55) | Qalinroq glass |
| `--glass-bg-ultra` | rgba(255,255,255,0.78) | rgba(60,60,67,0.7) | Eng qalin glass |
| `--glass-border` | rgba(255,255,255,0.6) | rgba(255,255,255,0.15) | Glass chegara |
| `--glass-blur` | 20px | 20px | Standart blur |
| `--glass-blur-heavy` | 40px | 40px | Kuchli blur |

**Shadow va radius token'lar:**

| O'zgaruvchi | Vazifa |
|-------------|--------|
| `--shadow-sm` / `--shadow` / `--shadow-lg` / `--shadow-xl` | 4 darajali soya |
| `--radius-sm` (10px) / `--radius` (14px) / `--radius-lg` (20px) / `--radius-xl` (24px) | 4 darajali radius |

**Animatsiya token'lar:**

| O'zgaruvchi | Vazifa |
|-------------|--------|
| `--spring-bounce` | Elastic qaytish (overshoot) |
| `--spring-smooth` | Silliq spring |
| `--spring-snappy` | Tez spring |
| `--spring-gentle` | Sekin spring |
| `--spring-material` | Material design spring |
| `--spring-elastic` | Kuchli elastic |
| `--duration-fast` (200ms) | Tez animatsiya |
| `--duration-normal` (350ms) | Standart animatsiya |
| `--duration-slow` (500ms) | Sekin animatsiya |
| `--duration-sheet` (450ms) | Sheet modal animatsiya |

**Specular va Mesh:**

| O'zgaruvchi | Vazifa |
|-------------|--------|
| `--specular-x` / `--specular-y` | JS tomonidan yangilanadigan yorug'lik pozitsiyasi |
| `--specular-gradient` | Dinamik radial gradient (yorug'lik effekti) |
| `--mesh-orb-1..5` | Fon mesh gradient orb ranglari |

### UI Komponentlar

| Komponent | Fayl | Vazifa |
|-----------|------|--------|
| `Card` | `ui/Card.tsx` | Liquid Glass karta (apple-card stili) |
| `SheetModal` | `ui/SheetModal.tsx` | Bottom sheet (mobil) / modal (desktop) |
| `Button` | `ui/Button.tsx` | Tugma (primary, secondary, ghost, danger) |
| `Input` | `ui/Input.tsx` | Matn kiritish (h-12 mobil, h-10 desktop) |
| `Select` | `ui/Select.tsx` | Tanlash |
| `Badge` | `ui/Badge.tsx` | Status belgi |
| `FAB` | `ui/FAB.tsx` | Floating Action Button (mobil uchun) |
| `SegmentControl` | `ui/SegmentControl.tsx` | iOS-style segment tanlash |
| `Skeleton` | `ui/Skeleton.tsx` | Yuklanish placeholder (glass shimmer) |
| `Spinner` | `ui/Spinner.tsx` | Yuklanish animatsiya |
| `ThemeToggle` | `ui/ThemeToggle.tsx` | Qorong'u/yorug' rejim |
| `MeshBackground` | `ui/MeshBackground.tsx` | Dinamik mesh gradient fon (5 ta orb + parallax) |
| `GlassCard` | `ui/GlassCard.tsx` | → `Card` ga re-export (backwards compat) |
| `GlassModal` | `ui/GlassModal.tsx` | → `SheetModal` ga re-export (backwards compat) |

### Timetable Komponentlari

| Komponent | Fayl | Vazifa |
|-----------|------|--------|
| `TimetableGrid` | `timetable/TimetableGrid.tsx` | Drag-drop jadval to'ri (kun × slot) |
| `CellAssignModal` | `timetable/CellAssignModal.tsx` | Katakchaga dars biriktirish modali |
| `LessonCard` | `timetable/LessonCard.tsx` | Alohida dars kartasi (drag qilinadigan) |

### Layout Komponentlar

| Komponent | Fayl | Ko'rinish |
|-----------|------|-----------|
| `Sidebar` | `layout/Sidebar.tsx` | Desktop (hidden lg:flex) |
| `Topbar` | `layout/Topbar.tsx` | Desktop (hidden md:flex) |
| `BottomTabBar` | `layout/BottomTabBar.tsx` | Mobil (lg:hidden) |
| `MobileHeader` | `layout/MobileHeader.tsx` | Mobil (md:hidden) |
| `RoleGuard` | `layout/RoleGuard.tsx` | Rol asosida sahifaga kirishni cheklaydi |

### Responsive Strategiya

- **Mobil (< 768px):** BottomTabBar + MobileHeader, DataTable karta ko'rinishida, TimetableGrid kun tab'lari
- **Planshet (768px–1024px):** Topbar, DataTable jadval, TimetableGrid to'liq jadval
- **Desktop (≥ 1024px):** Sidebar + Topbar, to'liq layout

### Utility Klasslar (globals.css)

| Klass | Vazifa |
|-------|--------|
| `apple-card` | Glass karta (backdrop-blur, specular highlight, shadow) |
| `glass-primary` | Qalin glass yuza (`--glass-bg-heavy`, blur 40px) |
| `glass-secondary` | Standart glass yuza (`--glass-bg`, blur 20px) |
| `glass-tertiary` | Ultra glass yuza (`--glass-bg-ultra`, blur 40px) |
| `glass-specular` | Specular highlight effekt (::before pseudo-element) |
| `press-effect` | iOS-style bosish effekti (scale 0.96 + spring qaytish) |
| `safe-top` / `safe-bottom` | Safe area padding (notch/home indicator) |
| `mesh-container` / `mesh-orb` | Mesh gradient fon tizimi |
| `gpu-accelerated` | GPU compositing (`translate3d`, `backface-visibility`) |
| `skeleton` | Glass shimmer loading animatsiya |

### Animatsiyalar

- `spring-up` — Spring physics bilan pastdan chiqish
- `fade-in` — Oddiy paydo bo'lish
- `slide-up` — Silliq ko'tarilish
- `glass-appear` — Glass karta paydo bo'lish (scale + blur)
- `glass-shimmer` — Skeleton shimmer effekt
- `float-up` — Suzib chiqish
- `stagger-fade` — Ketma-ket paydo bo'lish
- `orbFloat1..5` — Mesh orb harakatlari
- `orbBreathe` — Mesh orb nafas olish

### Maxsus Media Query'lar

- `prefers-reduced-motion: reduce` — Barcha animatsiyalar o'chiriladi, mesh orb'lar to'xtaydi
- `prefers-reduced-transparency: reduce` — Glass effektlar o'chiriladi, solid yuzalar ishlatiladi, mesh fon yashiriladi

### PWA

- `public/manifest.json` — PWA manifest (standalone, #007AFF theme)
- `public/icons/icon-192.png`, `icon-512.png` — Ilova ikonkalari
- Viewport: `viewport-fit=cover`, `user-scalable=no`
- Safe area: `env(safe-area-inset-*)` CSS o'zgaruvchilari
- Apple Web App: capable, default status bar style

### Hooks

| Hook | Fayl | Qaytarish turi |
|------|------|----------------|
| `useAuth` | `hooks/useAuth.ts` | `{ user, profile, loading, error, signIn(), signUp(), signOut(), isAdmin, isSuperAdmin, isTeacher, isStudent }` |
| `useHydration` | `hooks/useHydration.ts` | `boolean` — Zustand hydration holati (`useSyncExternalStore` pattern) |
| `useMediaQuery` | `hooks/useMediaQuery.ts` | `boolean` — Responsive breakpoint tekshiruvi (`useSyncExternalStore` pattern) |
| `useRealtimeSchedule` | `hooks/useRealtimeSchedule.ts` | `void` — Supabase realtime obuna (side-effect, schedule o'zgarishlarida store'larni yangilaydi) |
| `useRoleAccess` | `hooks/useRoleAccess.ts` | `{ role, profile, loading, filteredNavItems, canAccess(href) }` |
| `useSpecularLight` | `hooks/useSpecularLight.ts` | `void` — Mouse/gyroscope/auto-drift orqali `--specular-x/y` CSS o'zgaruvchilarini boshqarish |
| `useFilteredNotifications` | `hooks/useFilteredNotifications.ts` | `{ logs, readIds, unreadCount, markAsRead(id), markAllAsRead(ids), role }` — Rol asosida bildirishnomalarni filtrlash |
| `useSupabaseData` | `hooks/useSupabaseData.ts` | `{ loading, error }` — Supabase dan barcha ma'lumotlarni yuklash va realtime subscription (Dashboard layout da ishlatiladi) |

## Providers (`src/app/providers.tsx`)

```typescript
<ThemeProvider attribute="class" defaultTheme="light" enableSystem>
  <SpecularLightProvider>
    {children}
  </SpecularLightProvider>
</ThemeProvider>
```

- **ThemeProvider** — `class` atributi orqali dark mode (next-themes), standart tema: `light`
- **SpecularLightProvider** — `useSpecularLight()` hook ni faollashtiradi

### SupabaseDataProvider (`src/components/providers/SupabaseDataProvider.tsx`)

Dashboard layout da ishlatiladi. `useSupabaseData()` hook orqali:
1. Supabase sozlangan bo'lsa — barcha jadvallardan (teachers, groups, subjects, rooms, subject_loads, schedule_entries, schedule_changelog) ma'lumotlarni yuklaydi
2. Realtime subscription orqali o'zgarishlarni kuzatadi va Zustand store'larni yangilaydi
3. Supabase sozlanmagan bo'lsa — hech narsa qilmaydi (demo rejim, localStorage dan yuklaydi)

## Supabase Sync Layer (`src/lib/supabase/sync.ts`)

Barcha entity jadvallar uchun CRUD service. Store'lar optimistic update qiladi, keyin sync service orqali Supabase ga yozadi.

| Service | Jadval | Metodlar |
|---------|--------|----------|
| `teacherSync` | `teachers` | `fetchAll()`, `insert()`, `bulkInsert()`, `update()`, `remove()`, `removeMany()` |
| `groupSync` | `groups` | `fetchAll()`, `insert()`, `bulkInsert()`, `update()`, `remove()`, `removeMany()` |
| `subjectSync` | `subjects` | `fetchAll()`, `insert()`, `bulkInsert()`, `update()`, `remove()`, `removeMany()` |
| `roomSync` | `rooms` | `fetchAll()`, `insert()`, `bulkInsert()`, `update()`, `remove()`, `removeMany()` |
| `subjectLoadSync` | `subject_loads` | `fetchAll()`, `insert()`, `update()`, `remove()` |
| `scheduleSync` | `schedule_entries` | `fetchAll()`, `insert()`, `bulkInsert()`, `update()`, `remove()`, `removeAll()` |
| `changelogSync` | `schedule_changelog` | `fetchAll()`, `insert()`, `removeAll()` |

### Supabase Helper (`src/lib/supabase/helpers.ts`)

| Funksiya | Vazifa |
|----------|--------|
| `isSupabaseConfigured()` | `NEXT_PUBLIC_SUPABASE_URL` sozlanganligini tekshiradi (demo rejim aniqlash uchun) |

## Middleware (`src/middleware.ts`)

- `NEXT_PUBLIC_SUPABASE_URL` sozlanmagan bo'lsa → **demo rejim** (auth tekshirmaydi)
- Aks holda → `updateSession()` orqali session yangilash va yo'naltirish:
  - Autentifikatsiya qilinmagan → `/login` ga yo'naltirish
  - Autentifikatsiya qilingan + `/login` yoki `/register` → `/` ga yo'naltirish
- Matcher: Barcha yo'llar (static asset'lardan tashqari)

## Muhit O'zgaruvchilari (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
TELEGRAM_BOT_TOKEN=optional
```

Agar `NEXT_PUBLIC_SUPABASE_URL` sozlanmagan bo'lsa, ilova **demo rejimda** ishlaydi — barcha auth tekshiruvlari o'tkazib yuboriladi va rol `super_admin` sifatida belgilanadi.

## Xatolarni Boshqarish

- `src/app/error.tsx` — Global error boundary (barcha sahifalar uchun)
- `src/app/(dashboard)/error.tsx` — Dashboard guruhiga xos error boundary
- `src/app/not-found.tsx` — 404 sahifa

## Demo Ma'lumotlar

- `src/lib/demo-data.ts` — Demo ma'lumotlar generatori
- `src/app/(dashboard)/demo-data/page.tsx` — Demo ma'lumotlar boshqaruv sahifasi (faqat `super_admin` roli uchun)
- `scripts/create-test-users.mjs` — Supabase da test foydalanuvchilarni yaratish skripti

## O'zgarishlarni Qaytarish (Rollback)

Har bir o'zgarish git commit orqali saqlanadi. Qaytarish uchun kodni qaytadan yozish MUMKIN EMAS — faqat git buyruqlari ishlatiladi.

**Tartib:**

1. **O'zgarish kiritishdan OLDIN** — avval joriy holatni commit qilish (checkpoint):
   ```bash
   git add <o'zgargan_fayllar> && git commit -m "checkpoint: <tavsif>"
   ```

2. **O'zgarish kiritgandan KEYIN** — yangi commit:
   ```bash
   git add <o'zgargan_fayllar> && git commit -m "<o'zgarish tavsifi>"
   ```

3. **Qaytarish kerak bo'lsa** — `git revert` bitta buyruq bilan:
   ```bash
   # Oxirgi commitni qaytarish:
   git revert HEAD --no-edit

   # Aniq bir commitni qaytarish:
   git revert <commit-hash> --no-edit

   # Bir nechta commitni qaytarish:
   git revert <eski_commit>..<yangi_commit> --no-edit
   ```

**Qoidalar:**
- Kodni qaytadan yozib qaytarish **TAQIQLANADI**
- Har doim `git revert` ishlatish **MAJBURIY**
- Har bir mustaqil o'zgarish alohida commitda bo'lishi kerak (kichik commitlar = oson qaytarish)
- Foydalanuvchi "orqaga qaytar" desa → `git log` bilan oxirgi commitlarni ko'rsatish → `git revert` bilan qaytarish

## Kod Yozish Qoidalari

- TypeScript strict mode yoqilgan
- Barcha tiplar `src/lib/types.ts` da markazlashgan
- Konstantalar `src/lib/constants.ts` da
- Import yo'llari `@/` prefiksi bilan
- Sahifalar Next.js App Router formatida (page.tsx)
- Supabase client: brauzer uchun `@/lib/supabase/client.ts`, server uchun `@/lib/supabase/server.ts`
- Interfeys tili: o'zbek (labellar, xabarlar)
- ID generatsiya: nanoid
- Xona turlari: `oddiy`, `laboratoriya`, `kompyuter_xona`, `majlis_xonasi`
- Ranglar faqat CSS o'zgaruvchilari orqali: `var(--color-accent)`, `var(--surface)`, `var(--glass-bg)` va h.k. (hardcoded ranglar ishlatilmasin)
- Tailwind CSS 4: `@theme inline` blokida o'zgaruvchilar, `tailwind.config.ts` fayli YO'Q
- Hydration xatoliklarini oldini olish: `useSyncExternalStore` pattern (`useHydration` va `useMediaQuery` da ishlatiladi)
- GlassCard/GlassModal import'lari hali ishlaydi (Card/SheetModal ga re-export)
- Mobil komponentlar: `md:hidden` / `hidden md:flex` / `hidden lg:flex` pattern
- Glass dizayn: `apple-card` klassi, `glass-*` utility klasslar, `press-effect` bosilish effekti
- Accessibility: `prefers-reduced-motion` va `prefers-reduced-transparency` media query'lar qo'llab-quvvatlanadi
- ESLint: flat config format (ESLint 9+), `eslint-config-next/core-web-vitals` + `typescript`
- Barcha komponentlar `"use client"` direktivasi bilan (client-side rendering)
- Dashboard layout `export const dynamic = "force-dynamic"` — build vaqtida Supabase env yo'q bo'lganda statik prerender xatoligini oldini oladi
- Supabase sync: CRUD operatsiyalar uchun `src/lib/supabase/sync.ts` ishlatiladi; `isSupabaseConfigured()` bilan demo rejim aniqlash
- **O'zgartirmaslik kerak:** stores, types, constants, utils, generator, import/export logic, supabase, middleware, tsconfig, postcss

## CI/CD va Deploy

Hozircha CI/CD konfiguratsiyasi yo'q. `next.config.ts` da `output: "standalone"` sozlangan — Docker yoki standalone deploy uchun tayyor. Vercel'da ham avtomatik tanib olinadi (Next.js 16).

## Testlar

Hozircha test setup yo'q. Yangi test qo'shilsa Jest + React Testing Library tavsiya etiladi.
