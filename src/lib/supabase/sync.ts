/**
 * Supabase CRUD service — barcha jadvallar uchun.
 * Store'lar optimistic update qiladi, keyin bu service orqali Supabase ga yozadi.
 */
import { createClient } from "@/lib/supabase/client";
import type { Database, Json } from "@/lib/supabase/database.types";
import type {
  Teacher,
  Group,
  Subject,
  Room,
  SubjectLoad,
  ScheduleEntry,
  ScheduleChangelog,
} from "@/lib/types";

type TeacherInsert = Database["public"]["Tables"]["teachers"]["Insert"];
type TeacherUpdate = Database["public"]["Tables"]["teachers"]["Update"];
type GroupInsert = Database["public"]["Tables"]["groups"]["Insert"];
type GroupUpdate = Database["public"]["Tables"]["groups"]["Update"];
type SubjectInsert = Database["public"]["Tables"]["subjects"]["Insert"];
type SubjectUpdate = Database["public"]["Tables"]["subjects"]["Update"];
type RoomInsert = Database["public"]["Tables"]["rooms"]["Insert"];
type RoomUpdate = Database["public"]["Tables"]["rooms"]["Update"];
type SubjectLoadInsert = Database["public"]["Tables"]["subject_loads"]["Insert"];
type SubjectLoadUpdate = Database["public"]["Tables"]["subject_loads"]["Update"];
type ScheduleInsert = Database["public"]["Tables"]["schedule_entries"]["Insert"];
type ScheduleUpdate = Database["public"]["Tables"]["schedule_entries"]["Update"];
type ChangelogInsert = Database["public"]["Tables"]["schedule_changelog"]["Insert"];

function supabase() {
  return createClient();
}

