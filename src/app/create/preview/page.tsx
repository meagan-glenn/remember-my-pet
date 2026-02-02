"use client";

import { useMemorialContext } from "@/contexts/memorial-state-context";
import { StepPreview } from "@/components/wizard/step-preview";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PricingCards } from "@/components/checkout/pricing-cards";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function PreviewContent() {
  const ctx = useMemorialContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoSave = searchParams.get("autoSave") === "1";
  const autoSaveTriggered = useRef(false);
  const [saving, setSaving] = useState(false);
  const [autoSaveFailed, setAutoSaveFailed] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [savedMemorial, setSavedMemorial] = useState<{
    id: string;
    slug: string;
  } | null>(null);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.status === 401) throw new Error("__AUTH_REQUIRED__");
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Upload failed");
    }
    const { url } = await res.json();
    return url;
  }, []);

  const handleSave = useCallback(async () => {
    const photos: { url: string; caption?: string; aiDetectedTags?: string[] }[] = [];

    try {
      // Upload hero photo
      const heroFile = ctx.heroPhotoFileRef.current;
      if (heroFile) {
        const heroUrl = await uploadFile(heroFile);
        photos.push({ url: heroUrl });
      }

      // Upload gallery photos in parallel
      const galleryResults = await Promise.all(
        ctx.photos
          .map((p) => {
            const file = ctx.photoFilesRef.current.get(p.id);
            if (!file) return null;
            return uploadFile(file).then((url) => ({
              url,
              caption: p.caption || undefined,
              aiDetectedTags: p.aiDetectedTags?.length ? p.aiDetectedTags : undefined,
            }));
          })
          .filter((p) => p !== null)
      );

      photos.push(...galleryResults);
    } catch (err) {
      if (err instanceof Error && err.message === "__AUTH_REQUIRED__") {
        router.push("/sign-in?redirect=" + encodeURIComponent("/create/preview?autoSave=1") + "&context=save");
        return;
      }
      throw err;
    }

    // Save memorial with real Supabase URLs
    const res = await fetch("/api/memorial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        petName: ctx.petDetails.petName,
        ownerLastName: ctx.ownerLastName,
        species:
          ctx.petDetails.species === "other"
            ? ctx.petDetails.customSpecies
            : ctx.petDetails.species,
        birthDate: ctx.petDetails.birthDate || null,
        deathDate: ctx.petDetails.deathDate || null,
        tribute: ctx.generatedTribute,
        photos,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to save memorial");
    }

    const { memorialId, slug } = await res.json();
    ctx.reset();
    setSavedMemorial({ id: memorialId, slug });
  }, [ctx, uploadFile, router]);

  // Auto-trigger save when returning from auth redirect
  useEffect(() => {
    if (!autoSave || !ctx.hydrated || autoSaveTriggered.current) return;
    autoSaveTriggered.current = true;
    setShowWelcomeBack(true);
    // Strip autoSave param from URL
    router.replace("/create/preview", { scroll: false });
    setSaving(true);
    handleSave()
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to save memorial. Please try again.");
        setAutoSaveFailed(true);
        setShowWelcomeBack(false);
      })
      .finally(() => setSaving(false));
  }, [autoSave, ctx.hydrated, handleSave, router]);

  if (!ctx.hydrated || saving) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-3 px-4">
          {showWelcomeBack && (
            <p className="text-base text-gray-700 mb-4">
              Welcome back. Picking up right where you left off.
            </p>
          )}
          <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          {saving && (
            <p className="text-sm text-gray-500">Saving your memorial...</p>
          )}
        </div>
      </div>
    );
  }

  if (autoSaveFailed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <p className="text-gray-700">Something went wrong saving your memorial.</p>
          <p className="text-sm text-gray-500">Your progress is safe — you can try again.</p>
          <Button
            onClick={() => {
              setAutoSaveFailed(false);
              setSaving(true);
              handleSave()
                .catch((err) => {
                  toast.error(err instanceof Error ? err.message : "Failed to save memorial. Please try again.");
                  setAutoSaveFailed(true);
                })
                .finally(() => setSaving(false));
            }}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (savedMemorial) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-white py-12 px-4">
        <PricingCards
          memorialId={savedMemorial.id}
          slug={savedMemorial.slug}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="px-4 pt-4 sm:px-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/create")}
          className="mb-2 -ml-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to workspace
        </Button>
      </div>

      <StepPreview
        petDetails={ctx.petDetails}
        photos={ctx.photos}
        heroPhoto={ctx.petDetails.heroPhoto}
        tribute={ctx.generatedTribute}
        onUpdateTribute={ctx.setTribute}
        onReorderPhotos={ctx.reorderPhotos}
        onSave={handleSave}
        onBack={() => router.push("/create")}
        heroPhotoCropY={ctx.petDetails.heroPhotoCropY ?? 50}
        onUpdateCropY={(y) => ctx.updatePetDetails({ heroPhotoCropY: y })}
      />
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense>
      <PreviewContent />
    </Suspense>
  );
}
