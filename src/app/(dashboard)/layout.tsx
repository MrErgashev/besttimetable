import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-ambient min-h-screen">
      <Sidebar />
      <Topbar />
      <main className="lg:ml-64 pt-24 px-4 sm:px-6 pb-8">{children}</main>
    </div>
  );
}
