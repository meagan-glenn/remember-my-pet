"use client";

import { useMemorialContext } from "@/contexts/memorial-state-context";
import { StepPreview } from "@/components/wizard/step-preview";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export default function PreviewPage() {
  const ctx = useMemorialContext();
  const router = useRouter();

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
    const photos: { url: string; caption?: string }[] = [];

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
            }));
          })
          .filter((p) => p !== null)
      );

      photos.push(...galleryResults);
    } catch (err) {
      if (err instanceof Error && err.message === "__AUTH_REQUIRED__") {
        router.push("/sign-in?redirect=/create/preview");
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

    const { slug } = await res.json();
    ctx.reset();
    router.push(`/dashboard?created=${slug}`);
  }, [ctx, uploadFile, router]);

  if (!ctx.hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="mx-auto max-w-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/create")}
          className="mb-4 -ml-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to workspace
        </Button>

        <StepPreview
          petDetails={ctx.petDetails}
          photos={ctx.photos}
          heroPhoto={ctx.petDetails.heroPhoto}
          tribute={ctx.generatedTribute}
          onUpdateTribute={ctx.setTribute}
          onReorderPhotos={ctx.reorderPhotos}
          onSave={handleSave}
          onBack={() => router.push("/create")}
        />
      </div>
    </div>
  );
}
