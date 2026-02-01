"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  saveHeroFile,
  loadHeroFile,
  removeHeroFile,
  savePhotoFile,
  loadPhotoFiles,
  removePhotoFile,
  clearPhotoStore,
} from "@/lib/photo-store";
import {
  saveVideoFile,
  loadVideoFiles,
  removeVideoFile,
  clearVideoStore,
} from "@/lib/video-store";

export interface PetDetails {
  petName: string;
  species: string;
  customSpecies: string;
  birthDate: string;
  deathDate: string;
  heroPhoto: string;
  heroPhotoCropY: number; // 0-100, vertical focal point percentage
}

export interface WizardPhoto {
  id: string;
  url: string;
  file?: File; // local File for deferred upload
  sortOrder: number;
  caption?: string;
  aiDetectedTags?: string[];
}

export interface WizardVideo {
  id: string;
  url: string; // blob URL for preview, Supabase URL after upload
  filename: string;
  durationSeconds?: number;
  thumbnailUrl?: string; // blob URL of first-frame thumbnail
  sortOrder: number;
}

export interface VideoClip {
  id: string;
  videoId: string;
  startTime: number; // seconds
  endTime: number; // seconds
  tag: string;
  sortOrder: number;
}

export interface SupportContextEntry {
  userConcern: string;
  aiReframing: string;
}

export interface MemorialState {
  petDetails: PetDetails;
  ownerLastName: string;
  photos: WizardPhoto[];
  chatMessages: { role: "assistant" | "user"; content: string }[];
  generatedTribute: string;
  memorialId: string;
  homepageConversation: { role: "assistant" | "user"; content: string }[];
  tributeMode: "celebrate" | "support" | "";
  hasPassedTransition: boolean;
  supportContext: SupportContextEntry[];
  videos: WizardVideo[];
  videoClips: VideoClip[];
  compilationUrl: string;
  introComplete: boolean;
}

const STORAGE_KEY = "petmemorial-wizard-state";
const SAVE_DEBOUNCE_MS = 500;

const initialState: MemorialState = {
  petDetails: {
    petName: "",
    species: "dog",
    customSpecies: "",
    birthDate: "",
    deathDate: "",
    heroPhoto: "",
    heroPhotoCropY: 50,
  },
  ownerLastName: "",
  photos: [],
  chatMessages: [],
  generatedTribute: "",
  memorialId: "",
  homepageConversation: [],
  tributeMode: "",
  hasPassedTransition: false,
  supportContext: [],
  videos: [],
  videoClips: [],
  compilationUrl: "",
  introComplete: false,
};

function loadState(): MemorialState {
  if (typeof window === "undefined") return initialState;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialState;
    // Destructure out currentStep from old wizard state for backward compat
    const { currentStep: _currentStep, ...rest } = JSON.parse(stored);
    void _currentStep;
    return { ...initialState, ...rest };
  } catch {
    return initialState;
  }
}

function saveState(state: MemorialState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable
  }
}

