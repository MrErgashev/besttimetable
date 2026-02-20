/**
 * Constraint checking for timetable generation.
 * Hard constraints = MUST satisfy (no schedule if violated)
 * Soft constraints = SHOULD satisfy (penalty if violated)
 */

import type {
  ScheduleEntry,
  Teacher,
  Room,
  Group,
  SubjectLoad,
  DayKey,
  ConstraintSet,
  ConflictReport,
} from "@/lib/types";
import { DAYS, TIME_SLOTS } from "@/lib/constants";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PlacementCandidate {
  load: SubjectLoad;
  day: DayKey;
  slotId: string;
  roomId: string;
}

export interface ConstraintContext {
  existingEntries: ScheduleEntry[];
  teachers: Teacher[];
  rooms: Room[];
  groups: Group[];
  constraints: ConstraintSet;
}

// ─── Hard Constraints ───────────────────────────────────────────────────────

/** O'qituvchi shu vaqtda band emasmi? */
export function isTeacherFree(
  ctx: ConstraintContext,
  teacherId: string,
  day: DayKey,
  slotId: string
): boolean {
  return !ctx.existingEntries.some(
    (e) => e.teacher_id === teacherId && e.day === day && e.slot_id === slotId
  );
}

/** Xona shu vaqtda bo'shmi? */
export function isRoomFree(
  ctx: ConstraintContext,
  roomId: string,
  day: DayKey,
  slotId: string
): boolean {
  return !ctx.existingEntries.some(
    (e) => e.room_id === roomId && e.day === day && e.slot_id === slotId
  );
}

/** Guruh shu vaqtda bo'shmi? */
export function isGroupFree(
  ctx: ConstraintContext,
  groupId: string,
  day: DayKey,
  slotId: string
): boolean {
  return !ctx.existingEntries.some(
    (e) =>
      e.group_ids.includes(groupId) && e.day === day && e.slot_id === slotId
  );
}

/** Xona sig'imi yetarlimi? */
export function roomHasCapacity(
  ctx: ConstraintContext,
  roomId: string,
  groupIds: string[]
): boolean {
  const room = ctx.rooms.find((r) => r.id === roomId);
  if (!room) return false;
  const totalStudents = groupIds.reduce((sum, gid) => {
    const group = ctx.groups.find((g) => g.id === gid);
    return sum + (group?.student_count || 0);
  }, 0);
  return room.capacity >= totalStudents;
}

/** Xona turi to'g'rimi? (lab kerak bo'lsa lab xona) */
export function roomTypeMatches(
  ctx: ConstraintContext,
  roomId: string,
  requiredType: string
): boolean {
  const room = ctx.rooms.find((r) => r.id === roomId);
  if (!room) return false;
  if (requiredType === "oddiy") return true; // oddiy istalgan xonada bo'lishi mumkin
  return room.type === requiredType;
}

/** Barcha hard constraintlarni tekshirish */
export function checkHardConstraints(
  ctx: ConstraintContext,
  candidate: PlacementCandidate
): boolean {
  const { load, day, slotId, roomId } = candidate;

  // O'qituvchi bo'shmi?
  if (!isTeacherFree(ctx, load.teacher_id, day, slotId)) return false;

  // Xona bo'shmi?
  if (!isRoomFree(ctx, roomId, day, slotId)) return false;

  // Guruh bo'shmi?
  if (!isGroupFree(ctx, load.group_id, day, slotId)) return false;

  // Xona sig'imi
  if (!roomHasCapacity(ctx, roomId, [load.group_id])) return false;

  // Xona turi
  if (!roomTypeMatches(ctx, roomId, load.room_type)) return false;

  // Guruhning trek slotlariga mos kelishi
  const group = ctx.groups.find((g) => g.id === load.group_id);
  const slot = TIME_SLOTS.find((s) => s.id === slotId);
  if (group && slot && group.track !== slot.track) return false;

  return true;
}

// ─── Soft Constraints (penalty-based) ───────────────────────────────────────

