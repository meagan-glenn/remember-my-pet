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
  /** Object pronoun (him / her / them) for the visitor empty state. */
  objectPronoun: string;
  tribute: string | null;
  isOwner: boolean;
  editUrl: string;
}

export function MemorialPhotos({
  masonryPhotos,
  memories,
  petName,
  objectPronoun,
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
      {/* Masonry wall (above tribute — sensory content first).
          Wider than the tribute (max-w-7xl vs max-w-2xl) so three columns
          of photos can breathe on desktop without the narrative prose
          below becoming an unreadable measure. */}
      {hasMasonryContent && (
        <section className="mx-auto max-w-7xl px-4 pt-6 pb-6 sm:px-6 sm:pt-10 sm:pb-10">
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
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-2xl">
            <p className="mb-6 text-center text-xs uppercase tracking-[0.2em] text-amber-700/80 dark:text-amber-500/70">
              A Tribute
            </p>
            <div className="font-serif text-[20px] leading-[1.75] text-gray-800 dark:text-gray-200 sm:text-[22px]">
              {tribute.trim().split(/\n\n+/).map((para, i) => (
                <p key={i} className="mb-5 last:mb-0 whitespace-pre-line">{para}</p>
              ))}
            </div>
          </div>
        </section>
      ) : isOwner ? (
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-6 text-xs uppercase tracking-[0.2em] text-amber-700/60 dark:text-amber-500/50">
              A Tribute
            </p>
            <p className="font-serif text-[20px] text-gray-600 dark:text-gray-300 sm:text-[22px]">
              {petName}&apos;s tribute is still being written.
            </p>
            <a
              href={editUrl}
              className="mt-3 inline-block text-sm text-amber-600 dark:text-amber-400 hover:underline"
            >
              Add a tribute
            </a>
          </div>
        </section>
      ) : (
        /* Visitor, no tribute. Only show a framed empty state when there is
           no wall content either — otherwise the wall carries the page. */
        !hasMasonryContent ? (
          <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <div className="mx-auto max-w-xl space-y-3 text-center">
              <p className="font-serif text-xl text-gray-600 dark:text-gray-300">
                A place is being made for {petName}.
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                If you loved {objectPronoun}, share a memory below.
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
