/**
 * Backtracking repair for timetable generation.
 *
 * Greedy algoritm ba'zi darslarni joylashtira olmasa,
 * backtracking bilan qayta urinib ko'rish:
 * 1. Joylashtirilmagan darslarni olish
 * 2. Har bir unplaced dars uchun, conflicting entry'larni vaqtincha olib tashlash
 * 3. Yangi darsni joylashtirish
 * 4. Olib tashlangan darslarni boshqa joyga ko'chirish
 * 5. Agar muvaffaqiyatli — saqlab qolish, aks holda — qaytarish
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
} from "@/lib/types";
import { DAYS, TIME_SLOTS } from "@/lib/constants";
import {
  checkHardConstraints,
  calculatePenalty,
  detectConflicts,
  type ConstraintContext,
  type PlacementCandidate,
} from "./constraints";
import type { ProgressCallback } from "./greedy";
import { generateGreedyWithEntries } from "./greedy";

// ─── Backtracking repair ────────────────────────────────────────────────────

export interface BacktrackOptions {
  /** Joylashtirilmagan darslar ro'yxati */
  unplacedLoads: SubjectLoad[];
  /** Mavjud yozuvlar (greedy natijasi) */
  currentEntries: ScheduleEntry[];
  teachers: Teacher[];
  rooms: Room[];
  groups: Group[];
  constraints: ConstraintSet;
  /** Maksimal urinishlar soni */
  maxAttempts?: number;
  onProgress?: ProgressCallback;
}

