"use client";

import { useMemorialContext } from "@/contexts/memorial-state-context";
import { StepDecisionSupport } from "@/components/wizard/step-decision-support";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function SupportPage() {
  const {
    petDetails,
    supportContext,
    setSupportContext,
    hydrated,
  } = useMemorialContext();
  const router = useRouter();

  // Route guard: pet name required
  useEffect(() => {
    if (hydrated && !petDetails.petName.trim()) {
      toast.error("Please enter your pet's name first.");
      router.replace("/create");
    }
  }, [hydrated, petDetails.petName, router]);

  if (!hydrated || !petDetails.petName.trim()) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  const resolvedSpecies =
    petDetails.species === "other"
      ? petDetails.customSpecies
      : petDetails.species;

  return (
    <div className="min-h-screen py-8 px-4 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/create")}
          className="mb-4 -ml-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-amber-50"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to workspace
        </Button>

        <StepDecisionSupport
          petName={petDetails.petName}
          species={resolvedSpecies}
          gender={petDetails.gender}
          supportContext={supportContext}
          onSetSupportContext={setSupportContext}
          onBack={() => router.push("/create")}
        />
      </div>
    </div>
  );
}
