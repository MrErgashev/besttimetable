# BestTimetable

Ta'lim muassasalari uchun dars jadvalini yaratish, boshqarish va optimallashtirish tizimi. O'zbek tilida interfeys.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript 5
- **Styling:** Tailwind CSS 4 (PostCSS plugin orqali)
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **State:** Zustand 5 (persist middleware bilan localStorage ga saqlaydi)
- **Drag & Drop:** @dnd-kit (core + sortable + utilities)
- **Validation:** Zod 4
- **Export:** xlsx (Excel), jspdf + jspdf-autotable (PDF)
- **Import:** xlsx (Excel), mammoth (Word .docx)
- **Icons:** lucide-react
- **Theme:** next-themes (dark/light)
- **Dates:** date-fns
- **IDs:** nanoid

## Buyruqlar

```bash
npm run dev      # Development server
npm run build    # Production build (xotira yetmasa: NODE_OPTIONS="--max-old-space-size=8192" npm run build)
npm run start    # Production server
npm run lint     # ESLint
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
      layout.tsx        # Dashboard layout (Sidebar, Topbar, BottomTabBar)
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
    layout.tsx          # Root layout
    globals.css         # Global CSS (Liquid Glass dizayn tizimi)
    providers.tsx       # ThemeProvider va boshqalar
  components/
    layout/             # Sidebar, Topbar, BottomTabBar, MobileHeader, RoleGuard
    timetable/          # TimetableGrid, CellAssignModal, LessonCard
    dashboard/          # QuickStats, AlertsPanel, TeacherWorkloadChart, RoomUtilizationChart, ScheduleHeatmap
    import/             # MasterDataImportWizard, PasteBulkEntry
    crud/               # DataTable (umumiy CRUD jadval, mobil karta + desktop jadval)
    ui/                 # Card, SheetModal, Button, Input, Select, Badge, FAB, SegmentControl, Skeleton, Spinner, ThemeToggle, MeshBackground, GlassCard (re-export), GlassModal (re-export)
  stores/               # Zustand store'lar (barchasi persist bilan)
  hooks/                # useAuth, useHydration, useMediaQuery, useRealtimeSchedule, useRoleAccess, useSpecularLight
  lib/
    types.ts            # Barcha TypeScript tiplar
    constants.ts        # DAYS, TIME_SLOTS, TRACK_LABELS, ROOM_TYPE_LABELS, SUBJECT_COLORS, NAV_ITEMS, ROLE_LABELS, DEFAULT_CONSTRAINTS
    utils.ts            # cn(), formatDate(), truncate()
    supabase/           # client.ts, server.ts, middleware.ts, database.types.ts
    generator/          # Jadval generatsiya algoritmlari
    export/             # excel.ts, pdf.ts
    import/             # excel-parser.ts, word-parser.ts, mapper.ts, column-mapping.ts, master-data-parser.ts, master-data-validator.ts, paste-parser.ts, template-generator.ts
  middleware.ts         # Auth middleware (demo rejimda o'tkazib yuboradi)
supabase/
  migrations/           # SQL migratsiyalar
    001_initial_schema.sql
    002_rls_policies.sql
    003_triggers_and_functions.sql
    004_test_users.sql
  seed.sql              # Namuna ma'lumotlar
```

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

Barcha store'lar `zustand/middleware` dan `persist` ishlatadi — ma'lumotlar localStorage da saqlanadi.

| Store | Fayl | Vazifa |
|-------|------|--------|
| `useTimetableStore` | `stores/useTimetableStore.ts` | Jadval yozuvlari CRUD |
| `useTeacherStore` | `stores/useTeacherStore.ts` | O'qituvchilar |
| `useGroupStore` | `stores/useGroupStore.ts` | Guruhlar |
| `useSubjectStore` | `stores/useSubjectStore.ts` | Fanlar |
| `useRoomStore` | `stores/useRoomStore.ts` | Xonalar |
| `useSubjectLoadStore` | `stores/useSubjectLoadStore.ts` | Fan yuklamalari |
| `useChangelogStore` | `stores/useChangelogStore.ts` | O'zgarishlar tarixi |

