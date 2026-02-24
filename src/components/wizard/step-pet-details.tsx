"use client";

import { useState, useRef, useCallback } from "react";
import type { PetDetails } from "@/hooks/use-memorial-state";
import { getPronouns } from "@/lib/pronouns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePlus, X } from "lucide-react";
import { ImageCropModal } from "@/components/image-crop-modal";

interface StepPetDetailsProps {
  data: PetDetails;
  onUpdate: (details: Partial<PetDetails>) => void;
  onSetHeroFile: (file: File | null) => void;
  onNext: () => void;
}

export function StepPetDetails({ data, onUpdate, onSetHeroFile, onNext }: StepPetDetailsProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleHeroUpload = useCallback(
    (file: File) => {
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, heroPhoto: "File too large (max 10MB)" }));
        return;
      }
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, heroPhoto: "Please select an image file" }));
        return;
      }

      setErrors((prev) => {
        const { heroPhoto: _, ...rest } = prev;
        return rest;
      });

      setCropSrc(URL.createObjectURL(file));
    },
    []
  );

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!data.petName.trim()) {
      newErrors.petName = "Please enter your pet's name";
    }
    if (
      data.birthDate &&
      data.deathDate &&
      new Date(data.deathDate) < new Date(data.birthDate)
    ) {
      newErrors.deathDate = "This date should be after the birth date";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-amber-50">
          Let&apos;s remember {data.petName ? data.petName : getPronouns(data.gender).object}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Tell us a little about your pet to get started.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="petName">Pet&apos;s name</Label>
          <Input
            id="petName"
            placeholder="Their name"
            value={data.petName}
            onChange={(e) => onUpdate({ petName: e.target.value })}
            autoFocus
            className="h-12 text-base"
          />
          {errors.petName && (
            <p className="text-sm text-red-500">{errors.petName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="species">Species</Label>
          <div className="flex gap-2">
            {["dog", "cat", "other"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onUpdate({ species: s })}
                className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium capitalize transition-colors ${
                  data.species === s
                    ? "border-amber-500 bg-amber-50 text-amber-700 dark:border-amber-500 dark:bg-amber-500/15 dark:text-amber-200"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-amber-800/30 dark:text-gray-400 dark:hover:border-amber-700/50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {data.species === "other" && (
            <Input
              placeholder="What kind of pet?"
              value={data.customSpecies}
              onChange={(e) => onUpdate({ customSpecies: e.target.value })}
              className="h-12 text-base mt-2"
            />
          )}
        </div>

        <div className="space-y-2">
          <Label>Gender (optional)</Label>
          <div className="flex gap-2">
            {([["male", "Boy"], ["female", "Girl"], ["neutral", "Other"]] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => onUpdate({ gender: data.gender === value ? undefined : value })}
                className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                  data.gender === value
                    ? "border-amber-500 bg-amber-50 text-amber-700 dark:border-amber-500 dark:bg-amber-500/15 dark:text-amber-200"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-amber-800/30 dark:text-gray-400 dark:hover:border-amber-700/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="birthDate">Born (optional)</Label>
            <Input
              id="birthDate"
              type="date"
              value={data.birthDate}
              onChange={(e) => onUpdate({ birthDate: e.target.value })}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deathDate">Passed (optional)</Label>
            <Input
              id="deathDate"
              type="date"
              value={data.deathDate}
              onChange={(e) => onUpdate({ deathDate: e.target.value })}
              className="h-12"
            />
            {errors.deathDate && (
              <p className="text-sm text-red-500">{errors.deathDate}</p>
            )}
          </div>
        </div>

        {/* Hero photo */}
        <div className="space-y-2">
          <Label>Primary photo</Label>
          {data.heroPhoto ? (
            <div className="relative w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.heroPhoto}
                alt={data.petName || "Pet photo"}
                className="w-full object-contain"
              />
              <button
                type="button"
                onClick={() => onSetHeroFile(null)}
                className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 hover:border-gray-300 transition-colors dark:border-amber-900/30 dark:bg-gray-900/40 dark:hover:border-amber-800/50"
            >
              <ImagePlus className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Add a favorite photo
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                This will be the main image on the memorial
              </p>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleHeroUpload(file);
              e.target.value = "";
            }}
            className="hidden"
          />
          {errors.heroPhoto && (
            <p className="text-sm text-red-500">{errors.heroPhoto}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-12 text-base bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-gray-900"
        disabled={!data.petName.trim()}
      >
        Continue
      </Button>
      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          open={!!cropSrc}
          onClose={() => {
            URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
          }}
          onCropComplete={(croppedFile) => {
            URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
            onSetHeroFile(croppedFile);
          }}
        />
      )}
    </form>
  );
}
