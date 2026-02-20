import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { OfflineBanner } from "@/components/ui/OfflineBanner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <OfflineBanner />

      {/* Desktop: Sidebar + Topbar */}
      <Sidebar />
      <Topbar />

      {/* Mobile: Header */}
      <MobileHeader />

      {/* Main content */}
      <main className="md:ml-72 md:pt-16 px-4 md:px-6 pb-24 md:pb-8 animate-[fade-in_0.2s_ease]">
        {children}
      </main>

      {/* Mobile: Bottom Tab Bar */}
      <BottomTabBar />
    </div>
  );
}
