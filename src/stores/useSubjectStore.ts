"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Subject, ID } from "@/lib/types";
import { SUBJECT_COLORS } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase/helpers";
import { subjectSync } from "@/lib/supabase/sync";

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
  bulkLoad: (subjects: Subject[]) => void;
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
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set((s) => ({ subjects: [...s.subjects, subject] }));
        if (isSupabaseConfigured()) {
          subjectSync.insert(subject).catch(console.error);
        }
        return subject;
      },

      addSubjects: (items) => {
        const now = new Date().toISOString();
        const currentCount = get().subjects.length;
        const newSubjects: Subject[] = items.map((data, i) => ({
          ...data,
          color:
            data.color ||
            SUBJECT_COLORS[(currentCount + i) % SUBJECT_COLORS.length],
          id: crypto.randomUUID(),
          created_at: now,
          updated_at: now,
        }));
        set((s) => ({ subjects: [...s.subjects, ...newSubjects] }));
        if (isSupabaseConfigured()) {
          subjectSync.bulkInsert(newSubjects).catch(console.error);
        }
        return newSubjects.length;
      },

      updateSubject: (id, data) => {
        set((s) => ({
          subjects: s.subjects.map((sub) =>
            sub.id === id
              ? { ...sub, ...data, updated_at: new Date().toISOString() }
              : sub
          ),
        }));
        if (isSupabaseConfigured()) {
          subjectSync.update(id, data).catch(console.error);
        }
      },

      bulkUpdateSubjects: (ids, data) => {
        const idSet = new Set(ids);
        set((s) => ({
          subjects: s.subjects.map((sub) =>
            idSet.has(sub.id)
              ? { ...sub, ...data, updated_at: new Date().toISOString() }
              : sub
          ),
        }));
        if (isSupabaseConfigured()) {
          ids.forEach((id) =>
            subjectSync.update(id, data).catch(console.error)
          );
        }
      },

      deleteSubject: (id) => {
        set((s) => ({
          subjects: s.subjects.filter((sub) => sub.id !== id),
        }));
        if (isSupabaseConfigured()) {
          subjectSync.remove(id).catch(console.error);
        }
      },

      deleteSubjects: (ids) => {
        const idSet = new Set(ids);
        set((s) => ({
          subjects: s.subjects.filter((sub) => !idSet.has(sub.id)),
        }));
        if (isSupabaseConfigured()) {
          subjectSync.removeMany(ids).catch(console.error);
        }
      },

      getSubjectById: (id) => get().subjects.find((sub) => sub.id === id),

      bulkLoad: (subjects) => set({ subjects }),
    }),
    {
      name: "besttimetable-subjects",
      version: 2,
      migrate: (_persisted, version) => {
        if (version < 2) return { subjects: [] };
        return _persisted as Record<string, unknown>;
      },
    }
  )
);
