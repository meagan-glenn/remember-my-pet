"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Play, Volume2, VolumeX } from "lucide-react";
import { useReducedMotion } from "framer-motion";

interface HeroMediaProps {
  /** Optional video compilation URL. When present, hero becomes ambient video. */
  videoUrl?: string | null;
  /** Poster image — also the still-hero fallback when videoUrl is absent. */
  posterUrl: string;
  posterAlt: string;
  /** Object-position Y percentage for the photo crop. */
  cropY: number;
}

/**
 * Ambient hero media for memorial pages.
 *
 * Modes:
 *   normal + video   → autoplay muted loop, poster fallback until onCanPlay,
 *                      tap-to-unmute bottom-left, pause when tab backgrounded
 *   normal + no video → still image with subtle Ken Burns on a wrapper div
 *   reduced + video   → poster with a "tap to play video" button (no autoplay)
 *   reduced + no video → still image, no motion
 *
 * Day 2 research: users consume the hero repeatedly for presence. Video is
 * the primary medium; the still image is a graceful fallback for memorials
 * without a compilation.
 */
export function HeroMedia({ videoUrl, posterUrl, posterAlt, cropY }: HeroMediaProps) {
  const reduce = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [manuallyStarted, setManuallyStarted] = useState(false);

  // Whether a video should actually be rendered right now.
  // Under reduced motion, we require a manual "tap to play" first.
  const shouldRenderVideo = !!videoUrl && (!reduce || manuallyStarted);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    // Some mobile browsers pause on mute state change; resume if needed.
    if (v.paused) void v.play().catch(() => {});
  }, []);

  const handleTapToPlay = useCallback(() => {
    setManuallyStarted(true);
  }, []);

  // Pause when tab is backgrounded (saves battery).
  // Note: we do NOT IntersectionObserver-pause on scroll in this pass —
  // see plan.md "Deferred" for when to revisit.
  useEffect(() => {
    if (!shouldRenderVideo) return;
    const v = videoRef.current;
    if (!v) return;
    const onVisibility = () => {
      if (document.hidden) v.pause();
      else void v.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [shouldRenderVideo]);

  // --- Reduced motion + video: poster with tap-to-play overlay ---
  if (videoUrl && reduce && !manuallyStarted) {
    return (
      <>
        <Image
          src={posterUrl}
          alt={posterAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: `center ${cropY}%` }}
        />
        <button
          type="button"
          onClick={handleTapToPlay}
          aria-label="Play memorial video"
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 print:hidden"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/40 text-white/90 backdrop-blur-sm">
            <Play className="h-7 w-7 translate-x-0.5 fill-current" />
          </span>
        </button>
      </>
    );
  }

  // --- Video mode (autoplay muted, or manually started under reduced motion) ---
  if (shouldRenderVideo && videoUrl) {
    return (
      <>
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlay={() => setVideoReady(true)}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: `center ${cropY}%` }}
          aria-label={posterAlt}
        />
        {/* Poster fallback prevents black flash until the video can play */}
        {!videoReady && (
          <Image
            src={posterUrl}
            alt={posterAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: `center ${cropY}%` }}
          />
        )}
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "Unmute memorial video" : "Mute memorial video"}
          className="absolute left-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 print:hidden sm:left-6"
          style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      </>
    );
  }

  // --- Still image (with Ken Burns when motion is allowed) ---
  // Ken Burns animates a wrapper div so it doesn't fight next/image's
  // fill positioning.
  return (
    <div
      className={
        reduce
          ? "absolute inset-0"
          : "absolute inset-0 motion-safe:animate-[ken-burns_24s_ease-in-out_infinite] motion-reduce:animate-none"
      }
    >
      <Image
        src={posterUrl}
        alt={posterAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: `center ${cropY}%` }}
      />
    </div>
  );
}
