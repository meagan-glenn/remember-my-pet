"use client";

import { Flame } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useCandleState } from "./candle-provider";

interface LightCandleProps {
  petName?: string;
  variant?: "inline" | "section" | "hero";
}

/**
 * Shared flame icon for inline + section variants. Hero variant has its own
 * CSS-keyframe-driven flame (see below) so the flicker can be decoupled from
 * the AnimatePresence swap.
 *
 * When prefers-reduced-motion is enabled, the infinite scale/rotate pulse is
 * omitted — the colored flame stays put, but the fade-in/out between lit and
 * unlit states is preserved (that swap is a discrete state change, not
 * ambient motion, and is safe under reduced-motion guidelines).
 */
function FlameIcon({ lit, size }: { lit: boolean; size: "sm" | "lg" }) {
  const reduce = useReducedMotion();
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
          {reduce ? (
            <Flame className={`${cls} fill-amber-400 text-amber-500`} />
          ) : (
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, -3, 3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Flame className={`${cls} fill-amber-400 text-amber-500`} />
            </motion.div>
          )}
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
        <div className="flex flex-col items-center gap-1 text-white/60">
          <Flame className="h-7 w-7" />
        </div>
      );
    }

    const heroLabel = petName
      ? userLit
        ? `Unlight your candle for ${petName}`
        : `Light a candle for ${petName}`
      : userLit
        ? "Unlight your candle"
        : "Light a candle";

    const countLabel =
      count > 0 ? `${count} candle${count === 1 ? "" : "s"} lit` : "Light a candle";

    return (
      <button
        onClick={toggle}
        aria-label={heroLabel}
        className="group flex flex-col items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:scale-95"
      >
        <span className="relative flex h-10 w-10 items-center justify-center">
          {/* Ambient glow halo — behind the flame. Opacity drives visibility;
              the pulse is purely motion-safe, so reduced-motion users see a
              steady halo on the lit state. */}
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 rounded-full bg-amber-400/50 blur-xl transition-opacity duration-500 ${
              userLit
                ? "opacity-90 motion-safe:animate-[candle-glow_3s_ease-in-out_infinite]"
                : "opacity-0 group-hover:opacity-30"
            }`}
          />
          {/* Flame itself — CSS flicker when lit, dim when unlit. */}
          <Flame
            className={`relative h-7 w-7 transition-colors duration-300 ${
              userLit
                ? "fill-amber-300 text-amber-400 motion-safe:animate-[candle-flicker_2.4s_ease-in-out_infinite]"
                : "fill-transparent text-white/50 group-hover:text-white/80"
            }`}
          />
        </span>
        <span
          className={`text-[11px] font-light tracking-wide transition-colors ${
            userLit ? "text-amber-200" : "text-white/70 group-hover:text-white/90"
          }`}
        >
          {countLabel}
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
