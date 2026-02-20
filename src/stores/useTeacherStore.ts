"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Teacher, ID } from "@/lib/types";

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
}

export const useTeacherStore = create<TeacherState>()(
  persist(
    (set, get) => ({
      teachers: [],

      addTeacher: (data) => {
        const teacher: Teacher = {
          ...data,
          id: nanoid(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set((s) => ({ teachers: [...s.teachers, teacher] }));
        return teacher;
      },

      addTeachers: (items) => {
        const now = new Date().toISOString();
        const newTeachers = items.map((data) => ({
          ...data,
          id: nanoid(),
          created_at: now,
          updated_at: now,
        }));
        set((s) => ({ teachers: [...s.teachers, ...newTeachers] }));
        return newTeachers.length;
      },

      updateTeacher: (id, data) =>
        set((s) => ({
          teachers: s.teachers.map((t) =>
            t.id === id
              ? { ...t, ...data, updated_at: new Date().toISOString() }
              : t
          ),
        })),

      bulkUpdateTeachers: (ids, data) => {
        const idSet = new Set(ids);
        set((s) => ({
          teachers: s.teachers.map((t) =>
            idSet.has(t.id)
              ? { ...t, ...data, updated_at: new Date().toISOString() }
              : t
          ),
        }));
      },

      deleteTeacher: (id) =>
        set((s) => ({ teachers: s.teachers.filter((t) => t.id !== id) })),

      deleteTeachers: (ids) => {
        const idSet = new Set(ids);
        set((s) => ({
          teachers: s.teachers.filter((t) => !idSet.has(t.id)),
        }));
      },

      getTeacherById: (id) => get().teachers.find((t) => t.id === id),
    }),
    { name: "besttimetable-teachers", version: 1 }
  )
);
