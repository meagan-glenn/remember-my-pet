"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { FullStoryIdentity } from "@/components/fullstory-identity";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
      <Toaster position="top-center" richColors />
      <FullStoryIdentity />
    </ThemeProvider>
  );
}
