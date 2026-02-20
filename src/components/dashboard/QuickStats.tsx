"use client";

import { useMemo } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { ScheduleEntry, Group } from "@/lib/types";
import { DAYS, TRACK_LABELS } from "@/lib/constants";
import type { TrackKey } from "@/lib/types";

interface QuickStatsProps {
  entries: ScheduleEntry[];
  groups: Group[];
}

export function QuickStats({ entries, groups }: QuickStatsProps) {
  const { fillPercent, manualCount, autoCount, trackDist } = useMemo(() => {
    const totalPossible =
      groups.length > 0 ? groups.length * DAYS.length * 3 : 1;
    const fillPercent = Math.min(
      100,
      Math.round((entries.length / Math.max(totalPossible, 1)) * 100)
    );

    const manualCount = entries.filter((e) => e.is_manual).length;
    const autoCount = entries.filter((e) => !e.is_manual).length;

    // Track distribution from groups
    const trackCounts: Record<TrackKey, number> = {
      kunduzgi: 0,
      sirtqi: 0,
      kechki: 0,
    };
    for (const g of groups) {
      if (g.track in trackCounts) {
        trackCounts[g.track as TrackKey]++;
      }
    }
    const totalGroups = groups.length || 1;
    const trackDist = (Object.entries(trackCounts) as [TrackKey, number][]).map(
      ([track, count]) => ({
        track,
        label: TRACK_LABELS[track],
        count,
        percent: Math.round((count / totalGroups) * 100),
      })
    );

    return { fillPercent, manualCount, autoCount, trackDist };
  }, [entries, groups]);

  const trackColors: Record<TrackKey, string> = {
    kunduzgi: "var(--color-accent)",
    sirtqi: "var(--color-warning)",
    kechki: "var(--color-success)",
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Fill percentage */}
      <GlassCard padding="sm">
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto mb-2">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--surface-secondary)"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="3"
                strokeDasharray={`${fillPercent}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold">{fillPercent}%</span>
            </div>
          </div>
          <p className="text-[11px] text-[var(--muted)]">To&apos;ldirilish</p>
          <p className="text-[10px] text-[var(--muted)]">
            {entries.length} dars
          </p>
        </div>
      </GlassCard>

      {/* Manual entries */}
      <GlassCard padding="sm">
        <div className="text-center py-2">
          <div className="text-2xl font-bold text-[var(--foreground)]">
            {manualCount}
          </div>
          <p className="text-[11px] text-[var(--muted)] mt-1">Qo&apos;lda</p>
          <div className="mt-2 h-1 bg-[var(--surface-secondary)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-accent)] rounded-full"
              style={{
                width: `${entries.length > 0 ? (manualCount / entries.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </GlassCard>

      {/* Auto entries */}
      <GlassCard padding="sm">
        <div className="text-center py-2">
          <div className="text-2xl font-bold text-[var(--foreground)]">
            {autoCount}
          </div>
          <p className="text-[11px] text-[var(--muted)] mt-1">Avtomatik</p>
          <div className="mt-2 h-1 bg-[var(--surface-secondary)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-success)] rounded-full"
              style={{
                width: `${entries.length > 0 ? (autoCount / entries.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </GlassCard>

      {/* Track distribution */}
      <GlassCard padding="sm">
        <div className="py-1">
          <p className="text-[11px] text-[var(--muted)] mb-2 text-center">
            Track taqsimoti
          </p>
          {/* Stacked bar */}
          <div className="h-2 bg-[var(--surface-secondary)] rounded-full overflow-hidden flex">
            {trackDist.map((td) => (
              <div
                key={td.track}
                className="h-full first:rounded-l-full last:rounded-r-full"
                style={{
                  width: `${td.percent}%`,
                  backgroundColor: trackColors[td.track],
                }}
              />
            ))}
          </div>
          <div className="mt-2 space-y-0.5">
            {trackDist.map((td) => (
              <div
                key={td.track}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-1">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: trackColors[td.track] }}
                  />
                  <span className="text-[10px] text-[var(--muted)]">
                    {td.label}
                  </span>
                </div>
                <span className="text-[10px] font-medium">{td.count}</span>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
