"use client";

import { useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTimetableStore } from "@/stores/useTimetableStore";
import type { ScheduleEntry } from "@/lib/types";

/**
 * Supabase Realtime orqali jadval o'zgarishlarini tinglash.
 * Boshqa admin dars qo'ysa/o'chirsa/ko'chirsa — grid darhol yangilanadi.
 */
export function useRealtimeSchedule() {
  const { entries, bulkLoad } = useTimetableStore();
  const supabase = createClient();

  // Boshlang'ich yuklash
  const fetchEntries = useCallback(async () => {
    const { data, error } = await supabase
      .from("schedule_entries")
      .select("*")
      .order("day")
      .order("slot_id");

    if (data && !error) {
      const rows = data as unknown as Record<string, unknown>[];
      const mapped: ScheduleEntry[] = rows.map((row) => ({
        id: row.id as string,
        period_id: row.period_id as string,
        day: row.day as ScheduleEntry["day"],
        slot_id: row.slot_id as string,
        group_ids: (row.group_ids as string[]) || [],
        subject_id: row.subject_id as string,
        teacher_id: row.teacher_id as string,
        room_id: row.room_id as string,
        is_manual: row.is_manual as boolean,
        created_by: (row.created_by as string) || "unknown",
        created_at: row.created_at as string,
        updated_at: row.updated_at as string,
      }));
      bulkLoad(mapped);
    }
  }, [supabase, bulkLoad]);

  // Realtime subscription
  useEffect(() => {
    // Boshlang'ich yuklash (faqat Supabase ulangan bo'lsa)
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co"
    ) {
      fetchEntries();
    }

    const channel = supabase
      .channel("schedule-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "schedule_entries",
        },
        (payload) => {
          const store = useTimetableStore.getState();
          const currentEntries = store.entries;

          if (payload.eventType === "INSERT") {
            const newEntry = mapRow(payload.new);
            // Agar allaqachon mavjud bo'lmasa qo'shish
            if (!currentEntries.find((e) => e.id === newEntry.id)) {
              store.bulkLoad([...currentEntries, newEntry]);
            }
          } else if (payload.eventType === "UPDATE") {
            const updated = mapRow(payload.new);
            store.bulkLoad(
              currentEntries.map((e) => (e.id === updated.id ? updated : e))
            );
          } else if (payload.eventType === "DELETE") {
            const deletedId = (payload.old as { id?: string })?.id;
            if (deletedId) {
              store.bulkLoad(currentEntries.filter((e) => e.id !== deletedId));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { refetch: fetchEntries };
}

function mapRow(row: Record<string, unknown>): ScheduleEntry {
  return {
    id: row.id as string,
    period_id: row.period_id as string,
    day: row.day as ScheduleEntry["day"],
    slot_id: row.slot_id as string,
    group_ids: (row.group_ids as string[]) || [],
    subject_id: row.subject_id as string,
    teacher_id: row.teacher_id as string,
    room_id: row.room_id as string,
    is_manual: row.is_manual as boolean,
    created_by: (row.created_by as string) || "unknown",
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}
