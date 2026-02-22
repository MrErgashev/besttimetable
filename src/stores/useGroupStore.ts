"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Group, ID } from "@/lib/types";
import { groupSync } from "@/lib/supabase/sync";
import { syncSafe } from "@/lib/supabase/sync-safe";

interface GroupState {
  groups: Group[];
  addGroup: (data: Omit<Group, "id" | "created_at" | "updated_at">) => Group;
  addGroups: (
    items: Omit<Group, "id" | "created_at" | "updated_at">[]
  ) => number;
  updateGroup: (id: ID, data: Partial<Group>) => void;
  bulkUpdateGroups: (ids: ID[], data: Partial<Group>) => void;
  deleteGroup: (id: ID) => void;
  deleteGroups: (ids: ID[]) => void;
  getGroupById: (id: ID) => Group | undefined;
  bulkLoad: (groups: Group[]) => void;
}

export const useGroupStore = create<GroupState>()(
  persist(
    (set, get) => ({
      groups: [],

      addGroup: (data) => {
        const group: Group = {
          ...data,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set((s) => ({ groups: [...s.groups, group] }));
        syncSafe(() => groupSync.insert(group));
        return group;
      },

      addGroups: (items) => {
        const now = new Date().toISOString();
        const newGroups: Group[] = items.map((data) => ({
          ...data,
          id: crypto.randomUUID(),
          created_at: now,
          updated_at: now,
        }));
        set((s) => ({ groups: [...s.groups, ...newGroups] }));
        syncSafe(() => groupSync.bulkInsert(newGroups));
        return newGroups.length;
      },

      updateGroup: (id, data) => {
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === id
              ? { ...g, ...data, updated_at: new Date().toISOString() }
              : g
          ),
        }));
        syncSafe(() => groupSync.update(id, data));
      },

      bulkUpdateGroups: (ids, data) => {
        const idSet = new Set(ids);
        set((s) => ({
          groups: s.groups.map((g) =>
            idSet.has(g.id)
              ? { ...g, ...data, updated_at: new Date().toISOString() }
              : g
          ),
        }));
        ids.forEach((id) => syncSafe(() => groupSync.update(id, data)));
      },

      deleteGroup: (id) => {
        set((s) => ({ groups: s.groups.filter((g) => g.id !== id) }));
        syncSafe(() => groupSync.remove(id));
      },

      deleteGroups: (ids) => {
        const idSet = new Set(ids);
        set((s) => ({
          groups: s.groups.filter((g) => !idSet.has(g.id)),
        }));
        syncSafe(() => groupSync.removeMany(ids));
      },

      getGroupById: (id) => get().groups.find((g) => g.id === id),

      bulkLoad: (groups) => set({ groups }),
    }),
    {
      name: "besttimetable-groups",
      version: 2,
      migrate: (_persisted, version) => {
        if (version < 2) return { groups: [] };
        return _persisted as Record<string, unknown>;
      },
    }
  )
);
