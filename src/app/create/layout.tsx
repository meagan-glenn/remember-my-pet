"use client";

import { MemorialStateProvider } from "@/contexts/memorial-state-context";
import type { ReactNode } from "react";

export default function CreateLayout({ children }: { children: ReactNode }) {
  return (
    <MemorialStateProvider>
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        {children}
      </div>
    </MemorialStateProvider>
  );
}
