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
npm run build    # Production build
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
    layout/           # Sidebar, Topbar
    timetable/        # TimetableGrid, CellAssignModal, LessonCard
    crud/             # DataTable (umumiy CRUD jadval)
    ui/               # Button, Input, Select, Badge, GlassCard, GlassModal, Spinner, ThemeToggle
  stores/             # Zustand store'lar (barchasi persist bilan)
  hooks/              # useAuth, useHydration, useRealtimeSchedule
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

## UI Patterns

- **Glass-morphism dizayn** — `GlassCard`, `GlassModal` komponentlari
- **cn() utility** — Tailwind klasslarini birlashtirish uchun (`@/lib/utils`)
- **Komponentlar:** `Button`, `Input`, `Select`, `Badge`, `Spinner`, `ThemeToggle`
- **DataTable** — Umumiy CRUD jadval komponenti (`components/crud/DataTable.tsx`)
- **Sidebar + Topbar** layout

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

## Testlar

Hozircha test setup yo'q. Yangi test qo'shilsa Jest + React Testing Library tavsiya etiladi.
