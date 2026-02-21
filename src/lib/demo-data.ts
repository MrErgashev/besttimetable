import type { DayKey, RoomType } from "./types";
import { SUBJECT_COLORS } from "./constants";

// ─── Store tiplarini aniqlash (store fayllarini import qilmaslik uchun) ──────
interface DemoStores {
  teacherStore: {
    teachers: { id: string }[];
    addTeacher: (data: {
      first_name: string;
      last_name: string;
      short_name: string;
      email?: string;
      phone?: string;
      max_weekly_hours: number;
    }) => { id: string };
    deleteTeachers: (ids: string[]) => void;
  };
  groupStore: {
    groups: { id: string }[];
    addGroup: (data: {
      name: string;
      course: number;
      department_id: string;
      track: "kunduzgi" | "sirtqi" | "kechki";
      student_count: number;
    }) => { id: string };
    deleteGroups: (ids: string[]) => void;
  };
  subjectStore: {
    subjects: { id: string }[];
    addSubject: (data: {
      name: string;
      short_name: string;
      color: string;
      requires_lab: boolean;
    }) => { id: string };
    deleteSubjects: (ids: string[]) => void;
  };
  roomStore: {
    rooms: { id: string }[];
    addRoom: (data: {
      name: string;
      building?: string;
      capacity: number;
      type: RoomType;
      floor?: number;
    }) => { id: string };
    deleteRooms: (ids: string[]) => void;
  };
  timetableStore: {
    entries: { id: string }[];
    placeEntry: (data: {
      period_id: string;
      day: DayKey;
      slot_id: string;
      group_ids: string[];
      subject_id: string;
      teacher_id: string;
      room_id: string;
      is_manual: boolean;
      created_by: string;
    }) => { id: string };
    clearAll: () => void;
  };
  loadStore: {
    loads: { id: string }[];
    addLoad: (data: {
      group_id: string;
      subject_id: string;
      teacher_id: string;
      weekly_hours: number;
      room_type: RoomType;
    }) => { id: string };
    clearAll: () => void;
  };
  changelogStore: {
    logs: { id: string }[];
    addLog: (data: {
      entry_id: string;
      action: "create" | "update" | "delete";
      old_data: Record<string, unknown> | null;
      new_data: Record<string, unknown> | null;
      changed_by: string;
    }) => void;
    clearAll: () => void;
  };
}

// ─── Demo konstantalar ──────────────────────────────────────────────────────
const DEMO_PERIOD_ID = "period-demo-1";
const DEMO_USER_ID = "user-demo-1";
const DEMO_DEPT_ID = "dept-demo-1";

// ─── Demo ma'lumotlar ───────────────────────────────────────────────────────

const DEMO_TEACHERS = [
  { first_name: "Bobur", last_name: "Ergashev", short_name: "Ergashev B.", email: "b.ergashev@edu.uz", phone: "+998901234567", max_weekly_hours: 18 },
  { first_name: "Nilufar", last_name: "Karimova", short_name: "Karimova N.", email: "n.karimova@edu.uz", phone: "+998901234568", max_weekly_hours: 16 },
  { first_name: "Sardor", last_name: "Toshmatov", short_name: "Toshmatov S.", email: "s.toshmatov@edu.uz", phone: "+998901234569", max_weekly_hours: 18 },
  { first_name: "Dilorom", last_name: "Rahimova", short_name: "Rahimova D.", email: "d.rahimova@edu.uz", phone: "+998901234570", max_weekly_hours: 14 },
  { first_name: "Jahongir", last_name: "Xasanov", short_name: "Xasanov J.", email: "j.xasanov@edu.uz", phone: "+998901234571", max_weekly_hours: 18 },
  { first_name: "Mohira", last_name: "Abdullayeva", short_name: "Abdullayeva M.", email: "m.abdullayeva@edu.uz", phone: "+998901234572", max_weekly_hours: 16 },
  { first_name: "Sherzod", last_name: "Nazarov", short_name: "Nazarov Sh.", email: "sh.nazarov@edu.uz", phone: "+998901234573", max_weekly_hours: 18 },
  { first_name: "Gavhar", last_name: "Yusupova", short_name: "Yusupova G.", email: "g.yusupova@edu.uz", phone: "+998901234574", max_weekly_hours: 14 },
  { first_name: "Ulugbek", last_name: "Mirzayev", short_name: "Mirzayev U.", email: "u.mirzayev@edu.uz", phone: "+998901234575", max_weekly_hours: 18 },
  { first_name: "Farhod", last_name: "Qodirov", short_name: "Qodirov F.", email: "f.qodirov@edu.uz", phone: "+998901234576", max_weekly_hours: 16 },
];

