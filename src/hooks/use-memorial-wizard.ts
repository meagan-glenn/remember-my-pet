"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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

  // Hydrate from localStorage on mount
  useEffect(() => {
    setState(loadState());
    setHydrated(true);
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
    (photo: WizardPhoto) =>
      setState((prev) => ({
        ...prev,
        photos: [...prev.photos, photo],
      })),
    []
  );

  const removePhoto = useCallback(
    (id: string) =>
      setState((prev) => ({
        ...prev,
        photos: prev.photos.filter((p) => p.id !== id),
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

  const reset = useCallback(() => {
    setState(initialState);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
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
    nextStep,
    previousStep,
    updateState,
    updatePetDetails,
    addPhoto,
    removePhoto,
    reorderPhotos,
    addChatMessage,
    setTribute,
    reset,
  };
}
