import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (!client) {
    // Demo rejimda (env sozlanmagan) placeholder URL bilan yaratish
    // Supabase funksiyalari ishlamas, lekin crash bo'lmaydi
    const url =
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
    client = createBrowserClient<Database>(url, key);
  }
  return client;
}
