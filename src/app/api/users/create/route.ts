import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/helpers";

interface CreateUserPayload {
  email: string;
  password: string;
  full_name: string;
  role: string;
}

/** full_name dan first_name, last_name, short_name ajratib olish */
function parseFullName(fullName: string): {
  first_name: string;
  last_name: string;
  short_name: string;
} {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    const last_name = parts[0];
    const first_name = parts.slice(1).join(" ");
    const short_name = `${last_name} ${first_name.charAt(0)}.`;
    return { first_name, last_name, short_name };
  }
  return {
    first_name: fullName,
    last_name: "",
    short_name: fullName,
  };
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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

    // Admin client (service role key bilan) — email yubormasdan yaratadi
    const hasServiceKey = !!serviceRoleKey;
    const adminClient = hasServiceKey
      ? createClient(supabaseUrl, serviceRoleKey!, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      : null;

    // Fallback: anon client (alohida, session ga ta'sir qilmaydi)
    // Supabase Dashboard da "Confirm email" OFF bo'lishi kerak
    const anonClient = !hasServiceKey
      ? createClient(supabaseUrl, anonKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      : null;

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      created_teachers: [] as { full_name: string; email: string }[],
    };

    for (const u of users) {
      const loginName = u.email?.split("@")[0] || "noma'lum";

      if (!u.email || !u.password || u.password.length < 6) {
        results.failed++;
        results.errors.push(`${loginName} — parol kamida 6 ta belgi bo'lishi kerak`);
        continue;
      }

      let errorMsg: string | null = null;

      if (adminClient) {
        // 1-usul: Admin API — ishonchli, email yubormasdan
        const { error } = await adminClient.auth.admin.createUser({
          email: u.email,
          password: u.password,
          email_confirm: true,
          user_metadata: {
            full_name: u.full_name || "",
            role: u.role || "student",
          },
        });

        // Orphan auth entry ni tozalash: auth.users da bor, app_users da yo'q
        if (error && (error.message.includes("already been registered") || error.message.includes("already exists"))) {
          const { data: existingAppUser } = await adminClient
            .from("app_users")
            .select("id")
            .eq("email", u.email)
            .maybeSingle();

          if (!existingAppUser) {
            // Orphan: auth.users da bor lekin app_users da yo'q — tozalab qayta yaratish
            const { data: listData } = await adminClient.auth.admin.listUsers();
            const orphanUser = listData?.users?.find((au) => au.email === u.email);

            if (orphanUser) {
              await adminClient.auth.admin.deleteUser(orphanUser.id);

              const { error: retryError } = await adminClient.auth.admin.createUser({
                email: u.email,
                password: u.password,
                email_confirm: true,
                user_metadata: {
                  full_name: u.full_name || "",
                  role: u.role || "student",
                },
              });
              errorMsg = retryError?.message || null;
            } else {
              errorMsg = error.message;
            }
          } else {
            // Haqiqiy duplikat — app_users da ham mavjud
            errorMsg = error.message;
          }
        } else {
          errorMsg = error?.message || null;
        }
      } else if (anonClient) {
        // 2-usul: Oddiy signUp (Dashboard da "Confirm email" OFF bo'lishi kerak)
        const { error } = await anonClient.auth.signUp({
          email: u.email,
          password: u.password,
          options: {
            data: {
              full_name: u.full_name || "",
              role: u.role || "student",
            },
          },
        });
        errorMsg = error?.message || null;
      } else {
        errorMsg = "Server sozlanmagan";
      }

      if (errorMsg) {
        results.failed++;
        if (errorMsg.includes("already been registered") || errorMsg.includes("already exists")) {
          results.errors.push(`${loginName} — allaqachon ro'yxatdan o'tgan`);
        } else if (errorMsg.includes("rate limit")) {
          results.errors.push(
            `${loginName} — Email cheklovi. Supabase → Authentication → Providers → Email → "Confirm email" ni O'CHIRING`
          );
        } else if (errorMsg.includes("not authorized") || errorMsg.includes("not allowed")) {
          results.errors.push(
            `${loginName} — Ruxsat yo'q. Vercel ga SUPABASE_SERVICE_ROLE_KEY qo'shing`
          );
        } else {
          results.errors.push(`${loginName} — ${errorMsg}`);
        }
      } else {
        results.success++;

        // O'qituvchi rolida bo'lsa, teachers jadvaliga ham yozish
        if (u.role === "teacher" && u.full_name) {
          const { first_name, last_name, short_name } = parseFullName(u.full_name);
          const dbClient = adminClient || supabase;
          await dbClient
            .from("teachers")
            .insert({
              first_name,
              last_name,
              short_name,
              email: u.email,
              max_weekly_hours: 18,
            })
            .then(({ error: teacherErr }) => {
              if (teacherErr) {
                console.error("Teacher insert error:", teacherErr.message);
              } else {
                results.created_teachers.push({
                  full_name: u.full_name,
                  email: u.email,
                });
              }
            });
        }
      }
    }

    return NextResponse.json(results);
  } catch (err) {
    console.error("User creation error:", err);
    const msg = err instanceof Error ? err.message : "Noma'lum xatolik";
    return NextResponse.json(
      {
        error: `Server xatolik: ${msg}`,
        hint: "Vercel Settings → Environment Variables → SUPABASE_SERVICE_ROLE_KEY qo'shib, redeploy qiling",
      },
      { status: 500 }
    );
  }
}
