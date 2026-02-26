"use client";

import Image from "next/image";
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
  onPhotoClick?: (index: number) => void;
  photoIndexOffset?: number;
}

function WallCardRenderer({
  card,
  index,
  petName,
  onPhotoClick,
}: {
  card: WallCard;
  index: number;
  petName: string;
  onPhotoClick?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
    >
      {card.type === "photo" && (
        <PhotoCard url={card.url} caption={card.caption} petName={petName} onClick={onPhotoClick} />
      )}
      {card.type === "memory" && (
        <div className="rounded-2xl border border-amber-100 dark:border-amber-900/30 bg-stone-50/80 dark:bg-gray-900/40 p-5 shadow-sm backdrop-blur-sm">
          <div className="mb-1 text-amber-400/60 text-2xl leading-none select-none">&ldquo;</div>
          <p className="whitespace-pre-line text-base leading-relaxed text-gray-700 dark:text-gray-300">
            {card.content}
          </p>
          {card.photoUrls && card.photoUrls.length > 0 && (
            <div className="mt-3 flex gap-2">
              {card.photoUrls.map((url, i) => (
                <div key={i} className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={url}
                    alt={`Photo shared by ${card.contributorName}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
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
  onPhotoClick,
  photoIndexOffset = 0,
}: MasonryWallProps) {
  const cards = interleaveWallContent({ photos, memories, videoUrl, videoPosterUrl });

  if (cards.length === 0) return null;

  const mediaCards = cards.filter((c) => c.type === "photo" || c.type === "video");
  const memoryCards = cards.filter((c) => c.type === "memory");

  // Track photo index for lightbox navigation
  let photoCounter = 0;

  return (
    <>
      {mediaCards.length > 0 && (
        <div className="columns-2 gap-3 md:columns-4 md:gap-4 [&>*]:mb-3 [&>*]:break-inside-avoid md:[&>*]:mb-4">
          {mediaCards.map((card, i) => {
            const currentPhotoIndex = card.type === "photo" ? photoCounter++ : -1;
            return (
              <WallCardRenderer
                key={card.id}
                card={card}
                index={i}
                petName={petName}
                onPhotoClick={
                  card.type === "photo" && onPhotoClick
                    ? () => onPhotoClick(photoIndexOffset + currentPhotoIndex)
                    : undefined
                }
              />
            );
          })}
        </div>
      )}

      {memoryCards.length > 0 && (
        <>
          <div className="flex items-center gap-4 py-5 sm:py-8">
            <div className="h-px flex-1 bg-amber-200/60 dark:bg-amber-900/30" />
            <span className="text-sm font-medium text-gray-400 dark:text-gray-500">
              Memories &amp; Stories
            </span>
            <div className="h-px flex-1 bg-amber-200/60 dark:bg-amber-900/30" />
          </div>
          <div className="columns-1 gap-3 md:columns-2 md:gap-4 [&>*]:mb-3 [&>*]:break-inside-avoid md:[&>*]:mb-4">
            {memoryCards.map((card, i) => (
              <WallCardRenderer
                key={card.id}
                card={card}
                index={i}
                petName={petName}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
