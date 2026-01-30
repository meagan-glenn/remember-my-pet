"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  saveHeroFile,
  loadHeroFile,
  removeHeroFile,
  savePhotoFile,
  loadPhotoFiles,
  removePhotoFile,
  clearPhotoStore,
} from "@/lib/photo-store";

export interface PetDetails {
  petName: string;
  species: string;
  customSpecies: string;
  birthDate: string;
  deathDate: string;
  heroPhoto: string;
}

export interface WizardPhoto {
  id: string;
  url: string;
  file?: File; // local File for deferred upload
  sortOrder: number;
}

export interface WizardState {
  currentStep: number;
  petDetails: PetDetails;
  photos: WizardPhoto[];
  chatMessages: { role: "assistant" | "user"; content: string }[];
  generatedTribute: string;
  memorialId: string;
}

const STORAGE_KEY = "petmemorial-wizard-state";
const SAVE_DEBOUNCE_MS = 500;

const initialState: WizardState = {
  currentStep: 1,
  petDetails: {
    petName: "",
    species: "dog",
    customSpecies: "",
    birthDate: "",
    deathDate: "",
    heroPhoto: "",
  },
  photos: [],
  chatMessages: [],
  generatedTribute: "",
  memorialId: "",
};

function loadState(): WizardState {
  if (typeof window === "undefined") return initialState;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialState;
    return { ...initialState, ...JSON.parse(stored) };
  } catch {
    return initialState;
  }
}

function saveState(state: WizardState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable
  }
}

export function useMemorialWizard() {
  const [state, setState] = useState<WizardState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  // File refs for deferred upload (not serializable)
  const heroPhotoFileRef = useRef<File | null>(null);
  const photoFilesRef = useRef<Map<string, File>>(new Map());

  // Hydrate from localStorage + IndexedDB on mount
  useEffect(() => {
    async function hydrate() {
      const loaded = loadState();
      // Merge homepage seed if present
      try {
        const seedRaw = localStorage.getItem("petmemorial-wizard-seed");
        if (seedRaw) {
          const seed = JSON.parse(seedRaw);
          localStorage.removeItem("petmemorial-wizard-seed");
          if (!loaded.petDetails.petName && seed.petName) {
            loaded.petDetails = {
              ...loaded.petDetails,
              petName: seed.petName,
              species: seed.species || loaded.petDetails.species,
            };
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

      setState(loaded);
      setHydrated(true);
    }
    hydrate();
  }, []);

  // Debounced persist to localStorage
  useEffect(() => {
    if (!hydrated) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveState(state), SAVE_DEBOUNCE_MS);
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

  const updateState = useCallback(
    (partial: Partial<WizardState>) =>
      setState((prev) => ({ ...prev, ...partial })),
    []
  );

  const nextStep = useCallback(
    () =>
      setState((prev) => ({
        ...prev,
        currentStep: Math.min(prev.currentStep + 1, 4),
      })),
    []
  );

  const previousStep = useCallback(
    () =>
      setState((prev) => ({
        ...prev,
        currentStep: Math.max(prev.currentStep - 1, 1),
      })),
    []
  );

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

  const reset = useCallback(() => {
    setState(initialState);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      clearPhotoStore().catch(() => {});
    }
  }, []);

  return {
    currentStep: state.currentStep,
    petDetails: state.petDetails,
    photos: state.photos,
    chatMessages: state.chatMessages,
    generatedTribute: state.generatedTribute,
    memorialId: state.memorialId,
    hydrated,
    heroPhotoFileRef,
    photoFilesRef,
    nextStep,
    previousStep,
    updateState,
    updatePetDetails,
    addPhoto,
    removePhoto,
    reorderPhotos,
    addChatMessage,
    setTribute,
    setHeroPhotoFile,
    reset,
  };
}
