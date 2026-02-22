import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/helpers";

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Demo rejimda foydalanuvchi o'chirib bo'lmaydi" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
        { error: "Ruxsat yo'q. Faqat admin foydalanuvchi o'chira oladi" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const userId: string = body.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "userId talab qilinadi" },
        { status: 400 }
      );
    }

    // O'zini o'chirishga ruxsat yo'q
    if (userId === user.id) {
      return NextResponse.json(
        { error: "O'zingizni o'chira olmaysiz" },
        { status: 400 }
      );
    }

    // auth.users dan o'chirish (service role key kerak)
    if (serviceRoleKey) {
      const adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { error: authError } =
        await adminClient.auth.admin.deleteUser(userId);

      if (authError) {
        // Agar auth.users da topilmasa ham davom etamiz
        // (app_users da bo'lishi mumkin lekin auth da yo'q)
        if (!authError.message.includes("not found")) {
          return NextResponse.json(
            { error: `Auth o'chirishda xatolik: ${authError.message}` },
            { status: 500 }
          );
        }
      }
    }

    // app_users dan o'chirish (cascade orqali teachers.user_id NULL bo'ladi)
    const { error: dbError } = await supabase
      .from("app_users")
      .delete()
      .eq("id", userId);

    if (dbError) {
      return NextResponse.json(
        { error: `Ma'lumotlar bazasidan o'chirishda xatolik: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Noma'lum xatolik";
    return NextResponse.json(
      { error: `Server xatolik: ${msg}` },
      { status: 500 }
    );
  }
}
