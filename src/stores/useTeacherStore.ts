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
  updateTeacher: (id: ID, data: Partial<Teacher>) => void;
  deleteTeacher: (id: ID) => void;
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

      updateTeacher: (id, data) =>
        set((s) => ({
          teachers: s.teachers.map((t) =>
            t.id === id
              ? { ...t, ...data, updated_at: new Date().toISOString() }
              : t
          ),
        })),

      deleteTeacher: (id) =>
        set((s) => ({ teachers: s.teachers.filter((t) => t.id !== id) })),

      getTeacherById: (id) => get().teachers.find((t) => t.id === id),
    }),
    { name: "besttimetable-teachers", version: 1 }
  )
);
