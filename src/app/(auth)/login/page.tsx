"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

/* ── Constants ─────────────────────────────────── */

const SHOW_TEST_ACCOUNTS_KEY = "showTestAccounts";

const TEST_ACCOUNTS = [
  {
    role: "Super Admin",
    login: "superadmin@timetable.uz",
    password: "Test1234!",
    icon: Shield,
    color: "text-red-500",
    bg: "bg-red-500/10",
    desc: "Tizimni to\u2018liq boshqaradi",
  },
  {
    role: "Admin",
    login: "admin@timetable.uz",
    password: "Test1234!",
    icon: UserCog,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    desc: "Bo\u2018lim jadvalini boshqaradi",
  },
  {
    role: "O\u2018qituvchi",
    login: "teacher@timetable.uz",
    password: "Test1234!",
    icon: BookOpen,
    color: "text-green-500",
    bg: "bg-green-500/10",
    desc: "O\u2018z jadvalini ko\u2018radi",
  },
  {
    role: "Talaba",
    login: "student@timetable.uz",
    password: "Test1234!",
    icon: GraduationCap,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    desc: "Faqat jadval ko\u2018radi",
  },
];

const FEATURES = [
  { icon: Calendar, label: "Dars jadvali" },
  { icon: Users, label: "O\u2018qituvchilar" },
  { icon: Building2, label: "Xonalar" },
];

/* ── Helpers ───────────────────────────────────── */

function toAuthEmail(input: string): string {
  return input.includes("@") ? input : `${input}@besttimetable.uz`;
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
      if (progress < 1) rafId = requestAnimationFrame(animate);
    }

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [started, value]);

  return <>{count}+</>;
}

