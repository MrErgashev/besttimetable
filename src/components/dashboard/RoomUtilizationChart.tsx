"use client";

import { useMemo } from "react";
import type { Room, ScheduleEntry } from "@/lib/types";
import { ROOM_TYPE_LABELS } from "@/lib/constants";

interface RoomUtilizationChartProps {
  rooms: Room[];
  entries: ScheduleEntry[];
}

const TYPE_COLORS: Record<string, string> = {
  oddiy: "var(--color-accent)",
  laboratoriya: "var(--color-success)",
  kompyuter_xona: "var(--color-warning)",
  majlis_xonasi: "var(--muted)",
};

export function RoomUtilizationChart({
  rooms,
  entries,
}: RoomUtilizationChartProps) {
  const { chartData, utilPercent, totalUsed, totalRooms } = useMemo(() => {
    const usedRoomIds = new Set(entries.map((e) => e.room_id));
    const byType = new Map<string, { used: number; total: number }>();

    for (const room of rooms) {
      const t = room.type || "oddiy";
      if (!byType.has(t)) byType.set(t, { used: 0, total: 0 });
      const bucket = byType.get(t)!;
      bucket.total++;
      if (usedRoomIds.has(room.id)) bucket.used++;
    }

    const chartData = Array.from(byType.entries()).map(([type, counts]) => ({
      name: ROOM_TYPE_LABELS[type] || type,
      value: counts.used,
      total: counts.total,
      type,
    }));

    const totalUsed = usedRoomIds.size;
    const totalRooms = rooms.length;
    const utilPercent =
      totalRooms > 0 ? Math.round((totalUsed / totalRooms) * 100) : 0;

    return { chartData, utilPercent, totalUsed, totalRooms };
  }, [rooms, entries]);

  if (rooms.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-sm text-[var(--muted)]">
        Ma&apos;lumot yo&apos;q
      </div>
    );
  }

  // SVG donut calculations
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 12;

  // Build donut segments
  const segments = useMemo(() => {
    const total = chartData.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) return [];

    let offset = 0;
    return chartData
      .filter((d) => d.value > 0)
      .map((d) => {
        const pct = d.value / total;
        const length = pct * circumference;
        const seg = {
          ...d,
          dasharray: `${length} ${circumference - length}`,
          dashoffset: -offset,
          color: TYPE_COLORS[d.type] || "var(--muted)",
        };
        offset += length;
        return seg;
      });
  }, [chartData, circumference]);

  return (
    <div className="flex flex-col items-center">
      {/* SVG Donut */}
      <div className="relative w-[160px] h-[160px]">
        <svg
          viewBox="0 0 128 128"
          className="w-full h-full -rotate-90"
        >
          {/* Background ring */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="var(--surface-secondary)"
            strokeWidth={strokeWidth}
            opacity={0.4}
          />
          {/* Data segments */}
          {segments.map((seg) => (
            <circle
              key={seg.type}
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={seg.dasharray}
              strokeDashoffset={seg.dashoffset}
              strokeLinecap="round"
              opacity={0.85}
              className="transition-all duration-500"
            />
          ))}
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--foreground)]">
              {utilPercent}%
            </div>
            <div className="text-[10px] text-[var(--muted)]">
              {totalUsed}/{totalRooms}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-3">
        {chartData.map((item) => (
          <div key={item.type} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: TYPE_COLORS[item.type] || "var(--muted)",
              }}
            />
            <span className="text-xs text-[var(--muted)]">
              {item.name}: {item.total}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
