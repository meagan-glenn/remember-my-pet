"use client";

import { useState } from "react";
import type { PetDetails, WizardPhoto } from "@/hooks/use-memorial-wizard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Check } from "lucide-react";
import Image from "next/image";

interface StepPreviewProps {
  petDetails: PetDetails;
  photos: WizardPhoto[];
  tribute: string;
  onUpdateTribute: (tribute: string) => void;
  onSave: () => Promise<void>;
  onBack: () => void;
}

export function StepPreview({
  petDetails,
  photos,
  tribute,
  onUpdateTribute,
  onSave,
  onBack,
}: StepPreviewProps) {
  const [editingTribute, setEditingTribute] = useState(false);
  const [editedTribute, setEditedTribute] = useState(tribute);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const heroPhoto = photos[0];
  const species =
    petDetails.species === "other"
      ? petDetails.customSpecies
      : petDetails.species;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSaveTribute = () => {
    onUpdateTribute(editedTribute);
    setEditingTribute(false);
  };

  const handleSaveMemorial = async () => {
    setSaving(true);
    setError("");
    try {
      await onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">
          Preview your tribute
        </h1>
        <p className="text-gray-500">
          Here&apos;s how your memorial will look. You can edit anything before
          saving.
        </p>
      </div>

      {/* Memorial preview card */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {/* Hero image */}
        {heroPhoto && (
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <Image
              src={heroPhoto.url}
              alt={petDetails.petName}
              fill
              sizes="(max-width: 640px) 100vw, 512px"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="p-6 space-y-4">
          {/* Pet info */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {petDetails.petName}
            </h2>
            {species && (
              <p className="text-gray-500 capitalize mt-1">{species}</p>
            )}
            {(petDetails.birthDate || petDetails.deathDate) && (
              <p className="text-sm text-gray-400 mt-1">
                {petDetails.birthDate && formatDate(petDetails.birthDate)}
                {petDetails.birthDate && petDetails.deathDate && " — "}
                {petDetails.deathDate && formatDate(petDetails.deathDate)}
              </p>
            )}
          </div>

          {/* Tribute text */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Tribute
              </h3>
              <button
                type="button"
                onClick={() => {
                  if (editingTribute) {
                    handleSaveTribute();
                  } else {
                    setEditingTribute(true);
                  }
                }}
                className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700"
              >
                {editingTribute ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Done
                  </>
                ) : (
                  <>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </>
                )}
              </button>
            </div>

            {editingTribute ? (
              <Textarea
                value={editedTribute}
                onChange={(e) => setEditedTribute(e.target.value)}
                rows={10}
                className="text-base leading-relaxed"
              />
            ) : (
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {tribute}
              </p>
            )}
          </div>

          {/* Photo gallery */}
          {photos.length > 1 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Photos
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {photos.slice(1).map((photo) => (
                  <div
                    key={photo.id}
                    className="relative aspect-square rounded-lg overflow-hidden"
                  >
                    <Image
                      src={photo.url}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 33vw, 150px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-sm text-gray-400">
        Your memorial will be private until you choose to share it.
      </p>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

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
          onClick={handleSaveMemorial}
          disabled={saving}
          className="h-12 flex-1 bg-amber-600 hover:bg-amber-700"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving...
            </span>
          ) : (
            "Save Memorial"
          )}
        </Button>
      </div>
    </div>
  );
}
