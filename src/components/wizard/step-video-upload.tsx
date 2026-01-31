"use client";

import { useCallback, useRef, useState } from "react";
import type { WizardVideo } from "@/hooks/use-memorial-state";
import { Button } from "@/components/ui/button";
import { X, Upload, Film, Play } from "lucide-react";

interface StepVideoUploadProps {
  videos: WizardVideo[];
  onAddVideo: (video: WizardVideo & { file?: File }) => void;
  onRemoveVideo: (id: string) => void;
  petName: string;
}

const MAX_VIDEOS = 10;
const MAX_SIZE_MB = 100;
const ACCEPTED_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
];

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Extract duration and a first-frame thumbnail from a video File */
function extractVideoMeta(file: File): Promise<{ duration: number; thumbnailUrl: string }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const url = URL.createObjectURL(file);
    video.src = url;

    video.onloadeddata = () => {
      // Seek to 0.5s or 0 for thumbnail
      video.currentTime = Math.min(0.5, video.duration);
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (!blob) {
          resolve({ duration: video.duration, thumbnailUrl: "" });
          return;
        }
        resolve({
          duration: video.duration,
          thumbnailUrl: URL.createObjectURL(blob),
        });
      }, "image/jpeg", 0.7);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load video"));
    };
  });
}

export function StepVideoUpload({
  videos,
  onAddVideo,
  onRemoveVideo,
  petName,
}: StepVideoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const addLocalFile = useCallback(
    async (file: File) => {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`File too large (max ${MAX_SIZE_MB}MB)`);
        return;
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Unsupported file type. Use MP4, MOV, or WebM.");
        return;
      }

      setProcessing(true);
      try {
        const { duration, thumbnailUrl } = await extractVideoMeta(file);
        const url = URL.createObjectURL(file);
        onAddVideo({
          id: crypto.randomUUID(),
          url,
          file,
          filename: file.name,
          durationSeconds: duration,
          thumbnailUrl,
          sortOrder: videos.length,
        });
      } catch {
        setError("Could not process video. Try a different file.");
      } finally {
        setProcessing(false);
      }
    },
    [videos.length, onAddVideo]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      setError("");
      const remaining = MAX_VIDEOS - videos.length;
      const batch = Array.from(files).slice(0, remaining);
      if (files.length > remaining) {
        setError(`Only ${remaining} more video(s) allowed`);
      }
      batch.forEach((file) => addLocalFile(file));
    },
    [addLocalFile, videos.length]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">
          Videos of {petName || "your pet"}
        </h1>
        <p className="text-gray-500">
          Upload videos to create a compilation reel. Up to {MAX_VIDEOS} videos, {MAX_SIZE_MB}MB each.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors ${
          dragOver
            ? "border-amber-500 bg-amber-50"
            : "border-gray-200 hover:border-gray-300 bg-gray-50"
        }`}
      >
        <Film className="h-10 w-10 text-gray-400 mb-2" />
        <p className="text-sm font-medium text-gray-700">
          {processing ? "Processing video..." : "Tap to add videos"}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          MP4, MOV, or WebM
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          multiple
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
        />
      </div>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      {/* Video grid */}
      {videos.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {videos.map((video) => (
            <div key={video.id} className="relative group">
              {playingId === video.id ? (
                <div className="aspect-video rounded-lg overflow-hidden bg-black">
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <video
                    src={video.url}
                    controls
                    autoPlay
                    playsInline
                    className="h-full w-full"
                    onEnded={() => setPlayingId(null)}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPlayingId(video.id)}
                  className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-100"
                >
                  {video.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={video.thumbnailUrl}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Film className="h-8 w-8 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-black/50 p-2">
                      <Play className="h-5 w-5 text-white" fill="white" />
                    </div>
                  </div>
                  {video.durationSeconds != null && (
                    <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
                      {formatDuration(video.durationSeconds)}
                    </span>
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveVideo(video.id);
                }}
                className="absolute top-1.5 right-1.5 rounded-full bg-black/50 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="mt-1 text-xs text-gray-500 truncate">{video.filename}</p>
            </div>
          ))}
          {videos.length < MAX_VIDEOS && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors"
            >
              <Upload className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
