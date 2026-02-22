"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Group, ID } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase/helpers";
import { groupSync } from "@/lib/supabase/sync";

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
        if (isSupabaseConfigured()) {
          groupSync.insert(group).catch(console.error);
        }
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
        if (isSupabaseConfigured()) {
          groupSync.bulkInsert(newGroups).catch(console.error);
        }
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
        if (isSupabaseConfigured()) {
          groupSync.update(id, data).catch(console.error);
        }
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
        if (isSupabaseConfigured()) {
          ids.forEach((id) => groupSync.update(id, data).catch(console.error));
        }
      },

      deleteGroup: (id) => {
        set((s) => ({ groups: s.groups.filter((g) => g.id !== id) }));
        if (isSupabaseConfigured()) {
          groupSync.remove(id).catch(console.error);
        }
      },

      deleteGroups: (ids) => {
        const idSet = new Set(ids);
        set((s) => ({
          groups: s.groups.filter((g) => !idSet.has(g.id)),
        }));
        if (isSupabaseConfigured()) {
          groupSync.removeMany(ids).catch(console.error);
        }
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
