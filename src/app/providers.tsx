"use client";

import { ThemeProvider } from "next-themes";
import { useSpecularLight } from "@/hooks/useSpecularLight";

function SpecularLightProvider({ children }: { children: React.ReactNode }) {
  useSpecularLight();
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SpecularLightProvider>{children}</SpecularLightProvider>
    </ThemeProvider>
  );
}
