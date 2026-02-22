"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Teacher, ID } from "@/lib/types";
import { teacherSync } from "@/lib/supabase/sync";
import { syncSafe } from "@/lib/supabase/sync-safe";

interface TeacherState {
  teachers: Teacher[];
  addTeacher: (
    data: Omit<Teacher, "id" | "created_at" | "updated_at">
  ) => Teacher;
  addTeachers: (
    items: Omit<Teacher, "id" | "created_at" | "updated_at">[]
  ) => number;
  updateTeacher: (id: ID, data: Partial<Teacher>) => void;
  bulkUpdateTeachers: (ids: ID[], data: Partial<Teacher>) => void;
  deleteTeacher: (id: ID) => void;
  deleteTeachers: (ids: ID[]) => void;
  getTeacherById: (id: ID) => Teacher | undefined;
  bulkLoad: (teachers: Teacher[]) => void;
}

export const useTeacherStore = create<TeacherState>()(
  persist(
    (set, get) => ({
      teachers: [],

      addTeacher: (data) => {
        const teacher: Teacher = {
          ...data,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set((s) => ({ teachers: [...s.teachers, teacher] }));
        syncSafe(() => teacherSync.insert(teacher));
        return teacher;
      },

      addTeachers: (items) => {
        const now = new Date().toISOString();
        const newTeachers: Teacher[] = items.map((data) => ({
          ...data,
          id: crypto.randomUUID(),
          created_at: now,
          updated_at: now,
        }));
        set((s) => ({ teachers: [...s.teachers, ...newTeachers] }));
        syncSafe(() => teacherSync.bulkInsert(newTeachers));
        return newTeachers.length;
      },

      updateTeacher: (id, data) => {
        set((s) => ({
          teachers: s.teachers.map((t) =>
            t.id === id
              ? { ...t, ...data, updated_at: new Date().toISOString() }
              : t
          ),
        }));
        syncSafe(() => teacherSync.update(id, data));
      },

      bulkUpdateTeachers: (ids, data) => {
        const idSet = new Set(ids);
        set((s) => ({
          teachers: s.teachers.map((t) =>
            idSet.has(t.id)
              ? { ...t, ...data, updated_at: new Date().toISOString() }
              : t
          ),
        }));
        ids.forEach((id) => syncSafe(() => teacherSync.update(id, data)));
      },

      deleteTeacher: (id) => {
        set((s) => ({ teachers: s.teachers.filter((t) => t.id !== id) }));
        syncSafe(() => teacherSync.remove(id));
      },

      deleteTeachers: (ids) => {
        const idSet = new Set(ids);
        set((s) => ({
          teachers: s.teachers.filter((t) => !idSet.has(t.id)),
        }));
        syncSafe(() => teacherSync.removeMany(ids));
      },

      getTeacherById: (id) => get().teachers.find((t) => t.id === id),

      bulkLoad: (teachers) => set({ teachers }),
    }),
    {
      name: "besttimetable-teachers",
      version: 2,
      migrate: (_persisted, version) => {
        if (version < 2) return { teachers: [] };
        return _persisted as Record<string, unknown>;
      },
    }
  )
);