const DEMO_GROUPS: { name: string; course: number; track: "kunduzgi" | "sirtqi" | "kechki"; student_count: number }[] = [
  // Kunduzgi
  { name: "1-K1", course: 1, track: "kunduzgi", student_count: 30 },
  { name: "1-K2", course: 1, track: "kunduzgi", student_count: 28 },
  { name: "2-K1", course: 2, track: "kunduzgi", student_count: 25 },
  { name: "3-K1", course: 3, track: "kunduzgi", student_count: 22 },
  // Sirtqi
  { name: "1-S1", course: 1, track: "sirtqi", student_count: 35 },
  { name: "2-S1", course: 2, track: "sirtqi", student_count: 30 },
  // Kechki
  { name: "1-E1", course: 1, track: "kechki", student_count: 20 },
  { name: "2-E1", course: 2, track: "kechki", student_count: 18 },
];

const DEMO_SUBJECTS: { name: string; short_name: string; requires_lab: boolean }[] = [
  { name: "Matematika", short_name: "Mat", requires_lab: false },
  { name: "Fizika", short_name: "Fiz", requires_lab: true },
  { name: "Informatika", short_name: "Inf", requires_lab: true },
  { name: "Algoritmlar", short_name: "Alg", requires_lab: false },
  { name: "Ma'lumotlar bazasi", short_name: "MB", requires_lab: true },
  { name: "Web dasturlash", short_name: "Web", requires_lab: true },
  { name: "Ingliz tili", short_name: "Eng", requires_lab: false },
  { name: "O'zbek tili", short_name: "Uzb", requires_lab: false },
  { name: "Iqtisodiyot", short_name: "Iqt", requires_lab: false },
  { name: "Elektronika", short_name: "Elk", requires_lab: true },
];

const DEMO_ROOMS: { name: string; building: string; capacity: number; type: RoomType; floor: number }[] = [
  { name: "101", building: "Bosh bino", capacity: 35, type: "oddiy", floor: 1 },
  { name: "102", building: "Bosh bino", capacity: 35, type: "oddiy", floor: 1 },
  { name: "103", building: "Bosh bino", capacity: 40, type: "oddiy", floor: 1 },
  { name: "201", building: "Bosh bino", capacity: 30, type: "oddiy", floor: 2 },
  { name: "Lab-1", building: "Bosh bino", capacity: 25, type: "laboratoriya", floor: 2 },
  { name: "Komp-1", building: "IT bino", capacity: 30, type: "kompyuter_xona", floor: 1 },
  { name: "Komp-2", building: "IT bino", capacity: 25, type: "kompyuter_xona", floor: 1 },
  { name: "Majlis", building: "Bosh bino", capacity: 80, type: "majlis_xonasi", floor: 1 },
];

// ─── Jadval matritsasi (ziddiyatsiz) ────────────────────────────────────────
// Har bir entry: [kunIndex, slotId, guruhIndekslar[], fanIndex, teacherIndex, roomIndex]
// O'qituvchi va xona bir vaqtda takrorlanmasligi kerak
type ScheduleRow = [number, string, number[], number, number, number];

// Kunduzgi guruhlar: 0=1-K1, 1=1-K2, 2=2-K1, 3=3-K1
// Sirtqi guruhlar: 4=1-S1, 5=2-S1
// Kechki guruhlar: 6=1-E1, 7=2-E1
// Slotlar: k1,k2,k3 (kunduzgi), s1,s2,s3 (sirtqi), e1,e2 (kechki)
// Fanlar: 0=Mat, 1=Fiz, 2=Inf, 3=Alg, 4=MB, 5=Web, 6=Eng, 7=Uzb, 8=Iqt, 9=Elk
// O'qituvchilar: 0=Ergashev, 1=Karimova, 2=Toshmatov, 3=Rahimova, 4=Xasanov, 5=Abdullayeva, 6=Nazarov, 7=Yusupova, 8=Mirzayev, 9=Qodirov
// Xonalar: 0=101, 1=102, 2=103, 3=201, 4=Lab-1, 5=Komp-1, 6=Komp-2, 7=Majlis

