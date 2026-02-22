/**
 * Markazlashgan sync xatolik boshqaruvchisi.
 *
 * Barcha store'lardagi takroriy patternni soddalashtiradi:
 *   if (isSupabaseConfigured()) { someSync.method().catch(console.error); }
 *
 * Ishlatish:
 *   syncSafe(() => teacherSync.insert(teacher));
 *   syncSafe(() => teacherSync.remove(id), "O'qituvchini o'chirishda xatolik");
 */
import { isSupabaseConfigured } from "@/lib/supabase/helpers";

/**
 * Supabase ga fire-and-forget sync chaqiruvini xavfsiz bajaradi.
 * - isSupabaseConfigured() tekshiradi
 * - Xatoliklarni tutib, console.error ga yozadi (kontekst bilan)
 */
export function syncSafe(
  fn: () => Promise<void>,
  context?: string
): void {
  if (!isSupabaseConfigured()) return;
  fn().catch((err) => {
    console.error(context ?? "Supabase sync xatolik:", err);
  });
}
