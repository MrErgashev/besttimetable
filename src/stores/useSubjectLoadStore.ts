"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { SubjectLoad, ID } from "@/lib/types";

interface SubjectLoadState {
  loads: SubjectLoad[];

  addLoad: (data: Omit<SubjectLoad, "id">) => SubjectLoad;
  updateLoad: (id: ID, data: Partial<SubjectLoad>) => void;
  removeLoad: (id: ID) => void;
  getLoadsForGroup: (groupId: ID) => SubjectLoad[];
  getLoadsForTeacher: (teacherId: ID) => SubjectLoad[];
  clearAll: () => void;
}

export const useSubjectLoadStore = create<SubjectLoadState>()(
  persist(
    (set, get) => ({
      loads: [],

      addLoad: (data) => {
        const load: SubjectLoad = { ...data, id: nanoid() };
        set((s) => ({ loads: [...s.loads, load] }));
        return load;
      },

      updateLoad: (id, data) =>
        set((s) => ({
          loads: s.loads.map((l) => (l.id === id ? { ...l, ...data } : l)),
        })),

      removeLoad: (id) =>
        set((s) => ({ loads: s.loads.filter((l) => l.id !== id) })),

      getLoadsForGroup: (groupId) =>
        get().loads.filter((l) => l.group_id === groupId),

      getLoadsForTeacher: (teacherId) =>
        get().loads.filter((l) => l.teacher_id === teacherId),

      clearAll: () => set({ loads: [] }),
    }),
    { name: "besttimetable-subject-loads", version: 1 }
  )
);