const SCHEDULE_MATRIX: ScheduleRow[] = [
  // ── DUSHANBA (0) ──────────────────────────────────────
  // k1: 1-K1 Mat(Ergashev, 101), 1-K2 Eng(Rahimova, 102), 2-K1 Alg(Toshmatov, 103), 3-K1 Web(Nazarov, Komp-1)
  [0, "k1", [0], 0, 0, 0],
  [0, "k1", [1], 6, 3, 1],
  [0, "k1", [2], 3, 2, 2],
  [0, "k1", [3], 5, 6, 5],
  // k2: 1-K1 Fiz(Karimova, Lab-1), 1-K2 Mat(Ergashev, 101), 2-K1 MB(Xasanov, Komp-2), 3-K1 Alg(Toshmatov, 103)
  [0, "k2", [0], 1, 1, 4],
  [0, "k2", [1], 0, 0, 0],
  [0, "k2", [2], 4, 4, 6],
  [0, "k2", [3], 3, 2, 2],
  // k3: Ma'ruza — 1-K1 + 1-K2 birgalikda Iqtisodiyot(Yusupova, Majlis)
  [0, "k3", [0, 1], 8, 7, 7],
  [0, "k3", [2], 6, 3, 1],
  [0, "k3", [3], 9, 8, 4],
  // s1: 1-S1 Mat(Mirzayev, 101), 2-S1 Inf(Qodirov, Komp-1)
  [0, "s1", [4], 0, 8, 0],
  [0, "s1", [5], 2, 9, 5],
  // s2: 1-S1 Uzb(Abdullayeva, 102), 2-S1 Alg(Xasanov, 103)
  [0, "s2", [4], 7, 5, 1],
  [0, "s2", [5], 3, 4, 2],
  // e1: 1-E1 Mat(Ergashev, 101), 2-E1 Eng(Rahimova, 102)
  [0, "e1", [6], 0, 0, 0],
  [0, "e1", [7], 6, 3, 1],
  // e2: 1-E1 Inf(Qodirov, Komp-1), 2-E1 MB(Xasanov, Komp-2)
  [0, "e2", [6], 2, 9, 5],
  [0, "e2", [7], 4, 4, 6],

  // ── SESHANBA (1) ──────────────────────────────────────
  // k1: 1-K1 Inf(Nazarov, Komp-1), 1-K2 Fiz(Karimova, Lab-1), 2-K1 Uzb(Abdullayeva, 102), 3-K1 Mat(Ergashev, 101)
  [1, "k1", [0], 2, 6, 5],
  [1, "k1", [1], 1, 1, 4],
  [1, "k1", [2], 7, 5, 1],
  [1, "k1", [3], 0, 0, 0],
  // k2: 1-K1 Alg(Toshmatov, 103), 1-K2 Inf(Nazarov, Komp-1), 2-K1 Fiz(Karimova, Lab-1), 3-K1 Eng(Rahimova, 102)
  [1, "k2", [0], 3, 2, 2],
  [1, "k2", [1], 2, 6, 5],
  [1, "k2", [2], 1, 1, 4],
  [1, "k2", [3], 6, 3, 1],
  // k3: 1-K1 Eng(Rahimova, 201), 1-K2 Alg(Toshmatov, 103), 2-K1 Web(Xasanov, Komp-2), 3-K1 Inf(Nazarov, Komp-1)
  [1, "k3", [0], 6, 3, 3],
  [1, "k3", [1], 3, 2, 2],
  [1, "k3", [2], 5, 4, 6],
  [1, "k3", [3], 2, 6, 5],
  // s1: 1-S1 Eng(Yusupova, 101), 2-S1 Mat(Mirzayev, 102)
  [1, "s1", [4], 6, 7, 0],
  [1, "s1", [5], 0, 8, 1],
  // s2: 1-S1 Inf(Qodirov, Komp-1), 2-S1 Uzb(Abdullayeva, 103)
  [1, "s2", [4], 2, 9, 5],
  [1, "s2", [5], 7, 5, 2],
  // e1: 1-E1 Uzb(Abdullayeva, 101), 2-E1 Mat(Ergashev, 102)
  [1, "e1", [6], 7, 5, 0],
  [1, "e1", [7], 0, 0, 1],

  // ── CHORSHANBA (2) ────────────────────────────────────
  // k1: 1-K1 MB(Xasanov, Komp-2), 1-K2 Uzb(Abdullayeva, 102), 2-K1 Mat(Ergashev, 101), 3-K1 Fiz(Karimova, Lab-1)
  [2, "k1", [0], 4, 4, 6],
  [2, "k1", [1], 7, 5, 1],
  [2, "k1", [2], 0, 0, 0],
  [2, "k1", [3], 1, 1, 4],
  // k2: 1-K1 Uzb(Abdullayeva, 102), 1-K2 MB(Xasanov, Komp-2), 2-K1 Elk(Mirzayev, Lab-1), 3-K1 Mat(Ergashev, 101)
  [2, "k2", [0], 7, 5, 1],
  [2, "k2", [1], 4, 4, 6],
  [2, "k2", [2], 9, 8, 4],
  [2, "k2", [3], 0, 0, 0],
  // k3: Ma'ruza — 2-K1 + 3-K1 birgalikda Iqtisodiyot(Yusupova, Majlis), 1-K1 Web(Nazarov, Komp-1)
  [2, "k3", [2, 3], 8, 7, 7],
  [2, "k3", [0], 5, 6, 5],
  // s1: Ma'ruza — 1-S1 + 2-S1 birgalikda Iqtisodiyot(Yusupova, Majlis)
  [2, "s1", [4, 5], 8, 7, 7],
  // s2: 1-S1 Fiz(Karimova, Lab-1), 2-S1 Web(Qodirov, Komp-1)
  [2, "s2", [4], 1, 1, 4],
  [2, "s2", [5], 5, 9, 5],
  // s3: 1-S1 Alg(Toshmatov, 103), 2-S1 Eng(Rahimova, 201)
  [2, "s3", [4], 3, 2, 2],
  [2, "s3", [5], 6, 3, 3],
  // e1: 1-E1 Eng(Rahimova, 101), 2-E1 Inf(Qodirov, Komp-1)
  [2, "e1", [6], 6, 3, 0],
  [2, "e1", [7], 2, 9, 5],

  // ── PAYSHANBA (3) ─────────────────────────────────────
  // k1: 1-K1 Elk(Mirzayev, Lab-1), 1-K2 Web(Nazarov, Komp-1), 2-K1 Eng(Rahimova, 102), 3-K1 Alg(Toshmatov, 103)
  [3, "k1", [0], 9, 8, 4],
  [3, "k1", [1], 5, 6, 5],
  [3, "k1", [2], 6, 3, 1],
  [3, "k1", [3], 3, 2, 2],
  // k2: 1-K1 Web(Nazarov, Komp-1), 1-K2 Elk(Mirzayev, Lab-1), 2-K1 Inf(Xasanov, Komp-2), 3-K1 Uzb(Abdullayeva, 102)
  [3, "k2", [0], 5, 6, 5],
  [3, "k2", [1], 9, 8, 4],
  [3, "k2", [2], 2, 4, 6],
  [3, "k2", [3], 7, 5, 1],
  // k3: Ma'ruza — 1-K1 + 1-K2 + 2-K1 birgalikda Mat(Ergashev, Majlis)
  [3, "k3", [0, 1, 2], 0, 0, 7],
  // s1: 1-S1 Web(Qodirov, Komp-1), 2-S1 Fiz(Karimova, Lab-1)
  [3, "s1", [4], 5, 9, 5],
  [3, "s1", [5], 1, 1, 4],
  // s2: 1-S1 Mat(Mirzayev, 101), 2-S1 MB(Xasanov, Komp-2)
  [3, "s2", [4], 0, 8, 0],
  [3, "s2", [5], 4, 4, 6],
  // e1: 1-E1 Fiz(Karimova, Lab-1), 2-E1 Uzb(Abdullayeva, 102)
  [3, "e1", [6], 1, 1, 4],
  [3, "e1", [7], 7, 5, 1],
  // e2: 1-E1 Alg(Toshmatov, 103), 2-E1 Web(Nazarov, Komp-1)
  [3, "e2", [6], 3, 2, 2],
  [3, "e2", [7], 5, 6, 5],

  // ── JUMA (4) ──────────────────────────────────────────
  // k1: 1-K1 Eng(Rahimova, 201), 1-K2 Mat(Ergashev, 101), 2-K1 Web(Nazarov, Komp-1), 3-K1 MB(Xasanov, Komp-2)
  [4, "k1", [0], 6, 3, 3],
  [4, "k1", [1], 0, 0, 0],
  [4, "k1", [2], 5, 6, 5],
  [4, "k1", [3], 4, 4, 6],
  // k2: 1-K1 Mat(Ergashev, 101), 1-K2 Eng(Rahimova, 201), 2-K1 Elk(Mirzayev, Lab-1), 3-K1 Inf(Nazarov, Komp-1)
  [4, "k2", [0], 0, 0, 0],
  [4, "k2", [1], 6, 3, 3],
  [4, "k2", [2], 9, 8, 4],
  [4, "k2", [3], 2, 6, 5],
  // k3: 1-K1 Iqt(Yusupova, 102), 2-K1 Mat(Toshmatov, 103)
  [4, "k3", [0], 8, 7, 1],
  [4, "k3", [2], 0, 2, 2],
  // s1: 1-S1 Elk(Mirzayev, Lab-1), 2-S1 Inf(Qodirov, Komp-1)
  [4, "s1", [4], 9, 8, 4],
  [4, "s1", [5], 2, 9, 5],
  // s2: 1-S1 MB(Xasanov, Komp-2), 2-S1 Mat(Ergashev, 101)
  [4, "s2", [4], 4, 4, 6],
  [4, "s2", [5], 0, 0, 0],
  // e1: Ma'ruza — 1-E1 + 2-E1 birgalikda Iqtisodiyot(Yusupova, Majlis)
  [4, "e1", [6, 7], 8, 7, 7],
];

