"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { NAV_ITEMS } from "@/lib/constants";
import type { UserRole } from "@/lib/types";

/**
 * Foydalanuvchi roli asosida navigatsiya elementlarini filtrlaydigan hook.
 * Demo rejimda (profil yo'q) — super_admin sifatida ishlaydi.
 */
export function useRoleAccess() {
  const { profile, loading } = useAuth();

  const effectiveRole: UserRole = profile?.role ?? "super_admin";

  const filteredNavItems = useMemo(() => {
    return NAV_ITEMS.filter((item) => item.roles.includes(effectiveRole));
  }, [effectiveRole]);

  function canAccess(href: string): boolean {
    const item = NAV_ITEMS.find((i) =>
      i.href === "/" ? href === "/" : href.startsWith(i.href)
    );
    if (!item) return true;
    return item.roles.includes(effectiveRole);
  }

  return {
    role: effectiveRole,
    profile,
    loading,
    filteredNavItems,
    canAccess,
  };
}
