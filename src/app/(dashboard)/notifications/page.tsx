"use client";

import { useState, useMemo } from "react";
import { useTeacherStore } from "@/stores/useTeacherStore";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useRoomStore } from "@/stores/useRoomStore";
import { useGroupStore } from "@/stores/useGroupStore";
import { useHydration } from "@/hooks/useHydration";
import { useFilteredNotifications } from "@/hooks/useFilteredNotifications";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { DAYS, TIME_SLOTS, ROLE_LABELS } from "@/lib/constants";
import type { ScheduleChangelog } from "@/lib/types";

const ACTION_LABELS: Record<string, { label: string; variant: "success" | "warning" | "danger" }> = {
  create: { label: "Yangi dars", variant: "success" },
  update: { label: "O'zgartirildi", variant: "warning" },
  delete: { label: "O'chirildi", variant: "danger" },
};

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "hozirgina";
  if (minutes < 60) return `${minutes} daqiqa oldin`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} soat oldin`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} kun oldin`;
  return new Date(dateStr).toLocaleDateString("uz-UZ");
}

export default function NotificationsPage() {
  const hydrated = useHydration();
  const { logs, readIds, unreadCount, markAsRead, markAllAsRead, role } =
    useFilteredNotifications();
  const { teachers } = useTeacherStore();
  const { subjects } = useSubjectStore();
  const { rooms } = useRoomStore();
  const { groups } = useGroupStore();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const resolvedLogs = useMemo(() => {
    return logs.slice(0, 100).map((log) => {
      const data = log.new_data || log.old_data || {};
      const teacherName = teachers.find((t) => t.id === data.teacher_id)?.short_name;
      const subjectName = subjects.find((s) => s.id === data.subject_id)?.name;
      const roomName = rooms.find((r) => r.id === data.room_id)?.name;
      const groupNames = Array.isArray(data.group_ids)
        ? (data.group_ids as string[]).map((gid) => groups.find((g) => g.id === gid)?.name).filter(Boolean).join(", ")
        : undefined;
      const day = DAYS.find((d) => d.key === data.day)?.label;
      const slot = TIME_SLOTS.find((s) => s.id === data.slot_id)?.label;

      return { ...log, teacherName, subjectName, roomName, groupNames, day, slot };
    });
  }, [logs, teachers, subjects, rooms, groups]);

  const filtered = useMemo(() => {
    if (filter === "unread") return resolvedLogs.filter((l) => !readIds.has(l.id));
    return resolvedLogs;
  }, [resolvedLogs, filter, readIds]);

  if (!hydrated) return <Spinner className="py-20" />;

  const roleLabel = ROLE_LABELS[role] || role;
  const roleDescription =
    role === "teacher"
      ? "Faqat sizga tegishli darslar haqida bildirishnomalar"
      : role === "student"
        ? "Faqat sizning guruhingizga tegishli o'zgarishlar"
        : "Barcha jadval o'zgarishlari haqida bildirishnomalar";

  function buildMessage(log: ScheduleChangelog & { teacherName?: string; subjectName?: string; roomName?: string; groupNames?: string; day?: string; slot?: string }) {
    const parts: string[] = [];
    if (log.subjectName) parts.push(log.subjectName);
    if (log.teacherName) parts.push(log.teacherName);
    if (log.groupNames) parts.push(log.groupNames);
    if (log.day && log.slot) parts.push(`${log.day} ${log.slot}`);
    if (log.roomName) parts.push(log.roomName);
    if (parts.length === 0) return "Jadval yozuvi";
    return parts.join(" — ");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-light)] bg-clip-text text-transparent">Bildirishnomalar</span>
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            {roleDescription}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default">{roleLabel}</Badge>
          {unreadCount > 0 && (
            <Badge variant="accent">{unreadCount} ta yangi</Badge>
          )}
        </div>
      </div>

      {/* Filter + Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            filter === "all"
              ? "bg-[var(--color-accent)] text-white"
              : "bg-[var(--surface-secondary)] text-[var(--foreground)]"
          }`}
        >
          Hammasi ({resolvedLogs.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            filter === "unread"
              ? "bg-[var(--color-accent)] text-white"
              : "bg-[var(--surface-secondary)] text-[var(--foreground)]"
          }`}
        >
          O&apos;qilmagan ({unreadCount})
        </button>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllAsRead(resolvedLogs.map((l) => l.id))}
            className="ml-auto"
          >
            Barchasini o&apos;qilgan deb belgilash
          </Button>
        )}
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <GlassCard>
          <div className="text-center py-12">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-[var(--muted)] mb-3">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <p className="text-[var(--muted)] mb-1">
              {filter === "unread" ? "O'qilmagan bildirishnomalar yo'q" : "Bildirishnomalar yo'q"}
            </p>
            <p className="text-xs text-[var(--muted)]">
              Jadvalga o&apos;zgartirish kiritilganda bu yerda ko&apos;rinadi
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {filtered.map((log) => {
            const isRead = readIds.has(log.id);
            const actionConfig = ACTION_LABELS[log.action] || ACTION_LABELS.update;

            return (
              <button
                key={log.id}
                onClick={() => markAsRead(log.id)}
                className={`w-full text-left p-4 rounded-[16px] border transition-all ${
                  isRead
                    ? "bg-[var(--surface)] border-[var(--border)]"
                    : "bg-[var(--surface)] border-[var(--color-accent)]/30 shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Dot */}
                  <div className="mt-1.5 shrink-0">
                    {!isRead ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--border)]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={actionConfig.variant}>{actionConfig.label}</Badge>
                      <span className="text-xs text-[var(--muted)]">
                        {formatTimeAgo(log.changed_at)}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${isRead ? "text-[var(--muted)]" : "font-medium"}`}>
                      {buildMessage(log)}
                    </p>
                    {log.changed_by && (
                      <p className="text-xs text-[var(--muted)] mt-0.5">
                        {log.changed_by === "generator" ? "Avtomatik generator" : log.changed_by === "import" ? "Import" : "Admin"}
                      </p>
                    )}
                  </div>

                  {/* Icon */}
                  <div className={`p-2 rounded-lg shrink-0 ${
                    log.action === "create" ? "bg-green-500/10 text-green-500" :
                    log.action === "delete" ? "bg-red-500/10 text-red-500" :
                    "bg-amber-500/10 text-amber-500"
                  }`}>
                    {log.action === "create" ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                    ) : log.action === "delete" ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
