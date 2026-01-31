"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Scissors } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemorialContext } from "@/contexts/memorial-state-context";
import { StepVideoUpload } from "@/components/wizard/step-video-upload";

export default function ReelPage() {
  const router = useRouter();
  const { videos, petDetails, addVideo, removeVideo, hydrated } = useMemorialContext();

  if (!hydrated) {
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

        <StepVideoUpload
          videos={videos}
          onAddVideo={addVideo}
          onRemoveVideo={removeVideo}
          petName={petDetails.petName}
        />

        {videos.length > 0 && (
          <div className="mt-6">
            <Button
              onClick={() => router.push("/create/reel/clips")}
              className="w-full h-12 text-base bg-amber-600 hover:bg-amber-700 gap-2"
            >
              <Scissors className="h-5 w-5" />
              Create Clips
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
