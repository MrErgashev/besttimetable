import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { MeshBackground } from "@/components/ui/MeshBackground";
import { SupabaseDataProvider } from "@/components/providers/SupabaseDataProvider";

// Build vaqtida Supabase env yo'q — statik prerender o'rniga dinamik render
export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={[
        "bg-[var(--background)]",
        // Desktop: oddiy body scroll
        "md:min-h-screen",
        // Mobile: inner-scroll pattern — dvh flex container
        // Browser toolbar tab bar'ni yashira olmaydi
        "max-md:h-[100dvh] max-md:flex max-md:flex-col max-md:overflow-hidden",
      ].join(" ")}
    >
      <MeshBackground />
      <Sidebar />
      <Topbar />
      <MobileHeader />

      <main
        className={[
          "relative z-10 lg:ml-[var(--sidebar-width)] px-4 sm:px-6",
          // Mobile: flex-1 + ichki scroll (overscroll-contain = bounce yo'q)
          "max-md:flex-1 max-md:overflow-y-auto max-md:overscroll-contain",
          // Desktop: oddiy padding
          "md:pb-8",
        ].join(" ")}
        style={{
          paddingTop: "calc(var(--header-height) + 16px)",
          // Desktop uchun: tab bar height padding (mobile'da kerak emas — tab bar flex ichida)
        }}
      >
        {/* Mobile uchun pastki padding — content tab bar ostiga tushmasligi uchun */}
        <div className="max-md:pb-4 md:pt-0">
          <SupabaseDataProvider>
            <RoleGuard>{children}</RoleGuard>
          </SupabaseDataProvider>
        </div>
      </main>

      <BottomTabBar />
    </div>
  );
}
