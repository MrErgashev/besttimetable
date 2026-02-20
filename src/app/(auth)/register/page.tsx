"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ShieldAlert } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
      <div className="fixed top-4 right-4" style={{ paddingTop: "var(--safe-area-top)" }}>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm animate-[scale-in_0.3s_cubic-bezier(0.32,0.72,0,1)]">
        <div className="text-center mb-8">
          <h1 className="text-[32px] font-bold text-[var(--foreground)] tracking-tight">
            BestTimetable
          </h1>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[20px] p-8 text-center shadow-[var(--shadow-xl)]">
          <div className="w-16 h-16 rounded-[16px] bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-amber-500" />
          </div>

          <h2 className="text-xl font-semibold mb-3">
            Ro&apos;yxatdan o&apos;tish cheklangan
          </h2>

          <p className="text-sm text-[var(--muted)] mb-6 leading-relaxed">
            Bu tizim universitetning dars jadvali uchun mo&apos;ljallangan.
            Yangi foydalanuvchilarni faqat <strong>administrator</strong> yarata
            oladi.
          </p>

          <div className="space-y-3 text-left mb-6">
            <div className="p-3 rounded-[12px] bg-[var(--surface-hover)] border border-[var(--border)] text-sm">
              <span className="font-medium">O&apos;qituvchi</span>
              <span className="text-[var(--muted)]">
                {" "}
                — bo&apos;lim adminingizga murojaat qiling
              </span>
            </div>
            <div className="p-3 rounded-[12px] bg-[var(--surface-hover)] border border-[var(--border)] text-sm">
              <span className="font-medium">Talaba</span>
              <span className="text-[var(--muted)]">
                {" "}
                — jadval umumiy sahifada ko&apos;rinadi
              </span>
            </div>
          </div>

          <Button onClick={() => router.push("/login")} className="w-full">
            Kirish sahifasiga qaytish
          </Button>
        </div>

        <p className="text-center text-xs text-[var(--muted-light)] mt-6">
          BestTimetable &copy; 2026
        </p>
      </div>
    </div>
  );
}
