"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { ScheduleChangelog, ID } from "@/lib/types";

interface ChangelogState {
  logs: ScheduleChangelog[];
  addLog: (data: Omit<ScheduleChangelog, "id" | "changed_at">) => void;
  getLogs: (limit?: number) => ScheduleChangelog[];
  getLogsByEntry: (entryId: ID) => ScheduleChangelog[];
  clearAll: () => void;
}

export const useChangelogStore = create<ChangelogState>()(
  persist(
    (set, get) => ({
      logs: [],

      addLog: (data) => {
        const log: ScheduleChangelog = {
          ...data,
          id: nanoid(),
          changed_at: new Date().toISOString(),
        };
        set((s) => ({ logs: [log, ...s.logs] }));
      },

      getLogs: (limit = 50) => get().logs.slice(0, limit),

      getLogsByEntry: (entryId) =>
        get().logs.filter((l) => l.entry_id === entryId),

      clearAll: () => set({ logs: [] }),
    }),
    { name: "besttimetable-changelog", version: 1 }
  )
);
