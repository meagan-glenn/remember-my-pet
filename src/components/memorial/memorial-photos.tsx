"use client";

import { useState } from "react";
import Image from "next/image";
import { MasonryWall } from "@/components/memorial-wall/masonry-wall";
import { PhotoLightbox } from "./photo-lightbox";

interface Photo {
  id: string;
  url: string;
  caption: string | null;
}

interface MemoryRow {
  id?: string;
  name?: string;
  contributor_name?: string;
  content: string;
  photo_urls?: string[] | null;
  created_at?: string;
}

interface MemorialPhotosProps {
  sidePhotos: Photo[];
  masonryPhotos: Photo[];
  memories: MemoryRow[];
  videoUrl?: string;
  videoPosterUrl?: string;
  petName: string;
  tribute: string | null;
  isOwner: boolean;
  editUrl: string;
}

export function MemorialPhotos({
  sidePhotos,
  masonryPhotos,
  memories,
  videoUrl,
  videoPosterUrl,
  petName,
  tribute,
  isOwner,
  editUrl,
}: MemorialPhotosProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // All photos in unified order: side photos first, then masonry photos
  const allPhotos = [...sidePhotos, ...masonryPhotos].map((p) => ({
    url: p.url,
    caption: p.caption,
  }));

  function handlePhotoClick(globalIndex: number) {
    setLightboxIndex(globalIndex);
    setLightboxOpen(true);
  }

  const hasMasonryContent = masonryPhotos.length > 0 || memories.length > 0 || !!videoUrl;

  return (
    <>
      {/* Tribute + Side Photos */}
      {tribute ? (
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-stretch md:gap-4">
            <div className="flex-1 rounded-2xl border-l-4 border-l-amber-700 dark:border-l-amber-500 border border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/30 p-6 shadow-sm backdrop-blur-sm sm:p-8">
              <h2 className="mb-4 font-serif text-2xl font-medium text-gray-900 dark:text-amber-50">
                A Tribute
              </h2>
              <div className="whitespace-pre-line text-base leading-relaxed text-gray-700 dark:text-gray-300">
                {tribute}
              </div>
            </div>
            {sidePhotos.length > 0 && (
              <div className="flex gap-3 md:w-80 md:shrink-0 md:flex-col">
                {sidePhotos.map((photo, i) => (
                  <button
                    key={photo.id}
                    onClick={() => handlePhotoClick(i)}
                    className="cursor-pointer overflow-hidden rounded-2xl border border-amber-100 dark:border-amber-900/30 bg-white/80 dark:bg-gray-900/40 shadow-sm transition-opacity hover:opacity-90"
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={photo.url}
                        alt={photo.caption || petName}
                        fill
                        sizes="(min-width: 768px) 320px, 50vw"
                        className="object-cover"
                      />
                    </div>
                    {photo.caption && (
                      <p className="px-3 py-2 text-left text-xs italic text-gray-500 dark:text-gray-400">{photo.caption}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : isOwner ? (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="rounded-2xl border border-dashed border-amber-200 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/30 p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">No tribute yet.</p>
            <a
              href={editUrl}
              className="mt-2 inline-block text-sm text-amber-600 dark:text-amber-400 hover:underline"
            >
              Add a tribute
            </a>
          </div>
        </section>
      ) : (
        /* Visitor sees an empty state encouraging memory contribution */
        !hasMasonryContent ? (
          <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <div className="rounded-2xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-950/20 p-8 text-center space-y-2">
              <p className="text-gray-500 dark:text-gray-400">
                {petName}&apos;s memorial is just getting started.
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Be the first to share a memory below.
              </p>
            </div>
          </section>
        ) : null
      )}

      {/* Masonry wall */}
      {hasMasonryContent && (
        <section className="mx-auto max-w-6xl px-4 pt-6 pb-6 sm:px-6 sm:pt-10 sm:pb-10">
          <MasonryWall
            photos={masonryPhotos}
            memories={memories}
            videoUrl={videoUrl}
            videoPosterUrl={videoPosterUrl}
            petName={petName}
            onPhotoClick={handlePhotoClick}
            photoIndexOffset={sidePhotos.length}
          />
        </section>
      )}

      {/* Unified lightbox for all photos */}
      <PhotoLightbox
        photos={allPhotos}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </>
  );
}
