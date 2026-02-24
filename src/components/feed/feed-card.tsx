"use client";

import { useState, useCallback } from "react";
import { Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserSupabase } from "@/lib/supabase";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

interface FeedCardProps {
  id: string;
  petName: string;
  species: string | null;
  slug: string;
  tributeSnippet: string | null;
  heroPhotoUrl: string | null;
  candleCount: number;
  userLit: boolean;
}

export function FeedCard({
  id,
  petName,
  species,
  slug,
  tributeSnippet,
  heroPhotoUrl,
  candleCount: initialCount,
  userLit: initialUserLit,
}: FeedCardProps) {
  const [count, setCount] = useState(initialCount);
  const [userLit, setUserLit] = useState(initialUserLit);
  const [toggling, setToggling] = useState(false);

  const handleCandleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (toggling) return;

      // Check auth
      const supabase = createBrowserSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = `/sign-in?redirect=${encodeURIComponent("/")}`;
        return;
      }

      // Optimistic toggle
      setToggling(true);
      const wasLit = userLit;
      setUserLit(!wasLit);
      setCount((c) => (wasLit ? c - 1 : c + 1));

      try {
        const res = await fetch("/api/candles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memorial_id: id }),
        });
        if (res.ok) {
          const data = await res.json();
          setUserLit(data.lit);
          setCount(data.count);
        } else {
          setUserLit(wasLit);
          setCount((c) => (wasLit ? c + 1 : c - 1));
          toast.error("Couldn't save your candle right now.", { duration: 4000 });
        }
      } catch {
        setUserLit(wasLit);
        setCount((c) => (wasLit ? c + 1 : c - 1));
        toast.error("Couldn't save your candle right now.", { duration: 4000 });
      } finally {
        setToggling(false);
      }
    },
    [toggling, userLit, id]
  );

  return (
    <Link
      href={`/${slug}`}
      className="block rounded-2xl border border-amber-100 bg-white/80 shadow-sm overflow-hidden hover:shadow-md transition-shadow dark:border-amber-900/30 dark:bg-gray-900/40"
    >
      {heroPhotoUrl && (
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={heroPhotoUrl}
            alt={petName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      )}

      <div className="p-4 space-y-2">
        <div className="flex items-baseline justify-between">
          <h3 className="font-serif text-lg font-medium text-gray-900 truncate dark:text-amber-50">
            {petName}
          </h3>
          {species && (
            <span className="text-xs text-gray-400 capitalize ml-2 shrink-0 dark:text-gray-500">
              {species}
            </span>
          )}
        </div>

        {tributeSnippet && (
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed dark:text-gray-400">
            {tributeSnippet}
          </p>
        )}

        <button
          onClick={handleCandleClick}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors hover:bg-amber-50 active:scale-95 -ml-1 dark:hover:bg-amber-900/20"
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
      </div>
    </Link>
  );
}
