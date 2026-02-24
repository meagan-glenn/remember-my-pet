"use client";

import { MemorialStateProvider } from "@/contexts/memorial-state-context";
import type { ReactNode } from "react";
import { useEffect } from "react";

export default function CreateLayout({ children }: { children: ReactNode }) {
  // Hide the root layout footer on create pages (focused workspace with sticky CTA)
  useEffect(() => {
    document.body.classList.add("hide-footer");
    return () => document.body.classList.remove("hide-footer");
  }, []);

  return (
    <MemorialStateProvider>
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        {children}
      </div>
    </MemorialStateProvider>
  );
}
