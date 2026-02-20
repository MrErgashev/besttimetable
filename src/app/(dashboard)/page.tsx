"use client";

import { useMemo } from "react";
import { useTeacherStore } from "@/stores/useTeacherStore";
import { useGroupStore } from "@/stores/useGroupStore";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useRoomStore } from "@/stores/useRoomStore";
import { useTimetableStore } from "@/stores/useTimetableStore";
import { useHydration } from "@/hooks/useHydration";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { DAYS, TIME_SLOTS } from "@/lib/constants";

export default function DashboardPage() {
  const hydrated = useHydration();
  const { teachers } = useTeacherStore();
  const { groups } = useGroupStore();
  const { subjects } = useSubjectStore();
  const { rooms } = useRoomStore();
  const { entries } = useTimetableStore();

  // Konflikt hisoblash
  const conflictCount = useMemo(() => {
    const bySlot = new Map<string, typeof entries>();
    for (const e of entries) {
      const key = `${e.day}::${e.slot_id}`;
      if (!bySlot.has(key)) bySlot.set(key, []);
      bySlot.get(key)!.push(e);
    }
    let count = 0;
    for (const [, slotEntries] of bySlot) {
      const teacherIds = slotEntries.map((e) => e.teacher_id);
      const roomIds = slotEntries.map((e) => e.room_id);
      if (new Set(teacherIds).size !== teacherIds.length) count++;
      if (new Set(roomIds).size !== roomIds.length) count++;
    }
    return count;
  }, [entries]);

  // O'qituvchi yuklamasi
  const overloadedTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const count = entries.filter((e) => e.teacher_id === t.id).length;
      return count * 1.5 > t.max_weekly_hours;
    });
  }, [teachers, entries]);

  // Jadval to'ldirilishi (guruhlar bo'yicha o'rtacha)
  const fillPercent = useMemo(() => {
    if (groups.length === 0) return 0;
    const totalPossible = groups.length * DAYS.length * 3; // har bir guruh uchun 3 slot o'rtacha
    return Math.min(100, Math.round((entries.length / Math.max(totalPossible, 1)) * 100));
  }, [groups, entries]);

  if (!hydrated) return <Spinner className="py-20" />;

  const stats = [
    {
      title: "O'qituvchilar",
      value: teachers.length,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-[var(--color-accent)]",
    },
    {
      title: "Guruhlar",
      value: groups.length,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 2 6 3 6 3s6-1 6-3v-5" />
        </svg>
      ),
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-[#5856D6]",
    },
    {
      title: "Fanlar",
      value: subjects.length,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      ),
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
      textColor: "text-emerald-500",
    },
    {
      title: "Xonalar",
      value: rooms.length,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14" />
          <path d="M2 20h20M14 12v.01" />
        </svg>
      ),
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      textColor: "text-amber-500",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight md:text-[32px]">Bosh sahifa</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Dars jadvali tizimiga xush kelibsiz
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={stat.title} className="animate-[stagger-fade_0.4s_ease_forwards] opacity-0" style={{ animationDelay: `${index * 80}ms` }}>
          <GlassCard hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[var(--muted)]">{stat.title}</p>
                <p className={`text-3xl font-bold mt-1 ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-2.5 rounded-[12px] ${stat.bgColor}`}>
                {stat.icon}
              </div>
            </div>
          </GlassCard>
          </div>
        ))}
      </div>

      {/* Jadval holati */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard>
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--color-accent)]">{entries.length}</div>
            <div className="text-xs text-[var(--muted)] mt-1">Jami darslar</div>
            <div className="mt-2 h-1.5 bg-[var(--surface)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--color-accent)] to-[#5856D6] rounded-full"
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-center">
            <div className={`text-3xl font-bold ${conflictCount > 0 ? "text-red-500" : "text-green-500"}`}>
              {conflictCount}
            </div>
            <div className="text-xs text-[var(--muted)] mt-1">Konfliktlar</div>
            <div className="mt-2">
              <Badge variant={conflictCount > 0 ? "danger" : "success"}>
                {conflictCount > 0 ? "Tuzatish kerak!" : "Hammasi yaxshi"}
              </Badge>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-center">
            <div className={`text-3xl font-bold ${overloadedTeachers.length > 0 ? "text-amber-500" : "text-green-500"}`}>
              {overloadedTeachers.length}
            </div>
            <div className="text-xs text-[var(--muted)] mt-1">Yuklamasi oshgan</div>
            <div className="mt-2">
              {overloadedTeachers.length > 0 ? (
                <span className="text-xs text-amber-500">
                  {overloadedTeachers.map((t) => t.short_name).join(", ")}
                </span>
              ) : (
                <Badge variant="success">Normal</Badge>
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Quick Actions + O'zgarishlar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h2 className="text-lg font-semibold mb-4">Tez harakatlar</h2>
          <div className="space-y-3">
            {[
              {
                href: "/timetable",
                label: "Dars jadvalini ko'rish",
                desc: "Guruh bo'yicha jadval",
                color: "blue",
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>,
              },
              {
                href: "/generate",
                label: "Avtomatik jadval tuzish",
                desc: "Cheklovlar asosida",
                color: "purple",
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>,
              },
              {
                href: "/import",
                label: "Import qilish",
                desc: "Excel yoki Word fayldan",
                color: "emerald",
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
              },
              {
                href: "/export",
                label: "Eksport qilish",
                desc: "PDF yoki Excel",
                color: "amber",
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>,
              },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-[12px] hover:bg-[var(--surface-hover)] transition-all group"
              >
                <div className={`p-2 rounded-lg bg-${item.color}-100 dark:bg-${item.color}-900/30 text-${item.color}-600 dark:text-${item.color}-400 group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-[var(--muted)]">{item.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-lg font-semibold mb-4">Tizim holati</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-[12px] bg-[var(--surface)]">
              <span className="text-sm">Qo&apos;lda qo&apos;yilgan darslar</span>
              <Badge>{entries.filter((e) => e.is_manual).length}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-[12px] bg-[var(--surface)]">
              <span className="text-sm">Avtomatik tuzilgan</span>
              <Badge>{entries.filter((e) => !e.is_manual).length}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-[12px] bg-[var(--surface)]">
              <span className="text-sm">Jami vaqt slotlari</span>
              <Badge>{TIME_SLOTS.length}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-[12px] bg-[var(--surface)]">
              <span className="text-sm">Ish kunlari</span>
              <Badge>{DAYS.length}</Badge>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
