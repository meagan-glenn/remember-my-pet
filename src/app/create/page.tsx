"use client";

import { useMemorialContext } from "@/contexts/memorial-state-context";
import { FeatureCard } from "@/components/workspace/feature-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePlus, X, Camera, PenLine, Film, Eye } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useCallback } from "react";
import type { PetDetails } from "@/hooks/use-memorial-state";

function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
    </div>
  );
}

// ── Intro Mode: Pet details form ──────────────────────────────────────────────

function IntroForm() {
  const { petDetails, updatePetDetails, setHeroPhotoFile, hydrated } = useMemorialContext();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleHeroUpload = useCallback(
    (file: File) => {
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, heroPhoto: "File too large (max 10MB)" }));
        return;
      }
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, heroPhoto: "Please select an image file" }));
        return;
      }
      setErrors((prev) => {
        const { heroPhoto: _, ...rest } = prev;
        return rest;
      });
      setHeroPhotoFile(file);
    },
    [setHeroPhotoFile]
  );

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!petDetails.petName.trim()) {
      newErrors.petName = "Please enter your pet's name";
    }
    if (
      petDetails.birthDate &&
      petDetails.deathDate &&
      new Date(petDetails.deathDate) < new Date(petDetails.birthDate)
    ) {
      newErrors.deathDate = "This date should be after the birth date";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Pet name is now set — component will re-render into dashboard mode
    }
  };

  if (!hydrated) return <LoadingSkeleton />;

  return (
    <div className="py-8 px-4">
      <div className="mx-auto max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900">
              Let&apos;s remember them
            </h1>
            <p className="text-gray-500">
              Tell us a little about your pet to get started.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="petName">Pet&apos;s name</Label>
              <Input
                id="petName"
                placeholder="Their name"
                value={petDetails.petName}
                onChange={(e) => updatePetDetails({ petName: e.target.value })}
                autoFocus
                className="h-12 text-base"
              />
              {errors.petName && (
                <p className="text-sm text-red-500">{errors.petName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="species">Species</Label>
              <div className="flex gap-2">
                {["dog", "cat", "other"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => updatePetDetails({ species: s })}
                    className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium capitalize transition-colors ${
                      petDetails.species === s
                        ? "border-amber-500 bg-amber-50 text-amber-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {petDetails.species === "other" && (
                <Input
                  placeholder="What kind of pet?"
                  value={petDetails.customSpecies}
                  onChange={(e) => updatePetDetails({ customSpecies: e.target.value })}
                  className="h-12 text-base mt-2"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Born (optional)</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={petDetails.birthDate}
                  onChange={(e) => updatePetDetails({ birthDate: e.target.value })}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deathDate">Passed (optional)</Label>
                <Input
                  id="deathDate"
                  type="date"
                  value={petDetails.deathDate}
                  onChange={(e) => updatePetDetails({ deathDate: e.target.value })}
                  className="h-12"
                />
                {errors.deathDate && (
                  <p className="text-sm text-red-500">{errors.deathDate}</p>
                )}
              </div>
            </div>

            {/* Hero photo */}
            <div className="space-y-2">
              <Label>Primary photo</Label>
              {petDetails.heroPhoto ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={petDetails.heroPhoto}
                    alt={petDetails.petName || "Pet photo"}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setHeroPhotoFile(null)}
                    className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 hover:border-gray-300 transition-colors"
                >
                  <ImagePlus className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700">
                    Add a favorite photo
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    This will be the main image on the memorial
                  </p>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleHeroUpload(file);
                  e.target.value = "";
                }}
                className="hidden"
              />
              {errors.heroPhoto && (
                <p className="text-sm text-red-500">{errors.heroPhoto}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base bg-amber-600 hover:bg-amber-700"
            disabled={!petDetails.petName.trim()}
          >
            Continue
          </Button>
        </form>
      </div>
    </div>
  );
}

// ── Dashboard Mode: Workspace with feature cards ──────────────────────────────

function Dashboard() {
  const {
    petDetails,
    photos,
    chatMessages,
    generatedTribute,
    tributeMode,
    videos,
    compilationUrl,
    updatePetDetails,
    setHeroPhotoFile,
    hydrated,
  } = useMemorialContext();
  const [editingDetails, setEditingDetails] = useState(false);

  if (!hydrated) return <LoadingSkeleton />;

  // Status calculations
  const photoCount = photos.length + (petDetails.heroPhoto ? 1 : 0);
  const photoStatus = photoCount === 0
    ? "Not started"
    : `${photoCount} photo${photoCount !== 1 ? "s" : ""} uploaded`;
  const photoStatusType = photoCount === 0 ? "not-started" as const : "in-progress" as const;

  const tributeNotStarted = !tributeMode && chatMessages.length === 0 && !generatedTribute;
  const tributeStatus = tributeNotStarted
    ? "Not started"
    : generatedTribute
      ? "Complete"
      : "In progress";
  const tributeStatusType = tributeNotStarted
    ? "not-started" as const
    : generatedTribute
      ? "complete" as const
      : "in-progress" as const;

  return (
    <div className="py-8 px-4 pb-28">
      <div className="mx-auto max-w-lg space-y-8">
        {/* Pet details header */}
        <div className="text-center space-y-1">
          {petDetails.heroPhoto && (
            <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full border-2 border-amber-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={petDetails.heroPhoto}
                alt={petDetails.petName}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <h1 className="text-2xl font-semibold text-gray-900">
            You&apos;ve started {petDetails.petName}&apos;s memorial
          </h1>
          <p className="text-gray-500">
            What would you like to do next?
          </p>
          <button
            type="button"
            onClick={() => setEditingDetails(!editingDetails)}
            className="text-sm text-amber-600 hover:text-amber-700 mt-1"
          >
            {editingDetails ? "Done editing" : "Edit pet details"}
          </button>
        </div>

        {/* Inline pet details editor */}
        {editingDetails && (
          <PetDetailsEditor
            petDetails={petDetails}
            onUpdate={updatePetDetails}
            onSetHeroFile={setHeroPhotoFile}
          />
        )}

        {/* Feature cards */}
        <div className="space-y-3">
          <FeatureCard
            title="Upload Photos"
            description="Add photos to the memorial gallery"
            status={photoStatus}
            statusType={photoStatusType}
            href="/create/photos"
            icon={<Camera className="h-6 w-6" />}
          />
          <FeatureCard
            title="Write Tribute"
            description="Create a personal tribute with AI assistance"
            status={tributeStatus}
            statusType={tributeStatusType}
            href="/create/tribute"
            icon={<PenLine className="h-6 w-6" />}
          />
          <FeatureCard
            title="Create Video Reel"
            description="Upload videos and compile a memorial reel"
            status={
              compilationUrl
                ? "Complete"
                : videos.length === 0
                  ? "Not started"
                  : `${videos.length} video${videos.length !== 1 ? "s" : ""} uploaded`
            }
            statusType={
              compilationUrl
                ? "complete"
                : videos.length === 0
                  ? "not-started"
                  : "in-progress"
            }
            href="/create/reel"
            icon={<Film className="h-6 w-6" />}
          />
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white/95 backdrop-blur-sm px-4 py-4">
        <div className="mx-auto max-w-lg">
          <Link href="/create/preview">
            <Button className="w-full h-12 text-base bg-amber-600 hover:bg-amber-700 gap-2">
              <Eye className="h-5 w-5" />
              Preview & Save
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Inline Pet Details Editor ─────────────────────────────────────────────────

function PetDetailsEditor({
  petDetails,
  onUpdate,
  onSetHeroFile,
}: {
  petDetails: PetDetails;
  onUpdate: (details: Partial<PetDetails>) => void;
  onSetHeroFile: (file: File | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-petName">Pet&apos;s name</Label>
        <Input
          id="edit-petName"
          value={petDetails.petName}
          onChange={(e) => onUpdate({ petName: e.target.value })}
          className="h-12 text-base"
        />
      </div>

      <div className="space-y-2">
        <Label>Species</Label>
        <div className="flex gap-2">
          {["dog", "cat", "other"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onUpdate({ species: s })}
              className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium capitalize transition-colors ${
                petDetails.species === s
                  ? "border-amber-500 bg-amber-50 text-amber-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {petDetails.species === "other" && (
          <Input
            placeholder="What kind of pet?"
            value={petDetails.customSpecies}
            onChange={(e) => onUpdate({ customSpecies: e.target.value })}
            className="h-12 text-base mt-2"
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-birthDate">Born (optional)</Label>
          <Input
            id="edit-birthDate"
            type="date"
            value={petDetails.birthDate}
            onChange={(e) => onUpdate({ birthDate: e.target.value })}
            className="h-12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-deathDate">Passed (optional)</Label>
          <Input
            id="edit-deathDate"
            type="date"
            value={petDetails.deathDate}
            onChange={(e) => onUpdate({ deathDate: e.target.value })}
            className="h-12"
          />
        </div>
      </div>

      {/* Hero photo */}
      <div className="space-y-2">
        <Label>Primary photo</Label>
        {petDetails.heroPhoto ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={petDetails.heroPhoto}
              alt={petDetails.petName || "Pet photo"}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => onSetHeroFile(null)}
              className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 hover:border-gray-300 transition-colors"
          >
            <ImagePlus className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-700">Add a favorite photo</p>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && file.size <= 10 * 1024 * 1024 && file.type.startsWith("image/")) {
              onSetHeroFile(file);
            }
            e.target.value = "";
          }}
          className="hidden"
        />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CreateMemorial() {
  const { petDetails, hydrated } = useMemorialContext();

  if (!hydrated) return <LoadingSkeleton />;

  // Show intro form until pet name is set, then show dashboard
  if (!petDetails.petName.trim()) {
    return <IntroForm />;
  }

  return <Dashboard />;
}
