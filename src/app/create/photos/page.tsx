"use client";

import { useMemorialContext } from "@/contexts/memorial-state-context";
import { StepPhotoUpload } from "@/components/wizard/step-photo-upload";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PhotosPage() {
  const { photos, petDetails, addPhoto, removePhoto, setPhotoCaption, setPhotoTags, hydrated } = useMemorialContext();
  const router = useRouter();

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/create")}
          className="mb-4 -ml-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-amber-50"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to workspace
        </Button>

        <StepPhotoUpload
          photos={photos}
          heroPhoto={petDetails.heroPhoto}
          onAddPhoto={addPhoto}
          onRemovePhoto={removePhoto}
          onSetCaption={setPhotoCaption}
          onSetTags={setPhotoTags}
          onNext={() => router.push("/create")}
          onBack={() => router.push("/create")}
          petName={petDetails.petName}
          gender={petDetails.gender}
        />
      </div>
    </div>
  );
}
