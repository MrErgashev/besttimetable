"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Shield, UserCog, GraduationCap, BookOpen } from "lucide-react";

const TEST_ACCOUNTS = [
  {
    role: "Super Admin",
    email: "superadmin@timetable.uz",
    password: "Test1234!",
    icon: Shield,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-900/20",
    desc: "Tizimni to'liq boshqaradi",
  },
  {
    role: "Admin",
    email: "admin@timetable.uz",
    password: "Test1234!",
    icon: UserCog,
    color: "text-[var(--color-accent)]",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    desc: "Bo'lim jadvalini boshqaradi",
  },
  {
    role: "O'qituvchi",
    email: "teacher@timetable.uz",
    password: "Test1234!",
    icon: BookOpen,
    color: "text-[var(--color-success)]",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    desc: "O'z jadvalini ko'radi",
  },
  {
    role: "Talaba",
    email: "student@timetable.uz",
    password: "Test1234!",
    icon: GraduationCap,
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-900/20",
    desc: "Faqat jadval ko'radi",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes("Invalid login")) {
          setError("Email yoki parol noto'g'ri");
        } else if (authError.message.includes("Email not confirmed")) {
          setError("Email tasdiqlanmagan. Pochtangizni tekshiring.");
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Tizimga kirishda xatolik yuz berdi");
      setLoading(false);
    }
  }

  function fillCredentials(email: string, password: string) {
    setEmail(email);
    setPassword(password);
    setError("");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
      <div className="fixed top-4 right-4" style={{ paddingTop: "var(--safe-area-top)" }}>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg animate-[scale-in_0.3s_cubic-bezier(0.32,0.72,0,1)]">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-[32px] font-bold text-[var(--foreground)] tracking-tight">
            BestTimetable
          </h1>
          <p className="text-sm text-[var(--muted)] mt-2">
            Dars jadvali boshqaruv tizimi
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Login form */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[20px] p-6 shadow-[var(--shadow-xl)]">
            <h2 className="text-xl font-semibold mb-6">Tizimga kirish</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Parol"
                type="password"
                placeholder="Parolingiz"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && (
                <div className="p-3 rounded-[12px] bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? "Kirilyapti..." : "Kirish"}
              </Button>
            </form>

            <div className="mt-4 text-center text-xs text-[var(--muted)]">
              Foydalanuvchilar admin tomonidan yaratiladi
            </div>
          </div>

          {/* Test accounts */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[20px] p-6 shadow-[var(--shadow-xl)]">
            <h2 className="text-sm font-semibold mb-4 text-[var(--muted)]">
              Test hisoblar
            </h2>

            <div className="space-y-2.5">
              {TEST_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillCredentials(acc.email, acc.password)}
                  className="w-full flex items-center gap-3 p-3 rounded-[12px]
                    bg-[var(--surface-hover)] hover:bg-[var(--surface-hover)] transition-all text-left group active:scale-[0.98]"
                >
                  <div
                    className={`w-9 h-9 rounded-[10px] ${acc.bg} flex items-center justify-center shrink-0`}
                  >
                    <acc.icon className={`w-4.5 h-4.5 ${acc.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
                      {acc.role}
                    </div>
                    <div className="text-xs text-[var(--muted)] truncate">
                      {acc.desc}
                    </div>
                  </div>
                  <div className="text-xs text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    Kirish
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 p-2.5 rounded-[10px] bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs">
              <strong>Parol:</strong> Test1234! (barchasi uchun)
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-[var(--muted-light)] mt-6">
          BestTimetable &copy; 2026
        </p>
      </div>
    </div>
  );
}
