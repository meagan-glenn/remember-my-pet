"use client";

import { useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxPhoto {
  url: string;
  caption: string | null;
}

interface PhotoLightboxProps {
  photos: LightboxPhoto[];
  index: number;
  onIndexChange: (index: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PhotoLightbox({ photos, index, onIndexChange, open, onOpenChange }: PhotoLightboxProps) {
  const touchStartX = useRef<number | null>(null);

  const goNext = useCallback(() => {
    onIndexChange(Math.min(index + 1, photos.length - 1));
  }, [index, photos.length, onIndexChange]);

  const goPrev = useCallback(() => {
    onIndexChange(Math.max(index - 1, 0));
  }, [index, onIndexChange]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, goNext, goPrev]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) > 50) {
      if (delta < 0) goNext();
      else goPrev();
    }
  };

  if (photos.length === 0) return null;

  const photo = photos[index];

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/90 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex flex-col items-center justify-center outline-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <DialogPrimitive.Title className="sr-only">
            Photo {index + 1} of {photos.length}
          </DialogPrimitive.Title>

          {/* Close button */}
          <DialogPrimitive.Close className="absolute top-4 right-4 z-10 rounded-full bg-black/40 p-2 text-white/80 transition-colors hover:bg-black/60 hover:text-white">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>

          {/* Counter */}
          {photos.length > 1 && (
            <div className="absolute top-4 left-4 z-10 rounded-full bg-black/40 px-3 py-1 text-sm text-white/70">
              {index + 1} of {photos.length}
            </div>
          )}

          {/* Previous button */}
          {index > 0 && (
            <button
              onClick={goPrev}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white/80 transition-colors hover:bg-black/60 hover:text-white sm:left-4"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Next button */}
          {index < photos.length - 1 && (
            <button
              onClick={goNext}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white/80 transition-colors hover:bg-black/60 hover:text-white sm:right-4"
              aria-label="Next photo"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Image */}
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative h-[70vh] w-[90vw] sm:h-[80vh] sm:w-[85vw]"
            >
              <Image
                src={photo.url}
                alt={photo.caption || "Photo"}
                fill
                sizes="90vw"
                className="object-contain"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* Caption */}
          {photo.caption && (
            <p className="mt-4 max-w-lg px-4 text-center text-sm italic text-white/70">
              {photo.caption}
            </p>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
