"use client";

import { useMemorialContext } from "@/contexts/memorial-state-context";
import { StepTributeChat } from "@/components/wizard/step-tribute-chat";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function TributePage() {
  const {
    petDetails,
    chatMessages,
    generatedTribute,
    homepageConversation,
    tributeMode,
    hasPassedTransition,
    supportContext,
    addChatMessage,
    setTribute,
    setTributeMode,
    setHasPassedTransition,
    setSupportContext,
    hydrated,
  } = useMemorialContext();
  const router = useRouter();

  // Route guard: pet name required for tribute generation
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

  return (
    <div className="py-8 px-4">
      <div className="mx-auto max-w-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/create")}
          className="mb-4 -ml-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to workspace
        </Button>

        <StepTributeChat
          petName={petDetails.petName}
          petDetails={petDetails}
          chatMessages={chatMessages}
          generatedTribute={generatedTribute}
          homepageConversation={homepageConversation}
          tributeMode={tributeMode}
          hasPassedTransition={hasPassedTransition}
          supportContext={supportContext}
          onAddMessage={addChatMessage}
          onSetTribute={setTribute}
          onSetTributeMode={setTributeMode}
          onSetHasPassedTransition={setHasPassedTransition}
          onSetSupportContext={setSupportContext}
          onNext={() => router.push("/create/preview")}
          onBack={() => router.push("/create")}
        />
      </div>
    </div>
  );
}
