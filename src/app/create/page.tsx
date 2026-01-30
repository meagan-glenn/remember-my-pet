"use client";

import { useMemorialWizard } from "@/hooks/use-memorial-wizard";
import { StepIndicator } from "@/components/wizard/step-indicator";
import { StepPetDetails } from "@/components/wizard/step-pet-details";
import { StepPhotoUpload } from "@/components/wizard/step-photo-upload";
import { StepTributeChat } from "@/components/wizard/step-tribute-chat";
import { StepPreview } from "@/components/wizard/step-preview";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect } from "react";

function CreateMemorialInner() {
  const wizard = useMemorialWizard();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Resume from auth redirect (e.g. ?step=3)
  useEffect(() => {
    const step = searchParams.get("step");
    if (step && wizard.hydrated) {
      const stepNum = parseInt(step, 10);
      if (stepNum >= 1 && stepNum <= 4) {
        wizard.updateState({ currentStep: stepNum });
      }
    }
  }, [searchParams, wizard.hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!wizard.hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  const handleSave = useCallback(async () => {
    const res = await fetch("/api/memorial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        petName: wizard.petDetails.petName,
        species:
          wizard.petDetails.species === "other"
            ? wizard.petDetails.customSpecies
            : wizard.petDetails.species,
        birthDate: wizard.petDetails.birthDate || null,
        deathDate: wizard.petDetails.deathDate || null,
        tribute: wizard.generatedTribute,
        photoUrls: wizard.photos.map((p) => p.url),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to save memorial");
    }

    const { slug } = await res.json();
    wizard.reset();
    router.push(`/dashboard?created=${slug}`);
  }, [wizard.petDetails, wizard.generatedTribute, wizard.photos, wizard.reset, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-8 px-4">
      <div className="mx-auto max-w-lg">
        <StepIndicator currentStep={wizard.currentStep} />

        <AnimatePresence mode="wait">
          <motion.div
            key={wizard.currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {wizard.currentStep === 1 && (
              <StepPetDetails
                data={wizard.petDetails}
                onUpdate={wizard.updatePetDetails}
                onNext={wizard.nextStep}
              />
            )}

            {wizard.currentStep === 2 && (
              <StepPhotoUpload
                photos={wizard.photos}
                onAddPhoto={wizard.addPhoto}
                onRemovePhoto={wizard.removePhoto}
                onNext={wizard.nextStep}
                onBack={wizard.previousStep}
                petName={wizard.petDetails.petName}
              />
            )}

            {wizard.currentStep === 3 && (
              <StepTributeChat
                petName={wizard.petDetails.petName}
                petDetails={wizard.petDetails}
                chatMessages={wizard.chatMessages}
                generatedTribute={wizard.generatedTribute}
                onAddMessage={wizard.addChatMessage}
                onSetTribute={wizard.setTribute}
                onNext={wizard.nextStep}
                onBack={wizard.previousStep}
              />
            )}

            {wizard.currentStep === 4 && (
              <StepPreview
                petDetails={wizard.petDetails}
                photos={wizard.photos}
                tribute={wizard.generatedTribute}
                onUpdateTribute={wizard.setTribute}
                onSave={handleSave}
                onBack={wizard.previousStep}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function CreateMemorial() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        </div>
      }
    >
      <CreateMemorialInner />
    </Suspense>
  );
}
