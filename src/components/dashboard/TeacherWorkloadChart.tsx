"use client";

import { useMemo } from "react";
import type { Teacher, ScheduleEntry } from "@/lib/types";

interface TeacherWorkloadChartProps {
  teachers: Teacher[];
  entries: ScheduleEntry[];
}

export function TeacherWorkloadChart({
  teachers,
  entries,
}: TeacherWorkloadChartProps) {
  const data = useMemo(() => {
    return teachers
      .map((t) => {
        const actual = entries.filter((e) => e.teacher_id === t.id).length;
        const max = t.max_weekly_hours;
        const percent = max > 0 ? Math.round((actual / max) * 100) : 0;
        return {
          name: t.short_name,
          actual,
          max,
          percent,
          overloaded: actual > max,
        };
      })
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 8);
  }, [teachers, entries]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-sm text-[var(--muted)]">
        Ma&apos;lumot yo&apos;q
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => Math.max(d.actual, d.max)));

  return (
    <div className="space-y-2.5">
      {data.map((d) => {
        const barWidth = maxVal > 0 ? Math.min(100, (d.actual / maxVal) * 100) : 0;
        const limitPos = maxVal > 0 ? Math.min(100, (d.max / maxVal) * 100) : 0;

        return (
          <div key={d.name} className="group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-[var(--foreground)] truncate max-w-[100px]">
                {d.name}
              </span>
              <span
                className={`text-[11px] font-medium ${
                  d.overloaded
                    ? "text-[var(--color-danger)]"
                    : d.percent >= 80
                      ? "text-[var(--color-warning)]"
                      : "text-[var(--muted)]"
                }`}
              >
                {d.actual}/{d.max} ({d.percent}%)
              </span>
            </div>
            <div className="relative h-2 bg-[var(--surface-secondary)] rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                style={{
                  width: `${barWidth}%`,
                  backgroundColor: d.overloaded
                    ? "var(--color-danger)"
                    : d.percent >= 80
                      ? "var(--color-warning)"
                      : "var(--color-accent)",
                  opacity: 0.85,
                }}
              />
              {/* Max limit marker */}
              <div
                className="absolute inset-y-0 w-[2px] bg-[var(--foreground)] opacity-20 rounded-full"
                style={{ left: `${limitPos}%` }}
              />
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--color-accent)", opacity: 0.85 }} />
          <span className="text-[10px] text-[var(--muted)]">Normal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--color-warning)", opacity: 0.85 }} />
          <span className="text-[10px] text-[var(--muted)]">Yuqori</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--color-danger)", opacity: 0.85 }} />
          <span className="text-[10px] text-[var(--muted)]">Oshgan</span>
        </div>
      </div>
    </div>
  );
}
