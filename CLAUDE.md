# BestTimetable

Ta'lim muassasalari uchun dars jadvalini yaratish, boshqarish va optimallashtirish tizimi. O'zbek tilida interfeys.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript 5
- **Styling:** Tailwind CSS 4 (PostCSS plugin orqali)
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **State:** Zustand 5 (persist middleware bilan localStorage ga saqlaydi)
- **Drag & Drop:** @dnd-kit
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
    (auth)/           # Login/Register sahifalari
    (dashboard)/      # Asosiy sahifalar (layout bilan)
      timetable/      # Jadval ko'rishlar (by-room, by-teacher)
      teachers/       # O'qituvchilar CRUD
      groups/         # Guruhlar CRUD
      subjects/       # Fanlar CRUD
      rooms/          # Xonalar CRUD
      generate/       # Avtomatik jadval generatsiyasi
      import/         # Excel/Word import
      export/         # Excel/PDF eksport
      substitutions/  # O'rinbosar o'qituvchilar
      changelog/      # O'zgarishlar tarixi
      settings/       # Sozlamalar
    layout.tsx        # Root layout
    providers.tsx     # ThemeProvider va boshqalar
  components/
    layout/           # Sidebar, Topbar, BottomTabBar, MobileHeader
    timetable/        # TimetableGrid, CellAssignModal, LessonCard
    crud/             # DataTable (umumiy CRUD jadval, mobil karta + desktop jadval)
    ui/               # Card, SheetModal, Button, Input, Select, Badge, FAB, SegmentControl, Skeleton, Spinner, ThemeToggle, GlassCard (re-export), GlassModal (re-export)
  stores/             # Zustand store'lar (barchasi persist bilan)
  hooks/              # useAuth, useHydration, useMediaQuery, useRealtimeSchedule
  lib/
    types.ts          # Barcha TypeScript tiplar
    constants.ts      # DAYS, TIME_SLOTS, TRACK_LABELS, ROOM_TYPE_LABELS, NAV_ITEMS
    utils.ts          # cn(), formatDate(), truncate()
    supabase/         # client.ts, server.ts, middleware.ts, database.types.ts
    generator/        # Jadval generatsiya algoritmlari
    export/           # excel.ts, pdf.ts
    import/           # excel-parser.ts, word-parser.ts, mapper.ts
  middleware.ts       # Auth middleware (demo rejimda o'tkazib yuboradi)
supabase/
  migrations/         # SQL migratsiyalar (schema, RLS, triggers)
  seed.sql            # Namuna ma'lumotlar
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

## Autentifikatsiya

- Supabase Auth (email/password)
- 4 ta rol: `super_admin`, `admin`, `teacher`, `student`
- Middleware: Supabase URL sozlanmagan bo'lsa demo rejimda ishlaydi (auth tekshirmaydi)
- `useAuth()` hook orqali foydalanuvchi konteksti

## Jadval Generatsiya

`src/lib/generator/` papkasida:

