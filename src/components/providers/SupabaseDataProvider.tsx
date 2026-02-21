"use client";

import { useSupabaseData } from "@/hooks/useSupabaseData";

/**
 * Supabase dan ma'lumotlarni yuklaydi va realtime subscription qo'yadi.
 * Dashboard layout da ishlatiladi.
 */
export function SupabaseDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useSupabaseData();
  return <>{children}</>;
}
