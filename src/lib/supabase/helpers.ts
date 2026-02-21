/**
 * Supabase sozlangan yoki yo'qligini tekshiradi.
 * Sozlanmagan bo'lsa — ilova demo rejimda (faqat localStorage) ishlaydi.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && url !== "https://your-project.supabase.co";
}
