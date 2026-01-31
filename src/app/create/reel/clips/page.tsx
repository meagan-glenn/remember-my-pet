"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMemorialContext } from "@/contexts/memorial-state-context";
import { VideoClipper } from "@/components/video/video-clipper";
import { ClipList } from "@/components/video/clip-list";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Film, Clapperboard } from "lucide-react";
import type { VideoClip } from "@/hooks/use-memorial-state";

export default function ClipsPage() {
  const router = useRouter();
  const {
    videos,
    videoClips,
    addClip,
    updateClip,
    removeClip,
    reorderClips,
    hydrated,
  } = useMemorialContext();

  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [editingClip, setEditingClip] = useState<VideoClip | null>(null);

  const selectedVideo = videos.find((v) => v.id === selectedVideoId);

  const handleSaveClip = useCallback(
    (clip: VideoClip) => {
      // Check if we're editing an existing clip
      const existing = videoClips.find((c) => c.id === clip.id);
      if (existing) {
        updateClip(clip.id, clip);
      } else {
        addClip({ ...clip, sortOrder: videoClips.length });
      }
      setEditingClip(null);
    },
    [videoClips, addClip, updateClip]
  );

  const handleEditClip = useCallback(
    (clip: VideoClip) => {
      setSelectedVideoId(clip.videoId);
      setEditingClip(clip);
    },
    []
  );

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (videos.length === 0) {
    router.push("/create/reel");
    return null;
  }

  const totalClipDuration = videoClips.reduce(
    (sum, c) => sum + (c.endTime - c.startTime),
    0
  );

  return (
    <div className="py-8 px-4 pb-28">
      <div className="mx-auto max-w-lg space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/create/reel")}
          className="mb-2 -ml-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to videos
        </Button>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">Create Clips</h1>
          <p className="text-gray-500">
            Select a video, mark the moments you want to keep, then arrange them.
          </p>
        </div>

        {/* Video selection */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Select a video</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {videos.map((video) => (
              <button
                key={video.id}
                type="button"
                onClick={() => {
                  setSelectedVideoId(video.id);
                  setEditingClip(null);
                }}
                className={`flex-shrink-0 w-28 rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedVideoId === video.id
                    ? "border-amber-500"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="aspect-video bg-gray-100 relative">
                  {video.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={video.thumbnailUrl}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Film className="h-6 w-6 text-gray-300" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-600 truncate px-1.5 py-1">
                  {video.filename}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Clipper */}
        {selectedVideo && (
          <VideoClipper
            video={selectedVideo}
            onSaveClip={handleSaveClip}
            editingClip={editingClip}
          />
        )}

        {/* Clip list */}
        <ClipList
          clips={videoClips}
          videos={videos}
          onReorder={reorderClips}
          onRemove={removeClip}
          onEdit={handleEditClip}
        />
      </div>

      {/* Compile bar */}
      {videoClips.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white/95 backdrop-blur-sm px-4 py-4">
          <div className="mx-auto max-w-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">
                {videoClips.length} clip{videoClips.length !== 1 ? "s" : ""}
              </span>
              <span className="text-sm text-gray-500">
                ~{Math.round(totalClipDuration)}s total
              </span>
            </div>
            <Button
              onClick={() => router.push("/create/reel/compile")}
              className="w-full h-12 text-base bg-amber-600 hover:bg-amber-700 gap-2"
            >
              <Clapperboard className="h-5 w-5" />
              Compile Video
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
