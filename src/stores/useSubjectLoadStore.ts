"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SubjectLoad, ID } from "@/lib/types";
import { subjectLoadSync } from "@/lib/supabase/sync";
import { syncSafe } from "@/lib/supabase/sync-safe";

interface SubjectLoadState {
  loads: SubjectLoad[];

  addLoad: (data: Omit<SubjectLoad, "id">) => SubjectLoad;
  updateLoad: (id: ID, data: Partial<SubjectLoad>) => void;
  removeLoad: (id: ID) => void;
  getLoadsForGroup: (groupId: ID) => SubjectLoad[];
  getLoadsForTeacher: (teacherId: ID) => SubjectLoad[];
  clearAll: () => void;
  bulkLoad: (loads: SubjectLoad[]) => void;
}

export const useSubjectLoadStore = create<SubjectLoadState>()(
  persist(
    (set, get) => ({
      loads: [],

      addLoad: (data) => {
        const load: SubjectLoad = { ...data, id: crypto.randomUUID() };
        set((s) => ({ loads: [...s.loads, load] }));
        syncSafe(() => subjectLoadSync.insert(load));
        return load;
      },

      updateLoad: (id, data) => {
        set((s) => ({
          loads: s.loads.map((l) => (l.id === id ? { ...l, ...data } : l)),
        }));
        syncSafe(() => subjectLoadSync.update(id, data));
      },

      removeLoad: (id) => {
        set((s) => ({ loads: s.loads.filter((l) => l.id !== id) }));
        syncSafe(() => subjectLoadSync.remove(id));
      },

      getLoadsForGroup: (groupId) =>
        get().loads.filter((l) => l.group_id === groupId),

      getLoadsForTeacher: (teacherId) =>
        get().loads.filter((l) => l.teacher_id === teacherId),

      clearAll: () => set({ loads: [] }),

      bulkLoad: (loads) => set({ loads }),
    }),
    {
      name: "besttimetable-subject-loads",
      version: 2,
      migrate: (_persisted, version) => {
        if (version < 2) return { loads: [] };
        return _persisted as Record<string, unknown>;
      },
    }
  )
);
