"use client";

import { useMemorialContext } from "@/contexts/memorial-state-context";
import { FeatureCard } from "@/components/workspace/feature-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePlus, X, Camera, PenLine, Film, Eye, Check, HeartHandshake } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { PetDetails } from "@/hooks/use-memorial-state";
import { ImageCropModal } from "@/components/image-crop-modal";


function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
    </div>
  );
}

// ── Intro Mode: Pet details form ──────────────────────────────────────────────

function IntroForm() {
  const { petDetails, ownerLastName, setOwnerLastName, updatePetDetails, setHeroPhotoFile, setIntroComplete, hydrated } = useMemorialContext();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cropSrc, setCropSrc] = useState<string | null>(null);
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
      setCropSrc(URL.createObjectURL(file));
    },
    []
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
      setIntroComplete(true);
    }
  };

  if (!hydrated) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-white py-8 px-4 dark:bg-gray-950">
      <div className="mx-auto max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-amber-50">
              Let&apos;s remember them
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
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
              <Label htmlFor="ownerLastName">Your last name</Label>
              <Input
                id="ownerLastName"
                placeholder="So we can personalize the page"
                value={ownerLastName}
                onChange={(e) => setOwnerLastName(e.target.value)}
                className="h-12 text-base"
              />
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
                        ? "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-amber-900/30 dark:text-gray-400 dark:hover:border-amber-800/50"
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
                <div className="relative w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={petDetails.heroPhoto}
                    alt={petDetails.petName || "Pet photo"}
                    className="w-full object-contain"
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
                  className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 hover:border-gray-300 transition-colors dark:border-amber-900/30 dark:bg-gray-900/40 dark:hover:border-amber-800/50"
                >
                  <ImagePlus className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-2" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Add a favorite photo
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
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
            className="w-full h-12 text-base bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-gray-900"
            disabled={!petDetails.petName.trim()}
          >
            Continue
          </Button>
        </form>
        {cropSrc && (
          <ImageCropModal
            imageSrc={cropSrc}
            open={!!cropSrc}
            onClose={() => {
              URL.revokeObjectURL(cropSrc);
              setCropSrc(null);
            }}
            onCropComplete={(croppedFile) => {
              URL.revokeObjectURL(cropSrc);
              setCropSrc(null);
              setHeroPhotoFile(croppedFile);
            }}
          />
        )}
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
    videos,
    compilationUrl,
    ownerLastName,
    setOwnerLastName,
    updatePetDetails,
    setHeroPhotoFile,
    cameFromSeed,
    lastSaved,
    supportContext,
    hydrated,
  } = useMemorialContext();
  const [editingDetails, setEditingDetails] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  useEffect(() => {
    if (lastSaved === null) return;
    setShowPulse(true);
    const timer = setTimeout(() => setShowPulse(false), 2000);
    return () => clearTimeout(timer);
  }, [lastSaved]);

  if (!hydrated) return <LoadingSkeleton />;

  // Status calculations
  const photoCount = photos.length + (petDetails.heroPhoto ? 1 : 0);
  const photoStatus = photoCount === 0
    ? "Not started"
    : `${photoCount} photo${photoCount !== 1 ? "s" : ""} uploaded`;
  const photoStatusType = photoCount === 0 ? "not-started" as const : "complete" as const;

  const tributeNotStarted = chatMessages.length === 0 && !generatedTribute;
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

  const supportStatus = supportContext.length === 0
    ? "Not started"
    : `${supportContext.length} concern${supportContext.length !== 1 ? "s" : ""} addressed`;
  const supportStatusType = supportContext.length === 0 ? "not-started" as const : "complete" as const;

  return (
    <div className={`min-h-screen bg-white py-8 px-4 dark:bg-gray-950 ${photoCount > 0 || !tributeNotStarted || videos.length > 0 || compilationUrl || supportContext.length > 0 ? "pb-28" : "pb-8"}`}>
      <div className="mx-auto max-w-lg space-y-8">
        {/* Pet details header */}
        <div className="text-center space-y-1">
          {petDetails.heroPhoto && (
            <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full border-2 border-amber-200 dark:border-amber-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={petDetails.heroPhoto}
                alt={petDetails.petName}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-amber-50">
            {cameFromSeed
              ? <>Let&apos;s build {petDetails.petName}&apos;s memorial</>
              : <>You&apos;ve started {petDetails.petName}&apos;s memorial</>}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            What would you like to do next?
          </p>
          {lastSaved !== null && (
            <div className={`flex items-center justify-center gap-1.5 text-xs transition-opacity duration-700 ${
              showPulse ? 'opacity-100' : 'opacity-50'
            }`}>
              <Check className="h-3 w-3 text-green-600 dark:text-green-500" />
              <span className="text-gray-400 dark:text-gray-500">Saved to this device</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setEditingDetails(!editingDetails)}
            className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 mt-1"
          >
            {editingDetails ? "Done editing" : "Edit pet details"}
          </button>
        </div>

        {/* Inline pet details editor */}
        {editingDetails && (
          <PetDetailsEditor
            petDetails={petDetails}
            ownerLastName={ownerLastName}
            onOwnerLastNameChange={setOwnerLastName}
            onUpdate={updatePetDetails}
            onSetHeroFile={setHeroPhotoFile}
          />
        )}

        {/* Steps */}
        <div className="flex flex-col gap-4">
          <FeatureCard
            step={1}
            title="Upload Photos"
            description="Add photos to the memorial gallery"
            status={photoStatus}
            statusType={photoStatusType}
            href="/create/photos"
            icon={<Camera className="h-6 w-6" />}
          />
          <FeatureCard
            step={2}
            title="Write Tribute"
            description="Write a personal tribute with AI to tell their story"
            status={tributeStatus}
            statusType={tributeStatusType}
            href="/create/tribute"
            icon={<PenLine className="h-6 w-6" />}
          />
          <FeatureCard
            step={3}
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

        {/* Optional support */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
            <span className="text-xs text-gray-400 dark:text-gray-500">If you need support</span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
          </div>
          <FeatureCard
            title="Talk It Through"
            description="A safe space to work through guilt, regrets, or the &lsquo;what-ifs&rsquo; — at your own pace"
            status={supportContext.length > 0 ? supportStatus : ""}
            statusType={supportStatusType}
            href="/create/support"
            icon={<HeartHandshake className="h-6 w-6" />}
          />
        </div>
      </div>

      {/* Sticky save bar — only show after user has started at least one section */}
      {(photoCount > 0 || !tributeNotStarted || videos.length > 0 || compilationUrl || supportContext.length > 0) ? (
        <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white/95 backdrop-blur-sm px-4 py-4 dark:border-amber-900/30 dark:bg-gray-950/95">
          <div className="mx-auto max-w-lg">
            <Link href="/create/preview">
              <Button className="w-full h-12 text-base bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-gray-900 gap-2">
                <Eye className="h-5 w-5" />
                Preview & Save
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 text-center space-y-3">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Not sure where to start? If you&apos;re carrying something heavy, try
            &ldquo;Work Through the Hard Stuff&rdquo; first. Otherwise, most people begin with photos.
          </p>
          <Link href="/demo" className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 underline underline-offset-2">
            Want to see what a finished memorial looks like? View example →
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Inline Pet Details Editor ─────────────────────────────────────────────────

function PetDetailsEditor({
  petDetails,
  ownerLastName,
  onOwnerLastNameChange,
  onUpdate,
  onSetHeroFile,
}: {
  petDetails: PetDetails;
  ownerLastName: string;
  onOwnerLastNameChange: (name: string) => void;
  onUpdate: (details: Partial<PetDetails>) => void;
  onSetHeroFile: (file: File | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4 dark:border-amber-900/30 dark:bg-gray-900/40">
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
        <Label htmlFor="edit-ownerLastName">Your last name</Label>
        <Input
          id="edit-ownerLastName"
          placeholder="So we can personalize the page"
          value={ownerLastName}
          onChange={(e) => onOwnerLastNameChange(e.target.value)}
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
                  ? "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-amber-900/30 dark:text-gray-400 dark:hover:border-amber-800/50"
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

      <div className="space-y-2">
        <Label>Gender (optional)</Label>
        <div className="flex gap-2">
          {([["male", "Boy"], ["female", "Girl"], ["neutral", "Other"]] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onUpdate({ gender: petDetails.gender === value ? undefined : value })}
              className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                petDetails.gender === value
                  ? "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-amber-900/30 dark:text-gray-400 dark:hover:border-amber-800/50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
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
          <div className="relative w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={petDetails.heroPhoto}
              alt={petDetails.petName || "Pet photo"}
              className="w-full object-contain"
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
            className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 hover:border-gray-300 transition-colors dark:border-amber-900/30 dark:bg-gray-900/40 dark:hover:border-amber-800/50"
          >
            <ImagePlus className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Add a favorite photo</p>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && file.size <= 10 * 1024 * 1024 && file.type.startsWith("image/")) {
              setCropSrc(URL.createObjectURL(file));
            }
            e.target.value = "";
          }}
          className="hidden"
        />
      </div>
      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          open={!!cropSrc}
          onClose={() => {
            URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
          }}
          onCropComplete={(croppedFile) => {
            URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
            onSetHeroFile(croppedFile);
          }}
        />
      )}
    </div>
  );
}

// ── Edit loader wrapper ────────────────────────────────────────────────────────

function EditLoader() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { memorialId, loadFromMemorial, hydrated } = useMemorialContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const attempted = useRef(false);

  useEffect(() => {
    if (!editId || !hydrated || attempted.current) return;
    // Already loaded this memorial
    if (memorialId === editId) return;
    attempted.current = true;
    setLoading(true);
    fetch(`/api/memorial/${editId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load memorial");
        return res.json();
      })
      .then(({ memorial }) => {
        loadFromMemorial(memorial);
      })
      .catch(() => {
        setError("Couldn't load your memorial. Please refresh the page or sign in again.");
      })
      .finally(() => setLoading(false));
  }, [editId, hydrated, memorialId, loadFromMemorial]);

  if (loading) return <LoadingSkeleton />;
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center space-y-3">
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <a href="/dashboard" className="text-sm text-amber-600 hover:underline dark:text-amber-400">
            Back to dashboard
          </a>
        </div>
      </div>
    );
  }

  return null;
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CreateMemorial() {
  const { introComplete, hydrated } = useMemorialContext();

  if (!hydrated) return <LoadingSkeleton />;

  return (
    <>
      <Suspense>
        <EditLoader />
      </Suspense>
      {introComplete ? <Dashboard /> : <IntroForm />}
    </>
  );
}
