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
    <div className="min-h-screen bg-[var(--background)]">
      <MeshBackground />
      <Sidebar />
      <Topbar />
      <MobileHeader />

      <main
        className="relative z-10 lg:ml-[var(--sidebar-width)] px-4 sm:px-6 pb-8"
        style={{
          paddingTop: "calc(var(--header-height) + 16px)",
          paddingBottom: "calc(var(--tab-bar-height) + var(--safe-area-bottom) + 24px)",
        }}
      >
        <div className="md:pt-0" style={{ paddingTop: 0 }}>
          <SupabaseDataProvider>
            <RoleGuard>{children}</RoleGuard>
          </SupabaseDataProvider>
        </div>
      </main>

      <BottomTabBar />
    </div>
  );
}
