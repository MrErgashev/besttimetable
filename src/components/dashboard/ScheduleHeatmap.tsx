"use client";

import { Fragment, useMemo } from "react";
import type { ScheduleEntry } from "@/lib/types";
import { DAYS, TIME_SLOTS } from "@/lib/constants";

interface ScheduleHeatmapProps {
  entries: ScheduleEntry[];
}

function getHeatColor(count: number, max: number): string {
  if (count === 0) return "var(--surface-secondary)";
  const ratio = max > 0 ? count / max : 0;
  if (ratio <= 0.33) return "var(--color-accent)";
  if (ratio <= 0.66) return "var(--color-warning)";
  return "var(--color-danger)";
}

function getHeatOpacity(count: number, max: number): number {
  if (count === 0) return 0.2;
  const ratio = max > 0 ? count / max : 0;
  return 0.3 + ratio * 0.7;
}

export function ScheduleHeatmap({ entries }: ScheduleHeatmapProps) {
  const { grid, maxCount } = useMemo(() => {
    const counts = new Map<string, number>();
    let maxCount = 0;

    for (const entry of entries) {
      const key = `${entry.day}::${entry.slot_id}`;
      const c = (counts.get(key) || 0) + 1;
      counts.set(key, c);
      if (c > maxCount) maxCount = c;
    }

    const grid = DAYS.map((day) => ({
      day,
      slots: TIME_SLOTS.map((slot) => ({
        slot,
        count: counts.get(`${day.key}::${slot.id}`) || 0,
      })),
    }));

    return { grid, maxCount };
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-sm text-[var(--muted)]">
        Jadval bo&apos;sh
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-1">
      <div className="min-w-[500px] px-1">
        {/* Header */}
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `56px repeat(${TIME_SLOTS.length}, 1fr)` }}>
          <div />
          {TIME_SLOTS.map((slot) => (
            <div
              key={slot.id}
              className="text-[10px] text-center text-[var(--muted)] font-medium truncate"
            >
              {slot.label}
            </div>
          ))}

          {/* Grid rows */}
          {grid.map((row) => (
            <Fragment key={row.day.key}>
              <div
                className="text-xs font-medium text-[var(--foreground)] flex items-center"
              >
                {row.day.short}
              </div>
              {row.slots.map((cell) => (
                <div
                  key={`${row.day.key}-${cell.slot.id}`}
                  className="aspect-[2/1] rounded-[6px] flex items-center justify-center text-[10px] font-medium transition-all hover:scale-105 cursor-default"
                  style={{
                    backgroundColor: getHeatColor(cell.count, maxCount),
                    opacity: getHeatOpacity(cell.count, maxCount),
                    color:
                      cell.count > 0
                        ? "white"
                        : "var(--muted)",
                  }}
                  title={`${row.day.label}, ${cell.slot.label}: ${cell.count} dars`}
                >
                  {cell.count > 0 ? cell.count : ""}
                </div>
              ))}
            </Fragment>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-[3px]"
              style={{
                backgroundColor: "var(--surface-secondary)",
                opacity: 0.3,
              }}
            />
            <span className="text-[10px] text-[var(--muted)]">0</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-[3px]"
              style={{
                backgroundColor: "var(--color-accent)",
                opacity: 0.6,
              }}
            />
            <span className="text-[10px] text-[var(--muted)]">Kam</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-[3px]"
              style={{
                backgroundColor: "var(--color-warning)",
                opacity: 0.8,
              }}
            />
            <span className="text-[10px] text-[var(--muted)]">O&apos;rta</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-[3px]"
              style={{
                backgroundColor: "var(--color-danger)",
                opacity: 1,
              }}
            />
            <span className="text-[10px] text-[var(--muted)]">Ko&apos;p</span>
          </div>
        </div>
      </div>
    </div>
  );
}