- `greedy.ts` — Greedy algoritm (tez, yetarli natija)
- `backtrack.ts` — Backtracking algoritm (optimallash/ta'mirlash)
- `constraints.ts` — Cheklovlar tekshiruvi (o'qituvchi, xona, guruh ziddiyatlari)
- `index.ts` — Umumiy interfeys

Standart cheklovlar (`DEFAULT_CONSTRAINTS`): max 3 ketma-ket dars, 1 tanaffus, 1-kurs uchun ertalab, tekis taqsimlash.

## Dizayn Tizimi (Apple Design Language)

Mobile-first PWA dizayn. Solid surface'lar, OLED qora dark mode (#000000), #007AFF aksent rang.

### CSS O'zgaruvchilari (globals.css)

Ranglar CSS custom properties orqali boshqariladi (`@theme inline` Tailwind CSS 4 formatida):

| O'zgaruvchi | Light | Dark | Vazifa |
|-------------|-------|------|--------|
| `--color-accent` | #007AFF | #0A84FF | Asosiy aksent (Apple Blue) |
| `--color-danger` | #FF3B30 | #FF453A | Xatolik/o'chirish |
| `--color-success` | #34C759 | #30D158 | Muvaffaqiyat |
| `--color-warning` | #FF9500 | #FF9F0A | Ogohlantirish |
| `--background` | #F5F5F7 | #000000 | Sahifa foni |
| `--surface` | #FFFFFF | #1C1C1E | Karta/panel foni |
| `--surface-secondary` | #F2F2F7 | #2C2C2E | Ichki element foni |
| `--foreground` | #1D1D1F | #F5F5F7 | Asosiy matn |
| `--muted` | #86868B | #98989D | Ikkinchi darajali matn |
| `--border` | #D2D2D7 | #38383A | Chegaralar |

### UI Komponentlar

| Komponent | Fayl | Vazifa |
|-----------|------|--------|
| `Card` | `ui/Card.tsx` | Apple-style karta (rounded-[16px], shadow) |
| `SheetModal` | `ui/SheetModal.tsx` | Bottom sheet (mobil) / modal (desktop) |
| `Button` | `ui/Button.tsx` | Tugma (primary, secondary, ghost, danger) |
| `Input` | `ui/Input.tsx` | Matn kiritish (h-12 mobil, h-10 desktop) |
| `Select` | `ui/Select.tsx` | Tanlash |
| `Badge` | `ui/Badge.tsx` | Status belgi |
| `FAB` | `ui/FAB.tsx` | Floating Action Button (mobil uchun) |
| `SegmentControl` | `ui/SegmentControl.tsx` | iOS-style segment tanlash |
| `Skeleton` | `ui/Skeleton.tsx` | Yuklanish placeholder |
| `Spinner` | `ui/Spinner.tsx` | Yuklanish animatsiya |
| `ThemeToggle` | `ui/ThemeToggle.tsx` | Qorong'u/yorug' rejim |
| `GlassCard` | `ui/GlassCard.tsx` | → `Card` ga re-export (backwards compat) |
| `GlassModal` | `ui/GlassModal.tsx` | → `SheetModal` ga re-export (backwards compat) |

### Layout Komponentlar

| Komponent | Fayl | Ko'rinish |
|-----------|------|-----------|
| `Sidebar` | `layout/Sidebar.tsx` | Desktop (hidden lg:flex) |
| `Topbar` | `layout/Topbar.tsx` | Desktop (hidden md:flex) |
| `BottomTabBar` | `layout/BottomTabBar.tsx` | Mobil (lg:hidden) |
| `MobileHeader` | `layout/MobileHeader.tsx` | Mobil (md:hidden) |

### Responsive Strategiya

- **Mobil (< 768px):** BottomTabBar + MobileHeader, DataTable karta ko'rinishida, TimetableGrid kun tab'lari
- **Planshet (768px–1024px):** Topbar, DataTable jadval, TimetableGrid to'liq jadval
- **Desktop (≥ 1024px):** Sidebar + Topbar, to'liq layout

### Utility Klasslar (globals.css)

- `apple-card` — Karta stili (surface bg, border, rounded-[16px], shadow)
- `apple-card-interactive` — Bosiluvchi karta (hover/active efektlar)
- `cn()` — Tailwind klasslarini birlashtirish (`@/lib/utils`)

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
- Ranglar faqat CSS o'zgaruvchilari orqali: `var(--color-accent)`, `var(--surface)`, va h.k. (hardcoded ranglar ishlatilmasin)
- Tailwind CSS 4: `@theme inline` blokida o'zgaruvchilar, `tailwind.config.ts` fayli YO'Q
- Hydration xatoliklarini oldini olish: `useSyncExternalStore` pattern (ThemeToggle'da namuna)
- GlassCard/GlassModal import'lari hali ishlaydi (Card/SheetModal ga re-export)
- Mobil komponentlar: `md:hidden` / `hidden md:flex` / `hidden lg:flex` pattern
- **O'zgartirmaslik kerak:** stores, types, constants, utils, generator, import/export logic, supabase, middleware, tsconfig, postcss

## Testlar

Hozircha test setup yo'q. Yangi test qo'shilsa Jest + React Testing Library tavsiya etiladi.
