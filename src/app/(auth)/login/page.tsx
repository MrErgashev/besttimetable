"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Shield, UserCog, GraduationCap, BookOpen } from "lucide-react";
import { MeshBackground } from "@/components/ui/MeshBackground";

const SHOW_TEST_ACCOUNTS_KEY = "showTestAccounts";

const TEST_ACCOUNTS = [
  {
    role: "Super Admin",
    email: "superadmin@timetable.uz",
    password: "Test1234!",
    icon: Shield,
    color: "text-red-500",
    bg: "bg-red-500/10",
    desc: "Tizimni to'liq boshqaradi",
  },
  {
    role: "Admin",
    email: "admin@timetable.uz",
    password: "Test1234!",
    icon: UserCog,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    desc: "Bo'lim jadvalini boshqaradi",
  },
  {
    role: "O'qituvchi",
    email: "teacher@timetable.uz",
    password: "Test1234!",
    icon: BookOpen,
    color: "text-green-500",
    bg: "bg-green-500/10",
    desc: "O'z jadvalini ko'radi",
  },
  {
    role: "Talaba",
    email: "student@timetable.uz",
    password: "Test1234!",
    icon: GraduationCap,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    desc: "Faqat jadval ko'radi",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTestAccounts, setShowTestAccounts] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(SHOW_TEST_ACCOUNTS_KEY);
    // Default: true (ko'rsatish), faqat aniq "false" bo'lsa yashirish
    setShowTestAccounts(stored !== "false");
  }, []);

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
    <div className="bg-[var(--background)] min-h-screen flex flex-col items-center justify-center p-4 relative">
      <MeshBackground />

      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[400px] relative z-10 flex flex-col items-center">
        {/* Logo va sarlavha */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/oriental-logo.png"
              alt="Oriental Universiteti"
              width={160}
              height={160}
              className="drop-shadow-md"
              priority
            />
          </div>
          <h1 className="text-xl font-semibold text-[var(--foreground)]">
            Dars jadvali boshqaruv tizimi
          </h1>
        </div>

        {/* Login karta */}
        <div className="w-full apple-card rounded-[var(--radius-xl)] p-6 md:p-8">
          <h2 className="text-lg font-semibold text-center mb-6">
            Tizimga kirish
          </h2>

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
              <div className="p-3 rounded-[var(--radius)] bg-[var(--color-danger)]/12 backdrop-blur-sm border border-[var(--color-danger)]/20 text-[var(--color-danger)] text-sm text-center">
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

          <p className="mt-5 text-center text-[13px] text-[var(--muted)] leading-relaxed">
            Dars jadvalingizni oson rejalashtiring,
            <br />
            vaqtingizni tejang
          </p>
        </div>

        {/* Test accounts — shartli ko'rsatish */}
        {mounted && showTestAccounts && (
          <div className="w-full apple-card rounded-[var(--radius-xl)] p-5 mt-4 animate-[slide-up_0.4s_var(--spring-smooth)_both]">
            <h3 className="text-sm font-semibold mb-3 text-[var(--muted)]">
              Test hisoblar
            </h3>

            <div className="space-y-2">
              {TEST_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillCredentials(acc.email, acc.password)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-[var(--radius)]
                    bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur-light)] hover:bg-[var(--glass-bg-heavy)] border border-[var(--glass-border-subtle)] transition-all duration-300 [transition-timing-function:var(--spring-smooth)] text-left group"
                >
                  <div
                    className={`w-8 h-8 rounded-lg ${acc.bg} flex items-center justify-center shrink-0`}
                  >
                    <acc.icon className={`w-4 h-4 ${acc.color}`} />
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

            <div className="mt-3 p-2 rounded-[var(--radius-sm)] bg-[var(--color-warning)]/12 backdrop-blur-sm border border-[var(--color-warning)]/20 text-[var(--color-warning)] text-xs text-center">
              <strong>Parol:</strong> Test1234! (barchasi uchun)
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-[var(--muted-light)] mt-6">
          Oriental Universiteti Dars jadvali boshqaruv tizimi &copy; 2026
        </p>
      </div>
    </div>
  );
}