export function backtrackRepair(
  options: BacktrackOptions
): { entries: ScheduleEntry[]; repairedCount: number } {
  const {
    unplacedLoads,
    currentEntries,
    teachers,
    rooms,
    groups,
    constraints,
    maxAttempts = 100,
    onProgress,
  } = options;

  let entries = [...currentEntries];
  let repairedCount = 0;
  let attempts = 0;

  for (const load of unplacedLoads) {
    if (attempts >= maxAttempts) break;

    const group = groups.find((g) => g.id === load.group_id);
    if (!group) continue;

    const trackSlots = TIME_SLOTS.filter((s) => s.track === group.track);
    let placed = false;

    // Har bir mumkin bo'lgan slot uchun sinash
    for (const day of DAYS) {
      if (placed) break;
      for (const slot of trackSlots) {
        if (placed) break;
        attempts++;
        if (attempts >= maxAttempts) break;

        // Shu slotdagi conflicting entry'larni topish
        const conflicting = entries.filter(
          (e) =>
            e.day === day.key &&
            e.slot_id === slot.id &&
            (e.teacher_id === load.teacher_id ||
              e.group_ids.includes(load.group_id))
        );

        if (conflicting.length === 0) {
          // Conflict yo'q — to'g'ridan-to'g'ri joylashtirish
          const matchingRooms = rooms.filter((r) => {
            if (load.room_type === "oddiy") return true;
            return r.type === load.room_type;
          });

          for (const room of matchingRooms) {
            const ctx: ConstraintContext = {
              existingEntries: entries,
              teachers,
              rooms,
              groups,
              constraints,
            };

            const candidate: PlacementCandidate = {
              load,
              day: day.key,
              slotId: slot.id,
              roomId: room.id,
            };

            if (checkHardConstraints(ctx, candidate)) {
              entries.push({
                id: nanoid(),
                period_id: "current",
                day: day.key,
                slot_id: slot.id,
                group_ids: [load.group_id],
                subject_id: load.subject_id,
                teacher_id: load.teacher_id,
                room_id: room.id,
                is_manual: false,
                created_by: "generator-backtrack",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
              repairedCount++;
              placed = true;
              break;
            }
          }
        } else if (conflicting.length === 1) {
          // Bitta conflict — uni ko'chirib ko'rish
          const conflictEntry = conflicting[0];
          const entriesWithout = entries.filter(
            (e) => e.id !== conflictEntry.id
          );

          // Avval yangi darsni joylashtirish
          const matchingRooms = rooms.filter((r) => {
            if (load.room_type === "oddiy") return true;
            return r.type === load.room_type;
          });

          let newEntryPlaced = false;
          let newEntries = entriesWithout;

          for (const room of matchingRooms) {
            const ctx: ConstraintContext = {
              existingEntries: entriesWithout,
              teachers,
              rooms,
              groups,
              constraints,
            };

            const candidate: PlacementCandidate = {
              load,
              day: day.key,
              slotId: slot.id,
              roomId: room.id,
            };

            if (checkHardConstraints(ctx, candidate)) {
              newEntries = [
                ...entriesWithout,
                {
                  id: nanoid(),
                  period_id: "current",
                  day: day.key,
                  slot_id: slot.id,
                  group_ids: [load.group_id],
                  subject_id: load.subject_id,
                  teacher_id: load.teacher_id,
                  room_id: room.id,
                  is_manual: false,
                  created_by: "generator-backtrack",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ];
              newEntryPlaced = true;
              break;
            }
          }

          if (!newEntryPlaced) continue;

          // Endi ko'chirilgan entry'ni boshqa joyga joylashtirish
          let relocatedEntry: ScheduleEntry | null = null;
          const conflictGroup = groups.find((g) =>
            conflictEntry.group_ids.includes(g.id)
          );
          const conflictTrackSlots = conflictGroup
            ? TIME_SLOTS.filter((s) => s.track === conflictGroup.track)
            : TIME_SLOTS;

          for (const rDay of DAYS) {
            if (relocatedEntry) break;
            for (const rSlot of conflictTrackSlots) {
              if (relocatedEntry) break;
              // Asl joyiga qaytarmaslik
              if (rDay.key === day.key && rSlot.id === slot.id) continue;

              for (const room of rooms) {
                const rCtx: ConstraintContext = {
                  existingEntries: newEntries,
                  teachers,
                  rooms,
                  groups,
                  constraints,
                };

                // Xona turi va sig'im tekshirish
                const rCandidate: PlacementCandidate = {
                  load: {
                    id: conflictEntry.id,
                    group_id: conflictEntry.group_ids[0],
                    subject_id: conflictEntry.subject_id,
                    teacher_id: conflictEntry.teacher_id,
                    weekly_hours: 1.5,
                    room_type:
                      rooms.find((r) => r.id === conflictEntry.room_id)
                        ?.type || "oddiy",
                  },
                  day: rDay.key,
                  slotId: rSlot.id,
                  roomId: room.id,
                };

                if (checkHardConstraints(rCtx, rCandidate)) {
                  relocatedEntry = {
                    ...conflictEntry,
                    id: nanoid(),
                    day: rDay.key,
                    slot_id: rSlot.id,
                    room_id: room.id,
                    updated_at: new Date().toISOString(),
                  };
                  break;
                }
              }
            }
          }

          if (relocatedEntry) {
            entries = [...newEntries, relocatedEntry];
            repairedCount++;
            placed = true;
          }
          // Agar relocate bo'lmasa — bu slotni o'tkazib yuborish
        }
      }
    }

    onProgress?.(repairedCount, unplacedLoads.length);
  }

  return { entries, repairedCount };
}

// ─── Full generation with backtracking ──────────────────────────────────────

export interface FullGenerationOptions {
  loads: SubjectLoad[];
  teachers: Teacher[];
  rooms: Room[];
  groups: Group[];
  constraints: ConstraintSet;
  existingManualEntries?: ScheduleEntry[];
  maxBacktrackAttempts?: number;
  onProgress?: (phase: string, placed: number, total: number) => void;
}

export function generateWithBacktracking(
  options: FullGenerationOptions
): { result: GenerationResult; entries: ScheduleEntry[] } {
  const {
    loads,
    teachers,
    rooms,
    groups,
    constraints,
    existingManualEntries = [],
    maxBacktrackAttempts = 200,
    onProgress,
  } = options;

  const startTime = Date.now();

  // 1-bosqich: Greedy
  const greedyResult = generateGreedyWithEntries({
    loads,
    teachers,
    rooms,
    groups,
    constraints,
    existingEntries: existingManualEntries,
    onProgress: (placed: number, total: number) =>
      onProgress?.("greedy", placed, total),
  });

  const greedyEntries: ScheduleEntry[] = greedyResult.entries;
  const greedyStats: GenerationResult = greedyResult.result;

  // Agar hammasi joylashtirilgan bo'lsa
  if (greedyStats.placed === greedyStats.total) {
    return {
      result: {
        ...greedyStats,
        duration_ms: Date.now() - startTime,
      },
      entries: greedyEntries,
    };
  }

  // 2-bosqich: Joylashtirilmagan darslarni topish
  const placedLoadKeys = new Set<string>();
  for (const entry of greedyEntries) {
    const key = `${entry.group_ids[0]}::${entry.subject_id}::${entry.teacher_id}`;
    const count = (placedLoadKeys.has(key) ? 1 : 0) + 1;
    placedLoadKeys.add(`${key}::${count}`);
  }

  // Simplifiyed: unplaced = total - placed darslar soniga teng load'lar
  const lessonsPerLoad = loads.map((l) => ({
    load: l,
    count: Math.ceil(l.weekly_hours / 1.5),
  }));

  const unplacedLoads: SubjectLoad[] = [];
  for (const { load, count } of lessonsPerLoad) {
    const placedCount = greedyEntries.filter(
      (e) =>
        e.group_ids.includes(load.group_id) &&
        e.subject_id === load.subject_id &&
        e.teacher_id === load.teacher_id
    ).length;
    for (let i = placedCount; i < count; i++) {
      unplacedLoads.push(load);
    }
  }

  if (unplacedLoads.length === 0) {
    return {
      result: {
        status: "complete",
        placed: greedyStats.total,
        total: greedyStats.total,
        conflicts: greedyStats.conflicts,
        duration_ms: Date.now() - startTime,
      },
      entries: greedyEntries,
    };
  }

  // 3-bosqich: Backtracking repair
  const allEntries = [...existingManualEntries, ...greedyEntries];
  const { entries: repairedEntries, repairedCount } = backtrackRepair({
    unplacedLoads,
    currentEntries: allEntries,
    teachers,
    rooms,
    groups,
    constraints,
    maxAttempts: maxBacktrackAttempts,
    onProgress: (repaired, total) =>
      onProgress?.("backtrack", greedyStats.placed + repaired, greedyStats.total),
  });

  const finalNewEntries = repairedEntries.slice(existingManualEntries.length);
  const totalPlaced = greedyStats.placed + repairedCount;
  const conflicts = detectConflicts(repairedEntries, teachers, rooms, groups);

  return {
    result: {
      status: totalPlaced === greedyStats.total ? "complete" : "partial",
      placed: totalPlaced,
      total: greedyStats.total,
      conflicts,
      duration_ms: Date.now() - startTime,
    },
    entries: finalNewEntries,
  };
}
