# BestTimetable — Product Requirements Document (PRD)

**Versiya:** 1.0
**Sana:** 2026-02-22
**Muallif:** BestTimetable jamoasi
**Holat:** Faol rivojlantirilmoqda (v0.1.0)

---

## 1. Mahsulot Haqida Umumiy Ma'lumot

### 1.1 Mahsulot Nomi
**BestTimetable** — Ta'lim muassasalari uchun dars jadvalini yaratish, boshqarish va optimallashtirish tizimi.

### 1.2 Muammo
O'zbekistondagi ta'lim muassasalarida dars jadvali yaratish jarayoni quyidagi muammolarga duch keladi:

- **Qo'lda yaratish murakkabligi:** O'qituvchilar, xonalar, guruhlar va fanlar o'rtasidagi ziddiyatlarni qo'lda tekshirish juda ko'p vaqt talab qiladi
- **Resurs ziddiyatlari:** Bitta o'qituvchi yoki xona bir vaqtda ikki joyga tayinlanishi kabi xatoliklar tez-tez uchraydi
- **O'zgarishlarni boshqarish:** Semestr davomida o'rinbosar tayinlash, xona almashtirishlar kabi tez-tez o'zgartirish kerak bo'ladi
- **Shaffoflik yo'qligi:** O'qituvchilar va talabalar jadval o'zgarishlaridan xabardor bo'lmaydi
- **Ma'lumot tarqoqligi:** Jadval ma'lumotlari turli Excel fayllarda saqlanadi, markazlashgan tizim yo'q
- **Mobil qulay emasligi:** Mavjud yechimlar faqat desktop uchun mo'ljallangan

### 1.3 Yechim
BestTimetable — bu **web-asosli PWA** (Progressive Web App) bo'lib, quyidagi imkoniyatlarni taqdim etadi:

- Avtomatik jadval generatsiyasi (ziddiyatsiz)
- Drag-and-drop orqali qo'lda tahrirlash
- Real-time sinxronizatsiya (barcha foydalanuvchilar bir xil ma'lumot ko'radi)
- Mobil-qulay interfeys (iOS 26 Liquid Glass dizayn)
- Excel/PDF eksport va Excel/Word/CSV import
- Rol asosida kirish huquqlari (admin, o'qituvchi, talaba)
- O'rinbosar o'qituvchilar boshqaruvi
- O'zgarishlar tarixi va audit logi

### 1.4 Maqsadli Foydalanuvchilar

| Foydalanuvchi | Tavsif | Asosiy Ehtiyoj |
|---------------|--------|----------------|
| **Super Admin** | Tizim ma'muri | To'liq boshqaruv, foydalanuvchilar yaratish, barcha ma'lumotlarga kirish |
| **Admin** | Bo'lim boshlig'i / O'quv bo'limi xodimi | Jadval yaratish, tahrirlash, eksport, o'rinbosar tayinlash |
| **O'qituvchi** | Dars beruvchi professor/o'qituvchi | O'z jadvalini ko'rish, mavjudlikni belgilash, bildirishnomalar olish |
| **Talaba** | O'qiyotgan talaba | O'z guruhining jadvalini ko'rish |

### 1.5 Muvaffaqiyat Mezonlari

| Mezon | Maqsad |
|-------|--------|
| Jadval yaratish vaqti | Qo'lda 2–3 kundan → avtomatik 5 daqiqaga |
| Ziddiyatlar soni | 0 ta (avtomatik generatsiyada) |
| Foydalanuvchi qoniqishi | O'qituvchilar jadvalga 1 daqiqada kirishi |
| Mobil foydalanish | 60%+ trafik mobil qurilmalardan |
| Ma'lumot aniqligi | 100% sinxronizatsiya (real-time) |

---

## 2. Funksional Talablar

### 2.1 Autentifikatsiya va Avtorizatsiya

**FR-AUTH-01: Foydalanuvchi ro'yxatdan o'tishi**
- Email va parol orqali ro'yxatdan o'tish
- Supabase Auth integratsiyasi
- Yangi foydalanuvchiga standart rol tayinlash

**FR-AUTH-02: Tizimga kirish**
- Email/parol orqali kirish
- Session boshqaruvi (JWT token, cookie-based)
- "Meni eslab qol" funksiyasi

**FR-AUTH-03: Rol asosida kirish huquqlari**

| Sahifa | Super Admin | Admin | O'qituvchi | Talaba |
|--------|:-----------:|:-----:|:----------:|:------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Jadval ko'rish | ✅ | ✅ | ✅ | ✅ |
| Jadval tahrirlash | ✅ | ✅ | ❌ | ❌ |
| O'qituvchilar CRUD | ✅ | ✅ | ❌ | ❌ |
| Guruhlar CRUD | ✅ | ✅ | ❌ | ❌ |
| Fanlar CRUD | ✅ | ✅ | ❌ | ❌ |
| Xonalar CRUD | ✅ | ✅ | ❌ | ❌ |
| Avtomatik generatsiya | ✅ | ✅ | ❌ | ❌ |
| Import/Eksport | ✅ | ✅ | ❌ | ❌ |
| O'rinbosarlar | ✅ | ✅ | ❌ | ❌ |
| Foydalanuvchilar | ✅ | ❌ | ❌ | ❌ |
| Sozlamalar | ✅ | ✅ | ✅ | ✅ |
| Demo ma'lumotlar | ✅ | ❌ | ❌ | ❌ |

**FR-AUTH-04: Demo rejim**
- Supabase sozlanmagan holda ilova to'liq ishlaydi
- Demo rejimda rol: `super_admin`
- Ma'lumotlar localStorage da saqlanadi

### 2.2 Ma'lumotnomalar (Master Data) Boshqaruvi

**FR-MD-01: O'qituvchilar**
- CRUD operatsiyalar (yaratish, o'qish, yangilash, o'chirish)
- Maydonlar: ism, maksimal haftalik soat, bo'lim, fanlar ro'yxati
- Ko'plab o'qituvchilarni bir vaqtda import qilish (Excel/matn)
- Ko'plab o'qituvchilarni bir vaqtda tahrirlash va o'chirish

**FR-MD-02: Guruhlar**
- CRUD operatsiyalar
- Maydonlar: nomi, kurs raqami, bo'lim, track (kunduzgi/sirtqi/kechki), talabalar soni
- Track bo'yicha filtrlash

**FR-MD-03: Fanlar**
- CRUD operatsiyalar
- Maydonlar: nomi, rang (vizual farqlash uchun), laboratoriya talabi (ha/yo'q)
- 20+ ta standart rang palitrasidan tanlash

**FR-MD-04: Xonalar**
- CRUD operatsiyalar
- Maydonlar: nomi, turi (oddiy/laboratoriya/kompyuter xona/majlis xonasi), sig'im, bino, qavat
- Xona turi bo'yicha filtrlash

**FR-MD-05: Fan yuklamalari (Subject Loads)**
- Qaysi fan, qaysi guruhga, qaysi o'qituvchi tomonidan, haftada necha soat
- Jadval generatsiyasi uchun asosiy kirish ma'lumoti

**FR-MD-06: O'qituvchi mavjudligi**
- Har bir o'qituvchi uchun kun va slot bo'yicha mavjudlik belgilash
- Generatsiya algoritmida hisobga olish

**FR-MD-07: Umumiy DataTable komponenti**
- Desktop: klassik jadval ko'rinishi
- Mobil: karta ko'rinishi (responsive)
- Qidiruv, filtrlash, ko'plab tanlash
- Ko'plab elementni bir vaqtda o'chirish

### 2.3 Dars Jadvali

**FR-TT-01: Jadval tuzilishi**

| Parametr | Qiymat |
|----------|--------|
| Kunlar | Dushanba — Juma (5 kun) |
| Track'lar | Kunduzgi (3 slot), Sirtqi (3 slot), Kechki (2 slot) |
| Jami slotlar | 8 ta (kuniga) |
| Jadval katagi | Kun × Slot × Guruh/O'qituvchi/Xona |

**Vaqt oraliqari:**

| # | Track | Slot ID | Vaqt |
|---|-------|---------|------|
| 1 | Kunduzgi | k1 | 08:30 — 10:00 |
| 2 | Kunduzgi | k2 | 10:00 — 11:30 |
| 3 | Kunduzgi | k3 | 11:30 — 13:00 |
| 4 | Sirtqi | s1 | 13:30 — 15:00 |
| 5 | Sirtqi | s2 | 15:00 — 16:30 |
| 6 | Sirtqi | s3 | 16:30 — 18:00 |
| 7 | Kechki | e1 | 18:00 — 19:30 |
| 8 | Kechki | e2 | 19:30 — 21:00 |

**FR-TT-02: Jadval ko'rish rejimlari**
- **Guruh bo'yicha:** Bitta guruhning haftalik jadvali (asosiy ko'rinish)
- **O'qituvchi bo'yicha:** Bitta o'qituvchining haftalik jadvali
- **Xona bo'yicha:** Bitta xonaning haftalik bandlik jadvali

**FR-TT-03: Qo'lda dars joylashtirish**
- Drag-and-drop orqali darsni bir katakdan boshqasiga ko'chirish
- Katakchani bosib yangi dars qo'shish (modal orqali fan, o'qituvchi, xona tanlash)
- Darsni o'chirish

