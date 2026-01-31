"use client";

import { useState } from "react";
import type { PetDetails, WizardPhoto } from "@/hooks/use-memorial-state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Check, GripVertical, PawPrint } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortablePhoto({ photo }: { photo: WizardPhoto }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-2">
      <div className="relative aspect-square overflow-hidden rounded-xl group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt={photo.caption || ""}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
        </button>
      </div>
      {photo.caption && (
        <p className="text-sm text-gray-500 italic px-1">{photo.caption}</p>
      )}
    </div>
  );
}

interface StepPreviewProps {
  petDetails: PetDetails;
  photos: WizardPhoto[];
  heroPhoto: string;
  tribute: string;
  onUpdateTribute: (tribute: string) => void;
  onReorderPhotos: (photos: WizardPhoto[]) => void;
  onSave: () => Promise<void>;
  onBack?: () => void;
}

export function StepPreview({
  petDetails,
  photos,
  heroPhoto,
  tribute,
  onUpdateTribute,
  onReorderPhotos,
  onSave,
  onBack,
}: StepPreviewProps) {
  const [editingTribute, setEditingTribute] = useState(false);
  const [editedTribute, setEditedTribute] = useState(tribute);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = photos.findIndex((p) => p.id === active.id);
    const newIndex = photos.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...photos];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    onReorderPhotos(reordered.map((p, i) => ({ ...p, sortOrder: i })));
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const birthFormatted = formatDate(petDetails.birthDate);
  const deathFormatted = formatDate(petDetails.deathDate);

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
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-white">
      {/* Header */}
      <div className="text-center space-y-2 pt-8 pb-4 px-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Preview your tribute
        </h1>
        <p className="text-gray-500">
          Here&apos;s how your memorial will look. You can edit anything before
          saving.
        </p>
      </div>

      {/* Hero Section */}
      <section className="relative">
        {heroPhoto ? (
          <div className="relative h-[50vh] min-h-[320px] max-h-[500px] w-full sm:h-[60vh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroPhoto}
              alt={petDetails.petName}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10">
              <h2 className="font-serif text-4xl font-medium tracking-tight sm:text-5xl">
                {petDetails.petName}
              </h2>
              {(birthFormatted || deathFormatted) && (
                <p className="mt-2 text-lg text-white/80">
                  {birthFormatted && deathFormatted
                    ? `${birthFormatted} — ${deathFormatted}`
                    : deathFormatted
                      ? `Passed ${deathFormatted}`
                      : `Born ${birthFormatted}`}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-[40vh] min-h-[280px] w-full flex-col items-center justify-center bg-gradient-to-b from-amber-100 to-amber-50">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-200/60">
              <PawPrint className="h-10 w-10 text-amber-600" />
            </div>
            <h2 className="font-serif text-4xl font-medium tracking-tight text-gray-900 sm:text-5xl">
              {petDetails.petName}
            </h2>
            {(birthFormatted || deathFormatted) && (
              <p className="mt-3 text-lg text-gray-500">
                {birthFormatted && deathFormatted
                  ? `${birthFormatted} — ${deathFormatted}`
                  : deathFormatted
                    ? `Passed ${deathFormatted}`
                    : `Born ${birthFormatted}`}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Tribute */}
      <section className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-amber-100 bg-white/80 p-6 shadow-sm backdrop-blur-sm sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-2xl font-medium text-gray-900">
              A Tribute
            </h2>
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
          ) : tribute ? (
            <div className="whitespace-pre-line text-base leading-relaxed text-gray-700">
              {tribute}
            </div>
          ) : (
            <p className="text-gray-400 italic">
              No tribute yet. Click Edit to add one.
            </p>
          )}
        </div>
      </section>

      {/* Photo Gallery */}
      {photos.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
          <div className="flex items-baseline gap-3 mb-6">
            <h2 className="font-serif text-2xl font-medium text-gray-900">
              Photos
            </h2>
            <span className="text-sm text-gray-400">drag to reorder</span>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={photos.map((p) => p.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {photos.map((photo) => (
                  <SortablePhoto key={photo.id} photo={photo} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </section>
      )}

      {/* Actions */}
      <div className="mx-auto max-w-2xl px-4 pb-12 sm:px-6 space-y-4">
        <p className="text-center text-sm text-gray-400">
          Your memorial will be private until you choose to share it.
        </p>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

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
    </div>
  );
}
