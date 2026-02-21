"use client";

import { motion } from "framer-motion";
import { interleaveWallContent } from "@/lib/interleave-wall-content";
import { PhotoCard } from "./photo-card";
import { VideoCard } from "./video-card";
import type { WallCard } from "./types";

interface MasonryWallProps {
  photos: { id?: string; src?: string; url?: string; caption?: string | null }[];
  memories: {
    id?: string;
    name?: string;
    contributor_name?: string;
    content: string;
    photo_urls?: string[] | null;
    created_at?: string;
  }[];
  videoUrl?: string;
  videoPosterUrl?: string;
  petName: string;
}

function WallCardRenderer({ card, index, petName }: { card: WallCard; index: number; petName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
    >
      {card.type === "photo" && (
        <PhotoCard url={card.url} caption={card.caption} petName={petName} />
      )}
      {card.type === "memory" && (
        <div className="rounded-2xl border border-amber-100 bg-stone-50/80 p-5 shadow-sm backdrop-blur-sm">
          <div className="mb-1 text-amber-400/60 text-2xl leading-none select-none">&ldquo;</div>
          <p className="whitespace-pre-line text-base leading-relaxed text-gray-700">
            {card.content}
          </p>
          <p className="mt-3 text-sm font-medium text-gray-500">
            &mdash; {card.contributorName}
          </p>
        </div>
      )}
      {card.type === "video" && (
        <VideoCard url={card.url} posterUrl={card.posterUrl} />
      )}
    </motion.div>
  );
}

export function MasonryWall({
  photos,
  memories,
  videoUrl,
  videoPosterUrl,
  petName,
}: MasonryWallProps) {
  const cards = interleaveWallContent({ photos, memories, videoUrl, videoPosterUrl });

  const mediaCards = cards.filter((c) => c.type === "photo" || c.type === "video");
  const memoryCards = cards.filter((c) => c.type === "memory");

  if (mediaCards.length === 0 && memoryCards.length === 0) return null;

  return (
    <div className="space-y-0">
      {/* Photos & Video */}
      {mediaCards.length > 0 && (
        <div className="columns-2 gap-3 md:columns-4 md:gap-4 [&>*]:mb-3 [&>*]:break-inside-avoid md:[&>*]:mb-4">
          {mediaCards.map((card, i) => (
            <WallCardRenderer key={card.id} card={card} index={i} petName={petName} />
          ))}
        </div>
      )}

      {/* Divider */}
      {mediaCards.length > 0 && memoryCards.length > 0 && (
        <div className="flex items-center gap-4 py-10">
          <div className="h-px flex-1 bg-amber-200/60" />
          <h3 className="text-sm font-medium text-gray-400 tracking-wide">
            Memories &amp; Stories
          </h3>
          <div className="h-px flex-1 bg-amber-200/60" />
        </div>
      )}

      {/* Memories */}
      {memoryCards.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          {memoryCards.map((card, i) => (
            <WallCardRenderer key={card.id} card={card} index={mediaCards.length + i} petName={petName} />
          ))}
        </div>
      )}
    </div>
  );
}
