"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Room, ID } from "@/lib/types";

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
}

export const useRoomStore = create<RoomState>()(
  persist(
    (set, get) => ({
      rooms: [],

      addRoom: (data) => {
        const room: Room = {
          ...data,
          id: nanoid(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set((s) => ({ rooms: [...s.rooms, room] }));
        return room;
      },

      updateRoom: (id, data) =>
        set((s) => ({
          rooms: s.rooms.map((r) =>
            r.id === id
              ? { ...r, ...data, updated_at: new Date().toISOString() }
              : r
          ),
        })),

      deleteRoom: (id) =>
        set((s) => ({ rooms: s.rooms.filter((r) => r.id !== id) })),

      getRoomById: (id) => get().rooms.find((r) => r.id === id),
    }),
    { name: "besttimetable-rooms", version: 1 }
  )
);
