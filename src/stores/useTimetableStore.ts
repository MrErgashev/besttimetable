"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { ScheduleEntry, ID, DayKey } from "@/lib/types";

interface TimetableState {
  entries: ScheduleEntry[];

  // Actions
  placeEntry: (
    data: Omit<ScheduleEntry, "id" | "created_at" | "updated_at">
  ) => ScheduleEntry;
  moveEntry: (entryId: ID, newDay: DayKey, newSlotId: string) => void;
  removeEntry: (entryId: ID) => void;
  clearAll: () => void;
  bulkLoad: (entries: ScheduleEntry[]) => void;

  // Lookups
  getCell: (day: DayKey, slotId: string, groupId: ID) => ScheduleEntry | undefined;
  getEntriesForGroup: (groupId: ID) => ScheduleEntry[];
  getEntriesForTeacher: (teacherId: ID) => ScheduleEntry[];
  getEntriesForRoom: (roomId: ID) => ScheduleEntry[];
}

export const useTimetableStore = create<TimetableState>()(
  persist(
    (set, get) => ({
      entries: [],

      placeEntry: (data) => {
        const entry: ScheduleEntry = {
          ...data,
          id: nanoid(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set((s) => ({ entries: [...s.entries, entry] }));
        return entry;
      },

      moveEntry: (entryId, newDay, newSlotId) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === entryId
              ? {
                  ...e,
                  day: newDay,
                  slot_id: newSlotId,
                  updated_at: new Date().toISOString(),
                }
              : e
          ),
        })),

      removeEntry: (entryId) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== entryId) })),

      clearAll: () => set({ entries: [] }),

      bulkLoad: (entries) => set({ entries }),

      getCell: (day, slotId, groupId) =>
        get().entries.find(
          (e) =>
            e.day === day &&
            e.slot_id === slotId &&
            e.group_ids.includes(groupId)
        ),

      getEntriesForGroup: (groupId) =>
        get().entries.filter((e) => e.group_ids.includes(groupId)),

      getEntriesForTeacher: (teacherId) =>
        get().entries.filter((e) => e.teacher_id === teacherId),

      getEntriesForRoom: (roomId) =>
        get().entries.filter((e) => e.room_id === roomId),
    }),
    { name: "besttimetable-timetable", version: 1 }
  )
);
