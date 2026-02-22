"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/helpers";
import {
  teacherSync,
  groupSync,
  subjectSync,
  roomSync,
  subjectLoadSync,
  scheduleSync,
  changelogSync,
} from "@/lib/supabase/sync";
import { useTeacherStore } from "@/stores/useTeacherStore";
import { useGroupStore } from "@/stores/useGroupStore";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useRoomStore } from "@/stores/useRoomStore";
import { useSubjectLoadStore } from "@/stores/useSubjectLoadStore";
import { useTimetableStore } from "@/stores/useTimetableStore";
import { useChangelogStore } from "@/stores/useChangelogStore";
import type {
  Teacher,
  Group,
  Subject,
  Room,
  SubjectLoad,
  ScheduleEntry,
  ScheduleChangelog,
} from "@/lib/types";

/**
 * Supabase dan barcha ma'lumotlarni yuklaydi va realtime subscription qo'yadi.
 * Dashboard layout da chaqiriladi.
 */
export function useSupabaseData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  // Boshlang'ich yuklash
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    async function loadAll() {
      try {
        // Promise.allSettled ishlatiladi — bitta jadval xato bo'lsa
        // qolganlari baribir yuklanadi (partial failure resilience).
        const results = await Promise.allSettled([
          teacherSync.fetchAll(),
          groupSync.fetchAll(),
          subjectSync.fetchAll(),
          roomSync.fetchAll(),
          subjectLoadSync.fetchAll(),
          scheduleSync.fetchAll(),
          changelogSync.fetchAll(),
        ]);

        const [teachers, groups, subjects, rooms, loads, entries, logs] = results;

        // Muvaffaqiyatli natijalarni store'larga yuklash.
        // Supabase dan kelgan ma'lumotlar bo'sh bo'lsa, lokal store'ni
        // ustiga yozmaslik (demo data saqlanib qolishi uchun).
        if (teachers.status === "fulfilled" && teachers.value.length > 0)
          useTeacherStore.getState().bulkLoad(teachers.value);
        if (groups.status === "fulfilled" && groups.value.length > 0)
          useGroupStore.getState().bulkLoad(groups.value);
        if (subjects.status === "fulfilled" && subjects.value.length > 0)
          useSubjectStore.getState().bulkLoad(subjects.value);
        if (rooms.status === "fulfilled" && rooms.value.length > 0)
          useRoomStore.getState().bulkLoad(rooms.value);
        if (loads.status === "fulfilled" && loads.value.length > 0)
          useSubjectLoadStore.getState().bulkLoad(loads.value);
        if (entries.status === "fulfilled" && entries.value.length > 0)
          useTimetableStore.getState().bulkLoad(entries.value);
        if (logs.status === "fulfilled" && logs.value.length > 0)
          useChangelogStore.getState().bulkLoad(logs.value);

        // Xato bo'lgan jadvallarni log qilish
        const failures = results.filter(
          (r): r is PromiseRejectedResult => r.status === "rejected"
        );
        if (failures.length > 0) {
          for (const f of failures) {
            console.error("Supabase yuklash xatosi:", f.reason);
          }
          // Faqat hammasi xato bo'lganda error state o'rnatiladi
          if (failures.length === results.length) {
            setError("Barcha jadvallarni yuklashda xatolik");
          } else {
            setError(null);
          }
        } else {
          setError(null);
        }
      } catch (err) {
        console.error("Supabase dan yuklashda xatolik:", err);
        setError(err instanceof Error ? err.message : "Yuklash xatosi");
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, []);

  // Realtime subscriptions
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const channel = supabase
      .channel("all-changes")
      // Teachers
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "teachers" },
        (payload) => {
          const store = useTeacherStore.getState();
          const current = store.teachers;
          if (payload.eventType === "INSERT") {
            const row = payload.new as unknown as Teacher;
            if (!current.find((t) => t.id === row.id)) {
              store.bulkLoad([...current, row]);
            }
          } else if (payload.eventType === "UPDATE") {
            const row = payload.new as unknown as Teacher;
            store.bulkLoad(current.map((t) => (t.id === row.id ? row : t)));
          } else if (payload.eventType === "DELETE") {
            const id = (payload.old as { id?: string })?.id;
            if (id) store.bulkLoad(current.filter((t) => t.id !== id));
          }
        }
      )
      // Groups
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "groups" },
        (payload) => {
          const store = useGroupStore.getState();
          const current = store.groups;
          if (payload.eventType === "INSERT") {
            const row = payload.new as unknown as Group;
            if (!current.find((g) => g.id === row.id)) {
              store.bulkLoad([...current, row]);
            }
          } else if (payload.eventType === "UPDATE") {
            const row = payload.new as unknown as Group;
            store.bulkLoad(current.map((g) => (g.id === row.id ? row : g)));
          } else if (payload.eventType === "DELETE") {
            const id = (payload.old as { id?: string })?.id;
            if (id) store.bulkLoad(current.filter((g) => g.id !== id));
          }
        }
      )
      // Subjects
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subjects" },
        (payload) => {
          const store = useSubjectStore.getState();
          const current = store.subjects;
          if (payload.eventType === "INSERT") {
            const row = payload.new as unknown as Subject;
            if (!current.find((s) => s.id === row.id)) {
              store.bulkLoad([...current, row]);
            }
          } else if (payload.eventType === "UPDATE") {
            const row = payload.new as unknown as Subject;
            store.bulkLoad(current.map((s) => (s.id === row.id ? row : s)));
          } else if (payload.eventType === "DELETE") {
            const id = (payload.old as { id?: string })?.id;
            if (id) store.bulkLoad(current.filter((s) => s.id !== id));
          }
        }
      )
      // Rooms
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms" },
        (payload) => {
          const store = useRoomStore.getState();
          const current = store.rooms;
          if (payload.eventType === "INSERT") {
            const row = payload.new as unknown as Room;
            if (!current.find((r) => r.id === row.id)) {
              store.bulkLoad([...current, row]);
            }
          } else if (payload.eventType === "UPDATE") {
            const row = payload.new as unknown as Room;
            store.bulkLoad(current.map((r) => (r.id === row.id ? row : r)));
          } else if (payload.eventType === "DELETE") {
            const id = (payload.old as { id?: string })?.id;
            if (id) store.bulkLoad(current.filter((r) => r.id !== id));
          }
        }
      )
      // Subject Loads
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subject_loads" },
        (payload) => {
          const store = useSubjectLoadStore.getState();
          const current = store.loads;
          if (payload.eventType === "INSERT") {
            const row = payload.new as unknown as SubjectLoad;
            if (!current.find((l) => l.id === row.id)) {
              store.bulkLoad([...current, row]);
            }
          } else if (payload.eventType === "UPDATE") {
            const row = payload.new as unknown as SubjectLoad;
            store.bulkLoad(current.map((l) => (l.id === row.id ? row : l)));
          } else if (payload.eventType === "DELETE") {
            const id = (payload.old as { id?: string })?.id;
            if (id) store.bulkLoad(current.filter((l) => l.id !== id));
          }
        }
      )
      // Schedule Entries
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "schedule_entries" },
        (payload) => {
          const store = useTimetableStore.getState();
          const current = store.entries;
          if (payload.eventType === "INSERT") {
            const row = payload.new as unknown as ScheduleEntry;
            const entry: ScheduleEntry = {
              ...row,
              group_ids: row.group_ids ?? [],
              created_by: row.created_by ?? "unknown",
            };
            if (!current.find((e) => e.id === entry.id)) {
              store.bulkLoad([...current, entry]);
            }
          } else if (payload.eventType === "UPDATE") {
            const row = payload.new as unknown as ScheduleEntry;
            const entry: ScheduleEntry = {
              ...row,
              group_ids: row.group_ids ?? [],
              created_by: row.created_by ?? "unknown",
            };
            store.bulkLoad(current.map((e) => (e.id === entry.id ? entry : e)));
          } else if (payload.eventType === "DELETE") {
            const id = (payload.old as { id?: string })?.id;
            if (id) store.bulkLoad(current.filter((e) => e.id !== id));
          }
        }
      )
      // Changelog
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "schedule_changelog" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const store = useChangelogStore.getState();
            const row = payload.new as unknown as ScheduleChangelog;
            if (!store.logs.find((l) => l.id === row.id)) {
              store.bulkLoad([row, ...store.logs]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return { loading, error };
}
