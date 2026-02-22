"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useTeacherStore } from "@/stores/useTeacherStore";
import { useGroupStore } from "@/stores/useGroupStore";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useRoomStore } from "@/stores/useRoomStore";
import { useTimetableStore } from "@/stores/useTimetableStore";
import { useHydration } from "@/hooks/useHydration";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { TeacherWorkloadChart } from "@/components/dashboard/TeacherWorkloadChart";
import { RoomUtilizationChart } from "@/components/dashboard/RoomUtilizationChart";
import { DAYS, TIME_SLOTS } from "@/lib/constants";
import type { DayKey } from "@/lib/types";

// Bugungi kunni DayKey ga aylantirish
function getTodayKey(): DayKey | null {
  const dayMap: Record<number, DayKey> = {
    1: "dushanba", 2: "seshanba", 3: "chorshanba",
    4: "payshanba", 5: "juma",
  };
  return dayMap[new Date().getDay()] || null;
}

// ─── Teacher Dashboard ──────────────────────────────────────────────────────
function TeacherDashboard() {
  const { profile } = useRoleAccess();
  const { teachers } = useTeacherStore();
  const { entries } = useTimetableStore();
  const { getSubjectById } = useSubjectStore();
  const { getRoomById } = useRoomStore();
  const { groups } = useGroupStore();

  const myTeacher = teachers.find((t) => t.user_id === profile?.id);
  const myEntries = useMemo(() => {
    if (!myTeacher) return [];
    return entries.filter((e) => e.teacher_id === myTeacher.id);
  }, [myTeacher, entries]);

  const todayKey = useMemo(() => getTodayKey(), []);
  const todayLabel = DAYS.find((d) => d.key === todayKey)?.label;

  // Bugungi darslar (vaqt bo'yicha tartiblangan)
  const todayEntries = useMemo(() => {
    if (!todayKey) return [];
    return myEntries
      .filter((e) => e.day === todayKey)
      .sort((a, b) => {
        const aIdx = TIME_SLOTS.findIndex((s) => s.id === a.slot_id);
        const bIdx = TIME_SLOTS.findIndex((s) => s.id === b.slot_id);
        return aIdx - bIdx;
      });
  }, [myEntries, todayKey]);

  // Haftalik yuklama foizi
  const maxHours = myTeacher?.max_weekly_hours ?? 0;
  const usedHours = myEntries.length * 1.5;
  const loadPercent = maxHours > 0 ? Math.min(Math.round((usedHours / maxHours) * 100), 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight md:text-[32px]">
          Xush kelibsiz{profile?.full_name ? `, ${profile.full_name}` : ""}
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Sizning dars jadvalingiz
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="animate-[stagger-fade_0.4s_ease_forwards] opacity-0" style={{ animationDelay: "0ms" }}>
          <GlassCard hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[var(--muted)]">Jami darslarim</p>
                <p className="text-2xl font-bold mt-1 text-[var(--color-accent)]">
                  {myEntries.length}
                </p>
              </div>
              <div className="p-2 rounded-[10px] bg-blue-50 dark:bg-blue-900/20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </div>
            </div>
          </GlassCard>
        </div>
        <div className="animate-[stagger-fade_0.4s_ease_forwards] opacity-0" style={{ animationDelay: "80ms" }}>
          <GlassCard hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[var(--muted)]">Bugungi darslar</p>
                <p className="text-2xl font-bold mt-1 text-emerald-500">
                  {todayEntries.length}
                </p>
              </div>
              <div className="p-2 rounded-[10px] bg-emerald-50 dark:bg-emerald-900/20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
            </div>
          </GlassCard>
        </div>
        <div className="col-span-2 sm:col-span-1 animate-[stagger-fade_0.4s_ease_forwards] opacity-0" style={{ animationDelay: "160ms" }}>
          <GlassCard hover>
            <div>
              <p className="text-xs text-[var(--muted)]">Haftalik yuklama</p>
              <p className="text-2xl font-bold mt-1 text-purple-500">
                {usedHours}<span className="text-sm font-normal text-[var(--muted)]">/{maxHours} soat</span>
              </p>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-[var(--surface-secondary)] overflow-hidden">
              <div
                className="h-full rounded-full bg-purple-500 transition-all duration-500"
                style={{ width: `${loadPercent}%` }}
              />
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Bugungi darslar */}
      <div className="animate-[stagger-fade_0.4s_ease_forwards] opacity-0" style={{ animationDelay: "240ms" }}>
        <GlassCard>
          <h2 className="text-sm font-semibold mb-3">
            {todayLabel ? `Bugungi darslar — ${todayLabel}` : "Dam olish kuni"}
          </h2>
          {!todayKey ? (
            <p className="text-sm text-[var(--muted)] py-4 text-center">
              Bugun dam olish kuni. Yaxshi dam oling!
            </p>
          ) : todayEntries.length === 0 ? (
            <p className="text-sm text-[var(--muted)] py-4 text-center">
              Bugun darslar yo&apos;q
            </p>
          ) : (
            <div className="space-y-2">
              {todayEntries.map((entry) => {
                const slot = TIME_SLOTS.find((s) => s.id === entry.slot_id);
                const subject = getSubjectById(entry.subject_id);
                const room = getRoomById(entry.room_id);
                const entryGroups = Array.isArray(entry.group_ids)
                  ? entry.group_ids.map((gid) => groups.find((g) => g.id === gid)?.name).filter(Boolean).join(", ")
                  : "";
                return (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 p-3 rounded-[12px] bg-[var(--surface-secondary)]"
                  >
                    <div className="text-center min-w-[52px]">
                      <p className="text-xs font-semibold text-[var(--color-accent)]">{slot?.label}</p>
                      <p className="text-[10px] text-[var(--muted)]">{slot?.start}</p>
                    </div>
                    <div className="h-8 w-px bg-[var(--border)]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{subject?.name || "—"}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {room && <Badge variant="default">{room.name}</Badge>}
                        {entryGroups && <span className="text-[10px] text-[var(--muted)] truncate">{entryGroups}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Tez harakatlar */}
      <div className="animate-[stagger-fade_0.4s_ease_forwards] opacity-0" style={{ animationDelay: "320ms" }}>
        <GlassCard>
          <h2 className="text-sm font-semibold mb-3">Tez harakatlar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { href: "/timetable/by-teacher", label: "Darslarim", desc: "To'liq jadval", iconBg: "bg-blue-100 dark:bg-blue-900/30", iconColor: "text-blue-600 dark:text-blue-400", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" /></svg> },
              { href: "/timetable", label: "Umumiy jadval", desc: "Barcha guruhlar", iconBg: "bg-purple-100 dark:bg-purple-900/30", iconColor: "text-purple-600 dark:text-purple-400", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg> },
              { href: "/timetable/by-room", label: "Xonalar", desc: "Xona jadvali", iconBg: "bg-emerald-100 dark:bg-emerald-900/30", iconColor: "text-emerald-600 dark:text-emerald-400", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" /></svg> },
              { href: "/notifications", label: "Xabarlar", desc: "Bildirishnomalar", iconBg: "bg-amber-100 dark:bg-amber-900/30", iconColor: "text-amber-600 dark:text-amber-400", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg> },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col items-center gap-2 p-3 rounded-[12px] hover:bg-[var(--surface-secondary)] transition-all group text-center"
              >
                <div className={`p-2.5 rounded-[10px] ${action.iconBg} ${action.iconColor} group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <div>
                  <p className="text-xs font-medium">{action.label}</p>
                  <p className="text-[10px] text-[var(--muted)]">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ─── Student Dashboard ──────────────────────────────────────────────────────
function StudentDashboard() {
  const { profile } = useRoleAccess();
  const { groups } = useGroupStore();
  const { entries } = useTimetableStore();
  const { getSubjectById } = useSubjectStore();
  const { getTeacherById } = useTeacherStore();
  const { getRoomById } = useRoomStore();

  // Talaba guruhlarini aniqlash (department_id orqali)
  const myGroups = useMemo(() => {
    const deptId = profile?.department_id;
    if (!deptId) return groups;
    return groups.filter((g) => g.department_id === deptId);
  }, [profile, groups]);

  const myGroupIds = useMemo(() => new Set(myGroups.map((g) => g.id)), [myGroups]);

  // Talaba guruhlariga tegishli darslar
  const myEntries = useMemo(() => {
    return entries.filter((e) =>
      Array.isArray(e.group_ids) && e.group_ids.some((gid) => myGroupIds.has(gid))
    );
  }, [entries, myGroupIds]);

  const todayKey = useMemo(() => getTodayKey(), []);
  const todayLabel = DAYS.find((d) => d.key === todayKey)?.label;

  // Bugungi darslar
  const todayEntries = useMemo(() => {
    if (!todayKey) return [];
    return myEntries
      .filter((e) => e.day === todayKey)
      .sort((a, b) => {
        const aIdx = TIME_SLOTS.findIndex((s) => s.id === a.slot_id);
        const bIdx = TIME_SLOTS.findIndex((s) => s.id === b.slot_id);
        return aIdx - bIdx;
      });
  }, [myEntries, todayKey]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight md:text-[32px]">
          Xush kelibsiz{profile?.full_name ? `, ${profile.full_name}` : ""}
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Sizning guruh jadvalingiz
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="animate-[stagger-fade_0.4s_ease_forwards] opacity-0" style={{ animationDelay: "0ms" }}>
          <GlassCard hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[var(--muted)]">Haftalik darslar</p>
                <p className="text-2xl font-bold mt-1 text-[var(--color-accent)]">
                  {myEntries.length}
                </p>
              </div>
              <div className="p-2 rounded-[10px] bg-blue-50 dark:bg-blue-900/20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </div>
            </div>
          </GlassCard>
        </div>
        <div className="animate-[stagger-fade_0.4s_ease_forwards] opacity-0" style={{ animationDelay: "80ms" }}>
          <GlassCard hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[var(--muted)]">Bugungi darslar</p>
                <p className="text-2xl font-bold mt-1 text-emerald-500">
                  {todayEntries.length}
                </p>
              </div>
              <div className="p-2 rounded-[10px] bg-emerald-50 dark:bg-emerald-900/20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Bugungi darslar */}
      <div className="animate-[stagger-fade_0.4s_ease_forwards] opacity-0" style={{ animationDelay: "160ms" }}>
        <GlassCard>
          <h2 className="text-sm font-semibold mb-3">
            {todayLabel ? `Bugungi darslar — ${todayLabel}` : "Dam olish kuni"}
          </h2>
          {!todayKey ? (
            <p className="text-sm text-[var(--muted)] py-4 text-center">
              Bugun dam olish kuni. Yaxshi dam oling!
            </p>
          ) : todayEntries.length === 0 ? (
            <p className="text-sm text-[var(--muted)] py-4 text-center">
              Bugun darslar yo&apos;q
            </p>
          ) : (
            <div className="space-y-2">
              {todayEntries.map((entry) => {
                const slot = TIME_SLOTS.find((s) => s.id === entry.slot_id);
                const subject = getSubjectById(entry.subject_id);
                const teacher = getTeacherById(entry.teacher_id);
                const room = getRoomById(entry.room_id);
                return (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 p-3 rounded-[12px] bg-[var(--surface-secondary)]"
                  >
                    <div className="text-center min-w-[52px]">
                      <p className="text-xs font-semibold text-[var(--color-accent)]">{slot?.label}</p>
                      <p className="text-[10px] text-[var(--muted)]">{slot?.start}</p>
                    </div>
                    <div className="h-8 w-px bg-[var(--border)]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{subject?.name || "—"}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {room && <Badge variant="default">{room.name}</Badge>}
                        {teacher && <span className="text-[10px] text-[var(--muted)] truncate">{teacher.short_name}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Tez harakatlar */}
      <div className="animate-[stagger-fade_0.4s_ease_forwards] opacity-0" style={{ animationDelay: "240ms" }}>
        <GlassCard>
          <h2 className="text-sm font-semibold mb-3">Tez harakatlar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { href: "/timetable", label: "Jadvalim", desc: "Guruh jadvali", iconBg: "bg-blue-100 dark:bg-blue-900/30", iconColor: "text-blue-600 dark:text-blue-400", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg> },
              { href: "/timetable/by-teacher", label: "O'qituvchilar", desc: "O'qituvchi jadvali", iconBg: "bg-purple-100 dark:bg-purple-900/30", iconColor: "text-purple-600 dark:text-purple-400", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="10" cy="7" r="4" /><path d="M10.3 15H7a4 4 0 0 0-4 4v2" /><circle cx="17" cy="17" r="3" /><path d="m21 21-1.9-1.9" /></svg> },
              { href: "/timetable/by-room", label: "Xonalar", desc: "Xona jadvali", iconBg: "bg-emerald-100 dark:bg-emerald-900/30", iconColor: "text-emerald-600 dark:text-emerald-400", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" /></svg> },
              { href: "/notifications", label: "Xabarlar", desc: "Bildirishnomalar", iconBg: "bg-amber-100 dark:bg-amber-900/30", iconColor: "text-amber-600 dark:text-amber-400", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg> },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col items-center gap-2 p-3 rounded-[12px] hover:bg-[var(--surface-secondary)] transition-all group text-center"
              >
                <div className={`p-2.5 rounded-[10px] ${action.iconBg} ${action.iconColor} group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <div>
                  <p className="text-xs font-medium">{action.label}</p>
                  <p className="text-[10px] text-[var(--muted)]">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ─── Admin Dashboard ────────────────────────────────────────────────────────
function AdminDashboard() {
  const { profile } = useRoleAccess();
  const { teachers } = useTeacherStore();
  const { groups } = useGroupStore();
  const { subjects } = useSubjectStore();
  const { rooms } = useRoomStore();
  const { entries } = useTimetableStore();

  const stats = useMemo(
    () => [
      {
        title: "O'qituvchilar",
        value: teachers.length,
        href: "/teachers",
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        iconColor: "text-[var(--color-accent)]",
        textColor: "text-[var(--color-accent)]",
      },
      {
        title: "Guruhlar",
        value: groups.length,
        href: "/groups",
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c0 2 6 3 6 3s6-1 6-3v-5" />
          </svg>
        ),
        bgColor: "bg-purple-50 dark:bg-purple-900/20",
        iconColor: "text-purple-500",
        textColor: "text-purple-500",
      },
      {
        title: "Fanlar",
        value: subjects.length,
        href: "/subjects",
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        ),
        bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
        iconColor: "text-emerald-500",
        textColor: "text-emerald-500",
      },
      {
        title: "Xonalar",
        value: rooms.length,
        href: "/rooms",
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14" />
            <path d="M2 20h20M14 12v.01" />
          </svg>
        ),
        bgColor: "bg-amber-100 dark:bg-amber-900/30",
        iconColor: "text-amber-500",
        textColor: "text-amber-500",
      },
    ],
    [teachers.length, groups.length, subjects.length, rooms.length]
  );

  const quickActions = [
    {
      href: "/timetable",
      label: "Jadval",
      desc: "Ko'rish",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      ),
    },
    {
      href: "/generate",
      label: "Tuzish",
      desc: "Avtomatik",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
      ),
    },
    {
      href: "/import",
      label: "Import",
      desc: "Excel/Word",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      ),
    },
    {
      href: "/export",
      label: "Eksport",
      desc: "PDF/Excel",
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold tracking-tight md:text-[32px]">
          Bosh sahifa
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          {profile?.full_name ? `${profile.full_name}, dars` : "Dars"} jadvali
          tizimiga xush kelibsiz
        </p>
      </div>

      {/* ── Section 1: Hero Stats ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <div
            key={stat.title}
            className="animate-[stagger-fade_0.4s_ease_forwards] opacity-0"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <Link href={stat.href}>
              <GlassCard hover padding="sm">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-[10px] ${stat.bgColor} ${stat.iconColor} shrink-0`}
                  >
                    {stat.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[var(--muted)] truncate">
                      {stat.title}
                    </p>
                    <p className={`text-2xl font-bold ${stat.textColor}`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-[11px] text-[var(--muted)]">
                  <span>Boshqarish</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </GlassCard>
            </Link>
          </div>
        ))}
      </div>

      {/* ── Section 2: Charts ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          className="animate-[stagger-fade_0.4s_ease_forwards] opacity-0"
          style={{ animationDelay: "320ms" }}
        >
          <GlassCard>
            <h2 className="text-sm font-semibold mb-3">
              O&apos;qituvchi yuklamasi
            </h2>
            <TeacherWorkloadChart teachers={teachers} entries={entries} />
          </GlassCard>
        </div>
        <div
          className="animate-[stagger-fade_0.4s_ease_forwards] opacity-0"
          style={{ animationDelay: "400ms" }}
        >
          <GlassCard>
            <h2 className="text-sm font-semibold mb-3">Xona bandligi</h2>
            <RoomUtilizationChart rooms={rooms} entries={entries} />
          </GlassCard>
        </div>
      </div>

      {/* ── Section 3: Alerts + Quick Actions ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Alerts — wider */}
        <div
          className="lg:col-span-3 animate-[stagger-fade_0.4s_ease_forwards] opacity-0"
          style={{ animationDelay: "560ms" }}
        >
          <GlassCard>
            <h2 className="text-sm font-semibold mb-3">Ogohlantirishlar</h2>
            <AlertsPanel
              teachers={teachers}
              rooms={rooms}
              entries={entries}
            />
          </GlassCard>
        </div>

        {/* Quick Actions — compact grid */}
        <div
          className="lg:col-span-2 animate-[stagger-fade_0.4s_ease_forwards] opacity-0"
          style={{ animationDelay: "640ms" }}
        >
          <GlassCard>
            <h2 className="text-sm font-semibold mb-3">Tez harakatlar</h2>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex flex-col items-center gap-2 p-3 rounded-[12px] hover:bg-[var(--surface-secondary)] transition-all group text-center"
                >
                  <div
                    className={`p-2.5 rounded-[10px] ${action.iconBg} ${action.iconColor} group-hover:scale-110 transition-transform`}
                  >
                    {action.icon}
                  </div>
                  <div>
                    <p className="text-xs font-medium">{action.label}</p>
                    <p className="text-[10px] text-[var(--muted)]">
                      {action.desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* ── Section 5: System Stats ───────────────────────────────────────────── */}
      <div
        className="animate-[stagger-fade_0.4s_ease_forwards] opacity-0"
        style={{ animationDelay: "720ms" }}
      >
        <QuickStats entries={entries} groups={groups} />
      </div>
    </div>
  );
}

// ─── Main Dashboard Page ────────────────────────────────────────────────────
export default function DashboardPage() {
  const hydrated = useHydration();
  const { role } = useRoleAccess();

  if (!hydrated) return <Spinner className="py-20" />;

  if (role === "super_admin" || role === "admin") {
    return <AdminDashboard />;
  }

  if (role === "teacher") {
    return <TeacherDashboard />;
  }

  return <StudentDashboard />;
}