/* ── Page ──────────────────────────────────────── */

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
    <div className="bg-[var(--background)] min-h-screen flex items-center justify-center relative overflow-hidden">
      <MeshBackground />

      {/* Premium gradient overlay — soft blue / cyan glow blobs */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 25% 35%, rgba(37,99,235,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 75% 65%, rgba(56,189,248,0.05) 0%, transparent 50%)",
        }}
      />

      {/* ── Main Content ─────────────────────────── */}
      <div className="relative z-10 w-full max-w-[1360px] mx-auto px-10 py-8 flex items-center gap-16">

        {/* ── LEFT PANEL ─────────────────────────── */}
        <div className="flex-[1.28] flex flex-col justify-center">
          {/* Logo */}
          <div
            className="mb-8 opacity-0"
            style={{ animation: "float-up 0.8s var(--spring-smooth) 0.1s forwards" }}
          >
            <Image
              src="/images/oriental-logo.png"
              alt="Oriental Universiteti"
              width={72}
              height={72}
              priority
            />
          </div>

          {/* Hero Title — 56px */}
          <h1
            className="text-[56px] font-extrabold tracking-tight max-w-[520px] mb-5 opacity-0"
            style={{
              lineHeight: 1.08,
              animation: "float-up 0.8s var(--spring-smooth) 0.2s forwards",
            }}
          >
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              Dars jadvali
            </span>
            <br />
            <span className="text-[var(--foreground)]">boshqaruv tizimi</span>
          </h1>

          {/* Subtitle — 20px */}
          <p
            className="text-[20px] font-normal max-w-[560px] text-[var(--muted)] mb-10 opacity-0"
            style={{
              lineHeight: 1.6,
              animation: "float-up 0.8s var(--spring-smooth) 0.35s forwards",
            }}
          >
            Dars jadvalingizni oson rejalashtiring, vaqtingizni tejang.
            Zamonaviy va qulay boshqaruv platformasi.
          </p>

          {/* Stat Cards */}
          <div
            className="flex gap-4 opacity-0"
            style={{ animation: "float-up 0.8s var(--spring-smooth) 0.5s forwards" }}
          >
            {FEATURES.map((feat) => (
              <div
                key={feat.label}
                className="apple-card rounded-[var(--radius-lg)] p-3 flex-1 text-center"
              >
                <feat.icon className="w-5 h-5 text-[var(--color-accent)] mx-auto mb-2" />
                <div className="text-sm font-medium text-[var(--foreground)]">
                  {feat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ────────────────────────── */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[520px]">
            {/* Login Card */}
            <div
              className="opacity-0"
              style={{ animation: "float-up 0.7s var(--spring-smooth) 0.3s forwards" }}
            >
              <div
                className={`rounded-[24px] overflow-hidden ${shakeError ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
                style={{
                  background: "var(--glass-bg-ultra)",
                  backdropFilter: "blur(var(--glass-blur-heavy))",
                  WebkitBackdropFilter: "blur(var(--glass-blur-heavy))",
                  border: "1px solid var(--glass-border)",
                  boxShadow:
                    "var(--shadow-xl), inset 0 1px 0 0 var(--glass-highlight), inset 0 -1px 2px 0 var(--glass-inner-shadow)",
                  minHeight: 540,
                }}
              >
                {/* Top accent gradient line */}
                <div
                  className="h-[3px] w-full"
                  style={{
                    background: "linear-gradient(to right, #2563EB, #3B82F6, #38BDF8)",
                  }}
                />

                {/* Card Body */}
                <div className="p-8">
                  {/* Header: title + action pill */}
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-[40px] font-bold text-[var(--foreground)] leading-tight">
                      Xush kelibsiz
                    </h2>

                    {/* Action pill */}
                    <div
                      className="flex items-center gap-1 rounded-full bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur-light)] border border-[var(--glass-border-subtle)] p-1"
                      style={{ boxShadow: "var(--shadow-sm)" }}
                    >
                      <ThemeToggle />
                    </div>
                  </div>

                  <p className="text-[18px] text-[var(--muted)] mb-8">
                    Tizimga kirish uchun ma&apos;lumotlaringizni kiriting
                  </p>

                  {/* ── Form ──────────────────────── */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email / Login field */}
                    <div>
                      <label
                        htmlFor="login-input"
                        className="block text-[14px] font-semibold text-slate-700 dark:text-slate-300 mb-2"
                      >
                        Email
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--muted-light)] z-10 pointer-events-none" />
                        <Input
                          id="login-input"
                          type="text"
                          placeholder="Loginingizni kiriting"
                          value={login}
                          onChange={(e) => setLogin(e.target.value)}
                          required
                          autoComplete="username"
                          className="pl-11 rounded-[14px] text-[16px]"
                          style={{ height: 52 }}
                        />
                      </div>
                    </div>

                    {/* Password field */}
                    <div>
                      <label
                        htmlFor="password-input"
                        className="block text-[14px] font-semibold text-slate-700 dark:text-slate-300 mb-2"
                      >
                        Parol
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--muted-light)] z-10 pointer-events-none" />
                        <Input
                          id="password-input"
                          type={showPassword ? "text" : "password"}
                          placeholder="Parolingizni kiriting"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete="current-password"
                          className="pl-11 pr-12 rounded-[14px] text-[16px]"
                          style={{ height: 52 }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--glass-bg)] transition-colors duration-200"
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

                    {/* Remember me + forgot password */}
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <div
                          className={`w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center transition-all duration-200 shrink-0 ${
                            rememberMe
                              ? "bg-blue-600 border-blue-600"
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

                      <button
                        type="button"
                        className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 font-medium"
                      >
                        Parolni unutdingizmi?
                      </button>
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="flex items-center gap-2.5 p-3 rounded-[14px] bg-[var(--color-danger)]/10 backdrop-blur-sm border border-[var(--color-danger)]/20 animate-[float-up_0.3s_var(--spring-smooth)]">
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

                    {/* Submit */}
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full rounded-[14px] text-base font-bold group relative overflow-hidden"
                      style={{
                        height: 54,
                        background: "linear-gradient(to right, #2563EB, #3B82F6)",
                        border: "none",
                      }}
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
                            Kirish
                            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                          </>
                        )}
                      </span>
                      {/* Shimmer on hover */}
                      {!loading && (
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </div>

            {/* ── Test Accounts (collapsible) ────── */}
            {mounted && showTestAccounts && (
              <div
                className="mt-4 opacity-0"
                style={{ animation: "float-up 0.6s var(--spring-smooth) 0.5s forwards" }}
              >
                <button
                  type="button"
                  onClick={() => setTestAccountsExpanded(!testAccountsExpanded)}
                  className="w-full flex items-center justify-between px-5 py-3 rounded-[16px] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border border-[var(--glass-border-subtle)] text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors duration-200"
                >
                  <span className="font-medium">Test hisoblar</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 [transition-timing-function:var(--spring-smooth)] ${testAccountsExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-[400ms] [transition-timing-function:var(--spring-smooth)] ${
                    testAccountsExpanded ? "max-h-[500px] opacity-100 mt-2" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="rounded-[16px] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border border-[var(--glass-border-subtle)] p-4 space-y-2">
                    {TEST_ACCOUNTS.map((acc) => (
                      <button
                        key={acc.login}
                        type="button"
                        onClick={() => fillCredentials(acc.login, acc.password)}
                        className="w-full flex items-center gap-3 p-2 rounded-[var(--radius)] bg-[var(--surface-secondary)]/40 hover:bg-[var(--surface-secondary)]/70 border border-[var(--glass-border-subtle)] transition-all duration-200 text-left group"
                      >
                        <div className={`w-8 h-8 rounded-lg ${acc.bg} flex items-center justify-center shrink-0`}>
                          <acc.icon className={`w-4 h-4 ${acc.color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">{acc.role}</div>
                          <div className="text-xs text-[var(--muted)] truncate">{acc.desc}</div>
                        </div>
                        <div className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          Kirish
                        </div>
                      </button>
                    ))}
                    <div className="p-2 rounded-[var(--radius-sm)] bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/15 text-[var(--color-warning)] text-xs text-center">
                      <strong>Parol:</strong> Test1234! (barchasi uchun)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <p
              className="mt-6 text-center text-[14px] text-[var(--muted-light)] opacity-0"
              style={{ animation: "float-up 0.6s var(--spring-smooth) 0.65s forwards" }}
            >
              Oriental Universiteti &copy; 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
