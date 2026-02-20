"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Subject, ID } from "@/lib/types";
import { SUBJECT_COLORS } from "@/lib/constants";

interface SubjectState {
  subjects: Subject[];
  addSubject: (
    data: Omit<Subject, "id" | "created_at" | "updated_at">
  ) => Subject;
  addSubjects: (
    items: Omit<Subject, "id" | "created_at" | "updated_at">[]
  ) => number;
  updateSubject: (id: ID, data: Partial<Subject>) => void;
  bulkUpdateSubjects: (ids: ID[], data: Partial<Subject>) => void;
  deleteSubject: (id: ID) => void;
  deleteSubjects: (ids: ID[]) => void;
  getSubjectById: (id: ID) => Subject | undefined;
}

export const useSubjectStore = create<SubjectState>()(
  persist(
    (set, get) => ({
      subjects: [],

      addSubject: (data) => {
        const subject: Subject = {
          ...data,
          color:
            data.color ||
            SUBJECT_COLORS[get().subjects.length % SUBJECT_COLORS.length],
          id: nanoid(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set((s) => ({ subjects: [...s.subjects, subject] }));
        return subject;
      },

      updateSubject: (id, data) =>
        set((s) => ({
          subjects: s.subjects.map((sub) =>
            sub.id === id
              ? { ...sub, ...data, updated_at: new Date().toISOString() }
              : sub
          ),
        })),

      deleteSubject: (id) =>
        set((s) => ({ subjects: s.subjects.filter((sub) => sub.id !== id) })),

      getSubjectById: (id) => get().subjects.find((sub) => sub.id === id),
    }),
    { name: "besttimetable-subjects", version: 1 }
  )
);
