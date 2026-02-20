// Test foydalanuvchilarni Supabase Auth Admin API orqali yaratish
const SUPABASE_URL = "https://wkgspvuxarpwqpgvhotx.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZ3NwdnV4YXJwd3FwZ3Zob3R4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTU3NjQ3MCwiZXhwIjoyMDg3MTUyNDcwfQ._CBGK6VQa6vdIIqrLkrpTePFH091LWhDxUwIyNdHIwE";

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

const TEST_USERS = [
  {
    email: "superadmin@timetable.uz",
    password: "Test1234!",
    user_metadata: { full_name: "Super Admin", role: "super_admin" },
  },
  {
    email: "admin@timetable.uz",
    password: "Test1234!",
    user_metadata: { full_name: "Admin Foydalanuvchi", role: "admin" },
  },
  {
    email: "teacher@timetable.uz",
    password: "Test1234!",
    user_metadata: { full_name: "Aliyev Vohid", role: "teacher" },
  },
  {
    email: "student@timetable.uz",
    password: "Test1234!",
    user_metadata: { full_name: "Karimov Jasur", role: "student" },
  },
];

async function deleteUserByEmail(email) {
  // Barcha userlarni olish va email bo'yicha topish
  const res = await fetch(
    `${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=50`,
    { headers }
  );
  const data = await res.json();
  const users = data.users || [];
  const user = users.find((u) => u.email === email);
  if (user) {
    await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
      method: "DELETE",
      headers,
    });
    console.log(`  🗑️  Eski ${email} o'chirildi`);
  }
}

async function createUser(userData) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: userData.user_metadata,
    }),
  });

  const data = await res.json();
  if (data.id) {
    console.log(
      `  ✅ ${userData.user_metadata.role.padEnd(12)} → ${userData.email} (ID: ${data.id.slice(0, 8)}...)`
    );
    return data;
  } else {
    console.log(`  ❌ ${userData.email}: ${data.msg || data.message || JSON.stringify(data)}`);
    return null;
  }
}

async function setDepartment(userId, deptId) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/app_users?id=eq.${userId}`,
    {
      method: "PATCH",
      headers: { ...headers, Prefer: "return=minimal" },
      body: JSON.stringify({ department_id: deptId }),
    }
  );
  if (res.ok) {
    console.log(`  🏢 Admin ga department tayinlandi`);
  }
}

async function main() {
  console.log("\n🚀 Test foydalanuvchilar yaratilmoqda...\n");

  // Eski test userlarni tozalash
  console.log("1️⃣  Eski test foydalanuvchilarni tozalash...");
  for (const u of TEST_USERS) {
    await deleteUserByEmail(u.email);
  }
  // test@test.com ni ham tozalash
  await deleteUserByEmail("test@test.com");

  // Yangi userlar yaratish
  console.log("\n2️⃣  Yangi foydalanuvchilar yaratish...");
  const created = [];
  for (const u of TEST_USERS) {
    const result = await createUser(u);
    created.push({ ...u, result });
  }

  // Admin ga department tayinlash
  console.log("\n3️⃣  Admin ga department tayinlash...");
  const adminUser = created.find(
    (u) => u.user_metadata.role === "admin" && u.result
  );
  if (adminUser) {
    // Birinchi department ni olish
    const deptRes = await fetch(
      `${SUPABASE_URL}/rest/v1/departments?select=id&limit=1`,
      { headers }
    );
    const depts = await deptRes.json();
    if (depts.length > 0) {
      await setDepartment(adminUser.result.id, depts[0].id);
    }
  }

  // Natijani tekshirish
  console.log("\n4️⃣  app_users jadvalini tekshirish...");
  const usersRes = await fetch(
    `${SUPABASE_URL}/rest/v1/app_users?select=id,email,full_name,role&order=role`,
    { headers }
  );
  const users = await usersRes.json();
  console.log("\n┌─────────────────────────────┬────────────────┐");
  console.log("│ Email                       │ Rol            │");
  console.log("├─────────────────────────────┼────────────────┤");
  for (const u of users) {
    console.log(
      `│ ${u.email.padEnd(27)} │ ${u.role.padEnd(14)} │`
    );
  }
  console.log("└─────────────────────────────┴────────────────┘");

  console.log("\n✅ Tayyor! Endi login sahifadan test hisoblar bilan kirishingiz mumkin.");
  console.log("   Parol (barchasi uchun): Test1234!\n");
}

main().catch(console.error);
