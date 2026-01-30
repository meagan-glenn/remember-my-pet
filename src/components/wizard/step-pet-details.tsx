"use client";

import { useState } from "react";
import type { PetDetails } from "@/hooks/use-memorial-wizard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StepPetDetailsProps {
  data: PetDetails;
  onUpdate: (details: Partial<PetDetails>) => void;
  onNext: () => void;
}

export function StepPetDetails({ data, onUpdate, onNext }: StepPetDetailsProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        <h1 className="text-2xl font-semibold text-gray-900">
          Let&apos;s remember them
        </h1>
        <p className="text-gray-500">
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
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
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
      </div>

      <Button
        type="submit"
        className="w-full h-12 text-base bg-amber-600 hover:bg-amber-700"
        disabled={!data.petName.trim()}
      >
        Continue
      </Button>
    </form>
  );
}
