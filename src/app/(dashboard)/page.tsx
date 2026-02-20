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
import { Spinner } from "@/components/ui/Spinner";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";

import { QuickStats } from "@/components/dashboard/QuickStats";
import { TeacherWorkloadChart } from "@/components/dashboard/TeacherWorkloadChart";
import { RoomUtilizationChart } from "@/components/dashboard/RoomUtilizationChart";

// ─── Teacher Dashboard ──────────────────────────────────────────────────────
function TeacherDashboard() {
  const { profile } = useRoleAccess();
  const { teachers } = useTeacherStore();
  const { entries } = useTimetableStore();

  const myTeacher = teachers.find((t) => t.user_id === profile?.id);
  const myEntries = useMemo(() => {
    if (!myTeacher) return [];
    return entries.filter((e) => e.teacher_id === myTeacher.id);
  }, [myTeacher, entries]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight md:text-[32px]">
          Xush kelibsiz{profile?.full_name ? `, ${profile.full_name}` : ""}
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Sizning dars jadvalingiz
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="animate-[stagger-fade_0.4s_ease_forwards] opacity-0" style={{ animationDelay: "0ms" }}>
          <GlassCard hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[var(--muted)]">Jami darslarim</p>
                <p className="text-3xl font-bold mt-1 text-[var(--color-accent)]">
                  {myEntries.length}
                </p>
              </div>
              <div className="p-2.5 rounded-[12px] bg-blue-50 dark:bg-blue-900/20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                <p className="text-sm text-[var(--muted)]">Max haftalik soat</p>
                <p className="text-3xl font-bold mt-1 text-[#5856D6]">
                  {myTeacher?.max_weekly_hours ?? 0}
                </p>
              </div>
              <div className="p-2.5 rounded-[12px] bg-purple-50 dark:bg-purple-900/20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Tez harakatlar */}
      <GlassCard>
        <h2 className="text-lg font-semibold mb-4">Tez harakatlar</h2>
        <div className="space-y-3">
          <Link
            href="/timetable"
            className="flex items-center gap-3 p-3 rounded-[12px] hover:bg-[var(--glass-bg)] hover:backdrop-blur-sm transition-all group"
          >
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-[var(--color-accent)] group-hover:scale-110 transition-transform">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">Dars jadvalimni ko&apos;rish</p>
              <p className="text-xs text-[var(--muted)]">Haftalik jadval</p>
            </div>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}

// ─── Student Dashboard ──────────────────────────────────────────────────────
function StudentDashboard() {
  const { profile } = useRoleAccess();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight md:text-[32px]">
          Xush kelibsiz{profile?.full_name ? `, ${profile.full_name}` : ""}
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Sizning guruh jadvalingiz
        </p>
      </div>

      {/* Tez harakatlar */}
      <GlassCard>
        <h2 className="text-lg font-semibold mb-4">Tez harakatlar</h2>
        <div className="space-y-3">
          <Link
            href="/timetable"
            className="flex items-center gap-3 p-3 rounded-[12px] hover:bg-[var(--glass-bg)] hover:backdrop-blur-sm transition-all group"
          >
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-[var(--color-accent)] group-hover:scale-110 transition-transform">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">Dars jadvalini ko&apos;rish</p>
              <p className="text-xs text-[var(--muted)]">Guruh bo&apos;yicha haftalik jadval</p>
            </div>
          </Link>
        </div>
      </GlassCard>
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

      {/* ── Section 3: Heatmap ────────────────────────────────────────────────── */}
      <div
        className="animate-[stagger-fade_0.4s_ease_forwards] opacity-0"
        style={{ animationDelay: "480ms" }}
      >
        <GlassCard>
          <h2 className="text-lg font-semibold mb-4">Tez harakatlar</h2>
          <div className="space-y-3">
            {[
              {
                href: "/timetable",
                label: "Dars jadvalini ko'rish",
                desc: "Guruh bo'yicha jadval",
                iconBg: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>,
              },
              {
                href: "/generate",
                label: "Avtomatik jadval tuzish",
                desc: "Cheklovlar asosida",
                iconBg: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>,
              },
              {
                href: "/import",
                label: "Import qilish",
                desc: "Excel yoki Word fayldan",
                iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
              },
              {
                href: "/export",
                label: "Eksport qilish",
                desc: "PDF yoki Excel",
                iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>,
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-[12px] hover:bg-[var(--glass-bg)] hover:backdrop-blur-sm transition-all group"
              >
                <div className={`p-2 rounded-lg group-hover:scale-110 transition-transform ${item.iconBg}`}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-[var(--muted)]">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* ── Section 4: Alerts + Quick Actions ─────────────────────────────────── */}
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
