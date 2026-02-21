"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Room, ID } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase/helpers";
import { roomSync } from "@/lib/supabase/sync";

interface RoomState {
  rooms: Room[];
  addRoom: (data: Omit<Room, "id" | "created_at" | "updated_at">) => Room;
  addRooms: (
    items: Omit<Room, "id" | "created_at" | "updated_at">[]
  ) => number;
  updateRoom: (id: ID, data: Partial<Room>) => void;
  bulkUpdateRooms: (ids: ID[], data: Partial<Room>) => void;
  deleteRoom: (id: ID) => void;
  deleteRooms: (ids: ID[]) => void;
  getRoomById: (id: ID) => Room | undefined;
  bulkLoad: (rooms: Room[]) => void;
}

export const useRoomStore = create<RoomState>()(
  persist(
    (set, get) => ({
      rooms: [],

      addRoom: (data) => {
        const room: Room = {
          ...data,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set((s) => ({ rooms: [...s.rooms, room] }));
        if (isSupabaseConfigured()) {
          roomSync.insert(room).catch(console.error);
        }
        return room;
      },

      addRooms: (items) => {
        const now = new Date().toISOString();
        const newRooms: Room[] = items.map((data) => ({
          ...data,
          id: crypto.randomUUID(),
          created_at: now,
          updated_at: now,
        }));
        set((s) => ({ rooms: [...s.rooms, ...newRooms] }));
        if (isSupabaseConfigured()) {
          roomSync.bulkInsert(newRooms).catch(console.error);
        }
        return newRooms.length;
      },

      updateRoom: (id, data) => {
        set((s) => ({
          rooms: s.rooms.map((r) =>
            r.id === id
              ? { ...r, ...data, updated_at: new Date().toISOString() }
              : r
          ),
        }));
        if (isSupabaseConfigured()) {
          roomSync.update(id, data).catch(console.error);
        }
      },

      bulkUpdateRooms: (ids, data) => {
        const idSet = new Set(ids);
        set((s) => ({
          rooms: s.rooms.map((r) =>
            idSet.has(r.id)
              ? { ...r, ...data, updated_at: new Date().toISOString() }
              : r
          ),
        }));
        if (isSupabaseConfigured()) {
          ids.forEach((id) => roomSync.update(id, data).catch(console.error));
        }
      },

      deleteRoom: (id) => {
        set((s) => ({ rooms: s.rooms.filter((r) => r.id !== id) }));
        if (isSupabaseConfigured()) {
          roomSync.remove(id).catch(console.error);
        }
      },

      deleteRooms: (ids) => {
        const idSet = new Set(ids);
        set((s) => ({
          rooms: s.rooms.filter((r) => !idSet.has(r.id)),
        }));
        if (isSupabaseConfigured()) {
          roomSync.removeMany(ids).catch(console.error);
        }
      },

      getRoomById: (id) => get().rooms.find((r) => r.id === id),

      bulkLoad: (rooms) => set({ rooms }),
    }),
    {
      name: "besttimetable-rooms",
      version: 2,
      migrate: (_persisted, version) => {
        if (version < 2) return { rooms: [] };
        return _persisted as Record<string, unknown>;
      },
    }
  )
);
