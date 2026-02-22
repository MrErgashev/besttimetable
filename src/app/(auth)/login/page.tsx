"use client";

import { useState, useEffect, Fragment } from "react";
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
  Sun,
  CloudSun,
  Moon,
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

const STATS = [
  { icon: Calendar, label: "Darslar", value: 500 },
  { icon: Users, label: "O\u2018qituvchilar", value: 50 },
  { icon: Building2, label: "Xonalar", value: 30 },
];

/** Vaqtga asoslangan salomlash */
function getGreeting(): { text: string; icon: typeof Sun } {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return { text: "Xayrli tong", icon: Sun };
  if (hour >= 12 && hour < 18) return { text: "Xayrli kun", icon: CloudSun };
  return { text: "Xayrli kech", icon: Moon };
}

/** Mini jadval preview uchun katakchalar */
const MINI_GRID_CELLS = [
  { day: 0, slot: 0, color: "bg-[var(--color-accent)]/20", label: "Mat" },
  { day: 1, slot: 1, color: "bg-[var(--color-success)]/20", label: "Fiz" },
  { day: 0, slot: 2, color: "bg-[var(--color-warning)]/20", label: "Ing" },
  { day: 2, slot: 0, color: "bg-[var(--color-accent)]/20", label: "Kim" },
  { day: 3, slot: 1, color: "bg-[var(--color-success)]/20", label: "Bio" },
  { day: 2, slot: 2, color: "bg-[var(--color-warning)]/20", label: "Tar" },
  { day: 1, slot: 0, color: "bg-[var(--color-accent-light)]/15", label: "Adab" },
  { day: 3, slot: 2, color: "bg-[var(--color-accent)]/15", label: "Rus" },
];

const MINI_DAYS = ["Du", "Se", "Ch", "Pa"];
const MINI_SLOTS = ["1-p", "2-p", "3-p"];

