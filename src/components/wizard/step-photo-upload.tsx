"use client";

import { useCallback, useRef, useState } from "react";
import type { WizardPhoto } from "@/hooks/use-memorial-wizard";
import { Button } from "@/components/ui/button";
import { X, Upload, ImagePlus } from "lucide-react";
import Image from "next/image";

interface StepPhotoUploadProps {
  photos: WizardPhoto[];
  onAddPhoto: (photo: WizardPhoto) => void;
  onRemovePhoto: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  petName: string;
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
  onAddPhoto,
  onRemovePhoto,
  onNext,
  onBack,
  petName,
}: StepPhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = useCallback(
    async (file: File): Promise<void> => {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`File too large (max ${MAX_SIZE_MB}MB)`);
        return;
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Unsupported file type. Use JPG, PNG, or WebP.");
        return;
      }

      setUploadingCount((c) => c + 1);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        const { url } = await res.json();
        onAddPhoto({
          id: crypto.randomUUID(),
          url,
          sortOrder: photos.length,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploadingCount((c) => c - 1);
      }
    },
    [photos.length, onAddPhoto]
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
      Promise.all(batch.map((file) => uploadFile(file)));
    },
    [uploadFile, photos.length]
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
        {uploadingCount > 0 ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            <p className="text-sm text-gray-500">Uploading...</p>
          </div>
        ) : (
          <>
            <ImagePlus className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-700">
              Tap to add photos
            </p>
            <p className="text-xs text-gray-400 mt-1">
              or drag and drop on desktop
            </p>
          </>
        )}
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
            <div key={photo.id} className="relative aspect-square group">
              <Image
                src={photo.url}
                alt=""
                fill
                sizes="(max-width: 640px) 33vw, 150px"
                className="rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemovePhoto(photo.id);
                }}
                className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
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

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="h-12 flex-1"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={photos.length === 0}
          className="h-12 flex-1 bg-amber-600 hover:bg-amber-700"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
