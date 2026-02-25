"use client";

import { useMemorialContext } from "@/contexts/memorial-state-context";
import { StepPreview } from "@/components/wizard/step-preview";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Share2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { getPronouns } from "@/lib/pronouns";
import { compressImage } from "@/lib/compress-image";

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
  const [showInFeed, setShowInFeed] = useState(false);
  const showInFeedInitialized = useRef(false);

  // Initialize showInFeed from existing memorial when editing
  useEffect(() => {
    if (!ctx.memorialId || !ctx.hydrated || showInFeedInitialized.current) return;
    showInFeedInitialized.current = true;
    fetch(`/api/memorial/${ctx.memorialId}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.memorial?.show_in_feed) {
          setShowInFeed(true);
        }
      })
      .catch(() => {});
  }, [ctx.memorialId, ctx.hydrated]);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const compressed = await compressImage(file);
    const formData = new FormData();
    formData.append("file", compressed);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.status === 401) throw new Error("__AUTH_REQUIRED__");
    if (!res.ok) {
      if (res.status === 413) throw new Error("This photo is too large. Please use a photo under 10MB.");
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error?.message || data.error || "Upload failed");
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
        memorialId: ctx.memorialId || undefined,
        petName: ctx.petDetails.petName,
        ownerLastName: ctx.ownerLastName,
        species:
          ctx.petDetails.species === "other"
            ? ctx.petDetails.customSpecies
            : ctx.petDetails.species,
        customSpecies: ctx.petDetails.species === "other" ? ctx.petDetails.customSpecies : undefined,
        gender: ctx.petDetails.gender || undefined,
        birthDate: ctx.petDetails.birthDate || null,
        deathDate: ctx.petDetails.deathDate || null,
        tribute: ctx.generatedTribute,
        heroPhotoCropY: ctx.petDetails.heroPhotoCropY ?? 50,
        photos,
        publish: true,
        showInFeed,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error?.message || data.error || "Failed to save memorial");
    }

    const { memorialId, slug } = await res.json();
    setSavedMemorial({ id: memorialId, slug });
  }, [ctx, uploadFile, router, showInFeed]);

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
        toast.error(err instanceof Error ? err.message : ERROR_MESSAGES.MEMORIAL_SAVE_FAILED.message, { duration: Infinity });
        setAutoSaveFailed(true);
        setShowWelcomeBack(false);
      })
      .finally(() => setSaving(false));
  }, [autoSave, ctx.hydrated, handleSave, router]);

  if (!ctx.hydrated || saving) {
    return (
      <div className="flex min-h-screen items-center justify-center dark:bg-gray-950">
        <div className="text-center space-y-3 px-4">
          {showWelcomeBack && (
            <p className="text-base text-gray-700 dark:text-gray-300 mb-4">
              Welcome back. Picking up right where you left off.
            </p>
          )}
          <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          {saving && (
            <p className="text-sm text-gray-500 dark:text-gray-400">Saving your memorial...</p>
          )}
        </div>
      </div>
    );
  }

  if (autoSaveFailed) {
    return (
      <div className="flex min-h-screen items-center justify-center dark:bg-gray-950">
        <div className="text-center space-y-4 px-4">
          <p className="text-gray-700 dark:text-gray-300">{ERROR_MESSAGES.MEMORIAL_SAVE_FAILED.message}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your progress is safe — you can try again.</p>
          <Button
            onClick={() => {
              setAutoSaveFailed(false);
              setSaving(true);
              handleSave()
                .catch((err) => {
                  toast.error(err instanceof Error ? err.message : ERROR_MESSAGES.MEMORIAL_SAVE_FAILED.message, { duration: Infinity });
                  setAutoSaveFailed(true);
                })
                .finally(() => setSaving(false));
            }}
            className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-gray-900"
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (savedMemorial) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-950 py-12 px-4">
        <div className="mx-auto max-w-md text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="font-serif text-2xl font-medium text-gray-900 dark:text-amber-50">
            {ctx.petDetails.petName}&apos;s memorial is live
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Share it with the people who loved {getPronouns(ctx.petDetails.gender).object}.
          </p>
          <div className="space-y-3">
            <Button
              className="w-full h-12 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-gray-900"
              onClick={async () => {
                const url = `${window.location.origin}/${savedMemorial.slug}`;
                if (navigator.share) {
                  try {
                    await navigator.share({ title: `${ctx.petDetails.petName}'s Memorial`, url });
                  } catch {
                    // User cancelled share — ignore
                  }
                } else {
                  await navigator.clipboard.writeText(url);
                  toast.success("Link copied to clipboard", { duration: 4000 });
                }
              }}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share memorial
            </Button>
            <Link href={`/${savedMemorial.slug}`}>
              <Button variant="outline" className="w-full h-12 mt-3">
                View memorial
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
      <div className="px-4 pt-4 sm:px-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/create")}
          className="mb-2 -ml-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-amber-50"
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
        showInFeed={showInFeed}
        onShowInFeedChange={setShowInFeed}
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
