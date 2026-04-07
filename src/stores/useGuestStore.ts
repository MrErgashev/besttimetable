"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ID } from "@/lib/types";

export interface GuestProfile {
  fullName: string;
  groupId: ID;
  groupNameSnapshot: string;
  createdAt: string;
}

interface GuestState {
  profile: GuestProfile | null;
  setProfile: (profile: Omit<GuestProfile, "createdAt">) => void;
  clearProfile: () => void;
}

export const useGuestStore = create<GuestState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) =>
        set({
          profile: {
            ...profile,
            createdAt: new Date().toISOString(),
          },
        }),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: "besttimetable-guest",
      version: 1,
    }
  )
);
