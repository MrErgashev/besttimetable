"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Group, ID } from "@/lib/types";

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
}

export const useGroupStore = create<GroupState>()(
  persist(
    (set, get) => ({
      groups: [],

      addGroup: (data) => {
        const group: Group = {
          ...data,
          id: nanoid(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set((s) => ({ groups: [...s.groups, group] }));
        return group;
      },

      addGroups: (items) => {
        const now = new Date().toISOString();
        const newGroups = items.map((data) => ({
          ...data,
          id: nanoid(),
          created_at: now,
          updated_at: now,
        }));
        set((s) => ({ groups: [...s.groups, ...newGroups] }));
        return newGroups.length;
      },

      updateGroup: (id, data) =>
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === id
              ? { ...g, ...data, updated_at: new Date().toISOString() }
              : g
          ),
        })),

      bulkUpdateGroups: (ids, data) => {
        const idSet = new Set(ids);
        set((s) => ({
          groups: s.groups.map((g) =>
            idSet.has(g.id)
              ? { ...g, ...data, updated_at: new Date().toISOString() }
              : g
          ),
        }));
      },

      deleteGroup: (id) =>
        set((s) => ({ groups: s.groups.filter((g) => g.id !== id) })),

      deleteGroups: (ids) => {
        const idSet = new Set(ids);
        set((s) => ({
          groups: s.groups.filter((g) => !idSet.has(g.id)),
        }));
      },

      getGroupById: (id) => get().groups.find((g) => g.id === id),
    }),
    { name: "besttimetable-groups", version: 1 }
  )
);