/** Soft constraint buzilganlar uchun penalty hisoblash (past = yaxshi) */
export function calculatePenalty(
  ctx: ConstraintContext,
  candidate: PlacementCandidate
): number {
  let penalty = 0;
  const { load, day, slotId } = candidate;
  const { constraints } = ctx;

  // 1. Ketma-ket darslar chegarasi
  if (constraints.max_consecutive_lessons > 0) {
    const teacherDayEntries = ctx.existingEntries.filter(
      (e) => e.teacher_id === load.teacher_id && e.day === day
    );
    const slotIndex = TIME_SLOTS.findIndex((s) => s.id === slotId);
    let consecutive = 1;
    // Oldinga tekshir
    for (let i = slotIndex - 1; i >= 0; i--) {
      if (
        teacherDayEntries.some((e) => e.slot_id === TIME_SLOTS[i].id)
      ) {
        consecutive++;
      } else break;
    }
    // Orqaga tekshir
    for (let i = slotIndex + 1; i < TIME_SLOTS.length; i++) {
      if (
        teacherDayEntries.some((e) => e.slot_id === TIME_SLOTS[i].id)
      ) {
        consecutive++;
      } else break;
    }
    if (consecutive > constraints.max_consecutive_lessons) {
      penalty += (consecutive - constraints.max_consecutive_lessons) * 10;
    }
  }

  // 2. Oxirgi slotdan qochish
  if (constraints.avoid_last_slot) {
    const trackSlots = TIME_SLOTS.filter((s) => {
      const group = ctx.groups.find((g) => g.id === load.group_id);
      return group && s.track === group.track;
    });
    if (trackSlots.length > 0 && slotId === trackSlots[trackSlots.length - 1].id) {
      penalty += 5;
    }
  }

  // 3. Kunlar bo'yicha teng taqsimlash
  if (constraints.distribute_evenly) {
    const teacherDayCount = ctx.existingEntries.filter(
      (e) => e.teacher_id === load.teacher_id && e.day === day
    ).length;
    const avgPerDay =
      ctx.existingEntries.filter((e) => e.teacher_id === load.teacher_id)
        .length / DAYS.length;
    if (teacherDayCount > avgPerDay + 1) {
      penalty += (teacherDayCount - avgPerDay) * 3;
    }
  }

  // 4. Birinchi kurs uchun ertalab afzal
  if (constraints.prefer_morning_for_first_year) {
    const group = ctx.groups.find((g) => g.id === load.group_id);
    if (group && group.course === 1) {
      const slotIndex = TIME_SLOTS.findIndex((s) => s.id === slotId);
      if (slotIndex > 2) penalty += 2; // 3-poradan keyin penalty
    }
  }

  // 5. O'qituvchi haftalik yuklama chegarasi
  const teacher = ctx.teachers.find((t) => t.id === load.teacher_id);
  if (teacher) {
    const weeklyCount = ctx.existingEntries.filter(
      (e) => e.teacher_id === load.teacher_id
    ).length;
    // 1.5 soat per slot assumed
    if ((weeklyCount + 1) * 1.5 > teacher.max_weekly_hours) {
      penalty += 20;
    }
  }

  return penalty;
}

// ─── Conflict Detection ─────────────────────────────────────────────────────

/** Barcha mavjud yozuvlardagi konfliktlarni topish */
export function detectConflicts(
  entries: ScheduleEntry[],
  teachers: Teacher[],
  rooms: Room[],
  groups: Group[]
): ConflictReport[] {
  const conflicts: ConflictReport[] = [];

  // Slot bo'yicha guruhlash
  const bySlot = new Map<string, ScheduleEntry[]>();
  for (const e of entries) {
    const key = `${e.day}::${e.slot_id}`;
    if (!bySlot.has(key)) bySlot.set(key, []);
    bySlot.get(key)!.push(e);
  }

  for (const [, slotEntries] of bySlot) {
    // O'qituvchi double-booking
    const teacherMap = new Map<string, ScheduleEntry[]>();
    for (const e of slotEntries) {
      if (!teacherMap.has(e.teacher_id)) teacherMap.set(e.teacher_id, []);
      teacherMap.get(e.teacher_id)!.push(e);
    }
    for (const [tid, tes] of teacherMap) {
      if (tes.length > 1) {
        const teacher = teachers.find((t) => t.id === tid);
        conflicts.push({
          type: "teacher_double",
          description: `${teacher?.short_name || tid} bir vaqtda ${tes.length} ta darsda`,
          entry_ids: tes.map((e) => e.id),
        });
      }
    }

    // Xona double-booking
    const roomMap = new Map<string, ScheduleEntry[]>();
    for (const e of slotEntries) {
      if (!roomMap.has(e.room_id)) roomMap.set(e.room_id, []);
      roomMap.get(e.room_id)!.push(e);
    }
    for (const [rid, res] of roomMap) {
      if (res.length > 1) {
        const room = rooms.find((r) => r.id === rid);
        conflicts.push({
          type: "room_double",
          description: `${room?.name || rid} bir vaqtda ${res.length} ta darsda ishlatilmoqda`,
          entry_ids: res.map((e) => e.id),
        });
      }
    }

    // Guruh double-booking
    const groupSlots = new Map<string, ScheduleEntry[]>();
    for (const e of slotEntries) {
      for (const gid of e.group_ids) {
        if (!groupSlots.has(gid)) groupSlots.set(gid, []);
        groupSlots.get(gid)!.push(e);
      }
    }
    for (const [gid, ges] of groupSlots) {
      if (ges.length > 1) {
        const group = groups.find((g) => g.id === gid);
        conflicts.push({
          type: "group_double",
          description: `${group?.name || gid} bir vaqtda ${ges.length} ta darsda`,
          entry_ids: ges.map((e) => e.id),
        });
      }
    }
  }

  // Sig'im oshib ketishi
  for (const e of entries) {
    const room = rooms.find((r) => r.id === e.room_id);
    if (!room) continue;
    const totalStudents = e.group_ids.reduce((sum, gid) => {
      const group = groups.find((g) => g.id === gid);
      return sum + (group?.student_count || 0);
    }, 0);
    if (totalStudents > room.capacity) {
      conflicts.push({
        type: "capacity_exceeded",
        description: `${room.name}: ${totalStudents} talaba, sig'im ${room.capacity}`,
        entry_ids: [e.id],
      });
    }
  }

  return conflicts;
}