export function useMemorialState() {
  const [state, setState] = useState<MemorialState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [cameFromSeed, setCameFromSeed] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  // File refs for deferred upload (not serializable)
  const heroPhotoFileRef = useRef<File | null>(null);
  const photoFilesRef = useRef<Map<string, File>>(new Map());
  const videoFilesRef = useRef<Map<string, File>>(new Map());

  // Hydrate from localStorage + IndexedDB on mount
  useEffect(() => {
    async function hydrate() {
      const loaded = loadState();
      // Merge homepage seed if present
      try {
        const seedRaw = localStorage.getItem("petmemorial-wizard-seed");
        if (seedRaw) {
          const seed = JSON.parse(seedRaw);
          if (seed.petName) {
            const normalizedSpecies = seed.species ? seed.species.toLowerCase() : "";
            loaded.petDetails = {
              ...loaded.petDetails,
              petName: seed.petName,
              species: normalizedSpecies || loaded.petDetails.species,
            };
            loaded.introComplete = true;
            setCameFromSeed(true);
          }
          // Store homepage conversation for tribute integration
          if (seed.conversation && Array.isArray(seed.conversation)) {
            loaded.homepageConversation = seed.conversation;
          } else if (seed.memory && typeof seed.memory === "string" && !loaded.homepageConversation.length) {
            // Backward compat: convert old single-memory format
            loaded.homepageConversation = [
              { role: "assistant" as const, content: `What's your favorite memory with ${seed.petName}?` },
              { role: "user" as const, content: seed.memory },
            ];
          }
        }
      } catch {
        // ignore malformed seed
      }

      // Restore file refs from IndexedDB (survives auth redirects)
      try {
        const heroFile = await loadHeroFile();
        if (heroFile) {
          heroPhotoFileRef.current = heroFile;
          // Regenerate blob URL if wizard state has a heroPhoto marker
          if (loaded.petDetails.heroPhoto) {
            loaded.petDetails.heroPhoto = URL.createObjectURL(heroFile);
          }
        }
        const photoFiles = await loadPhotoFiles();
        if (photoFiles.size > 0) {
          photoFilesRef.current = photoFiles;
          // Regenerate blob URLs for photos that have stored files
          loaded.photos = loaded.photos.map((p) => {
            const file = photoFiles.get(p.id);
            if (file) {
              return { ...p, url: URL.createObjectURL(file) };
            }
            return p;
          });
        }
      } catch {
        // IndexedDB unavailable — files lost, user can re-add
      }

      // Restore video files from IndexedDB
      try {
        const videoFiles = await loadVideoFiles();
        if (videoFiles.size > 0) {
          videoFilesRef.current = videoFiles;
          loaded.videos = loaded.videos.map((v) => {
            const file = videoFiles.get(v.id);
            if (file) {
              return { ...v, url: URL.createObjectURL(file) };
            }
            return v;
          });
        }
      } catch {
        // IndexedDB unavailable
      }

      setState(loaded);
      setHydrated(true);
      // Remove seed after state is applied (deferred to avoid React Strict Mode double-run)
      localStorage.removeItem("petmemorial-wizard-seed");
    }
    hydrate();
  }, []);

  // Debounced persist to localStorage
  useEffect(() => {
    if (!hydrated) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        saveState(state);
        setLastSaved(Date.now());
      } catch {
        // localStorage full or unavailable — don't update lastSaved
      }
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state, hydrated]);

  // Flush pending save on page hide / unmount
  useEffect(() => {
    const flush = () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      saveState(stateRef.current);
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, []);

  const updatePetDetails = useCallback(
    (details: Partial<PetDetails>) =>
      setState((prev) => ({
        ...prev,
        petDetails: { ...prev.petDetails, ...details },
      })),
    []
  );

  const addPhoto = useCallback(
    (photo: WizardPhoto) => {
      if (photo.file) {
        photoFilesRef.current.set(photo.id, photo.file);
        savePhotoFile(photo.id, photo.file).catch(() => {});
      }
      setState((prev) => ({
        ...prev,
        photos: [...prev.photos, { id: photo.id, url: photo.url, sortOrder: photo.sortOrder }],
      }));
    },
    []
  );

  const removePhoto = useCallback(
    (id: string) => {
      const file = photoFilesRef.current.get(id);
      if (file) {
        const photo = stateRef.current.photos.find((p) => p.id === id);
        if (photo?.url.startsWith("blob:")) URL.revokeObjectURL(photo.url);
        photoFilesRef.current.delete(id);
        removePhotoFile(id).catch(() => {});
      }
      setState((prev) => ({
        ...prev,
        photos: prev.photos.filter((p) => p.id !== id),
      }));
    },
    []
  );

  const setHeroPhotoFile = useCallback(
    (file: File | null) => {
      const old = stateRef.current.petDetails.heroPhoto;
      if (old.startsWith("blob:")) URL.revokeObjectURL(old);

      heroPhotoFileRef.current = file;
      if (file) {
        saveHeroFile(file).catch(() => {});
        const url = URL.createObjectURL(file);
        setState((prev) => ({
          ...prev,
          petDetails: { ...prev.petDetails, heroPhoto: url },
        }));
      } else {
        removeHeroFile().catch(() => {});
        setState((prev) => ({
          ...prev,
          petDetails: { ...prev.petDetails, heroPhoto: "" },
        }));
      }
    },
    []
  );

  const setPhotoCaption = useCallback(
    (id: string, caption: string) =>
      setState((prev) => ({
        ...prev,
        photos: prev.photos.map((p) =>
          p.id === id ? { ...p, caption } : p
        ),
      })),
    []
  );

  const setPhotoTags = useCallback(
    (id: string, tags: string[]) =>
      setState((prev) => ({
        ...prev,
        photos: prev.photos.map((p) =>
          p.id === id ? { ...p, aiDetectedTags: tags } : p
        ),
      })),
    []
  );

  const reorderPhotos = useCallback(
    (photos: WizardPhoto[]) => setState((prev) => ({ ...prev, photos })),
    []
  );

  const addChatMessage = useCallback(
    (message: { role: "assistant" | "user"; content: string }) =>
      setState((prev) => ({
        ...prev,
        chatMessages: [...prev.chatMessages, message],
      })),
    []
  );

  const setTribute = useCallback(
    (tribute: string) =>
      setState((prev) => ({ ...prev, generatedTribute: tribute })),
    []
  );

  const setHomepageConversation = useCallback(
    (conversation: { role: "assistant" | "user"; content: string }[]) =>
      setState((prev) => ({ ...prev, homepageConversation: conversation })),
    []
  );

  const setTributeMode = useCallback(
    (mode: "celebrate" | "support" | "") =>
      setState((prev) => ({
        ...prev,
        tributeMode: mode,
        chatMessages: [],
        generatedTribute: "",
        hasPassedTransition: false,
        supportContext: [],
      })),
    []
  );

  const setHasPassedTransition = useCallback(
    (passed: boolean) =>
      setState((prev) => ({ ...prev, hasPassedTransition: passed })),
    []
  );

  const setSupportContext = useCallback(
    (ctx: SupportContextEntry[]) =>
      setState((prev) => ({ ...prev, supportContext: ctx })),
    []
  );

  const addVideo = useCallback(
    (video: WizardVideo & { file?: File }) => {
      if (video.file) {
        videoFilesRef.current.set(video.id, video.file);
        saveVideoFile(video.id, video.file).catch(() => {});
      }
      setState((prev) => ({
        ...prev,
        videos: [...prev.videos, {
          id: video.id,
          url: video.url,
          filename: video.filename,
          durationSeconds: video.durationSeconds,
          thumbnailUrl: video.thumbnailUrl,
          sortOrder: video.sortOrder,
        }],
      }));
    },
    []
  );

  const removeVideo = useCallback(
    (id: string) => {
      const file = videoFilesRef.current.get(id);
      if (file) {
        const video = stateRef.current.videos.find((v) => v.id === id);
        if (video?.url.startsWith("blob:")) URL.revokeObjectURL(video.url);
        if (video?.thumbnailUrl?.startsWith("blob:")) URL.revokeObjectURL(video.thumbnailUrl);
        videoFilesRef.current.delete(id);
        removeVideoFile(id).catch(() => {});
      }
      setState((prev) => ({
        ...prev,
        videos: prev.videos.filter((v) => v.id !== id),
        // Also remove any clips from this video
        videoClips: prev.videoClips.filter((c) => c.videoId !== id),
      }));
    },
    []
  );

  const reorderVideos = useCallback(
    (videos: WizardVideo[]) => setState((prev) => ({ ...prev, videos })),
    []
  );

  const addClip = useCallback(
    (clip: VideoClip) =>
      setState((prev) => ({
        ...prev,
        videoClips: [...prev.videoClips, clip],
      })),
    []
  );

  const updateClip = useCallback(
    (id: string, updates: Partial<VideoClip>) =>
      setState((prev) => ({
        ...prev,
        videoClips: prev.videoClips.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
      })),
    []
  );

  const removeClip = useCallback(
    (id: string) =>
      setState((prev) => ({
        ...prev,
        videoClips: prev.videoClips.filter((c) => c.id !== id),
      })),
    []
  );

  const reorderClips = useCallback(
    (clips: VideoClip[]) => setState((prev) => ({ ...prev, videoClips: clips })),
    []
  );

  const setCompilationUrl = useCallback(
    (url: string) => setState((prev) => ({ ...prev, compilationUrl: url })),
    []
  );

  const setOwnerLastName = useCallback(
    (name: string) => setState((prev) => ({ ...prev, ownerLastName: name })),
    []
  );

  const setIntroComplete = useCallback(
    (complete: boolean) =>
      setState((prev) => ({ ...prev, introComplete: complete })),
    []
  );

  const reset = useCallback(() => {
    setState(initialState);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      clearPhotoStore().catch(() => {});
      clearVideoStore().catch(() => {});
    }
  }, []);

  const actions = useMemo(
    () => ({
      updatePetDetails,
      addPhoto,
      removePhoto,
      setPhotoCaption,
      setPhotoTags,
      reorderPhotos,
      addChatMessage,
      setTribute,
      setHeroPhotoFile,
      setHomepageConversation,
      setTributeMode,
      setHasPassedTransition,
      setSupportContext,
      addVideo,
      removeVideo,
      reorderVideos,
      addClip,
      updateClip,
      removeClip,
      reorderClips,
      setOwnerLastName,
      setCompilationUrl,
      setIntroComplete,
      reset,
    }),
    [updatePetDetails, addPhoto, removePhoto, setPhotoCaption, setPhotoTags, reorderPhotos, addChatMessage, setTribute, setHeroPhotoFile, setHomepageConversation, setTributeMode, setHasPassedTransition, setSupportContext, addVideo, removeVideo, reorderVideos, addClip, updateClip, removeClip, reorderClips, setOwnerLastName, setCompilationUrl, setIntroComplete, reset]
  );

  return useMemo(
    () => ({
      petDetails: state.petDetails,
      photos: state.photos,
      chatMessages: state.chatMessages,
      generatedTribute: state.generatedTribute,
      memorialId: state.memorialId,
      homepageConversation: state.homepageConversation,
      tributeMode: state.tributeMode,
      hasPassedTransition: state.hasPassedTransition,
      supportContext: state.supportContext,
      videos: state.videos,
      videoClips: state.videoClips,
      ownerLastName: state.ownerLastName,
      compilationUrl: state.compilationUrl,
      introComplete: state.introComplete,
      cameFromSeed,
      lastSaved,
      hydrated,
      heroPhotoFileRef,
      photoFilesRef,
      videoFilesRef,
      ...actions,
    }),
    [state, hydrated, lastSaved, actions]
  );
}

export type MemorialStateValue = ReturnType<typeof useMemorialState>;
