"use client";

import { Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCandleState } from "./candle-provider";

interface LightCandleProps {
  petName?: string;
  variant?: "inline" | "section" | "hero";
}

function FlameIcon({ lit, size }: { lit: boolean; size: "sm" | "lg" }) {
  const cls = size === "lg" ? "h-6 w-6" : "h-4 w-4";

  return (
    <AnimatePresence mode="wait">
      {lit ? (
        <motion.div
          key="lit"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, -3, 3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Flame className={`${cls} fill-amber-400 text-amber-500`} />
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
          <Flame className={`${cls} text-gray-400 dark:text-gray-500`} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function LightCandle({ petName, variant = "inline" }: LightCandleProps) {
  const { count, userLit, loading, toggle } = useCandleState();

  if (variant === "hero") {
    if (loading) {
      return (
        <div className="flex items-center gap-1.5 text-sm text-white/60">
          <Flame className="h-4 w-4" />
        </div>
      );
    }

    return (
      <button
        onClick={toggle}
        className="flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 text-sm backdrop-blur-sm transition-colors hover:bg-black/50 active:scale-95"
        aria-label={userLit ? "Unlight your candle" : "Light a candle"}
      >
        <FlameIcon lit={userLit} size="sm" />
        <span className={userLit ? "text-amber-300" : "text-white/70"}>
          {count > 0
            ? `${count} candle${count === 1 ? "" : "s"} lit`
            : "Light a candle"}
        </span>
      </button>
    );
  }

  if (variant === "section") {
    if (loading) {
      return (
        <div className="flex flex-col items-center gap-2 py-4">
          <Flame className="h-6 w-6 text-gray-300 dark:text-gray-700" />
        </div>
      );
    }

    const label = petName
      ? count > 0
        ? `${count} candle${count === 1 ? "" : "s"} lit for ${petName}`
        : `Light a candle for ${petName}`
      : count > 0
        ? `${count} candle${count === 1 ? "" : "s"} lit`
        : "Light a candle";

    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <button
          onClick={toggle}
          className="flex items-center gap-2 rounded-full px-5 py-2.5 transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/20 active:scale-95"
          aria-label={userLit ? "Unlight your candle" : "Light a candle"}
        >
          <FlameIcon lit={userLit} size="lg" />
          <span className={`text-base ${userLit ? "text-amber-700 dark:text-amber-400" : "text-gray-500 dark:text-gray-400"}`}>
            {label}
          </span>
        </button>
      </div>
    );
  }

  // Inline variant
  if (loading) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500">
        <Flame className="h-4 w-4" />
      </div>
    );
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/20 active:scale-95"
      aria-label={userLit ? "Unlight your candle" : "Light a candle"}
    >
      <FlameIcon lit={userLit} size="sm" />
      <span className={userLit ? "text-amber-700 dark:text-amber-400" : "text-gray-500 dark:text-gray-400"}>
        {count > 0
          ? `${count} candle${count === 1 ? "" : "s"} lit`
          : "Light a candle"}
      </span>
    </button>
  );
}
