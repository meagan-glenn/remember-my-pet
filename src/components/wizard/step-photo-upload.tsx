"use client";

import { useCallback, useRef, useState } from "react";
import type { WizardPhoto } from "@/hooks/use-memorial-state";
import { Button } from "@/components/ui/button";
import { X, Upload, ImagePlus } from "lucide-react";
import { EarlyAuthBanner } from "@/components/wizard/early-auth-banner";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
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

const MAX_PHOTOS = 20;
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
        fileToBase64(file)
          .then((base64) =>
            fetch("/api/caption", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                imageBase64: base64,
                mimeType: file.type,
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
          .catch(() => {})
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
      const batch = Array.from(files).slice(0, remaining);
      if (files.length > remaining) {
        setError(`Only ${remaining} more photo(s) allowed`);
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
        <h1 className="text-2xl font-semibold text-gray-900">
          Photos of {petName || "your pet"}
        </h1>
        <p className="text-gray-500">
          Share your favorite photos. You can add up to {MAX_PHOTOS}.
        </p>
        {totalPhotos < 5 && (
          <p className="text-sm text-gray-500">
            The more photos you add, the richer {petName || "your pet"}&apos;s gallery will be.
          </p>
        )}
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
        <ImagePlus className="h-10 w-10 text-gray-400 mb-2" />
        <p className="text-sm font-medium text-gray-700">
          Tap to add photos
        </p>
        <p className="text-xs text-gray-400 mt-1">
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
                <input
                  type="text"
                  placeholder={captioning.has(photo.id) ? "Generating caption..." : "Add a caption..."}
                  value={photo.caption || ""}
                  onChange={(e) => onSetCaption(photo.id, e.target.value)}
                  className={`w-full rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 ${captioning.has(photo.id) ? "animate-pulse bg-amber-50" : ""}`}
                  maxLength={200}
                />
              )}
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors"
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

              className="h-12 flex-1 bg-amber-600 hover:bg-amber-700"
            >
              Continue
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
