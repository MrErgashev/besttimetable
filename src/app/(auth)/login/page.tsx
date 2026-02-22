"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MeshBackground } from "@/components/ui/MeshBackground";
import {
  Shield,
  UserCog,
  GraduationCap,
  BookOpen,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ChevronDown,
  Calendar,
  Users,
  Building2,
  X,
  Sparkles,
  CheckCircle2,
  Clock,
  BarChart3,
  Zap,
} from "lucide-react";

const SHOW_TEST_ACCOUNTS_KEY = "showTestAccounts";

const TEST_ACCOUNTS = [
  {
    role: "Super Admin",
    login: "superadmin@timetable.uz",
    password: "Test1234!",
    icon: Shield,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    desc: "Tizimni to\u2018liq boshqaradi",
  },
  {
    role: "Admin",
    login: "admin@timetable.uz",
    password: "Test1234!",
    icon: UserCog,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    desc: "Bo\u2018lim jadvalini boshqaradi",
  },
  {
    role: "O\u2018qituvchi",
    login: "teacher@timetable.uz",
    password: "Test1234!",
    icon: BookOpen,
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    desc: "O\u2018z jadvalini ko\u2018radi",
  },
  {
    role: "Talaba",
    login: "student@timetable.uz",
    password: "Test1234!",
    icon: GraduationCap,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    desc: "Faqat jadval ko\u2018radi",
  },
];

const STATS = [
  { icon: Calendar, label: "Darslar", value: 500 },
  { icon: Users, label: "O\u2018qituvchilar", value: 50 },
  { icon: Building2, label: "Xonalar", value: 30 },
];

const FEATURES = [
  { icon: Zap, text: "Avtomatik jadval generatsiyasi" },
  { icon: Clock, text: "Real-time o\u2018zgarishlar" },
  { icon: BarChart3, text: "Statistika va hisobotlar" },
  { icon: CheckCircle2, text: "Ziddiyatlarni aniqlash" },
];

/** Login yoki email ni Supabase email formatiga aylantirish */
function toAuthEmail(input: string): string {
  return input.includes("@") ? input : `${input}@besttimetable.uz`;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Xayrli tong";
  if (hour >= 12 && hour < 18) return "Xayrli kun";
  return "Xayrli kech";
}

