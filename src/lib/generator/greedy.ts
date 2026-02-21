/**
 * Greedy timetable generator with Most-Constrained-First heuristic.
 *
 * Algoritm:
 * 1. SubjectLoad'larni "most constrained first" tartibda saralash
 * 2. Har bir load uchun barcha mumkin bo'lgan (day, slot, room) kombinatsiyalarni sinash
 * 3. Hard constraintlar o'tsa — soft penalty hisoblash
 * 4. Eng kam penalty'li variantni tanlash
 * 5. Joylashtirib bo'lmaganlarni unplaced ro'yxatiga qo'shish
 */

import { nanoid } from "nanoid";
import type {
  ScheduleEntry,
  SubjectLoad,
  Teacher,
  Room,
  Group,
  DayKey,
  ConstraintSet,
  GenerationResult,
  ConflictReport,
} from "@/lib/types";
import { DAYS, TIME_SLOTS } from "@/lib/constants";
import {
  checkHardConstraints,
  calculatePenalty,
  detectConflicts,
  type ConstraintContext,
  type PlacementCandidate,
} from "./constraints";

// ─── Progress callback ──────────────────────────────────────────────────────
export type ProgressCallback = (placed: number, total: number) => void;

// ─── Most-Constrained-First ordering ────────────────────────────────────────

function countAvailableSlots(
  load: SubjectLoad,
  ctx: ConstraintContext
): number {
  const group = ctx.groups.find((g) => g.id === load.group_id);
  if (!group) return 0;

  const trackSlots = TIME_SLOTS.filter((s) => s.track === group.track);
  let count = 0;

  for (const day of DAYS) {
    for (const slot of trackSlots) {
      const candidate: PlacementCandidate = {
        load,
        day: day.key,
        slotId: slot.id,
        roomId: "", // placeholder
      };
      // O'qituvchi va guruh bo'sh bo'lsa hisoblash
      const teacherFree = !ctx.existingEntries.some(
        (e) =>
          e.teacher_id === load.teacher_id &&
          e.day === day.key &&
          e.slot_id === slot.id
      );
      const groupFree = !ctx.existingEntries.some(
        (e) =>
          e.group_ids.includes(load.group_id) &&
          e.day === day.key &&
          e.slot_id === slot.id
      );
      if (teacherFree && groupFree) count++;
    }
  }
  return count;
}

function sortByMostConstrained(
  loads: SubjectLoad[],
  ctx: ConstraintContext
): SubjectLoad[] {
  return [...loads].sort((a, b) => {
    const slotsA = countAvailableSlots(a, ctx);
    const slotsB = countAvailableSlots(b, ctx);
    return slotsA - slotsB; // Eng kam imkoniyatli birinchi
  });
}

// ─── Expand loads to individual lessons ─────────────────────────────────────

interface LessonTask {
  load: SubjectLoad;
  lessonIndex: number; // haftalik nechta darsdan nechtanchisi
}

function expandLoadsToLessons(loads: SubjectLoad[]): LessonTask[] {
  const lessons: LessonTask[] = [];
  for (const load of loads) {
    // 1.5 soat per juftlik, weekly_hours ni juftliklarga aylantirish
    const lessonsPerWeek = Math.ceil(load.weekly_hours / 1.5);
    for (let i = 0; i < lessonsPerWeek; i++) {
      lessons.push({ load, lessonIndex: i });
    }
  }
  return lessons;
}

// ─── Find best placement for one lesson ─────────────────────────────────────

interface ScoredPlacement {
  day: DayKey;
  slotId: string;
  roomId: string;
  penalty: number;
}

function findBestPlacement(
  lesson: LessonTask,
  ctx: ConstraintContext
): ScoredPlacement | null {
  const { load } = lesson;
  const group = ctx.groups.find((g) => g.id === load.group_id);
  if (!group) return null;

  const trackSlots = TIME_SLOTS.filter((s) => s.track === group.track);
  const matchingRooms = ctx.rooms.filter((r) => {
    if (load.room_type === "oddiy") return true;
    return r.type === load.room_type;
  });

  const candidates: ScoredPlacement[] = [];

  for (const day of DAYS) {
    for (const slot of trackSlots) {
      for (const room of matchingRooms) {
        const candidate: PlacementCandidate = {
          load,
          day: day.key,
          slotId: slot.id,
          roomId: room.id,
        };

        if (!checkHardConstraints(ctx, candidate)) continue;

        const penalty = calculatePenalty(ctx, candidate);
        candidates.push({
          day: day.key,
          slotId: slot.id,
          roomId: room.id,
          penalty,
        });
      }
    }
  }

  if (candidates.length === 0) return null;

  // Eng kam penalty'li variantni tanlash (randomlik bilan bir xil penalty bo'lsa)
  candidates.sort((a, b) => a.penalty - b.penalty);
  const bestPenalty = candidates[0].penalty;
  const bestCandidates = candidates.filter((c) => c.penalty === bestPenalty);
  return bestCandidates[Math.floor(Math.random() * bestCandidates.length)];
}

