"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ScheduleChangelog, ID } from "@/lib/types";
import { changelogSync } from "@/lib/supabase/sync";
import { syncSafe } from "@/lib/supabase/sync-safe";

interface ChangelogState {
  logs: ScheduleChangelog[];
  addLog: (data: Omit<ScheduleChangelog, "id" | "changed_at">) => void;
  getLogs: (limit?: number) => ScheduleChangelog[];
  getLogsByEntry: (entryId: ID) => ScheduleChangelog[];
  clearAll: () => void;
  bulkLoad: (logs: ScheduleChangelog[]) => void;
}

export const useChangelogStore = create<ChangelogState>()(
  persist(
    (set, get) => ({
      logs: [],

      addLog: (data) => {
        const log: ScheduleChangelog = {
          ...data,
          id: crypto.randomUUID(),
          changed_at: new Date().toISOString(),
        };
        set((s) => ({ logs: [log, ...s.logs] }));
        syncSafe(() => changelogSync.insert(log));
      },

      getLogs: (limit = 50) => get().logs.slice(0, limit),

      getLogsByEntry: (entryId) =>
        get().logs.filter((l) => l.entry_id === entryId),

      clearAll: () => {
        set({ logs: [] });
        syncSafe(() => changelogSync.removeAll());
      },

      bulkLoad: (logs) => set({ logs }),
    }),
    {
      name: "besttimetable-changelog",
      version: 2,
      migrate: (_persisted, version) => {
        if (version < 2) return { logs: [] };
        return _persisted as Record<string, unknown>;
      },
    }
  )
);
