"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useMemorialState, type MemorialStateValue } from "@/hooks/use-memorial-state";

const MemorialStateContext = createContext<MemorialStateValue | null>(null);

export function MemorialStateProvider({ children }: { children: ReactNode }) {
  const state = useMemorialState();
  return (
    <MemorialStateContext.Provider value={state}>
      {children}
    </MemorialStateContext.Provider>
  );
}

export function useMemorialContext(): MemorialStateValue {
  const ctx = useContext(MemorialStateContext);
  if (!ctx) {
    throw new Error("useMemorialContext must be used within a MemorialStateProvider");
  }
  return ctx;
}