function AnimatedCounter({ value, delay = 600 }: { value: number; delay?: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    const duration = 1500;
    const startTime = performance.now();
    let rafId: number;

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * value));

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    }

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [started, value]);

  return <>{count}+</>;
}

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showTestAccounts, setShowTestAccounts] = useState(false);
  const [testAccountsExpanded, setTestAccountsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  const greeting = useMemo(() => getGreeting(), []);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(SHOW_TEST_ACCOUNTS_KEY);
    setShowTestAccounts(stored !== "false");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: toAuthEmail(login),
        password,
      });

      if (authError) {
        if (authError.message.includes("Invalid login")) {
          setError("Login yoki parol noto\u2018g\u2018ri");
        } else if (authError.message.includes("Email not confirmed")) {
          setError("Hisob tasdiqlanmagan. Administratorga murojaat qiling.");
        } else {
          setError(authError.message);
        }
        triggerShake();
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Tizimga kirishda xatolik yuz berdi");
      triggerShake();
      setLoading(false);
    }
  }

  function triggerShake() {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 600);
  }

  function fillCredentials(loginVal: string, pwd: string) {
    setLogin(loginVal);
    setPassword(pwd);
    setError("");
  }

  return (
    <div className="bg-[var(--background)] min-h-screen flex relative overflow-hidden">
      <MeshBackground />

      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* ── LEFT PANEL: Branding (Desktop only) ────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col items-center justify-center p-10 xl:p-14">
        {/* Subtle accent gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/6 via-transparent to-[var(--color-accent)]/3 dark:from-[var(--color-accent)]/12 dark:via-transparent dark:to-[var(--color-accent)]/6" />

        <div className="relative z-10 max-w-lg">
          {/* Logo */}
          <div
            className="mb-6 opacity-0"
            style={{ animation: "float-up 0.8s var(--spring-smooth) 0.1s forwards" }}
          >
            <Image
              src="/images/oriental-logo.png"
              alt="Oriental Universiteti"
              width={80}
              height={80}
              priority
            />
          </div>

          {/* Title */}
          <div
            className="mb-4 opacity-0"
            style={{ animation: "float-up 0.8s var(--spring-smooth) 0.2s forwards" }}
          >
            <h1 className="text-3xl xl:text-4xl font-bold tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-light)] bg-clip-text text-transparent">
                Dars jadvali
              </span>
              <br />
              <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-light)] bg-clip-text text-transparent">
                boshqaruv tizimi
              </span>
            </h1>
          </div>

          {/* Slogan */}
          <p
            className="text-base text-[var(--muted)] leading-relaxed mb-8 max-w-md opacity-0"
            style={{ animation: "float-up 0.8s var(--spring-smooth) 0.35s forwards" }}
          >
            Dars jadvalingizni oson rejalashtiring, vaqtingizni tejang.
            Zamonaviy va qulay boshqaruv platformasi.
          </p>

          {/* Feature list */}
          <div
            className="mb-8 space-y-3 opacity-0"
            style={{ animation: "float-up 0.8s var(--spring-smooth) 0.4s forwards" }}
          >
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0">
                  <feature.icon className="w-4 h-4 text-[var(--color-accent)]" />
                </div>
                <span className="text-sm text-[var(--foreground)]/80">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div
            className="flex gap-3 opacity-0"
            style={{ animation: "float-up 0.8s var(--spring-smooth) 0.5s forwards" }}
          >
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className="apple-card rounded-[var(--radius-lg)] p-4 flex-1 text-center"
              >
                <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--color-accent)]/10 flex items-center justify-center mx-auto mb-2.5">
                  <stat.icon className="w-[18px] h-[18px] text-[var(--color-accent)]" />
                </div>
                <div className="text-2xl font-bold text-[var(--foreground)]">
                  <AnimatedCounter value={stat.value} delay={800 + i * 200} />
                </div>
                <div className="text-xs text-[var(--muted)] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Login Form ────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative z-10">
        <div className="w-full max-w-[400px]">
          {/* Mobile branding (lg:hidden) */}
          <div className="lg:hidden text-center mb-8">
            <div
              className="flex justify-center mb-4 opacity-0"
              style={{ animation: "float-up 0.6s var(--spring-smooth) 0.1s forwards" }}
            >
              <Image
                src="/images/oriental-logo.png"
                alt="Oriental Universiteti"
                width={88}
                height={88}
                priority
              />
            </div>
            <h1
              className="text-2xl font-bold opacity-0"
              style={{ animation: "float-up 0.6s var(--spring-smooth) 0.2s forwards" }}
            >
              <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-light)] bg-clip-text text-transparent">
                Dars jadvali
              </span>{" "}
              <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-light)] bg-clip-text text-transparent">
                boshqaruv tizimi
              </span>
            </h1>
            <p
              className="text-sm text-[var(--muted)] mt-2 opacity-0"
              style={{ animation: "float-up 0.6s var(--spring-smooth) 0.25s forwards" }}
            >
              Zamonaviy jadval boshqaruv platformasi
            </p>
          </div>

          {/* Login card */}
          <div
            className="opacity-0"
            style={{ animation: "float-up 0.7s var(--spring-smooth) 0.3s forwards" }}
          >
            <div
              className={`apple-card rounded-[var(--radius-xl)] p-6 md:p-8 ${shakeError ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
            >
              {/* Greeting with decorative icon */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] flex items-center justify-center shadow-sm">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[var(--foreground)]">
                      {greeting}!
                    </h2>
                    <p className="text-[13px] text-[var(--muted)]">
                      Tizimga kirish
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Login input with label */}
                <div>
                  <label className="block text-[13px] font-medium text-[var(--muted)] mb-1.5">
                    Login
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--muted-light)] z-10 pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="Login yoki email kiriting"
                      aria-label="Login"
                      value={login}
                      onChange={(e) => setLogin(e.target.value)}
                      required
                      autoComplete="username"
                      className="pl-11"
                    />
                  </div>
                </div>

                {/* Password input with label */}
                <div>
                  <label className="block text-[13px] font-medium text-[var(--muted)] mb-1.5">
                    Parol
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--muted-light)] z-10 pointer-events-none" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Parolingizni kiriting"
                      aria-label="Parol"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="pl-11 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--glass-bg)] transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? "Parolni yashirish" : "Parolni ko\u2018rsatish"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-[18px] h-[18px] text-[var(--muted)]" />
                      ) : (
                        <Eye className="w-[18px] h-[18px] text-[var(--muted)]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember me + Forgot password row */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <div
                      className={`w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center transition-all duration-200 shrink-0 ${
                        rememberMe
                          ? "bg-[var(--color-accent)] border-[var(--color-accent)]"
                          : "border-[var(--border-strong)] bg-[var(--glass-bg)] backdrop-blur-sm"
                      }`}
                      onClick={() => setRememberMe(!rememberMe)}
                    >
                      <svg
                        className={`w-2.5 h-2.5 text-white transition-all duration-200 ${rememberMe ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
                        viewBox="0 0 10 10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1.5 5.5L4 8L8.5 2" />
                      </svg>
                    </div>
                    <span className="text-sm text-[var(--muted)]">Meni eslab qol</span>
                  </label>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2.5 p-3 rounded-[var(--radius)] bg-[var(--color-danger)]/10 backdrop-blur-sm border border-[var(--color-danger)]/20 animate-[float-up_0.3s_var(--spring-smooth)]">
                    <div className="w-5 h-5 rounded-full bg-[var(--color-danger)]/15 flex items-center justify-center shrink-0">
                      <span className="text-[11px] font-bold text-[var(--color-danger)]">!</span>
                    </div>
                    <p className="text-sm text-[var(--color-danger)] flex-1">{error}</p>
                    <button
                      type="button"
                      onClick={() => setError("")}
                      className="shrink-0 text-[var(--color-danger)]/50 hover:text-[var(--color-danger)] transition-colors"
                      aria-label="Xabarni yopish"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full group relative overflow-hidden"
                  size="lg"
                  disabled={loading}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Kirilyapti...
                      </>
                    ) : (
                      <>
                        Tizimga kirish
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                  {/* Shimmer effect on hover */}
                  {!loading && (
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                  )}
                </Button>
              </form>

              {/* Register link */}
              <div className="mt-5 text-center">
                <p className="text-sm text-[var(--muted)]">
                  Hisobingiz yo&apos;qmi?{" "}
                  <Link
                    href="/register"
                    className="text-[var(--color-accent)] font-medium hover:underline underline-offset-2 transition-colors"
                  >
                    Ro&apos;yxatdan o&apos;tish
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Divider with "yoki" */}
          {mounted && showTestAccounts && (
            <div
              className="flex items-center gap-3 my-4 opacity-0"
              style={{ animation: "float-up 0.6s var(--spring-smooth) 0.45s forwards" }}
            >
              <div className="flex-1 h-px bg-[var(--border)]" />
              <span className="text-xs text-[var(--muted-light)] font-medium uppercase tracking-wider">yoki</span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>
          )}

          {/* Test accounts — collapsible */}
          {mounted && showTestAccounts && (
            <div
              className="opacity-0"
              style={{ animation: "float-up 0.6s var(--spring-smooth) 0.5s forwards" }}
            >
              {/* Toggle button */}
              <button
                type="button"
                onClick={() => setTestAccountsExpanded(!testAccountsExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 apple-card rounded-[var(--radius-lg)] text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[var(--color-accent)]/10 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  </div>
                  <span className="font-medium">Test hisoblar</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 [transition-timing-function:var(--spring-smooth)] ${testAccountsExpanded ? "rotate-180" : ""}`}
                />
              </button>

              {/* Expandable content */}
              <div
                className={`overflow-hidden transition-all duration-[400ms] [transition-timing-function:var(--spring-smooth)] ${
                  testAccountsExpanded ? "max-h-[500px] opacity-100 mt-2" : "max-h-0 opacity-0"
                }`}
              >
                <div className="grid grid-cols-2 gap-2">
                  {TEST_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.login}
                      type="button"
                      onClick={() => fillCredentials(acc.login, acc.password)}
                      className={`apple-card rounded-[var(--radius-lg)] p-3 flex flex-col items-center gap-2 text-center hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 [transition-timing-function:var(--spring-smooth)] group border ${acc.border}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl ${acc.bg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
                      >
                        <acc.icon className={`w-5 h-5 ${acc.color}`} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[var(--foreground)]">{acc.role}</div>
                        <div className="text-[11px] text-[var(--muted)] mt-0.5 leading-tight">{acc.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-2 p-2.5 rounded-[var(--radius)] bg-[var(--color-warning)]/8 border border-[var(--color-warning)]/15 text-[var(--color-warning)] text-xs text-center flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3" />
                  <span><strong>Parol:</strong> Test1234!</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div
            className="mt-6 text-center opacity-0"
            style={{ animation: "float-up 0.6s var(--spring-smooth) 0.65s forwards" }}
          >
            <p className="text-xs text-[var(--muted-light)]">
              Oriental Universiteti &copy; 2026
            </p>
            <p className="text-[10px] text-[var(--muted-light)]/50 mt-1">
              v0.1.0 &middot; BestTimetable
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
