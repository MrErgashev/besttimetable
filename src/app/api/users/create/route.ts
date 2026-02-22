import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/helpers";

interface CreateUserPayload {
  email: string;
  password: string;
  full_name: string;
  role: string;
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

    // Admin client orqali yaratish
    const adminClient = createAdminClient();
    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const u of users) {
      if (!u.email || !u.password || u.password.length < 6) {
        results.failed++;
        results.errors.push(
          `${u.email || "noma'lum"} — email yoki parol noto'g'ri`
        );
        continue;
      }

      const { error } = await adminClient.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: {
          full_name: u.full_name || "",
          role: u.role || "student",
        },
      });

      if (error) {
        results.failed++;
        if (error.message.includes("already been registered")) {
          results.errors.push(`${u.email} — allaqachon ro'yxatdan o'tgan`);
        } else {
          results.errors.push(`${u.email} — ${error.message}`);
        }
      } else {
        results.success++;
      }
    }

    return NextResponse.json(results);
  } catch (err) {
    console.error("User creation error:", err);
    return NextResponse.json(
      { error: "Server xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
