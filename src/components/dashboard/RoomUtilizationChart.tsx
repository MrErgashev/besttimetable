"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
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

  return (
    <div className="flex flex-col items-center">
      <div className="w-full h-[220px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              dataKey="value"
              strokeWidth={2}
              stroke="var(--surface-solid)"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={TYPE_COLORS[entry.type] || "var(--muted)"}
                  opacity={0.85}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="apple-card px-3 py-2 text-xs">
                    <p className="font-semibold">{d.name}</p>
                    <p>
                      Band: {d.value} / {d.total}
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {chartData.map((item) => (
          <div key={item.type} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor:
                  TYPE_COLORS[item.type] || "var(--muted)",
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
