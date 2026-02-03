"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { detectCrisisKeywords } from "@/lib/crisis-detection";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { EarlyAuthBanner } from "@/components/wizard/early-auth-banner";
import type { SupportContextEntry } from "@/hooks/use-memorial-state";
import { getPronouns } from "@/lib/pronouns";

const OPENING_QUESTION = (name: string, gender?: "male" | "female" | "neutral") => {
  const { object } = getPronouns(gender);
  return `I'd love to hear about ${name}. What comes to mind first when you think of ${object}?`;
};

interface StepTributeChatProps {
  petName: string;
  petDetails: {
    petName: string;
    species: string;
    customSpecies: string;
    birthDate: string;
    deathDate: string;
    gender?: "male" | "female" | "neutral";
  };
  chatMessages: { role: "assistant" | "user"; content: string }[];
  generatedTribute: string;
  homepageConversation?: { role: "assistant" | "user"; content: string }[];
  supportContext: SupportContextEntry[];
  onAddMessage: (message: { role: "assistant" | "user"; content: string }) => void;
  onSetTribute: (tribute: string) => void;
  onSetSupportContext: (ctx: SupportContextEntry[]) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export function StepTributeChat({
  petName,
  petDetails,
  chatMessages,
  generatedTribute,
  onAddMessage,
  onSetTribute,
  homepageConversation,
  supportContext,
  onSetSupportContext,
  onNext,
  onBack,
}: StepTributeChatProps) {
  const [authChecked, setAuthChecked] = useState(false);
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [crisisBanner, setCrisisBanner] = useState(false);
  const [readyForTribute, setReadyForTribute] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [showSkipNote, setShowSkipNote] = useState(false);
  const [showRefinementInput, setShowRefinementInput] = useState(false);
  const [refinementFeedback, setRefinementFeedback] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auth is deferred to save time — no gate here
  useEffect(() => {
    setAuthChecked(true);
  }, []);

  // Send opening question on mount when no messages yet
  useEffect(() => {
    if (authChecked && chatMessages.length === 0) {
      onAddMessage({
        role: "assistant",
        content: OPENING_QUESTION(petName || "your pet", petDetails.gender),
      });
    }
  }, [authChecked, chatMessages.length, petName, onAddMessage]);

  // Scroll to bottom on new messages (within container only, not the page)
  useEffect(() => {
    const el = messagesEndRef.current;
    if (el?.parentElement) {
      el.parentElement.scrollTop = el.parentElement.scrollHeight;
    }
  }, [chatMessages]);

  const handleChat = async (newUserMessage: string) => {
    setChatLoading(true);
    setIsTyping(true);
    setError("");
    try {
      const history = [
        ...chatMessages,
        { role: "user" as const, content: newUserMessage },
      ];
      const res = await fetch("/api/tribute/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petName: petDetails.petName,
          species:
            petDetails.species === "other"
              ? petDetails.customSpecies
              : petDetails.species,
          gender: petDetails.gender,
          chatHistory: history,
          homepageConversation,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to get response");
      }

      const { reply, readyForTribute: ready, supportEntries } = await res.json();
      setIsTyping(false);
      onAddMessage({ role: "assistant", content: reply });
      if (ready) {
        setReadyForTribute(true);
      }
      // Accumulate any support context entries detected by the AI
      if (Array.isArray(supportEntries) && supportEntries.length > 0) {
        onSetSupportContext([...supportContext, ...supportEntries]);
      }
    } catch (err) {
      setIsTyping(false);
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.TRIBUTE_GENERATION_FAILED.message);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const text = input.trim();

    // Crisis detection on submit
    if (detectCrisisKeywords(text)) {
      setCrisisBanner(true);
    }

    onAddMessage({ role: "user", content: text });
    setInput("");
    handleChat(text);
  };

  const handleSkip = () => {
    if (!showSkipNote) setShowSkipNote(true);
    onAddMessage({ role: "user", content: "(skipped)" });
    handleChat("(skipped)");
  };

  const handleGenerateTribute = async (feedback?: string) => {
    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/tribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petName: petDetails.petName,
          species:
            petDetails.species === "other"
              ? petDetails.customSpecies
              : petDetails.species,
          gender: petDetails.gender,
          birthDate: petDetails.birthDate,
          deathDate: petDetails.deathDate,
          supportContext: supportContext.length > 0 ? supportContext : undefined,
          previousTribute: feedback ? generatedTribute : undefined,
          refinementFeedback: feedback || undefined,
          chatHistory: [
            ...(homepageConversation && homepageConversation.length > 0
              ? homepageConversation
              : []),
            ...chatMessages.filter((m) => m.content !== "(skipped)"),
          ],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate tribute");
      }

      const { tribute } = await res.json();
      onSetTribute(tribute);
      setShowRefinementInput(false);
      setRefinementFeedback("");
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.TRIBUTE_GENERATION_FAILED.message);
    } finally {
      setGenerating(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">
          {generatedTribute
            ? `${petName || "Your pet"}\u2019s Tribute`
            : `Tell us about ${petName || "your pet"}`}
        </h1>
        {!generatedTribute && (
          <p className="text-gray-500">
            Share some memories and we&apos;ll write a tribute together.
          </p>
        )}
        {generatedTribute && (
          <p className="text-gray-500">
            Review your tribute below, then continue to preview your memorial.
          </p>
        )}
      </div>

      {/* Active chat flow */}
      {!generatedTribute && (
        <>
          {/* Crisis banner */}
          {crisisBanner && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              <div className="flex items-start justify-between gap-2">
                <p>
                  If you&apos;re in crisis, please reach out:{" "}
                  <strong>988 Suicide &amp; Crisis Lifeline</strong> (call or
                  text 988)
                </p>
                <button
                  type="button"
                  onClick={() => setCrisisBanner(false)}
                  className="shrink-0 text-blue-400 hover:text-blue-600"
                  aria-label="Dismiss crisis resource banner"
                >
                  &times;
                </button>
              </div>
            </div>
          )}

          {/* Chat messages */}
          <div className="space-y-4 max-h-[400px] overflow-y-auto px-1">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 max-w-[85%] text-sm ${
                    msg.role === "user"
                      ? "bg-amber-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {(isTyping || chatLoading) && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-3 bg-gray-100 flex items-center gap-1">
                  <span
                    className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input or generate button */}
          {readyForTribute ? (
            <div className="space-y-3">
              <Button
                onClick={() => handleGenerateTribute()}
                disabled={generating}
                className="w-full h-12 bg-amber-600 hover:bg-amber-700"
              >
                {generating ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Writing your tribute...
                  </span>
                ) : (
                  "Generate Tribute"
                )}
              </Button>
              {error && (
                <p className="text-sm text-red-500 text-center">
                  {error}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <textarea
                  placeholder="Type your answer..."
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="flex-1 min-h-[48px] rounded-md border border-input bg-background px-3 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden"
                  rows={1}
                  autoFocus
                  disabled={isTyping || chatLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={
                    !input.trim() || isTyping || chatLoading
                  }
                  className="h-12 px-6 bg-amber-600 hover:bg-amber-700"
                >
                  Send
                </Button>
              </div>
              <button
                type="button"
                onClick={handleSkip}
                disabled={isTyping || chatLoading}
                className="text-sm text-gray-400 hover:text-gray-500 disabled:opacity-50"
              >
                Skip this question
              </button>
              {showSkipNote && (
                <p className="text-xs text-gray-400 text-center mt-1">
                  The more you share, the more personal your tribute will be — but skip anything that&apos;s too much right now.
                </p>
              )}
            </div>
          )}

          {/* Error display */}
          {error && !readyForTribute && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          {/* Back button */}
          {onBack && (
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="w-full text-gray-500"
            >
              Back
            </Button>
          )}
        </>
      )}

      {/* Generated tribute display */}
      {generatedTribute && (
        <div className="space-y-4">
          <div className="rounded-xl bg-white border border-amber-200 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">
              Your Tribute
            </h2>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {generatedTribute}
            </div>
          </div>
          <EarlyAuthBanner petName={petName} />
          {showRefinementInput && (
            <div className="space-y-3">
              <textarea
                value={refinementFeedback}
                onChange={(e) => setRefinementFeedback(e.target.value)}
                placeholder="What would you like to change? e.g. &quot;Remove the part about car rides&quot; or &quot;It says 'your' a few times — make it third person&quot;"
                className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                rows={3}
                maxLength={1000}
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRefinementInput(false);
                    setRefinementFeedback("");
                  }}
                  className="h-10 flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleGenerateTribute(refinementFeedback)}
                  disabled={generating || !refinementFeedback.trim()}
                  className="h-10 flex-1 bg-amber-600 hover:bg-amber-700"
                >
                  {generating ? "Rewriting…" : "Rewrite Tribute"}
                </Button>
              </div>
            </div>
          )}
          {!showRefinementInput && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowRefinementInput(true)}
                className="h-12 flex-1"
              >
                Revise
              </Button>
              <Button
                onClick={onNext}
                className="h-12 flex-1 bg-amber-600 hover:bg-amber-700"
              >
                Continue to Preview
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
