"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Group, ID } from "@/lib/types";

interface GroupState {
  groups: Group[];
  addGroup: (data: Omit<Group, "id" | "created_at" | "updated_at">) => Group;
  updateGroup: (id: ID, data: Partial<Group>) => void;
  deleteGroup: (id: ID) => void;
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

      updateGroup: (id, data) =>
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === id
              ? { ...g, ...data, updated_at: new Date().toISOString() }
              : g
          ),
        })),

      deleteGroup: (id) =>
        set((s) => ({ groups: s.groups.filter((g) => g.id !== id) })),

      getGroupById: (id) => get().groups.find((g) => g.id === id),
    }),
    { name: "besttimetable-groups", version: 1 }
  )
);
