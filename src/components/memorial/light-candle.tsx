"use client";

import { useState, useEffect, useCallback } from "react";
import { Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserSupabase } from "@/lib/supabase";
import { toast } from "sonner";

interface LightCandleProps {
  memorialId: string;
}

export function LightCandle({ memorialId }: LightCandleProps) {
  const [count, setCount] = useState(0);
  const [userLit, setUserLit] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    async function fetchState() {
      try {
        const supabase = createBrowserSupabase();

        // Check auth and fetch candle state in parallel
        const [authResult, res] = await Promise.all([
          supabase.auth.getUser(),
          fetch(`/api/candles?memorial_id=${memorialId}`),
        ]);
        setIsAuthenticated(!!authResult.data.user);

        if (res.ok) {
          const data = await res.json();
          setCount(data.count);
          setUserLit(data.userLit);
        }
      } catch {
        // Silently fail — candle count is non-critical
      } finally {
        setLoading(false);
      }
    }

    fetchState();
  }, [memorialId]);

  const handleClick = useCallback(async () => {
    if (toggling) return;

    if (!isAuthenticated) {
      window.location.href = `/sign-in?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    // Optimistic update
    setToggling(true);
    const wasLit = userLit;
    setUserLit(!wasLit);
    setCount((c) => (wasLit ? c - 1 : c + 1));

    try {
      const res = await fetch("/api/candles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memorial_id: memorialId }),
      });

      if (res.ok) {
        const data = await res.json();
        setUserLit(data.lit);
        setCount(data.count);
      } else {
        // Revert on error
        setUserLit(wasLit);
        setCount((c) => (wasLit ? c + 1 : c - 1));
        toast.error("Couldn't save your candle right now. Try refreshing the page.", { duration: 4000 });
      }
    } catch {
      // Revert on error
      setUserLit(wasLit);
      setCount((c) => (wasLit ? c + 1 : c - 1));
      toast.error("Couldn't save your candle right now. Try refreshing the page.", { duration: 4000 });
    } finally {
      setToggling(false);
    }
  }, [toggling, isAuthenticated, userLit, memorialId]);

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500">
        <Flame className="h-4 w-4" />
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/20 active:scale-95"
      aria-label={userLit ? "Unlight your candle" : "Light a candle"}
    >
      <AnimatePresence mode="wait">
        {userLit ? (
          <motion.div
            key="lit"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, -3, 3, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Flame className="h-4 w-4 fill-amber-400 text-amber-500" />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="unlit"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Flame className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </motion.div>
        )}
      </AnimatePresence>
      <span className={userLit ? "text-amber-700 dark:text-amber-400" : "text-gray-500 dark:text-gray-400"}>
        {count > 0
          ? `${count} candle${count === 1 ? "" : "s"} lit`
          : "Light a candle"}
      </span>
    </button>
  );
}