// ─── Subject Load matritsasi ────────────────────────────────────────────────
// [guruhIndex, fanIndex, teacherIndex, weeklyHours, roomType]
type LoadRow = [number, number, number, number, RoomType];

const LOAD_MATRIX: LoadRow[] = [
  // 1-K1 (guruh 0)
  [0, 0, 0, 4, "oddiy"],       // Matematika — Ergashev
  [0, 1, 1, 2, "laboratoriya"], // Fizika — Karimova
  [0, 2, 6, 2, "kompyuter_xona"], // Informatika — Nazarov
  [0, 3, 2, 2, "oddiy"],       // Algoritmlar — Toshmatov
  [0, 4, 4, 2, "kompyuter_xona"], // MB — Xasanov
  [0, 5, 6, 2, "kompyuter_xona"], // Web — Nazarov
  [0, 6, 3, 2, "oddiy"],       // Ingliz tili — Rahimova
  [0, 7, 5, 2, "oddiy"],       // O'zbek tili — Abdullayeva
  [0, 8, 7, 2, "oddiy"],       // Iqtisodiyot — Yusupova
  [0, 9, 8, 2, "laboratoriya"], // Elektronika — Mirzayev

  // 1-K2 (guruh 1)
  [1, 0, 0, 4, "oddiy"],
  [1, 1, 1, 2, "laboratoriya"],
  [1, 2, 6, 2, "kompyuter_xona"],
  [1, 3, 2, 2, "oddiy"],
  [1, 4, 4, 2, "kompyuter_xona"],
  [1, 5, 6, 2, "kompyuter_xona"],
  [1, 6, 3, 2, "oddiy"],
  [1, 7, 5, 2, "oddiy"],
  [1, 8, 7, 2, "oddiy"],
  [1, 9, 8, 2, "laboratoriya"],

  // 2-K1 (guruh 2)
  [2, 0, 0, 2, "oddiy"],
  [2, 1, 1, 2, "laboratoriya"],
  [2, 3, 2, 2, "oddiy"],
  [2, 4, 4, 2, "kompyuter_xona"],
  [2, 5, 4, 2, "kompyuter_xona"],
  [2, 6, 3, 2, "oddiy"],
  [2, 7, 5, 2, "oddiy"],
  [2, 8, 7, 2, "oddiy"],
  [2, 9, 8, 2, "laboratoriya"],

  // 3-K1 (guruh 3)
  [3, 0, 0, 2, "oddiy"],
  [3, 1, 1, 2, "laboratoriya"],
  [3, 2, 6, 2, "kompyuter_xona"],
  [3, 3, 2, 2, "oddiy"],
  [3, 4, 4, 2, "kompyuter_xona"],
  [3, 5, 6, 2, "kompyuter_xona"],
  [3, 6, 3, 2, "oddiy"],
  [3, 7, 5, 2, "oddiy"],
  [3, 8, 7, 2, "oddiy"],
  [3, 9, 8, 2, "laboratoriya"],

  // 1-S1 (guruh 4)
  [4, 0, 8, 4, "oddiy"],
  [4, 1, 1, 2, "laboratoriya"],
  [4, 2, 9, 2, "kompyuter_xona"],
  [4, 3, 2, 2, "oddiy"],
  [4, 4, 4, 2, "kompyuter_xona"],
  [4, 5, 9, 2, "kompyuter_xona"],
  [4, 7, 5, 2, "oddiy"],
  [4, 8, 7, 2, "oddiy"],
  [4, 9, 8, 2, "laboratoriya"],

  // 2-S1 (guruh 5)
  [5, 0, 8, 2, "oddiy"],
  [5, 1, 1, 2, "laboratoriya"],
  [5, 2, 9, 2, "kompyuter_xona"],
  [5, 3, 4, 2, "oddiy"],
  [5, 4, 4, 2, "kompyuter_xona"],
  [5, 5, 9, 2, "kompyuter_xona"],
  [5, 6, 3, 2, "oddiy"],
  [5, 7, 5, 2, "oddiy"],
  [5, 8, 7, 2, "oddiy"],

  // 1-E1 (guruh 6)
  [6, 0, 0, 2, "oddiy"],
  [6, 1, 1, 2, "laboratoriya"],
  [6, 2, 9, 2, "kompyuter_xona"],
  [6, 3, 2, 2, "oddiy"],
  [6, 6, 3, 2, "oddiy"],
  [6, 7, 5, 2, "oddiy"],
  [6, 8, 7, 2, "oddiy"],

  // 2-E1 (guruh 7)
  [7, 0, 0, 2, "oddiy"],
  [7, 2, 9, 2, "kompyuter_xona"],
  [7, 4, 4, 2, "kompyuter_xona"],
  [7, 5, 6, 2, "kompyuter_xona"],
  [7, 6, 3, 2, "oddiy"],
  [7, 7, 5, 2, "oddiy"],
  [7, 8, 7, 2, "oddiy"],
];