// ─── Teachers ─────────────────────────────────────────────────────────────────
export const teacherSync = {
  async fetchAll(): Promise<Teacher[]> {
    const { data, error } = await supabase()
      .from("teachers")
      .select("*")
      .order("last_name");
    if (error) throw error;
    return (data ?? []) as unknown as Teacher[];
  },

  async insert(teacher: Teacher): Promise<void> {
    const row: TeacherInsert = {
      id: teacher.id,
      first_name: teacher.first_name,
      last_name: teacher.last_name,
      short_name: teacher.short_name,
      email: teacher.email || null,
      phone: teacher.phone || null,
      max_weekly_hours: teacher.max_weekly_hours,
      user_id: teacher.user_id || null,
    };
    const { error } = await supabase().from("teachers").upsert(row);
    if (error) throw error;
  },

  async bulkInsert(teachers: Teacher[]): Promise<void> {
    if (teachers.length === 0) return;
    const rows: TeacherInsert[] = teachers.map((t) => ({
      id: t.id,
      first_name: t.first_name,
      last_name: t.last_name,
      short_name: t.short_name,
      email: t.email || null,
      phone: t.phone || null,
      max_weekly_hours: t.max_weekly_hours,
      user_id: t.user_id || null,
    }));
    const { error } = await supabase().from("teachers").upsert(rows);
    if (error) throw error;
  },

  async update(id: string, data: Partial<Teacher>): Promise<void> {
    const upd: TeacherUpdate = {};
    if (data.first_name !== undefined) upd.first_name = data.first_name;
    if (data.last_name !== undefined) upd.last_name = data.last_name;
    if (data.short_name !== undefined) upd.short_name = data.short_name;
    if (data.email !== undefined) upd.email = data.email || null;
    if (data.phone !== undefined) upd.phone = data.phone || null;
    if (data.max_weekly_hours !== undefined) upd.max_weekly_hours = data.max_weekly_hours;
    const { error } = await supabase().from("teachers").update(upd).eq("id", id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase().from("teachers").delete().eq("id", id);
    if (error) throw error;
  },

  async removeMany(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const { error } = await supabase().from("teachers").delete().in("id", ids);
    if (error) throw error;
  },
};

// ─── Groups ───────────────────────────────────────────────────────────────────
export const groupSync = {
  async fetchAll(): Promise<Group[]> {
    const { data, error } = await supabase()
      .from("groups")
      .select("*")
      .order("name");
    if (error) throw error;
    return (data ?? []) as unknown as Group[];
  },

  async insert(group: Group): Promise<void> {
    const row: GroupInsert = {
      id: group.id,
      name: group.name,
      course: group.course,
      department_id: group.department_id || null,
      track: group.track,
      student_count: group.student_count,
    };
    const { error } = await supabase().from("groups").upsert(row);
    if (error) throw error;
  },

  async bulkInsert(groups: Group[]): Promise<void> {
    if (groups.length === 0) return;
    const rows: GroupInsert[] = groups.map((g) => ({
      id: g.id,
      name: g.name,
      course: g.course,
      department_id: g.department_id || null,
      track: g.track,
      student_count: g.student_count,
    }));
    const { error } = await supabase().from("groups").upsert(rows);
    if (error) throw error;
  },

  async update(id: string, data: Partial<Group>): Promise<void> {
    const upd: GroupUpdate = {};
    if (data.name !== undefined) upd.name = data.name;
    if (data.course !== undefined) upd.course = data.course;
    if (data.department_id !== undefined) upd.department_id = data.department_id || null;
    if (data.track !== undefined) upd.track = data.track;
    if (data.student_count !== undefined) upd.student_count = data.student_count;
    const { error } = await supabase().from("groups").update(upd).eq("id", id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase().from("groups").delete().eq("id", id);
    if (error) throw error;
  },

  async removeMany(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const { error } = await supabase().from("groups").delete().in("id", ids);
    if (error) throw error;
  },
};

// ─── Subjects ─────────────────────────────────────────────────────────────────
export const subjectSync = {
  async fetchAll(): Promise<Subject[]> {
    const { data, error } = await supabase()
      .from("subjects")
      .select("*")
      .order("name");
    if (error) throw error;
    return (data ?? []) as unknown as Subject[];
  },

  async insert(subject: Subject): Promise<void> {
    const row: SubjectInsert = {
      id: subject.id,
      name: subject.name,
      short_name: subject.short_name,
      color: subject.color,
      requires_lab: subject.requires_lab,
    };
    const { error } = await supabase().from("subjects").upsert(row);
    if (error) throw error;
  },

  async bulkInsert(subjects: Subject[]): Promise<void> {
    if (subjects.length === 0) return;
    const rows: SubjectInsert[] = subjects.map((s) => ({
      id: s.id,
      name: s.name,
      short_name: s.short_name,
      color: s.color,
      requires_lab: s.requires_lab,
    }));
    const { error } = await supabase().from("subjects").upsert(rows);
    if (error) throw error;
  },

  async update(id: string, data: Partial<Subject>): Promise<void> {
    const upd: SubjectUpdate = {};
    if (data.name !== undefined) upd.name = data.name;
    if (data.short_name !== undefined) upd.short_name = data.short_name;
    if (data.color !== undefined) upd.color = data.color;
    if (data.requires_lab !== undefined) upd.requires_lab = data.requires_lab;
    const { error } = await supabase().from("subjects").update(upd).eq("id", id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase().from("subjects").delete().eq("id", id);
    if (error) throw error;
  },

  async removeMany(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const { error } = await supabase().from("subjects").delete().in("id", ids);
    if (error) throw error;
  },
};

// ─── Rooms ────────────────────────────────────────────────────────────────────
export const roomSync = {
  async fetchAll(): Promise<Room[]> {
    const { data, error } = await supabase()
      .from("rooms")
      .select("*")
      .order("name");
    if (error) throw error;
    return (data ?? []) as unknown as Room[];
  },

  async insert(room: Room): Promise<void> {
    const row: RoomInsert = {
      id: room.id,
      name: room.name,
      building: room.building || null,
      capacity: room.capacity,
      type: room.type,
      floor: room.floor ?? null,
    };
    const { error } = await supabase().from("rooms").upsert(row);
    if (error) throw error;
  },

  async bulkInsert(rooms: Room[]): Promise<void> {
    if (rooms.length === 0) return;
    const rows: RoomInsert[] = rooms.map((r) => ({
      id: r.id,
      name: r.name,
      building: r.building || null,
      capacity: r.capacity,
      type: r.type,
      floor: r.floor ?? null,
    }));
    const { error } = await supabase().from("rooms").upsert(rows);
    if (error) throw error;
  },

  async update(id: string, data: Partial<Room>): Promise<void> {
    const upd: RoomUpdate = {};
    if (data.name !== undefined) upd.name = data.name;
    if (data.building !== undefined) upd.building = data.building || null;
    if (data.capacity !== undefined) upd.capacity = data.capacity;
    if (data.type !== undefined) upd.type = data.type;
    if (data.floor !== undefined) upd.floor = data.floor ?? null;
    const { error } = await supabase().from("rooms").update(upd).eq("id", id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase().from("rooms").delete().eq("id", id);
    if (error) throw error;
  },

  async removeMany(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const { error } = await supabase().from("rooms").delete().in("id", ids);
    if (error) throw error;
  },
};

// ─── Subject Loads ────────────────────────────────────────────────────────────
export const subjectLoadSync = {
  async fetchAll(): Promise<SubjectLoad[]> {
    const { data, error } = await supabase().from("subject_loads").select("*");
    if (error) throw error;
    return (data ?? []) as unknown as SubjectLoad[];
  },

  async insert(load: SubjectLoad): Promise<void> {
    const row: SubjectLoadInsert = {
      id: load.id,
      group_id: load.group_id,
      subject_id: load.subject_id,
      teacher_id: load.teacher_id,
      weekly_hours: load.weekly_hours,
      room_type: load.room_type,
    };
    const { error } = await supabase().from("subject_loads").upsert(row);
    if (error) throw error;
  },

  async update(id: string, data: Partial<SubjectLoad>): Promise<void> {
    const upd: SubjectLoadUpdate = {};
    if (data.group_id !== undefined) upd.group_id = data.group_id;
    if (data.subject_id !== undefined) upd.subject_id = data.subject_id;
    if (data.teacher_id !== undefined) upd.teacher_id = data.teacher_id;
    if (data.weekly_hours !== undefined) upd.weekly_hours = data.weekly_hours;
    if (data.room_type !== undefined) upd.room_type = data.room_type;
    const { error } = await supabase().from("subject_loads").update(upd).eq("id", id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase().from("subject_loads").delete().eq("id", id);
    if (error) throw error;
  },
};

// ─── Schedule Entries ─────────────────────────────────────────────────────────
export const scheduleSync = {
  async fetchAll(): Promise<ScheduleEntry[]> {
    const { data, error } = await supabase()
      .from("schedule_entries")
      .select("*")
      .order("day")
      .order("slot_id");
    if (error) throw error;
    return (data ?? []) as unknown as ScheduleEntry[];
  },

  async insert(entry: ScheduleEntry): Promise<void> {
    const row: ScheduleInsert = {
      id: entry.id,
      period_id: entry.period_id,
      day: entry.day,
      slot_id: entry.slot_id,
      group_ids: entry.group_ids,
      subject_id: entry.subject_id,
      teacher_id: entry.teacher_id,
      room_id: entry.room_id,
      is_manual: entry.is_manual,
      created_by: entry.created_by || null,
    };
    const { error } = await supabase().from("schedule_entries").upsert(row);
    if (error) throw error;
  },

  async bulkInsert(entries: ScheduleEntry[]): Promise<void> {
    if (entries.length === 0) return;
    const rows: ScheduleInsert[] = entries.map((e) => ({
      id: e.id,
      period_id: e.period_id,
      day: e.day,
      slot_id: e.slot_id,
      group_ids: e.group_ids,
      subject_id: e.subject_id,
      teacher_id: e.teacher_id,
      room_id: e.room_id,
      is_manual: e.is_manual,
      created_by: e.created_by || null,
    }));
    const { error } = await supabase().from("schedule_entries").upsert(rows);
    if (error) throw error;
  },

  async update(id: string, data: Partial<ScheduleEntry>): Promise<void> {
    const upd: ScheduleUpdate = {};
    if (data.day !== undefined) upd.day = data.day;
    if (data.slot_id !== undefined) upd.slot_id = data.slot_id;
    if (data.group_ids !== undefined) upd.group_ids = data.group_ids;
    if (data.subject_id !== undefined) upd.subject_id = data.subject_id;
    if (data.teacher_id !== undefined) upd.teacher_id = data.teacher_id;
    if (data.room_id !== undefined) upd.room_id = data.room_id;
    if (data.is_manual !== undefined) upd.is_manual = data.is_manual;
    const { error } = await supabase().from("schedule_entries").update(upd).eq("id", id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase().from("schedule_entries").delete().eq("id", id);
    if (error) throw error;
  },

  async removeAll(): Promise<void> {
    const { error } = await supabase()
      .from("schedule_entries")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) throw error;
  },
};

// ─── Changelog ────────────────────────────────────────────────────────────────
export const changelogSync = {
  async fetchAll(limit = 100): Promise<ScheduleChangelog[]> {
    const { data, error } = await supabase()
      .from("schedule_changelog")
      .select("*")
      .order("changed_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as unknown as ScheduleChangelog[];
  },

  async insert(log: ScheduleChangelog): Promise<void> {
    const row: ChangelogInsert = {
      id: log.id,
      entry_id: log.entry_id || null,
      action: log.action,
      old_data: (log.old_data as Json) ?? null,
      new_data: (log.new_data as Json) ?? null,
      changed_by: log.changed_by || null,
    };
    const { error } = await supabase().from("schedule_changelog").insert(row);
    if (error) throw error;
  },

  async removeAll(): Promise<void> {
    const { error } = await supabase()
      .from("schedule_changelog")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) throw error;
  },
};
