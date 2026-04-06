"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
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
  petName: string;
  onPhotoClick?: (index: number) => void;
  photoIndexOffset?: number;
}

/** Extract a single uppercased initial for the contributor avatar. */
function getInitial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  // Use Array.from to handle multi-byte characters safely
  const first = Array.from(trimmed)[0];
  return first ? first.toUpperCase() : "?";
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
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : { duration: 0.35, delay: Math.min(index * 0.04, 0.6) }}
    >
      {card.type === "photo" && (
        <PhotoCard url={card.url} caption={card.caption} petName={petName} onClick={onPhotoClick} />
      )}
      {card.type === "memory" && (
        <div className="rounded-2xl border border-amber-200/50 dark:border-amber-900/30 bg-amber-50/60 dark:bg-amber-950/20 p-5 shadow-sm backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div
              aria-hidden="true"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-200/70 text-sm font-medium text-amber-900 dark:bg-amber-900/40 dark:text-amber-200"
            >
              {getInitial(card.contributorName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="whitespace-pre-line font-serif text-[17px] leading-[1.7] text-gray-800 dark:text-gray-200">
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
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                &mdash; {card.contributorName}
              </p>
            </div>
          </div>
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
  petName,
  onPhotoClick,
  photoIndexOffset = 0,
}: MasonryWallProps) {
  // Video compilation is now hoisted into HeroMedia; the wall never renders video.
  const cards = interleaveWallContent({ photos, memories });

  if (cards.length === 0) return null;

  // photoCounter is incremented during map iteration to assign lightbox
  // indices to photos in visual order. Memories and videos do not affect it.
  let photoCounter = 0;

  return (
    <div className="columns-1 gap-3 sm:columns-2 md:columns-3 md:gap-4 print:columns-1 print:block [&>*]:mb-3 [&>*]:break-inside-avoid md:[&>*]:mb-4">
      {cards.map((card, i) => {
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
  );
}
