import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/helpers";

interface CreateUserPayload {
  email: string;
  password: string;
  full_name: string;
  role: string;
}

/**
 * Admin API (service role key) bilan foydalanuvchi yaratish.
 * Agar SUPABASE_SERVICE_ROLE_KEY sozlanmagan bo'lsa null qaytaradi.
 */
function getAdminClient() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) return null;

    // Dynamic import to avoid build-time errors
    const { createClient } = require("@supabase/supabase-js");
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Demo rejimda ishlamaydi
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Demo rejimda foydalanuvchi yaratib bo'lmaydi" },
        { status: 400 }
      );
    }

    // Chaqiruvchining autentifikatsiyasini tekshirish
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Autentifikatsiya talab qilinadi" },
        { status: 401 }
      );
    }

    // Rolni tekshirish — faqat admin yoki super_admin
    const { data: profile } = await supabase
      .from("app_users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "super_admin"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Ruxsat yo'q. Faqat admin foydalanuvchi yarata oladi" },
        { status: 403 }
      );
    }

    // Request body
    const body = await request.json();
    const users: CreateUserPayload[] = body.users;

    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: "users massivi talab qilinadi" },
        { status: 400 }
      );
    }

    if (users.length > 100) {
      return NextResponse.json(
        { error: "Bir vaqtda 100 tadan ko'p foydalanuvchi yaratib bo'lmaydi" },
        { status: 400 }
      );
    }

    // Admin client bor-yo'qligini tekshirish
    const adminClient = getAdminClient();
    const useAdminApi = !!adminClient;

    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const u of users) {
      if (!u.email || !u.password || u.password.length < 6) {
        results.failed++;
        results.errors.push(
          `${u.email || "noma'lum"} — login yoki parol noto'g'ri (kamida 6 belgi)`
        );
        continue;
      }

      let error: { message: string } | null = null;

      if (useAdminApi) {
        // 1-usul: Admin API (ishonchli, email yubormasdan)
        const res = await adminClient.auth.admin.createUser({
          email: u.email,
          password: u.password,
          email_confirm: true,
          user_metadata: {
            full_name: u.full_name || "",
            role: u.role || "student",
          },
        });
        error = res.error;
      } else {
        // 2-usul: Fallback — oddiy signUp
        // Ishlashi uchun Supabase Dashboard da "Confirm email" OFF bo'lishi kerak
        const res = await supabase.auth.signUp({
          email: u.email,
          password: u.password,
          options: {
            data: {
              full_name: u.full_name || "",
              role: u.role || "student",
            },
          },
        });
        error = res.error;
      }

      if (error) {
        results.failed++;
        const msg = error.message;
        if (msg.includes("already been registered") || msg.includes("already exists")) {
          results.errors.push(`${u.email.split("@")[0]} — allaqachon ro'yxatdan o'tgan`);
        } else if (msg.includes("rate limit") || msg.includes("email")) {
          results.errors.push(
            `${u.email.split("@")[0]} — Supabase cheklovi. Dashboard → Authentication → Providers → Email → "Confirm email" ni O'CHIRING`
          );
        } else {
          results.errors.push(`${u.email.split("@")[0]} — ${msg}`);
        }
      } else {
        results.success++;
      }
    }

    return NextResponse.json(results);
  } catch (err) {
    console.error("User creation error:", err);
    return NextResponse.json(
      { error: "Server xatolik yuz berdi. SUPABASE_SERVICE_ROLE_KEY sozlanganligini tekshiring." },
      { status: 500 }
    );
  }
}