// ─── Main greedy generator ──────────────────────────────────────────────────

export interface GreedyOptions {
  loads: SubjectLoad[];
  teachers: Teacher[];
  rooms: Room[];
  groups: Group[];
  constraints: ConstraintSet;
  existingEntries?: ScheduleEntry[];
  onProgress?: ProgressCallback;
}

export function generateGreedy(options: GreedyOptions): GenerationResult {
  const startTime = Date.now();
  const {
    loads,
    teachers,
    rooms,
    groups,
    constraints,
    existingEntries = [],
    onProgress,
  } = options;

  // Kontekst
  const ctx: ConstraintContext = {
    existingEntries: [...existingEntries],
    teachers,
    rooms,
    groups,
    constraints,
  };

  // Darslarni kengaytirish
  const allLessons = expandLoadsToLessons(loads);
  const total = allLessons.length;
  let placed = 0;

  // Most-constrained-first tartibda saralash
  // Har bir qadamda qayta saralash (dynamic ordering)
  const remaining = [...allLessons];
  const unplaced: LessonTask[] = [];

  while (remaining.length > 0) {
    // Har safar qayta saralash chunki kontekst o'zgaradi
    const sortedLoads = sortByMostConstrained(
      remaining.map((l) => l.load),
      ctx
    );

    // Eng cheklangan load'ni topish
    const nextLoad = sortedLoads[0];
    const nextIdx = remaining.findIndex((l) => l.load === nextLoad);
    if (nextIdx === -1) break;

    const lesson = remaining.splice(nextIdx, 1)[0];
    const best = findBestPlacement(lesson, ctx);

    if (best) {
      const entry: ScheduleEntry = {
        id: nanoid(),
        period_id: "current",
        day: best.day,
        slot_id: best.slotId,
        group_ids: [lesson.load.group_id],
        subject_id: lesson.load.subject_id,
        teacher_id: lesson.load.teacher_id,
        room_id: best.roomId,
        is_manual: false,
        created_by: "generator",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      ctx.existingEntries.push(entry);
      placed++;
    } else {
      unplaced.push(lesson);
    }

    onProgress?.(placed, total);
  }

  // Konfliktlarni tekshirish
  const newEntries = ctx.existingEntries.slice(existingEntries.length);
  const conflicts = detectConflicts(
    ctx.existingEntries,
    teachers,
    rooms,
    groups
  );

  return {
    status: placed === total ? "complete" : unplaced.length > 0 ? "partial" : "complete",
    placed,
    total,
    conflicts,
    duration_ms: Date.now() - startTime,
  };
}

/** Natija yozuvlarini olish (greedy generator ishlatgandan keyin) */
export function generateGreedyWithEntries(
  options: GreedyOptions
): { result: GenerationResult; entries: ScheduleEntry[] } {
  const startTime = Date.now();
  const {
    loads,
    teachers,
    rooms,
    groups,
    constraints,
    existingEntries = [],
    onProgress,
  } = options;

  const ctx: ConstraintContext = {
    existingEntries: [...existingEntries],
    teachers,
    rooms,
    groups,
    constraints,
  };

  const allLessons = expandLoadsToLessons(loads);
  const total = allLessons.length;
  let placed = 0;
  const remaining = [...allLessons];

  while (remaining.length > 0) {
    const sortedLoads = sortByMostConstrained(
      remaining.map((l) => l.load),
      ctx
    );

    const nextLoad = sortedLoads[0];
    const nextIdx = remaining.findIndex((l) => l.load === nextLoad);
    if (nextIdx === -1) break;

    const lesson = remaining.splice(nextIdx, 1)[0];
    const best = findBestPlacement(lesson, ctx);

    if (best) {
      const entry: ScheduleEntry = {
        id: nanoid(),
        period_id: "current",
        day: best.day,
        slot_id: best.slotId,
        group_ids: [lesson.load.group_id],
        subject_id: lesson.load.subject_id,
        teacher_id: lesson.load.teacher_id,
        room_id: best.roomId,
        is_manual: false,
        created_by: "generator",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      ctx.existingEntries.push(entry);
      placed++;
    }

    onProgress?.(placed, total);
  }

  const newEntries = ctx.existingEntries.slice(existingEntries.length);
  const conflicts = detectConflicts(ctx.existingEntries, teachers, rooms, groups);

  return {
    result: {
      status: placed === total ? "complete" : "partial",
      placed,
      total,
      conflicts,
      duration_ms: Date.now() - startTime,
    },
    entries: newEntries,
  };
}
