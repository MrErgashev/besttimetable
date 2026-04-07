import { MeshBackground } from "@/components/ui/MeshBackground";
import { SupabaseDataProvider } from "@/components/providers/SupabaseDataProvider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// Build vaqtida Supabase env yo'q — statik prerender o'rniga dinamik render
export const dynamic = "force-dynamic";

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--background)] min-h-[100dvh] relative overflow-x-hidden">
      <MeshBackground />

      <div className="fixed top-4 right-4 z-30">
        <ThemeToggle />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 pt-6 pb-10 safe-top safe-bottom">
        <SupabaseDataProvider>{children}</SupabaseDataProvider>
      </main>
    </div>
  );
}
