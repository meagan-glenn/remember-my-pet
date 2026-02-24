"use client";

import { useCallback, useRef, useState } from "react";
import type { WizardPhoto } from "@/hooks/use-memorial-state";
import { Button } from "@/components/ui/button";
import { X, Upload, ImagePlus } from "lucide-react";
import { EarlyAuthBanner } from "@/components/wizard/early-auth-banner";

/** Resize image to max 768px for caption generation (keeps payload under 1MB) */
function resizeForCaption(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 768;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        const scale = MAX / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("No canvas context")); return; }
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      resolve({ base64: dataUrl.split(",")[1], mimeType: "image/jpeg" });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => { URL.revokeObjectURL(img.src); reject(new Error("Image load failed")); };
    img.src = URL.createObjectURL(file);
  });
}

interface StepPhotoUploadProps {
  photos: WizardPhoto[];
  heroPhoto: string;
  onAddPhoto: (photo: WizardPhoto) => void;
  onRemovePhoto: (id: string) => void;
  onSetCaption?: (id: string, caption: string) => void;
  onSetTags?: (id: string, tags: string[]) => void;
  onNext?: () => void;
  onBack?: () => void;
  petName: string;
  gender?: "male" | "female" | "neutral";
}

const MAX_PHOTOS = 30;
const MAX_SIZE_MB = 10;
const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

export function StepPhotoUpload({
  photos,
  heroPhoto,
  onAddPhoto,
  onRemovePhoto,
  onSetCaption,
  onSetTags,
  onNext,
  onBack,
  petName,
  gender,
}: StepPhotoUploadProps) {
  const totalPhotos = photos.length + (heroPhoto ? 1 : 0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [captioning, setCaptioning] = useState<Set<string>>(new Set());

  const addLocalFile = useCallback(
    (file: File): void => {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`File too large (max ${MAX_SIZE_MB}MB)`);
        return;
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Unsupported file type. Use JPG, PNG, or WebP.");
        return;
      }

      const url = URL.createObjectURL(file);
      const id = crypto.randomUUID();
      onAddPhoto({ id, url, file, sortOrder: photos.length });

      // Auto-generate caption in background
      if (onSetCaption) {
        setCaptioning((prev) => new Set(prev).add(id));
        resizeForCaption(file)
          .then(({ base64, mimeType: resizedMime }) =>
            fetch("/api/caption", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                imageBase64: base64,
                mimeType: resizedMime,
                petName,
                gender,
              }),
            })
          )
          .then((res) => res.json())
          .then(({ caption, tags }) => {
            if (caption) onSetCaption(id, caption);
            if (tags?.length && onSetTags) onSetTags(id, tags);
          })
          .catch((err) => {
            console.warn("Caption generation failed:", err);
          })
          .finally(() =>
            setCaptioning((prev) => {
              const next = new Set(prev);
              next.delete(id);
              return next;
            })
          );
      }
    },
    [photos.length, onAddPhoto, onSetCaption, onSetTags, petName]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      setError("");
      const remaining = MAX_PHOTOS - photos.length;
      if (remaining <= 0) {
        setError(`You've reached the ${MAX_PHOTOS} photo limit.`);
        return;
      }
      const batch = Array.from(files).slice(0, remaining);
      if (files.length > remaining) {
        setError(`You can only add ${remaining} more photo${remaining === 1 ? "" : "s"} (${MAX_PHOTOS} max).`);
      }
      batch.forEach((file) => addLocalFile(file));
    },
    [addLocalFile, photos.length]
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
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-amber-50">
          {petName ? `${petName}'s best moments` : "Your pet's best moments"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          The ones that make you smile.
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
            ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
            : "border-gray-200 hover:border-gray-300 bg-gray-50 dark:border-amber-900/30 dark:hover:border-amber-800/50 dark:bg-gray-900/40"
        }`}
      >
        <ImagePlus className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-2" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Tap to add photos
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          or drag and drop on desktop
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      {/* Photo grid */}
      {photos.length > 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          {photos.length} {photos.length === 1 ? "photo" : "photos"} · {MAX_PHOTOS - photos.length} more available
        </p>
      )}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="space-y-1">
              <div className="relative aspect-square group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt=""
                  className="absolute inset-0 h-full w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemovePhoto(photo.id);
                  }}
                  className="absolute top-1 right-1 rounded-full bg-black/50 p-1.5 text-white opacity-60 hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {onSetCaption && (
                <textarea
                  rows={2}
                  placeholder={captioning.has(photo.id) ? "Generating caption..." : "Add a caption..."}
                  value={photo.caption || ""}
                  onChange={(e) => onSetCaption(photo.id, e.target.value)}
                  className={`w-full rounded-md border border-gray-200 dark:border-amber-900/30 px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 dark:bg-gray-900 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 dark:focus:border-amber-700/60 dark:focus:ring-amber-700/40 resize-none ${captioning.has(photo.id) ? "animate-pulse bg-amber-50 dark:bg-amber-950/30" : ""}`}
                  maxLength={200}
                />
              )}
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors dark:border-amber-900/30 dark:text-gray-500 dark:hover:border-amber-800/50 dark:hover:text-gray-400"
            >
              <Upload className="h-6 w-6" />
            </button>
          )}
        </div>
      )}

      {photos.length > 0 && (
        <EarlyAuthBanner petName={petName} />
      )}

      {(onBack || onNext) && (
        <div className="flex gap-3">
          {onBack && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="h-12 flex-1"
            >
              Back
            </Button>
          )}
          {onNext && (
            <Button
              type="button"
              onClick={onNext}

              className="h-12 flex-1 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-gray-900"
            >
              Continue
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
