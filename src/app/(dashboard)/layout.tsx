import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { MobileHeader } from "@/components/layout/MobileHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <Topbar />
      <MobileHeader />

      <main
        className="lg:ml-[var(--sidebar-width)] px-4 sm:px-6 pb-8"
        style={{
          paddingTop: "calc(var(--header-height) + 16px)",
          paddingBottom: "calc(var(--tab-bar-height) + var(--safe-area-bottom) + 24px)",
        }}
      >
        <div className="md:pt-0" style={{ paddingTop: 0 }}>
          {children}
        </div>
      </main>

      <BottomTabBar />
    </div>
  );
}
