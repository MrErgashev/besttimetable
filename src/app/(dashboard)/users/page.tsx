"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassModal } from "@/components/ui/GlassModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import {
  UserPlus,
  Shield,
  UserCog,
  BookOpen,
  GraduationCap,
  Trash2,
  Search,
  Users,
  AlertCircle,
  UsersRound,
} from "lucide-react";
import { BulkUserImport } from "@/components/import/BulkUserImport";
import type { AppUser, UserRole } from "@/lib/types";

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; bgClass: string; textClass: string; icon: React.ElementType }
> = {
  super_admin: { label: "Super Admin", bgClass: "bg-red-500/10", textClass: "text-red-500", icon: Shield },
  admin: { label: "Admin", bgClass: "bg-blue-500/10", textClass: "text-blue-500", icon: UserCog },
  teacher: { label: "O'qituvchi", bgClass: "bg-green-500/10", textClass: "text-green-500", icon: BookOpen },
  student: { label: "Talaba", bgClass: "bg-violet-500/10", textClass: "text-violet-500", icon: GraduationCap },
};

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form states
  const [newEmail, setNewEmail] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<string>("teacher");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const supabase = createClient();

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("app_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) {
        const rows = data as unknown as Record<string, unknown>[];
        setUsers(
          rows.map((r) => ({
            id: r.id as string,
            email: r.email as string,
            full_name: (r.full_name as string) || "",
            role: (r.role as UserRole) || "student",
            department_id: r.department_id as string | undefined,
            telegram_chat_id: r.telegram_chat_id as string | undefined,
            created_at: r.created_at as string,
          }))
        );
      }
    } catch {
      // Supabase ulanmagan bo'lishi mumkin
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    if (newPassword.length < 6) {
      setFormError("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      setFormLoading(false);
      return;
    }

    try {
      // Supabase Auth orqali yangi foydalanuvchi yaratish
      // Admin tomonidan yaratilgani uchun email tasdiqlash kerak emas
      const { error: signUpError } = await supabase.auth.signUp({
        email: newEmail,
        password: newPassword,
        options: {
          data: {
            full_name: newFullName,
            role: newRole,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          setFormError("Bu email allaqachon ro'yxatdan o'tgan");
        } else {
          setFormError(signUpError.message);
        }
        setFormLoading(false);
        return;
      }

      // Modal yopish va ro'yxatni yangilash
      setShowModal(false);
      resetForm();
      setSuccessMsg(`${newFullName} muvaffaqiyatli qo'shildi!`);
      setTimeout(() => setSuccessMsg(""), 4000);

      // Biroz kutib ro'yxatni yangilash (trigger ishlashi uchun)
      setTimeout(() => fetchUsers(), 1000);
    } catch {
      setFormError("Foydalanuvchi yaratishda xatolik yuz berdi");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeleteUser(userId: string, userName: string) {
    if (!confirm(`"${userName}" ni o'chirishga ishonchingiz komilmi?`)) return;

    try {
      const { error } = await supabase
        .from("app_users")
        .delete()
        .eq("id", userId);
      if (error) throw error;
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setSuccessMsg("Foydalanuvchi o'chirildi");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setError("O'chirishda xatolik yuz berdi");
      setTimeout(() => setError(""), 3000);
    }
  }

  function resetForm() {
    setNewEmail("");
    setNewFullName("");
    setNewPassword("");
    setNewRole("teacher");
    setFormError("");
  }

  async function handleBulkImport(
    usersToCreate: { full_name: string; email: string; password: string; role: string }[]
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const u of usersToCreate) {
      try {
        const { error: signUpError } = await supabase.auth.signUp({
          email: u.email,
          password: u.password,
          options: {
            data: {
              full_name: u.full_name,
              role: u.role,
            },
          },
        });

        if (signUpError) {
          failed++;
          if (signUpError.message.includes("already registered")) {
            errors.push(`${u.email} — allaqachon ro'yxatdan o'tgan`);
          } else {
            errors.push(`${u.email} — ${signUpError.message}`);
          }
        } else {
          success++;
        }
      } catch {
        failed++;
        errors.push(`${u.email} — kutilmagan xatolik`);
      }
    }

    // Ro'yxatni yangilash
    setTimeout(() => fetchUsers(), 1500);

    return { success, failed, errors };
  }

  // Filtrlangan foydalanuvchilar
  const filtered = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Statistika
  const stats = {
    total: users.length,
    admins: users.filter((u) =>
      ["super_admin", "admin"].includes(u.role)
    ).length,
    teachers: users.filter((u) => u.role === "teacher").length,
    students: users.filter((u) => u.role === "student").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Foydalanuvchilar</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Tizim foydalanuvchilarini boshqarish
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowBulkModal(true)}>
            <UsersRound className="w-4 h-4" />
            <span className="hidden sm:inline">Ommaviy yuklash</span>
          </Button>
          <Button onClick={() => setShowModal(true)}>
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Yangi foydalanuvchi</span>
          </Button>
        </div>
      </div>

      {/* Xabarlar */}
      {successMsg && (
        <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Statistika */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GlassCard className="p-4 text-center">
          <Users className="w-5 h-5 mx-auto mb-1 text-[var(--muted)]" />
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-xs text-[var(--muted)]">Jami</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <Shield className="w-5 h-5 mx-auto mb-1 text-blue-500" />
          <div className="text-2xl font-bold">{stats.admins}</div>
          <div className="text-xs text-[var(--muted)]">Adminlar</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <BookOpen className="w-5 h-5 mx-auto mb-1 text-green-500" />
          <div className="text-2xl font-bold">{stats.teachers}</div>
          <div className="text-xs text-[var(--muted)]">O&apos;qituvchilar</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <GraduationCap className="w-5 h-5 mx-auto mb-1 text-violet-500" />
          <div className="text-2xl font-bold">{stats.students}</div>
          <div className="text-xs text-[var(--muted)]">Talabalar</div>
        </GlassCard>
      </div>

      {/* Qidirish va Filtr */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Ism yoki email bo'yicha qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-[10px] bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--foreground)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:outline-none"
            />
          </div>
          <Select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            options={[
              { value: "all", label: "Barcha rollar" },
              { value: "super_admin", label: "Super Admin" },
              { value: "admin", label: "Admin" },
              { value: "teacher", label: "O'qituvchi" },
              { value: "student", label: "Talaba" },
            ]}
          />
        </div>
      </GlassCard>

      {/* Foydalanuvchilar ro'yxati */}
      <GlassCard className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[var(--muted)]">
            Yuklanmoqda...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-[var(--muted)]" />
            <p className="text-[var(--muted)]">
              {users.length === 0
                ? "Hali foydalanuvchilar yo'q. Supabase da SQL migratsiyalarni bajaring."
                : "Qidiruvga mos foydalanuvchi topilmadi"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {filtered.map((user) => {
              const config = ROLE_CONFIG[user.role] || ROLE_CONFIG.student;
              const Icon = config.icon;

              return (
                <div
                  key={user.id}
                  className="flex items-center gap-4 p-4 hover:bg-[var(--surface-secondary)] transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.bgClass}`}
                  >
                    <Icon
                      className={`w-5 h-5 ${config.textClass}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">
                      {user.full_name || "Nomi ko'rsatilmagan"}
                    </div>
                    <div className="text-sm text-[var(--muted)] truncate">
                      {user.email}
                    </div>
                  </div>
                  <Badge
                    variant={
                      user.role === "super_admin"
                        ? "danger"
                        : user.role === "admin"
                        ? "accent"
                        : user.role === "teacher"
                        ? "success"
                        : "default"
                    }
                  >
                    {config.label}
                  </Badge>
                  <div className="text-xs text-[var(--muted)] hidden md:block w-24 text-right">
                    {new Date(user.created_at).toLocaleDateString("uz-UZ")}
                  </div>
                  {user.role !== "super_admin" && (
                    <button
                      onClick={() =>
                        handleDeleteUser(user.id, user.full_name || user.email)
                      }
                      className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--muted)] hover:text-red-500 transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Ommaviy yuklash modal */}
      <GlassModal
        open={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Ommaviy foydalanuvchi yuklash"
        size="lg"
      >
        <BulkUserImport
          onImport={handleBulkImport}
          onClose={() => {
            setShowBulkModal(false);
            setSuccessMsg("Foydalanuvchilar muvaffaqiyatli import qilindi!");
            setTimeout(() => setSuccessMsg(""), 4000);
          }}
        />
      </GlassModal>

      {/* Yangi foydalanuvchi modal */}
      <GlassModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title="Yangi foydalanuvchi qo'shish"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="To'liq ism"
            type="text"
            placeholder="Familiya Ism"
            value={newFullName}
            onChange={(e) => setNewFullName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="email@example.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />
          <Input
            label="Parol"
            type="password"
            placeholder="Kamida 6 ta belgi"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Select
            label="Rol"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            options={[
              { value: "teacher", label: "O'qituvchi" },
              { value: "admin", label: "Admin (bo'lim boshlig'i)" },
              { value: "student", label: "Talaba" },
            ]}
          />

          {formError && (
            <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm">
              {formError}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="flex-1"
            >
              Bekor qilish
            </Button>
            <Button type="submit" className="flex-1" disabled={formLoading}>
              {formLoading ? "Yaratilmoqda..." : "Yaratish"}
            </Button>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
