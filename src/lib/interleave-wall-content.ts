import type { WallCard, PhotoWallCard, MemoryWallCard, VideoWallCard } from "@/components/memorial-wall/types";

interface InterleaveInput {
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
}

/**
 * Adaptively interleaves photos, memories, and video into a wall card array.
 * Photos come first, with video placed after the first few photos.
 * Memories are distributed among remaining photos by ratio.
 */
export function interleaveWallContent({
  photos,
  memories,
  videoUrl,
  videoPosterUrl,
}: InterleaveInput): WallCard[] {
  const cards: WallCard[] = [];

  const photoCards: PhotoWallCard[] = photos.map((p, i) => ({
    id: p.id || `photo-${i}`,
    type: "photo" as const,
    url: p.src || p.url || "",
    caption: p.caption ?? null,
  }));

  const memoryCards: MemoryWallCard[] = memories.map((m, i) => ({
    id: m.id || `memory-${i}`,
    type: "memory" as const,
    contributorName: m.name || m.contributor_name || "Anonymous",
    content: m.content,
    photoUrls: m.photo_urls?.filter(Boolean) as string[] | undefined,
    createdAt: m.created_at || new Date().toISOString(),
  }));

  const videoCard: VideoWallCard | null = videoUrl
    ? { id: "video-0", type: "video", url: videoUrl, posterUrl: videoPosterUrl }
    : null;

  // Place first batch of photos (up to 3)
  const firstBatch = photoCards.slice(0, 3);
  const remainingPhotos = photoCards.slice(3);

  cards.push(...firstBatch);

  // Place video after first batch
  if (videoCard) {
    cards.push(videoCard);
  }

  // Interleave remaining photos and memories by ratio
  if (remainingPhotos.length === 0 && memoryCards.length === 0) {
    return cards;
  }

  if (memoryCards.length === 0) {
    cards.push(...remainingPhotos);
    return cards;
  }

  if (remainingPhotos.length === 0) {
    cards.push(...memoryCards);
    return cards;
  }

  // Ratio-based interleaving: distribute memories evenly among photos
  const photosPerMemory = Math.max(1, Math.floor(remainingPhotos.length / memoryCards.length));
  let photoIdx = 0;

  for (const memory of memoryCards) {
    // Add some photos before each memory
    for (let j = 0; j < photosPerMemory && photoIdx < remainingPhotos.length; j++) {
      cards.push(remainingPhotos[photoIdx++]);
    }
    cards.push(memory);
  }

  // Add any remaining photos
  while (photoIdx < remainingPhotos.length) {
    cards.push(remainingPhotos[photoIdx++]);
  }

  return cards;
}
