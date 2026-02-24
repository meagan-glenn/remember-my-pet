"use client";

import { useState, useRef, useCallback } from "react";
import type { PetDetails, WizardPhoto } from "@/hooks/use-memorial-state";
import { getPronouns } from "@/lib/pronouns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Check, GripVertical, PawPrint, Move } from "lucide-react";
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
        <p className="text-sm text-gray-500 dark:text-gray-400 italic px-1">{photo.caption}</p>
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
  heroPhotoCropY?: number;
  onUpdateCropY?: (y: number) => void;
  showInFeed?: boolean;
  onShowInFeedChange?: (value: boolean) => void;
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
  heroPhotoCropY = 50,
  onUpdateCropY,
  showInFeed = false,
  onShowInFeedChange,
}: StepPreviewProps) {
  const [editingTribute, setEditingTribute] = useState(false);
  const [editedTribute, setEditedTribute] = useState(tribute);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [repositioning, setRepositioning] = useState(false);
  const [cropY, setCropY] = useState(heroPhotoCropY);
  const dragRef = useRef<{ startY: number; startCropY: number } | null>(null);
  const heroContainerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!repositioning) return;
      e.preventDefault();
      dragRef.current = { startY: e.clientY, startCropY: cropY };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [repositioning, cropY]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current || !heroContainerRef.current) return;
      const containerHeight = heroContainerRef.current.clientHeight;
      const deltaPixels = e.clientY - dragRef.current.startY;
      // Moving pointer down means we want to see higher in the image (lower cropY)
      const deltaPct = (deltaPixels / containerHeight) * 100;
      const newY = Math.min(100, Math.max(0, dragRef.current.startCropY - deltaPct));
      setCropY(newY);
    },
    []
  );

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

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
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const birthFormatted = formatDate(petDetails.birthDate);
  const deathFormatted = formatDate(petDetails.deathDate);
  const pronouns = getPronouns(petDetails.gender);

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
    <div className="bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
      {/* Header */}
      <div className="text-center space-y-2 pt-8 pb-4 px-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-amber-50">
          Preview your memorial
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Here&apos;s how your memorial will look. You can edit anything before
          saving.
        </p>
      </div>

      {/* Hero Section */}
      <section className="relative">
        {heroPhoto ? (
          <div
            ref={heroContainerRef}
            className={`relative h-[45vh] min-h-[320px] max-h-[650px] w-full sm:h-[55vh] ${repositioning ? "cursor-grab active:cursor-grabbing" : ""}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroPhoto}
              alt={petDetails.petName}
              className="absolute inset-0 h-full w-full object-cover select-none"
              style={{ objectPosition: `center ${cropY}%` }}
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            {/* Reposition button */}
            {onUpdateCropY && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (repositioning) {
                    onUpdateCropY(cropY);
                    setRepositioning(false);
                  } else {
                    setRepositioning(true);
                  }
                }}
                className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-sm text-white backdrop-blur-sm hover:bg-black/70 transition-colors"
              >
                {repositioning ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Done
                  </>
                ) : (
                  <>
                    <Move className="h-3.5 w-3.5" /> Reposition
                  </>
                )}
              </button>
            )}
            {repositioning && (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="inline-block rounded-full bg-black/50 px-4 py-2 text-sm text-white backdrop-blur-sm">
                  Drag up or down to reposition
                </p>
              </div>
            )}
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
          <div className="flex h-[40vh] min-h-[280px] w-full flex-col items-center justify-center bg-gradient-to-b from-amber-100 to-amber-50 dark:from-gray-900 dark:to-gray-950">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-200/60 dark:bg-amber-900/30">
              <PawPrint className="h-10 w-10 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="font-serif text-4xl font-medium tracking-tight text-gray-900 dark:text-amber-50 sm:text-5xl">
              {petDetails.petName}
            </h2>
            {(birthFormatted || deathFormatted) && (
              <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">
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

      {/* Wall intro */}
      <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <p className="mb-6 text-center text-sm text-gray-400 dark:text-gray-500 italic">
          {petDetails.petName}&apos;s life, through the eyes of those who loved {pronouns.object}
        </p>
      </section>

      {/* Tribute + Side Photos */}
      <section className="mx-auto max-w-6xl px-4 pb-3 sm:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-stretch md:gap-4">
          <div className="flex-1 rounded-2xl border-l-4 border-l-amber-700 border border-amber-100 bg-amber-50/50 p-6 shadow-sm backdrop-blur-sm dark:border-amber-900/30 dark:border-l-amber-600 dark:bg-gray-900/40 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-2xl font-medium text-gray-900 dark:text-amber-50">
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
                className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
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
              <div className="whitespace-pre-line text-base leading-relaxed text-gray-700 dark:text-gray-300">
                {tribute}
              </div>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 italic">
                No tribute yet. Click Edit to add one.
              </p>
            )}
          </div>
          {photos.length > 0 && (
            <div className="flex gap-3 md:w-80 md:shrink-0 md:flex-col">
              {photos.slice(0, 2).map((photo) => (
                <div key={photo.id} className="overflow-hidden rounded-2xl border border-amber-100 bg-white/80 shadow-sm dark:border-amber-900/30 dark:bg-gray-900/40">
                  <div className="relative aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={photo.caption || petDetails.petName}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                  {photo.caption && (
                    <p className="px-3 py-2 text-xs italic text-gray-500 dark:text-gray-400">{photo.caption}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Photo Gallery (remaining photos after side photos) */}
      {photos.length > 2 && (
        <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={photos.slice(2).map((p) => p.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {photos.slice(2).map((photo) => (
                  <SortablePhoto key={photo.id} photo={photo} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">drag to reorder</p>
        </section>
      )}

      {/* Actions */}
      <div className="mx-auto max-w-md px-4 pt-8 pb-12 sm:px-6 space-y-4">
        {error && <p className="text-sm text-red-500 dark:text-red-400 text-center">{error}</p>}

        {/* Feed opt-in */}
        {onShowInFeedChange && (
          <label className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/50 p-4 cursor-pointer dark:border-amber-900/30 dark:bg-gray-900/40">
            <input
              type="checkbox"
              checked={showInFeed}
              onChange={(e) => onShowInFeedChange(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-800"
            />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Share on our community feed
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Let others light a candle for {petDetails.petName}. You can change this anytime.
              </p>
            </div>
          </label>
        )}

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
            className="h-12 flex-1 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-gray-900"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Publishing...
              </span>
            ) : (
              "Publish Memorial"
            )}
          </Button>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          Your memorial will be visible at its own page. You can change feed visibility anytime from your dashboard.
        </p>
      </div>
    </div>
  );
}