**FR-TT-04: Ziddiyat tekshiruvi**
- O'qituvchi ziddiyati: bir o'qituvchi bir vaqtda ikki joyda bo'la olmaydi
- Xona ziddiyati: bir xona bir vaqtda ikki guruhga berilmaydi
- Guruh ziddiyati: bir guruh bir vaqtda ikki darsda bo'la olmaydi
- Real-time ogohlantirish (ziddiyat aniqlanganda darhol ko'rsatish)

**FR-TT-05: Bir dars — ko'p guruh**
- Bitta dars yozuvi bir nechta guruhga tegishli bo'lishi mumkin (`group_ids: string[]`)
- Oqim darslar yoki birlashtirilgan ma'ruzalar uchun

### 2.4 Avtomatik Jadval Generatsiyasi

**FR-GEN-01: Greedy algoritm**
- Fan yuklamalari asosida jadval yaratish
- Cheklovlarni hisobga olish (ziddiyatlar, o'qituvchi mavjudligi, xona sig'imi)
- Tez ishlash (bir necha soniya ichida)

**FR-GEN-02: Backtracking algoritm**
- Greedy natijasini optimallashtirish
- Muammoli joylarni qayta taqsimlash
- Yaxshiroq natija, lekin ko'proq vaqt talab qiladi

**FR-GEN-03: Cheklovlar (Constraints)**

| Cheklov | Standart qiymat | Tavsif |
|---------|-----------------|--------|
| Maksimal ketma-ket dars | 3 | O'qituvchi uchun ketma-ket darslar soni |
| Minimal tanaffus | 1 slot | Ketma-ket darslar orasida majburiy tanaffus |
| 1-kurs ertalab | Ha | 1-kurs guruhlari uchun ertalabki slotlar afzal |
| Tekis taqsimlash | Ha | Darslar kunlar bo'yicha teng taqsimlanadi |

**FR-GEN-04: Generatsiya holatlari**
- `idle` — Hali boshlanmagan
- `running` — Jarayonda
- `complete` — Muvaffaqiyatli tugatildi
- `failed` — Xatolik yuz berdi
- `partial` — Qisman natija (ba'zi darslar joylashtirilmadi)

**FR-GEN-05: Ziddiyat hisoboti**
- Generatsiya tugagandan keyin batafsil hisobot
- Joylashtirilmagan darslar ro'yxati va sabablari
- Takliflar (masalan: "3A guruhiga qo'shimcha xona kerak")

### 2.5 Import Tizimi

**FR-IMP-01: Excel import**
- `.xlsx` va `.xls` fayl formatlari
- Ustun mapping wizard (foydalanuvchi ustunlarni moslashtiradi)
- O'qituvchilar, guruhlar, fanlar, xonalar — har birini alohida import

**FR-IMP-02: Word import**
- `.docx` fayl formati (mammoth kutubxonasi)
- Jadval formatidagi ma'lumotlarni parse qilish

**FR-IMP-03: CSV/Matn import**
- Clipboard'dan nusxa ko'chirish (paste)
- Tab yoki vergul bilan ajratilgan ma'lumotlar
- Ko'plab foydalanuvchilarni matn orqali import (BulkUserImport)

**FR-IMP-04: Import wizard**
- 4 bosqich: Fayl yuklash → Ustun moslashtirish → Validatsiya → Natija
- Xatoliklar va ogohlantirishlar ko'rsatish
- Dublikat tekshiruvi

**FR-IMP-05: Shablon generatsiya**
- Har bir entity turi uchun namuna Excel shablon yaratish
- Foydalanuvchi shablonni to'ldirib qayta import qiladi

### 2.6 Eksport Tizimi

**FR-EXP-01: Excel eksport**
- Guruh bo'yicha jadval
- O'qituvchi bo'yicha jadval
- Xona bo'yicha jadval
- Barcha jadvallar bitta faylda (ko'p varaqlı)

**FR-EXP-02: PDF eksport**
- Guruh bo'yicha jadval
- O'qituvchi bo'yicha jadval
- Xona bo'yicha jadval
- Professional formatda, chop etishga tayyor

### 2.7 O'rinbosar O'qituvchilar

**FR-SUB-01: O'rinbosar tayinlash**
- Asosiy o'qituvchi o'rniga vaqtinchalik o'rinbosar tayinlash
- Sana oralig'i belgilash
- Sabab yozish

**FR-SUB-02: Ziddiyat tekshiruvi**
- O'rinbosar o'qituvchining o'sha vaqtda band emasligini tekshirish

### 2.8 Bildirishnomalar

**FR-NOT-01: Bildirishnoma turlari**
- Jadval o'zgarishi
- O'rinbosar tayinlanishi
- Tizim xabarlari

**FR-NOT-02: Rol asosida filtrlash**
- O'qituvchi faqat o'ziga tegishli bildirishnomalarni ko'radi
- Admin barcha bildirishnomalarni ko'radi

**FR-NOT-03: O'qilgan/O'qilmagan holat**
- O'qilmagan bildirishnomalar soni ko'rsatish
- Barchasini o'qilgan deb belgilash

### 2.9 O'zgarishlar Tarixi (Changelog)

**FR-LOG-01: Audit log**
- Har bir jadval o'zgarishi qayd etiladi
- Kim, qachon, nima o'zgartirdi
- Eski va yangi qiymatlar

**FR-LOG-02: Tarix ko'rish**
- Vaqt bo'yicha tartiblangan ro'yxat
- Filtrlash (o'qituvchi, guruh, sana bo'yicha)

### 2.10 Dashboard

**FR-DASH-01: Tezkor statistika (QuickStats)**
- Jadval to'ldirilganlik foizi
- Qo'lda va avtomatik joylashtirilgan darslar soni
- Track bo'yicha taqsimot

**FR-DASH-02: Ogohlantirishlar paneli (AlertsPanel)**
- Faol ziddiyatlar ro'yxati
- Hal qilinmagan muammolar

**FR-DASH-03: O'qituvchi ish yuklama grafigi**
- Har bir o'qituvchining haftalik soatlari
- Maksimal soatga nisbatan foiz

**FR-DASH-04: Xonalar bandlik grafigi**
- Har bir xonaning haftalik bandlik darajasi

**FR-DASH-05: Jadval issiqlik xaritasi (Heatmap)**
- Kun × Slot matritsa
- Rang intensivligi — bandlik darajasi

### 2.11 Foydalanuvchilar Boshqaruvi

**FR-USR-01: Foydalanuvchi yaratish**
- Faqat `super_admin` tomonidan
- Email, parol, rol, bo'lim belgilash

**FR-USR-02: Ko'plab foydalanuvchi import**
- Matn yoki Excel orqali ko'plab foydalanuvchi yaratish
- Har biriga rol va parol belgilash

**FR-USR-03: Foydalanuvchi profili**
- Ism, email, rol, bo'lim, avatar

### 2.12 Sozlamalar

**FR-SET-01: Qorong'u/Yorug' rejim**
- Tizim parametri yoki qo'lda tanlash
- `next-themes` orqali `class` atributi bilan

**FR-SET-02: Akademik davr**
- Semestrlarni yaratish va boshqarish
- Faqat bitta aktiv semestr
- Jadval aktiv semestrga bog'liq

---

## 3. Nofunksional Talablar

### 3.1 Ishlash (Performance)

| Mezon | Talab |
|-------|-------|
| Sahifa yuklanish vaqti | < 3 soniya (3G tarmoqda) |
| Jadval generatsiya | < 30 soniya (500 ta dars uchun) |
| Real-time sinxronizatsiya | < 1 soniya kechikish |
| Client-side navigatsiya | < 200ms |

### 3.2 Kengayuvchanlik (Scalability)

| Mezon | Talab |
|-------|-------|
| O'qituvchilar soni | 500+ |
| Guruhlar soni | 200+ |
| Xonalar soni | 100+ |
| Bir vaqtdagi foydalanuvchilar | 100+ |
| Jadval yozuvlari | 5000+ |

### 3.3 Xavfsizlik (Security)

- **Autentifikatsiya:** Supabase Auth (JWT, HTTP-only cookies)
- **Avtorizatsiya:** Row Level Security (RLS) barcha 15 jadvalda
- **HTTPS:** Barcha so'rovlar shifrlangan
- **XSS himoya:** React tomonidan avtomatik, Next.js security headers
- **CSRF himoya:** SameSite cookie siyosati
- **Content Security:** X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin
- **SQL Injection:** Supabase parametrized queries

### 3.4 Mavjudlik (Availability)

| Mezon | Talab |
|-------|-------|
| Uptime | 99.5% |
| Rejali texnik xizmat | Haftada 1 soat (tunda) |
| Offline qo'llab-quvvatlash | PWA + localStorage orqali asosiy funksiyalar |

### 3.5 Moslik (Compatibility)

**Brauzerlar:**
- Chrome 90+ (Android va Desktop)
- Safari 15+ (iOS va macOS)
- Firefox 90+
- Edge 90+

**Qurilmalar:**
- Mobil telefonlar (320px+)
- Planshetlar (768px+)
- Desktop (1024px+)

**PWA:**
- Bosh ekranga qo'shish (Add to Home Screen)
- Standalone rejimda ishlash
- Safe area qo'llab-quvvatlash (notch, home indicator)

### 3.6 Maxsus Imkoniyatlar (Accessibility)

- `prefers-reduced-motion` — animatsiyalar o'chiriladi
- `prefers-reduced-transparency` — glass effektlar solid yuzalarga almashtiriladi
- Kontrastli ranglar (WCAG AA darajasi)
- Klaviatura navigatsiyasi

### 3.7 Lokalizatsiya

- Interfeys tili: **O'zbek** (asosiy va yagona)
- Sana formati: O'zbek locale
- Raqam formati: standart

---

## 4. Texnik Arxitektura

### 4.1 Texnologiya Steki

| Qatlam | Texnologiya | Versiya |
|--------|-------------|---------|
| Frontend Framework | Next.js (App Router) | 16.1.6 |
| UI Library | React | 19.2.3 |
| Til | TypeScript (strict mode) | 5.9.3 |
| Stilizatsiya | Tailwind CSS (PostCSS plugin) | 4 |
| Ma'lumotlar bazasi | Supabase (PostgreSQL) | - |
| Autentifikatsiya | Supabase Auth | - |
| Holat boshqaruvi | Zustand (persist middleware) | 5 |
| Drag & Drop | @dnd-kit | 6.3.1 |
| Validatsiya | Zod | 4.3.6 |
| Eksport (Excel) | xlsx | 0.18.5 |
| Eksport (PDF) | jspdf + jspdf-autotable | 4.2.0 / 5.0.7 |
| Import (Word) | mammoth | 1.11.0 |
| Ikonkalar | lucide-react | 0.575.0 |
| Tema | next-themes | 0.4.6 |
| Sanalar | date-fns | 4.1.0 |
| ID generatsiya | nanoid | 5.1.6 |

### 4.2 Arxitektura Diagrammasi

```
┌─────────────────────────────────────────────────────────┐
│                    Foydalanuvchi                         │
│              (Mobil / Planshet / Desktop)                │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  Next.js App Router                      │
│  ┌───────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ (auth)/   │  │(dashboard)│  │     middleware.ts     │  │
│  │ login     │  │ page.tsx  │  │ (auth tekshiruvi)    │  │
│  │ register  │  │ timetable │  └──────────────────────┘  │
│  └───────────┘  │ teachers  │                            │
│                 │ groups    │                            │
│                 │ subjects  │                            │
│                 │ rooms     │                            │
│                 │ generate  │                            │
│                 │ import    │                            │
│                 │ export    │                            │
│                 └──────────┘                             │
└──────────────────────┬──────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│ Zustand      │ │ Supabase │ │ localStorage │
│ Stores (7)   │ │ (cloud)  │ │ (demo rejim) │
│              │ │          │ │              │
│ timetable    │ │ PostgreSQL│ │ persist      │
│ teachers     │ │ Auth     │ │ middleware   │
│ groups       │ │ RLS      │ │              │
│ subjects     │ │ Realtime │ │              │
│ rooms        │ │          │ │              │
│ subjectLoads │ └──────────┘ └──────────────┘
│ changelog    │
└──────────────┘
```

### 4.3 Ma'lumotlar Oqimi

```
1. Foydalanuvchi harakati (UI)
       │
       ▼
2. Zustand Store (optimistic update)
       │
       ├──► 3a. localStorage (har doim)
       │
       └──► 3b. Supabase Sync (agar sozlangan bo'lsa)
                    │
                    ▼
              4. PostgreSQL (doimiy saqlash)
                    │
                    ▼
              5. Realtime broadcast
                    │
                    ▼
              6. Boshqa foydalanuvchilar (auto-sync)
```

### 4.4 Ma'lumotlar Bazasi Sxemasi

**15 ta jadval:**

```
┌──────────────────┐     ┌──────────────────┐
│   departments    │     │ academic_periods  │
│──────────────────│     │──────────────────│
│ id               │     │ id               │
│ name             │     │ name             │
│ institution_id   │     │ start_date       │
│ created_at       │     │ end_date         │
└────────┬─────────┘     │ is_active        │
         │               └──────────────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐
│    teachers      │────►│ teacher_subjects │
│──────────────────│     │──────────────────│
│ id               │     │ teacher_id       │
│ name             │     │ subject_id       │
│ max_hours_weekly │     └────────┬─────────┘
│ department_id    │              │
└────────┬─────────┘              │
         │                        ▼
         │               ┌──────────────────┐
         │               │    subjects      │
         │               │──────────────────│
         │               │ id               │
         │               │ name             │
         │               │ color            │
         │               │ requires_lab     │
         │               └──────────────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐
│teacher_availability│   │  subject_loads   │
│──────────────────│     │──────────────────│
│ teacher_id       │     │ id               │
│ day              │     │ subject_id       │
│ slot_id          │     │ group_id         │
│ is_available     │     │ teacher_id       │
└──────────────────┘     │ hours_per_week   │
                         └──────────────────┘
┌──────────────────┐
│     groups       │     ┌──────────────────┐
│──────────────────│     │      rooms       │
│ id               │     │──────────────────│
│ name             │     │ id               │
│ course           │     │ name             │
│ department_id    │     │ type             │
│ track            │     │ capacity         │
│ student_count    │     │ building         │
└──────────────────┘     │ floor            │
                         └──────────────────┘

┌────────────────────────────────────────┐
│          schedule_entries              │
│────────────────────────────────────────│
│ id                                     │
│ day          (DayKey)                  │
│ slot_id      (TimeSlot ID)            │
│ group_ids    (string[])               │
│ subject_id   → subjects.id            │
│ teacher_id   → teachers.id            │
│ room_id      → rooms.id              │
│ is_manual    (boolean)                │
│ academic_period_id                     │
│ UNIQUE(day, slot_id, teacher_id)      │
│ UNIQUE(day, slot_id, room_id)         │
└────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  substitutions   │  │schedule_changelog│  │  notifications   │
│──────────────────│  │──────────────────│  │──────────────────│
│ id               │  │ id               │  │ id               │
│ entry_id         │  │ entry_id         │  │ type             │
│ original_teacher │  │ changed_by       │  │ title            │
│ substitute_teacher│ │ change_type      │  │ message          │
│ date_from        │  │ old_value        │  │ target_role      │
│ date_to          │  │ new_value        │  │ created_at       │
│ reason           │  │ created_at       │  └──────────────────┘
└──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐
│    app_users     │  │    time_slots    │
│──────────────────│  │──────────────────│
│ id (auth.uid)    │  │ id               │
│ email            │  │ label            │
│ full_name        │  │ track            │
│ role             │  │ start_time       │
│ department_id    │  │ end_time         │
│ avatar_url       │  │ slot_number      │
└──────────────────┘  └──────────────────┘
```

### 4.5 Jadval Generatsiya Algoritmi

```
Kirish ma'lumotlari:
  - Fan yuklamalari (subject_loads)
  - O'qituvchi mavjudligi (teacher_availability)
  - Xonalar ro'yxati (rooms)
  - Cheklovlar (constraints)

Algoritm:
  1. GREEDY bosqich:
     a. Fan yuklamalarini ustuvorlik bo'yicha tartiblash
     b. Har bir yuklama uchun:
        - Mavjud kun/slot kombinatsiyalarini aniqlash
        - O'qituvchi mavjudligini tekshirish
        - Xona mavjudligi va turi mosligini tekshirish
        - Ziddiyatsiz birinchi variantga joylashtirish
     c. Joylashtirilmagan darslarni hisobot qilish

  2. BACKTRACKING bosqich (ixtiyoriy):
     a. Muammoli joylarni aniqlash
     b. Atrofdagi darslarni qayta taqsimlash
     c. Yaxshiroq natija topilganda almashtirish
     d. Timeout bo'lsa to'xtatish

Chiqish:
  - ScheduleEntry[] (muvaffaqiyatli)
  - ConflictReport (muammolar)
  - GenerationResult (umumiy natija)
```

---

## 5. Dizayn Tizimi

### 5.1 Dizayn Falsafasi

**iOS 26 Liquid Glass** — Apple ning eng yangi dizayn tiliga asoslangan:

- **Shaffoflik:** Barcha yuzalar shaffof, orqa fonni blur qiladi
- **Chuqurlik:** Soyalar va blur orqali qatlamlar ajralib turadi
- **Harakatlanish:** Spring physics asosidagi tabiiy animatsiyalar
- **Yorug'lik:** Specular highlight — foydalanuvchi mouse/barmog'iga ta'sir qiladi

### 5.2 Rang Palitra

**Aksent rang:** `#007AFF` (Apple Blue) — barcha interaktiv elementlarda

**Semantik ranglar:**
| Rang | Light | Dark | Ishlatilishi |
|------|-------|------|-------------|
| Aksent | #007AFF | #0A84FF | Tugmalar, linklar, tanlangan elementlar |
| Xavf | #FF3B30 | #FF453A | O'chirish, xatolik |
| Muvaffaqiyat | #34C759 | #30D158 | Tasdiqlash, muvaffaqiyat |
| Ogohlantirish | #FF9500 | #FF9F0A | Ogohlantirishlar |

**Fon:**
- Light mode: `#F5F5F7` (silliq kulrang)
- Dark mode: `#000000` (OLED qora — batareya tejash)

### 5.3 Responsive Strategiya

```
┌─────────────────────────────────────────────────┐
│ MOBIL (< 768px)                                 │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ MobileHeader (md:hidden)                    │ │
│ ├─────────────────────────────────────────────┤ │
│ │                                             │ │
│ │  Kontent (karta ko'rinishda)                │ │
│ │  Jadval: kun tab'lari                       │ │
│ │                                             │ │
│ ├─────────────────────────────────────────────┤ │
│ │ BottomTabBar (lg:hidden)                    │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ PLANSHET (768px — 1024px)                       │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Topbar (hidden md:flex)                     │ │
│ ├─────────────────────────────────────────────┤ │
│ │                                             │ │
│ │  Kontent (jadval ko'rinishda)               │ │
│ │  Jadval: to'liq grid                        │ │
│ │                                             │ │
│ ├─────────────────────────────────────────────┤ │
│ │ BottomTabBar (lg:hidden)                    │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ DESKTOP (≥ 1024px)                              │
│                                                 │
│ ┌────────┬────────────────────────────────────┐ │
│ │        │ Topbar                             │ │
│ │Sidebar ├────────────────────────────────────┤ │
│ │(hidden │                                    │ │
│ │lg:flex)│  Kontent (to'liq layout)           │ │
│ │        │  Jadval: to'liq grid               │ │
│ │        │                                    │ │
│ └────────┴────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## 6. Foydalanuvchi Stsenariylari (User Flows)

### 6.1 Yangi semestr uchun jadval yaratish

```
1. Admin tizimga kiradi
2. Ma'lumotnomalarni import qiladi:
   a. O'qituvchilar (Excel dan)
   b. Guruhlar (Excel dan)
   c. Fanlar (qo'lda yoki Excel dan)
   d. Xonalar (qo'lda yoki Excel dan)
3. Fan yuklamalarini kiritadi (qaysi fan → qaysi guruh → qaysi o'qituvchi)
4. O'qituvchi mavjudligini belgilaydi
5. "Avtomatik generatsiya" sahifasiga o'tadi
6. Cheklovlarni sozlaydi (yoki standart qoldiradi)
7. "Generatsiya" tugmasini bosadi
8. Natijani ko'radi:
   a. Muvaffaqiyatli → jadvalga o'tadi
   b. Qisman → muammolarni ko'rib qo'lda tuzatadi
9. Jadvalga qo'lda tuzatishlar kiritadi (drag-drop)
10. Excel va PDF formatda eksport qiladi
11. O'qituvchilarga bildirishnoma yuboriladi
```

### 6.2 O'rinbosar tayinlash

```
1. Admin "O'rinbosarlar" sahifasiga o'tadi
2. "Yangi o'rinbosar" tugmasini bosadi
3. Asosiy o'qituvchini tanlaydi
4. O'rinbosar o'qituvchini tanlaydi
5. Sana oralig'ini belgilaydi
6. Sababni yozadi
7. Tizim ziddiyatni tekshiradi
8. Tasdiqlaydi → jadvalda o'zgarish avtomatik ko'rinadi
9. Har ikkala o'qituvchiga bildirishnoma yuboriladi
```

### 6.3 O'qituvchining jadvalga kirishi

```
1. O'qituvchi tizimga email/parol bilan kiradi
2. Dashboard da:
   - Bugungi darslari ko'rinadi
   - O'zgarishlar haqida bildirishnoma
3. "Jadval" sahifasiga o'tadi
4. O'z haftalik jadvalini ko'radi
5. Kerak bo'lsa PDF/Excel yuklab oladi
```

---

## 7. Rivojlantirish Yo'l Xaritasi (Roadmap)

### Faza 1 — MVP (Hozirgi holat: v0.1.0) ✅

- [x] Supabase integratsiya (Auth + Database + RLS)
- [x] Rol asosida kirish tizimi (4 ta rol)
- [x] Ma'lumotnomalar CRUD (o'qituvchilar, guruhlar, fanlar, xonalar)
- [x] Fan yuklamalari boshqaruvi
- [x] 3 ta ko'rinish (guruh/o'qituvchi/xona bo'yicha)
- [x] Drag-and-drop jadval tahrirlash
- [x] Avtomatik jadval generatsiyasi (greedy + backtracking)
- [x] Excel/PDF eksport
- [x] Excel/Word/CSV import + wizard
- [x] O'rinbosar o'qituvchilar
- [x] Dashboard (statistika, grafiklar, heatmap)
- [x] Bildirishnomalar tizimi
- [x] O'zgarishlar tarixi (changelog)
- [x] Liquid Glass dizayn tizimi (iOS 26 uslubi)
- [x] PWA qo'llab-quvvatlash
- [x] Mobil-responsive interfeys
- [x] Demo rejim (Supabase'siz ishlash)
- [x] Foydalanuvchilar boshqaruvi + ko'plab import

### Faza 2 — Kengaytirish (Rejalashtirilgan)

- [ ] Telegram bot integratsiyasi (jadval bildirishnomalari)
- [ ] Push notification (PWA)
- [ ] Hafta bo'yicha jadval versiyalari (hafta 1, hafta 2 almashinuvi)
- [ ] O'qituvchi o'z mavjudligini belgilashi
- [ ] QR-kod orqali jadvalga tezkor kirish
- [ ] Jadvallarni solishtirish (ikki semestr orasida)

### Faza 3 — Optimallashtirish

- [ ] AI asosidagi jadval tavsiyalari
- [ ] Genetik algoritm (generatsiya sifatini oshirish)
- [ ] Xona bandligini bashorat qilish
- [ ] O'qituvchi ish yukini balanslash algoritmi
- [ ] Ko'p muassasa qo'llab-quvvatlash (multi-tenant)
- [ ] API ochiq interfeys (boshqa tizimlar integratsiyasi uchun)

### Faza 4 — Korporativ

- [ ] LDAP/SSO integratsiya
- [ ] Ko'p tilli interfeys (rus, ingliz)
- [ ] Audit log'larni eksport qilish
- [ ] Hisobotlar tizimi (analytics dashboard)
- [ ] Mobil ilova (React Native / Flutter)

---

## 8. Xavflar va Kamchiliklar

### 8.1 Texnik Xavflar

| Xavf | Ehtimollik | Ta'sir | Yechim |
|------|-----------|--------|--------|
| Supabase down bo'lishi | Past | O'rta | Demo rejim (localStorage fallback) |
| Generatsiya juda uzoq davom etishi | O'rta | Past | Timeout + qisman natija |
| Real-time sync kechikishi | Past | Past | Optimistic updates + retry |
| Katta ma'lumot hajmi | O'rta | O'rta | Pagination, virtual scrolling |

### 8.2 Biznes Xavflar

| Xavf | Ehtimollik | Ta'sir | Yechim |
|------|-----------|--------|--------|
| Foydalanuvchilar yangi tizimga ko'nikmasligi | O'rta | Yuqori | Demo rejim, video qo'llanmalar |
| Mavjud jadval ma'lumotlarini import qilishda xatoliklar | Yuqori | O'rta | Import wizard + validatsiya |
| Rol huquqlari noto'g'ri sozlanishi | Past | Yuqori | RLS + frontend rol tekshiruvi |

---

## 9. Glossariy

| Atama | Tavsif |
|-------|--------|
| **Track** | Ta'lim shakli: kunduzgi, sirtqi, kechki |
| **Slot** | Vaqt oralig'i (pora) — 1.5 soatlik dars davri |
| **Greedy algoritm** | Ochko'z algoritm — eng yaqin optimal variantni tanlaydi |
| **Backtracking** | Qaytish algoritmi — noto'g'ri qarorlarni qaytarib yaxshiroq variant izlaydi |
| **RLS** | Row Level Security — qatorlar darajasida ma'lumot himoyasi |
| **PWA** | Progressive Web App — brauzerda o'rnatiladigan web-ilova |
| **Optimistic Update** | Server javobini kutmasdan UI ni darhol yangilash |
| **Liquid Glass** | Apple ning iOS 26 dizayn tili — shaffof, blur effektli interfeys |
| **Specular Highlight** | Sirtda yorug'lik akslanishi effekti |
| **Drag-and-Drop** | Sichqoncha/barmog' bilan sudrab joylashtirish |
| **CRUD** | Create, Read, Update, Delete — asosiy ma'lumot operatsiyalari |
| **Changelog** | O'zgarishlar tarixi (audit log) |
| **Substitution** | O'rinbosar o'qituvchi tayinlash |

---

## 10. Ilovalar

### 10.1 Hujjat Versiyalari

| Versiya | Sana | O'zgarishlar |
|---------|------|-------------|
| 1.0 | 2026-02-22 | Dastlabki versiya |

### 10.2 Bog'liq Hujjatlar

| Hujjat | Joylashuv |
|--------|-----------|
| CLAUDE.md | `/CLAUDE.md` — Kodebase texnik hujjati |
| README.md | `/README.md` — Loyiha haqida umumiy ma'lumot |
| SQL migratsiyalar | `/supabase/migrations/` — Ma'lumotlar bazasi sxemasi |
| Supabase seed | `/supabase/seed.sql` — Namuna ma'lumotlar |
