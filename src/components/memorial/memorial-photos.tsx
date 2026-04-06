"use client";

import { useState } from "react";
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
  masonryPhotos: Photo[];
  memories: MemoryRow[];
  petName: string;
  tribute: string | null;
  isOwner: boolean;
  editUrl: string;
}

export function MemorialPhotos({
  masonryPhotos,
  memories,
  petName,
  tribute,
  isOwner,
  editUrl,
}: MemorialPhotosProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const allPhotos = masonryPhotos.map((p) => ({
    url: p.url,
    caption: p.caption,
  }));

  function handlePhotoClick(globalIndex: number) {
    setLightboxIndex(globalIndex);
    setLightboxOpen(true);
  }

  const hasMasonryContent = masonryPhotos.length > 0 || memories.length > 0;

  return (
    <>
      {/* Masonry wall (above tribute — sensory content first) */}
      {hasMasonryContent && (
        <section className="mx-auto max-w-6xl px-4 pt-6 pb-6 sm:px-6 sm:pt-10 sm:pb-10">
          <MasonryWall
            photos={masonryPhotos}
            memories={memories}
            petName={petName}
            onPhotoClick={handlePhotoClick}
            photoIndexOffset={0}
          />
        </section>
      )}

      {/* Tribute as editorial prose */}
      {tribute ? (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-2xl">
            <p className="mb-6 text-center text-xs uppercase tracking-[0.2em] text-amber-700/80 dark:text-amber-500/70">
              A Tribute
            </p>
            <div className="font-serif text-[18px] leading-[1.75] text-gray-800 dark:text-gray-200 sm:text-[19px]">
              {tribute.trim().split(/\n\n+/).map((para, i) => (
                <p key={i} className="mb-5 last:mb-0 whitespace-pre-line">{para}</p>
              ))}
            </div>
          </div>
        </section>
      ) : isOwner ? (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-6 text-xs uppercase tracking-[0.2em] text-amber-700/60 dark:text-amber-500/50">
              A Tribute
            </p>
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
