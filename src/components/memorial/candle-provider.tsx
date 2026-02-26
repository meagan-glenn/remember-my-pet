"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { toast } from "sonner";

interface CandleState {
  count: number;
  userLit: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  toggling: boolean;
  toggle: () => Promise<void>;
}

const CandleContext = createContext<CandleState | null>(null);

export function useCandleState() {
  const ctx = useContext(CandleContext);
  if (!ctx) throw new Error("useCandleState must be used within CandleProvider");
  return ctx;
}

function getAnonKey(memorialId: string) {
  return `candle-lit:${memorialId}`;
}

export function CandleProvider({ memorialId, children }: { memorialId: string; children: ReactNode }) {
  const [count, setCount] = useState(0);
  const [userLit, setUserLit] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    async function fetchState() {
      try {
        const supabase = createBrowserSupabase();
        const [authResult, res] = await Promise.all([
          supabase.auth.getUser(),
          fetch(`/api/candles?memorial_id=${memorialId}`),
        ]);
        const authed = !!authResult.data.user;
        setIsAuthenticated(authed);
        if (res.ok) {
          const data = await res.json();
          setCount(data.count);
          // For authenticated users, trust the server. For anonymous, check localStorage.
          if (authed) {
            setUserLit(data.userLit);
          } else {
            setUserLit(localStorage.getItem(getAnonKey(memorialId)) === "1");
          }
        }
      } catch {
        // Silently fail — candle count is non-critical
      } finally {
        setLoading(false);
      }
    }
    fetchState();
  }, [memorialId]);

  const toggle = useCallback(async () => {
    if (toggling) return;

    // Anonymous users can only light, not unlight
    if (!isAuthenticated && userLit) return;

    const wasLit = userLit;
    setToggling(true);
    setUserLit(!wasLit);
    setCount((c) => (wasLit ? c - 1 : c + 1));

    try {
      const res = await fetch("/api/candles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memorial_id: memorialId,
          ...(isAuthenticated ? {} : { anonymous: true }),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setUserLit(data.lit);
        setCount(data.count);
        // Persist anonymous candle in localStorage
        if (!isAuthenticated) {
          localStorage.setItem(getAnonKey(memorialId), "1");
        }
      } else {
        setUserLit(wasLit);
        setCount((c) => (wasLit ? c + 1 : c - 1));
        toast.error("Couldn't save your candle right now. Try refreshing the page.", { duration: 4000 });
      }
    } catch {
      setUserLit(wasLit);
      setCount((c) => (wasLit ? c + 1 : c - 1));
      toast.error("Couldn't save your candle right now. Try refreshing the page.", { duration: 4000 });
    } finally {
      setToggling(false);
    }
  }, [toggling, isAuthenticated, userLit, memorialId]);

  return (
    <CandleContext.Provider value={{ count, userLit, isAuthenticated, loading, toggling, toggle }}>
      {children}
    </CandleContext.Provider>
  );
}