/** Login yoki email ni Supabase email formatiga aylantirish */
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
            className="text-base text-[var(--muted)]/70 leading-relaxed mb-8 max-w-md opacity-0"
            style={{ animation: "float-up 0.8s var(--spring-smooth) 0.35s forwards" }}
          >
            Dars jadvalingizni oson rejalashtiring, vaqtingizni tejang.
            Zamonaviy va qulay boshqaruv platformasi.
          </p>

          {/* Mini Jadval Preview */}
          <div
            className="mb-6 opacity-0"
            style={{ animation: "float-up 0.8s var(--spring-smooth) 0.45s forwards" }}
          >
            <div className="apple-card rounded-[var(--radius-lg)] p-4">
              <div className="grid grid-cols-5 gap-1.5">
                {/* Header row */}
                <div className="text-[10px] text-[var(--muted-light)] font-medium text-center py-1" />
                {MINI_DAYS.map((day) => (
                  <div key={day} className="text-[10px] text-[var(--muted)] font-semibold text-center py-1">
                    {day}
                  </div>
                ))}

                {/* Grid rows */}
                {MINI_SLOTS.map((slot, slotIdx) => (
                  <Fragment key={slot}>
                    <div className="text-[10px] text-[var(--muted-light)] font-medium flex items-center justify-center">
                      {slot}
                    </div>
                    {MINI_DAYS.map((_, dayIdx) => {
                      const cell = MINI_GRID_CELLS.find(
                        (c) => c.day === dayIdx && c.slot === slotIdx
                      );
                      return (
                        <div
                          key={`${dayIdx}-${slotIdx}`}
                          className="opacity-0"
                          style={{
                            animation: `stagger-fade 0.4s var(--spring-smooth) ${0.6 + (slotIdx * 4 + dayIdx) * 0.08}s forwards`,
                          }}
                        >
                          {cell ? (
                            <div
                              className={`${cell.color} rounded-[var(--radius-sm)] p-1.5 text-center backdrop-blur-sm border border-[var(--glass-border-subtle)]`}
                            >
                              <span className="text-[10px] font-semibold text-[var(--foreground)]">
                                {cell.label}
                              </span>
                            </div>
                          ) : (
                            <div className="rounded-[var(--radius-sm)] p-1.5 bg-[var(--surface-secondary)]/40 min-h-[28px]" />
                          )}
                        </div>
                      );
                    })}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div
            className="flex gap-3 opacity-0"
            style={{ animation: "float-up 0.8s var(--spring-smooth) 0.55s forwards" }}
          >
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className="apple-card rounded-[var(--radius-lg)] p-3 flex-1 text-center"
              >
                <stat.icon className="w-5 h-5 text-[var(--color-accent)] mx-auto mb-2" />
                <div className="text-xl font-bold text-[var(--foreground)]">
                  <AnimatedCounter value={stat.value} delay={1000 + i * 200} />
                </div>
                <div className="text-xs text-[var(--muted)] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Login Form ────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative z-10">
        <div className="w-full max-w-sm">
          {/* Mobile branding (lg:hidden) */}
          <div className="lg:hidden text-center mb-8">
            <div
              className="flex justify-center mb-4 opacity-0"
              style={{ animation: "float-up 0.6s var(--spring-smooth) 0.1s forwards" }}
            >
              <Image
                src="/images/oriental-logo.png"
                alt="Oriental Universiteti"
                width={100}
                height={100}
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
              <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-light)] bg-clip-text text-transparent">boshqaruv tizimi</span>
            </h1>
          </div>

          {/* Login card */}
          <div
            className="opacity-0"
            style={{ animation: "float-up 0.7s var(--spring-smooth) 0.3s forwards" }}
          >
            <div
              className={`apple-card rounded-[var(--radius-xl)] p-6 md:p-8 ${shakeError ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
            >
              <div className="mb-6">
                {(() => {
                  const greeting = getGreeting();
                  const GreetingIcon = greeting.icon;
                  return (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[var(--radius)] bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0">
                        <GreetingIcon className="w-5 h-5 text-[var(--color-accent)]" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-[var(--foreground)]">
                          {greeting.text}
                        </h2>
                        <p className="text-sm text-[var(--muted)] mt-0.5">
                          Tizimga kirish uchun ma&apos;lumotlaringizni kiriting
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Login input with icon */}
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--muted-light)] z-10 pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Login yoki email"
                    aria-label="Login"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    required
                    autoComplete="username"
                    className="pl-11"
                  />
                </div>

                {/* Password input with icon and toggle */}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--muted-light)] z-10 pointer-events-none" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Parolingiz"
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

                {/* Remember me */}
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
                        Kirish
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
            </div>
          </div>

          {/* Test accounts — collapsible */}
          {mounted && showTestAccounts && (
            <div
              className="mt-3 opacity-0"
              style={{ animation: "float-up 0.6s var(--spring-smooth) 0.5s forwards" }}
            >
              {/* Toggle button */}
              <button
                type="button"
                onClick={() => setTestAccountsExpanded(!testAccountsExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 apple-card rounded-[var(--radius-lg)] text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <span className="font-medium">Test hisoblar</span>
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
                <div className="apple-card rounded-[var(--radius-lg)] p-4 space-y-2">
                  {TEST_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.login}
                      type="button"
                      onClick={() => fillCredentials(acc.login, acc.password)}
                      className="w-full flex items-center gap-3 p-2 rounded-[var(--radius)] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur-light)] hover:bg-[var(--glass-bg-heavy)] border border-[var(--glass-border-subtle)] transition-all duration-300 [transition-timing-function:var(--spring-smooth)] text-left group"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg ${acc.bg} flex items-center justify-center shrink-0`}
                      >
                        <acc.icon className={`w-4 h-4 ${acc.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{acc.role}</div>
                        <div className="text-xs text-[var(--muted)] truncate">{acc.desc}</div>
                      </div>
                      <div className="text-xs text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
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
            className="mt-5 text-center text-xs text-[var(--muted-light)] opacity-0"
            style={{ animation: "float-up 0.6s var(--spring-smooth) 0.65s forwards" }}
          >
            Oriental Universiteti &copy; 2026
          </p>
        </div>
      </div>
    </div>
  );
}
