"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
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
          remaining: Math.max(0, max - actual),
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

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 40, left: 0, bottom: 4 }}
          barSize={14}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={80}
            tick={{ fontSize: 12, fill: "var(--foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="apple-card px-3 py-2 text-xs">
                  <p className="font-semibold">{d.name}</p>
                  <p>
                    Haqiqiy: <span className="font-medium">{d.actual}</span> /{" "}
                    {d.max} soat
                  </p>
                  <p>
                    Foiz:{" "}
                    <span
                      className={
                        d.overloaded
                          ? "text-[var(--color-danger)]"
                          : "text-[var(--color-accent)]"
                      }
                    >
                      {d.percent}%
                    </span>
                  </p>
                </div>
              );
            }}
          />
          <ReferenceLine x={0} stroke="var(--border-strong)" />
          <Bar dataKey="actual" stackId="load" radius={[0, 0, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  entry.overloaded
                    ? "var(--color-danger)"
                    : "var(--color-accent)"
                }
                opacity={0.85}
              />
            ))}
          </Bar>
          <Bar
            dataKey="remaining"
            stackId="load"
            fill="var(--surface-secondary)"
            radius={[0, 4, 4, 0]}
            opacity={0.5}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
