"use client";

import { useMemo, useState, useCallback } from "react";
import { useChangelogStore } from "@/stores/useChangelogStore";
import { useTeacherStore } from "@/stores/useTeacherStore";
import { useGroupStore } from "@/stores/useGroupStore";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { useAuth } from "@/hooks/useAuth";
import type { ScheduleChangelog } from "@/lib/types";

/**
 * Role-based bildirishnomalar filtrlash hook.
 *
 * - super_admin / admin: barcha changelog loglarni ko'radi
 * - teacher: faqat o'ziga tegishli darslar (teacher_id mos keladi)
 * - student: faqat o'z guruhiga tegishli o'zgarishlar (group_ids ichida)
 */

function getReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const saved = localStorage.getItem("besttimetable-read-notifications");
    return saved ? new Set(JSON.parse(saved) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function useFilteredNotifications() {
  const { logs } = useChangelogStore();
  const { teachers } = useTeacherStore();
  const { groups } = useGroupStore();
  const { role } = useRoleAccess();
  const { user, profile } = useAuth();

  const [readIds, setReadIds] = useState<Set<string>>(getReadIds);

  // O'qituvchi foydalanuvchini teacher entity ga bog'lash
  const myTeacherId = useMemo(() => {
    if (role !== "teacher") return null;
    const userId = user?.id || profile?.id;
    const userEmail = user?.email || profile?.email;

    // user_id orqali topish
    if (userId) {
      const byUserId = teachers.find((t) => t.user_id === userId);
      if (byUserId) return byUserId.id;
    }
    // email orqali topish
    if (userEmail) {
      const byEmail = teachers.find((t) => t.email === userEmail);
      if (byEmail) return byEmail.id;
    }
    return null;
  }, [role, user, profile, teachers]);

  // Talaba guruhlarini aniqlash (department_id orqali)
  const myGroupIds = useMemo(() => {
    if (role !== "student") return null;
    const deptId = profile?.department_id;
    if (!deptId) return null;
    return groups.filter((g) => g.department_id === deptId).map((g) => g.id);
  }, [role, profile, groups]);

  // Role-based filtrlash
  const filteredLogs = useMemo(() => {
    if (role === "super_admin" || role === "admin") {
      return logs;
    }

    if (role === "teacher" && myTeacherId) {
      return logs.filter((log) => {
        const data = log.new_data || log.old_data || {};
        return data.teacher_id === myTeacherId;
      });
    }

    if (role === "student" && myGroupIds && myGroupIds.length > 0) {
      return logs.filter((log) => {
        const data = log.new_data || log.old_data || {};
        const entryGroups = data.group_ids as string[] | undefined;
        if (!Array.isArray(entryGroups)) return false;
        return entryGroups.some((gid) => myGroupIds.includes(gid));
      });
    }

    // Agar teacher/student lekin bog'lanish topilmasa — bo'sh ro'yxat
    // (profil teacher/student entity ga bog'lanmagan)
    if (role === "teacher" || role === "student") {
      return [];
    }

    return logs;
  }, [logs, role, myTeacherId, myGroupIds]);

  // O'qilmagan soni
  const unreadCount = useMemo(
    () => filteredLogs.filter((l) => !readIds.has(l.id)).length,
    [filteredLogs, readIds]
  );

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem(
        "besttimetable-read-notifications",
        JSON.stringify([...next])
      );
      return next;
    });
  }, []);

  const markAllAsRead = useCallback((ids: string[]) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.add(id);
      localStorage.setItem(
        "besttimetable-read-notifications",
        JSON.stringify([...next])
      );
      return next;
    });
  }, []);

  return {
    logs: filteredLogs,
    readIds,
    unreadCount,
    markAsRead,
    markAllAsRead,
    role,
  };
}
