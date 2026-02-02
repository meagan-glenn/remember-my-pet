export type WallCardType = "photo" | "memory" | "video";

export interface PhotoWallCard {
  id: string;
  type: "photo";
  url: string;
  caption: string | null;
}

export interface MemoryWallCard {
  id: string;
  type: "memory";
  contributorName: string;
  content: string;
  photoUrls?: string[];
  createdAt: string;
}

export interface VideoWallCard {
  id: string;
  type: "video";
  url: string;
  posterUrl?: string;
}

export type WallCard = PhotoWallCard | MemoryWallCard | VideoWallCard;