## Autentifikatsiya va Rollar

- Supabase Auth (email/password)
- 4 ta rol: `super_admin`, `admin`, `teacher`, `student`
- Middleware: Supabase URL sozlanmagan bo'lsa demo rejimda ishlaydi (auth tekshirmaydi)
- `useAuth()` hook orqali foydalanuvchi konteksti
- `useRoleAccess()` hook — rol asosida navigatsiya filtrlash (demo rejimda super_admin)
- `RoleGuard` komponent — sahifaga kirishni rol bo'yicha cheklaydi
- `NAV_ITEMS` da har bir sahifa uchun `roles` massivi belgilangan
- `ROLE_LABELS` — rollarning o'zbekcha nomlari

## Jadval Generatsiya

`src/lib/generator/` papkasida:

- `greedy.ts` — Greedy algoritm (tez, yetarli natija)
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

## Dashboard Komponentlari

`src/components/dashboard/` papkasida — bosh sahifadagi statistika va grafiklar:

| Komponent | Vazifa |
|-----------|--------|
| `QuickStats` | Jadval to'ldirish foizi, manual/avto hisobi, track taqsimoti |
| `AlertsPanel` | Ziddiyatlar va ogohlantirishlar paneli |
| `TeacherWorkloadChart` | O'qituvchilar ish yuklama grafigi |
| `RoomUtilizationChart` | Xonalar bandlik grafigi |
| `ScheduleHeatmap` | Jadval issiqlik xaritasi (kun × slot) |

## Dizayn Tizimi (iOS 26 Liquid Glass)

Mobile-first PWA dizayn. **Liquid Glass** yondashuvi — shaffof, blur effektli yuzalar, specular highlight, mesh gradient fon.

### Dizayn Konseptsiyasi

- **Glass morphism:** `backdrop-filter: blur()` orqali shaffof kartalar
- **Specular highlight:** Mouse/gyroscope/auto-drift orqali dinamik yorug'lik effekti
- **Mesh gradient:** 5 ta harakatlanuvchi orb bilan fon gradient
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

### Hooks

| Hook | Fayl | Vazifa |
|------|------|--------|
| `useAuth` | `hooks/useAuth.ts` | Foydalanuvchi autentifikatsiya konteksti |
| `useHydration` | `hooks/useHydration.ts` | Zustand hydration holati |
| `useMediaQuery` | `hooks/useMediaQuery.ts` | Responsive breakpoint tekshiruvi |
| `useRealtimeSchedule` | `hooks/useRealtimeSchedule.ts` | Supabase realtime obuna |
| `useRoleAccess` | `hooks/useRoleAccess.ts` | Rol asosida NAV_ITEMS filtrlash, `canAccess()` funksiyasi |
| `useSpecularLight` | `hooks/useSpecularLight.ts` | Mouse/gyroscope/auto-drift orqali `--specular-x/y` boshqarish |

## Muhit O'zgaruvchilari (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
TELEGRAM_BOT_TOKEN=optional
```

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
- Hydration xatoliklarini oldini olish: `useSyncExternalStore` pattern (ThemeToggle'da namuna)
- GlassCard/GlassModal import'lari hali ishlaydi (Card/SheetModal ga re-export)
- Mobil komponentlar: `md:hidden` / `hidden md:flex` / `hidden lg:flex` pattern
- Glass dizayn: `apple-card` klassi, `glass-*` utility klasslar, `press-effect` bosilish effekti
- Accessibility: `prefers-reduced-motion` va `prefers-reduced-transparency` media query'lar qo'llab-quvvatlanadi
- **O'zgartirmaslik kerak:** stores, types, constants, utils, generator, import/export logic, supabase, middleware, tsconfig, postcss

## Testlar

Hozircha test setup yo'q. Yangi test qo'shilsa Jest + React Testing Library tavsiya etiladi.
