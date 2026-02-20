/**
 * Excel eksport — xlsx kutubxonasi bilan jadval yaratish.
 */

import * as XLSX from "xlsx";
import type { ScheduleEntry, Teacher, Subject, Room, Group } from "@/lib/types";
import { DAYS, TIME_SLOTS } from "@/lib/constants";

interface ExportContext {
  entries: ScheduleEntry[];
  teachers: Teacher[];
  subjects: Subject[];
  rooms: Room[];
  groups: Group[];
}

// ─── Guruh bo'yicha Excel ───────────────────────────────────────────────────

export function exportGroupExcel(
  groupId: string,
  ctx: ExportContext
): void {
  const group = ctx.groups.find((g) => g.id === groupId);
  if (!group) return;

  const trackSlots = TIME_SLOTS.filter((s) => s.track === group.track);

  // Jadval sarlavha
  const header = ["Vaqt", ...DAYS.map((d) => d.label)];
  const rows = trackSlots.map((slot) => {
    const row = [`${slot.label} (${slot.start}-${slot.end})`];
    for (const day of DAYS) {
      const entry = ctx.entries.find(
        (e) =>
          e.day === day.key &&
          e.slot_id === slot.id &&
          e.group_ids.includes(groupId)
      );
      if (entry) {
        const subject = ctx.subjects.find((s) => s.id === entry.subject_id);
        const teacher = ctx.teachers.find((t) => t.id === entry.teacher_id);
        const room = ctx.rooms.find((r) => r.id === entry.room_id);
        row.push(
          `${subject?.short_name || "?"} — ${teacher?.short_name || "?"} — ${room?.name || "?"}`
        );
      } else {
        row.push("");
      }
    }
    return row;
  });

  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);

  // Ustun kengligi
  ws["!cols"] = [
    { wch: 22 },
    ...DAYS.map(() => ({ wch: 30 })),
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, group.name);

  XLSX.writeFile(wb, `jadval_${group.name.replace(/\s+/g, "_")}.xlsx`);
}

// ─── O'qituvchi bo'yicha Excel ──────────────────────────────────────────────

export function exportTeacherExcel(
  teacherId: string,
  ctx: ExportContext
): void {
  const teacher = ctx.teachers.find((t) => t.id === teacherId);
  if (!teacher) return;

  const teacherEntries = ctx.entries.filter(
    (e) => e.teacher_id === teacherId
  );

  const header = ["Vaqt", ...DAYS.map((d) => d.label)];
  const rows = TIME_SLOTS.map((slot) => {
    const row = [`${slot.label} (${slot.start}-${slot.end})`];
    for (const day of DAYS) {
      const entry = teacherEntries.find(
        (e) => e.day === day.key && e.slot_id === slot.id
      );
      if (entry) {
        const subject = ctx.subjects.find((s) => s.id === entry.subject_id);
        const room = ctx.rooms.find((r) => r.id === entry.room_id);
        const groupNames = entry.group_ids
          .map((gid) => ctx.groups.find((g) => g.id === gid)?.name)
          .filter(Boolean)
          .join(", ");
        row.push(
          `${subject?.short_name || "?"} — ${groupNames || "?"} — ${room?.name || "?"}`
        );
      } else {
        row.push("");
      }
    }
    return row;
  });

  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  ws["!cols"] = [{ wch: 22 }, ...DAYS.map(() => ({ wch: 30 }))];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, teacher.short_name);

  XLSX.writeFile(
    wb,
    `jadval_${teacher.short_name.replace(/\s+/g, "_")}.xlsx`
  );
}

// ─── Barcha guruhlar Excel (bir faylda) ─────────────────────────────────────

export function exportAllGroupsExcel(ctx: ExportContext): void {
  const wb = XLSX.utils.book_new();

  for (const group of ctx.groups) {
    const trackSlots = TIME_SLOTS.filter((s) => s.track === group.track);
    const header = ["Vaqt", ...DAYS.map((d) => d.label)];
    const rows = trackSlots.map((slot) => {
      const row = [`${slot.label} (${slot.start}-${slot.end})`];
      for (const day of DAYS) {
        const entry = ctx.entries.find(
          (e) =>
            e.day === day.key &&
            e.slot_id === slot.id &&
            e.group_ids.includes(group.id)
        );
        if (entry) {
          const subject = ctx.subjects.find((s) => s.id === entry.subject_id);
          const teacher = ctx.teachers.find((t) => t.id === entry.teacher_id);
          const room = ctx.rooms.find((r) => r.id === entry.room_id);
          row.push(
            `${subject?.short_name || "?"} — ${teacher?.short_name || "?"} — ${room?.name || "?"}`
          );
        } else {
          row.push("");
        }
      }
      return row;
    });

    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    ws["!cols"] = [{ wch: 22 }, ...DAYS.map(() => ({ wch: 30 }))];

    // Sheet nomi 31 ta belgidan oshmasligi kerak
    const sheetName = group.name.substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  XLSX.writeFile(wb, "barcha_jadvallar.xlsx");
}
