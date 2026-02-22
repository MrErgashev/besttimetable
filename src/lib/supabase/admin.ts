import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin client — faqat server tomonida ishlatiladi.
 * Service role key RLS ni chetlab o'tadi va admin API ga kirish imkonini beradi.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL va SUPABASE_SERVICE_ROLE_KEY sozlanishi shart"
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