const DAYS_KEYS: DayKey[] = ["dushanba", "seshanba", "chorshanba", "payshanba", "juma"];

// ─── Asosiy funksiyalar ─────────────────────────────────────────────────────

export function seedDemoData(stores: DemoStores): {
  teachers: number;
  groups: number;
  subjects: number;
  rooms: number;
  loads: number;
  entries: number;
  changelog: number;
} {
  const {
    teacherStore,
    groupStore,
    subjectStore,
    roomStore,
    timetableStore,
    loadStore,
    changelogStore,
  } = stores;

  // 1. Avval hammasini tozalaymiz
  clearAllDemoData(stores);

  // 2. O'qituvchilar
  const teacherIds: string[] = [];
  for (const t of DEMO_TEACHERS) {
    const created = teacherStore.addTeacher(t);
    teacherIds.push(created.id);
  }

  // 3. Guruhlar
  const groupIds: string[] = [];
  for (const g of DEMO_GROUPS) {
    const created = groupStore.addGroup({ ...g, department_id: DEMO_DEPT_ID });
    groupIds.push(created.id);
  }

  // 4. Fanlar
  const subjectIds: string[] = [];
  for (let i = 0; i < DEMO_SUBJECTS.length; i++) {
    const s = DEMO_SUBJECTS[i];
    const created = subjectStore.addSubject({
      ...s,
      color: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
    });
    subjectIds.push(created.id);
  }

  // 5. Xonalar
  const roomIds: string[] = [];
  for (const r of DEMO_ROOMS) {
    const created = roomStore.addRoom(r);
    roomIds.push(created.id);
  }

  // 6. Fan yuklamalari (SubjectLoad)
  let loadCount = 0;
  for (const [gIdx, sIdx, tIdx, hours, roomType] of LOAD_MATRIX) {
    loadStore.addLoad({
      group_id: groupIds[gIdx],
      subject_id: subjectIds[sIdx],
      teacher_id: teacherIds[tIdx],
      weekly_hours: hours,
      room_type: roomType,
    });
    loadCount++;
  }

  // 7. Jadval yozuvlari (ScheduleEntry)
  const entryIds: string[] = [];
  for (const [dayIdx, slotId, gIdxArr, sIdx, tIdx, rIdx] of SCHEDULE_MATRIX) {
    const entry = timetableStore.placeEntry({
      period_id: DEMO_PERIOD_ID,
      day: DAYS_KEYS[dayIdx],
      slot_id: slotId,
      group_ids: gIdxArr.map((i) => groupIds[i]),
      subject_id: subjectIds[sIdx],
      teacher_id: teacherIds[tIdx],
      room_id: roomIds[rIdx],
      is_manual: true,
      created_by: DEMO_USER_ID,
    });
    entryIds.push(entry.id);
  }

  // 8. Changelog yozuvlari — role-based filtrlash uchun to'liq data
  // Turli o'qituvchilar, guruhlar va track'larni qamrab oluvchi yozuvlar
  // [matrixIndex, action]
  const CHANGELOG_ENTRIES: [number, "create" | "update" | "delete"][] = [
    [0, "create"],   // teacher 0 (Ergashev), group 0 (1-K1) — kunduzgi
    [1, "create"],   // teacher 3 (Rahimova), group 1 (1-K2) — kunduzgi
    [3, "create"],   // teacher 6 (Nazarov), group 3 (3-K1) — kunduzgi
    [4, "create"],   // teacher 1 (Karimova), group 0 (1-K1) — kunduzgi
    [6, "create"],   // teacher 4 (Xasanov), group 2 (2-K1) — kunduzgi
    [13, "create"],  // teacher 5 (Abdullayeva), group 4 (1-S1) — sirtqi
    [16, "create"],  // teacher 3 (Rahimova), group 7 (2-E1) — kechki
    [8, "update"],   // teacher 7 (Yusupova), groups 0,1 (1-K1+1-K2) — kunduzgi
    [10, "update"],  // teacher 8 (Mirzayev), group 3 (3-K1) — kunduzgi
    [11, "update"],  // teacher 8 (Mirzayev), group 4 (1-S1) — sirtqi
    [12, "update"],  // teacher 9 (Qodirov), group 5 (2-S1) — sirtqi
    [15, "update"],  // teacher 0 (Ergashev), group 6 (1-E1) — kechki
    [2, "delete"],   // teacher 2 (Toshmatov), group 2 (2-K1) — kunduzgi
    [9, "delete"],   // teacher 3 (Rahimova), group 2 (2-K1) — kunduzgi
    [17, "delete"],  // teacher 9 (Qodirov), group 6 (1-E1) — kechki
  ];
  const changelogCount = Math.min(CHANGELOG_ENTRIES.length, entryIds.length);
  for (let i = 0; i < changelogCount; i++) {
    const [mIdx, action] = CHANGELOG_ENTRIES[i];
    const [dayIdx, slotId, gIdxArr, sIdx, tIdx, rIdx] = SCHEDULE_MATRIX[mIdx];
    const fullData = {
      slot_id: slotId,
      day: DAYS_KEYS[dayIdx],
      teacher_id: teacherIds[tIdx],
      group_ids: gIdxArr.map((gi: number) => groupIds[gi]),
      subject_id: subjectIds[sIdx],
      room_id: roomIds[rIdx],
    };
    changelogStore.addLog({
      entry_id: entryIds[mIdx],
      action,
      old_data: action === "create" ? null : fullData,
      new_data: action === "delete" ? null : fullData,
      changed_by: DEMO_USER_ID,
    });
  }

  return {
    teachers: teacherIds.length,
    groups: groupIds.length,
    subjects: subjectIds.length,
    rooms: roomIds.length,
    loads: loadCount,
    entries: entryIds.length,
    changelog: changelogCount,
  };
}

export function clearAllDemoData(stores: DemoStores): void {
  const {
    teacherStore,
    groupStore,
    subjectStore,
    roomStore,
    timetableStore,
    loadStore,
    changelogStore,
  } = stores;

  // Jadval va bog'liq datalarni tozalaymiz
  timetableStore.clearAll();
  loadStore.clearAll();
  changelogStore.clearAll();

  // Master datalarni tozalaymiz
  const teacherIds = teacherStore.teachers.map((t) => t.id);
  if (teacherIds.length > 0) teacherStore.deleteTeachers(teacherIds);

  const groupIds = groupStore.groups.map((g) => g.id);
  if (groupIds.length > 0) groupStore.deleteGroups(groupIds);

  const subjectIds = subjectStore.subjects.map((s) => s.id);
  if (subjectIds.length > 0) subjectStore.deleteSubjects(subjectIds);

  const roomIds = roomStore.rooms.map((r) => r.id);
  if (roomIds.length > 0) roomStore.deleteRooms(roomIds);
}
