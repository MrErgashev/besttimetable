/**
 * PDF eksport — jsPDF + jspdf-autotable bilan A4 formatda jadval chiqarish.
 */

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { ScheduleEntry, Teacher, Subject, Room, Group } from "@/lib/types";
import { DAYS, TIME_SLOTS, TRACK_LABELS } from "@/lib/constants";
import type { TrackKey } from "@/lib/types";

interface ExportContext {
  entries: ScheduleEntry[];
  teachers: Teacher[];
  subjects: Subject[];
  rooms: Room[];
  groups: Group[];
}

// ─── Guruh bo'yicha PDF ─────────────────────────────────────────────────────

export function exportGroupPDF(
  groupId: string,
  ctx: ExportContext
): void {
  const group = ctx.groups.find((g) => g.id === groupId);
  if (!group) return;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Title
  doc.setFontSize(14);
  doc.text(`Dars jadvali — ${group.name}`, 14, 15);
  doc.setFontSize(8);
  doc.text(`Yaratilgan: ${new Date().toLocaleDateString("uz")}`, 14, 20);

  // Track bo'yicha slotlar
  const trackSlots = TIME_SLOTS.filter((s) => s.track === group.track);

  // Jadval ma'lumotlari
  const body = trackSlots.map((slot) => {
    const row = [`${slot.label}\n${slot.start}-${slot.end}`];
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
          `${subject?.short_name || "?"}\n${teacher?.short_name || "?"}\n${room?.name || "?"}`
        );
      } else {
        row.push("");
      }
    }
    return row;
  });

  autoTable(doc, {
    head: [["Vaqt", ...DAYS.map((d) => d.label)]],
    body,
    startY: 25,
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 2, valign: "middle" },
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: "bold" },
    columnStyles: { 0: { cellWidth: 25 } },
  });

  doc.save(`jadval_${group.name.replace(/\s+/g, "_")}.pdf`);
}

// ─── O'qituvchi bo'yicha PDF ────────────────────────────────────────────────

export function exportTeacherPDF(
  teacherId: string,
  ctx: ExportContext
): void {
  const teacher = ctx.teachers.find((t) => t.id === teacherId);
  if (!teacher) return;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  doc.setFontSize(14);
  doc.text(
    `Dars jadvali — ${teacher.last_name} ${teacher.first_name}`,
    14,
    15
  );
  doc.setFontSize(8);
  doc.text(`Yaratilgan: ${new Date().toLocaleDateString("uz")}`, 14, 20);

  const teacherEntries = ctx.entries.filter(
    (e) => e.teacher_id === teacherId
  );

  const body = TIME_SLOTS.map((slot) => {
    const row = [`${slot.label}\n${slot.start}-${slot.end}`];
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
          `${subject?.short_name || "?"}\n${groupNames || "?"}\n${room?.name || "?"}`
        );
      } else {
        row.push("");
      }
    }
    return row;
  });

  autoTable(doc, {
    head: [["Vaqt", ...DAYS.map((d) => d.label)]],
    body,
    startY: 25,
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 2, valign: "middle" },
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: "bold" },
    columnStyles: { 0: { cellWidth: 25 } },
  });

  doc.save(
    `jadval_${teacher.short_name.replace(/\s+/g, "_")}.pdf`
  );
}

// ─── Xona bo'yicha PDF ─────────────────────────────────────────────────────

export function exportRoomPDF(
  roomId: string,
  ctx: ExportContext
): void {
  const room = ctx.rooms.find((r) => r.id === roomId);
  if (!room) return;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  doc.setFontSize(14);
  doc.text(`Xona jadvali — ${room.name}`, 14, 15);
  doc.setFontSize(8);
  doc.text(`Yaratilgan: ${new Date().toLocaleDateString("uz")}`, 14, 20);

  const roomEntries = ctx.entries.filter((e) => e.room_id === roomId);

  const body = TIME_SLOTS.map((slot) => {
    const row = [`${slot.label}\n${slot.start}-${slot.end}`];
    for (const day of DAYS) {
      const entry = roomEntries.find(
        (e) => e.day === day.key && e.slot_id === slot.id
      );
      if (entry) {
        const subject = ctx.subjects.find((s) => s.id === entry.subject_id);
        const teacher = ctx.teachers.find((t) => t.id === entry.teacher_id);
        const groupNames = entry.group_ids
          .map((gid) => ctx.groups.find((g) => g.id === gid)?.name)
          .filter(Boolean)
          .join(", ");
        row.push(
          `${subject?.short_name || "?"}\n${teacher?.short_name || "?"}\n${groupNames || "?"}`
        );
      } else {
        row.push("");
      }
    }
    return row;
  });

  autoTable(doc, {
    head: [["Vaqt", ...DAYS.map((d) => d.label)]],
    body,
    startY: 25,
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 2, valign: "middle" },
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: "bold" },
    columnStyles: { 0: { cellWidth: 25 } },
  });

  doc.save(`xona_${room.name.replace(/\s+/g, "_")}.pdf`);
}
