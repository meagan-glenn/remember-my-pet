"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Heart, CloudRain } from "lucide-react";
import { detectCrisisKeywords } from "@/lib/crisis-detection";
import {
  SUPPORT_PROMPTS,
  SUPPORT_CELEBRATE_PROMPTS,
} from "@/lib/tribute-prompts";
import type { SupportContextEntry } from "@/hooks/use-memorial-state";

const FIRST_CELEBRATE_QUESTION = (name: string) =>
  `I'd love to hear about ${name}. What was ${name}'s favorite thing to do?`;

interface StepTributeChatProps {
  petName: string;
  petDetails: {
    petName: string;
    species: string;
    customSpecies: string;
    birthDate: string;
    deathDate: string;
  };
  chatMessages: { role: "assistant" | "user"; content: string }[];
  generatedTribute: string;
  homepageConversation?: { role: "assistant" | "user"; content: string }[];
  tributeMode: "celebrate" | "support" | "";
  hasPassedTransition: boolean;
  supportContext: SupportContextEntry[];
  onAddMessage: (message: { role: "assistant" | "user"; content: string }) => void;
  onSetTribute: (tribute: string) => void;
  onSetTributeMode: (mode: "celebrate" | "support" | "") => void;
  onSetHasPassedTransition: (passed: boolean) => void;
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
  tributeMode,
  hasPassedTransition,
  supportContext,
  onSetTributeMode,
  onSetHasPassedTransition,
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
  const [switchConfirmOpen, setSwitchConfirmOpen] = useState(false);
  const [pendingSwitchMode, setPendingSwitchMode] = useState<"celebrate" | "support" | "">("");
  const [supportLoading, setSupportLoading] = useState(false);
  const [readyForTribute, setReadyForTribute] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [showRefinementInput, setShowRefinementInput] = useState(false);
  const [refinementFeedback, setRefinementFeedback] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const modeCardRef = useRef<HTMLButtonElement>(null);

  // Auth is deferred to save time — no gate here
  useEffect(() => {
    setAuthChecked(true);
  }, []);

  // Focus first mode card on mount
  useEffect(() => {
    if (authChecked && !tributeMode) {
      modeCardRef.current?.focus();
    }
  }, [authChecked, tributeMode]);

  // Send first prompt when mode is selected and no messages yet
  useEffect(() => {
    if (authChecked && tributeMode && chatMessages.length === 0) {
      if (tributeMode === "support") {
        onAddMessage({
          role: "assistant",
          content: SUPPORT_PROMPTS[0](petName || "your pet"),
        });
      } else {
        onAddMessage({
          role: "assistant",
          content: FIRST_CELEBRATE_QUESTION(petName || "your pet"),
        });
      }
    }
  }, [authChecked, tributeMode, chatMessages.length, petName, onAddMessage]);

  // Scroll to bottom on new messages (within container only, not the page)
  useEffect(() => {
    const el = messagesEndRef.current;
    if (el?.parentElement) {
      el.parentElement.scrollTop = el.parentElement.scrollHeight;
    }
  }, [chatMessages]);

  // Count user messages to determine progress
  const userMessages = chatMessages.filter((m) => m.role === "user");

  // For support mode, figure out the phase
  const supportUserMessages = userMessages.length;
  const supportPhaseComplete =
    tributeMode === "support" && !hasPassedTransition && supportUserMessages >= SUPPORT_PROMPTS.length;
  const showTransitionInterstitial =
    tributeMode === "support" && !hasPassedTransition && supportPhaseComplete && !isTyping;

  // For support→celebrate transition: still use hardcoded prompts
  const celebratePrompts = SUPPORT_CELEBRATE_PROMPTS;
  const celebrateOffset = SUPPORT_PROMPTS.length;
  const celebrateUserMessages = Math.max(0, supportUserMessages - celebrateOffset);

  // Overall prompt progress — celebrate mode uses AI-driven readyForTribute flag
  const allPromptsAnswered =
    tributeMode === "support"
      ? hasPassedTransition && celebrateUserMessages >= celebratePrompts.length
      : readyForTribute;

  const sendNextPrompt = (prompts: ((name: string) => string)[], nextIndex: number) => {
    if (nextIndex < prompts.length) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        onAddMessage({
          role: "assistant",
          content: prompts[nextIndex](petName || "your pet"),
        });
      }, 1500);
    }
  };

  const handleCelebrateChat = async (newUserMessage: string) => {
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
          chatHistory: history,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to get response");
      }

      const { reply, readyForTribute: ready } = await res.json();
      setIsTyping(false);
      onAddMessage({ role: "assistant", content: reply });
      if (ready) {
        setReadyForTribute(true);
      }
    } catch (err) {
      setIsTyping(false);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setChatLoading(false);
    }
  };

  const handleSupportReframing = async (concern: string) => {
    setSupportLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tribute/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petName: petDetails.petName,
          species:
            petDetails.species === "other"
              ? petDetails.customSpecies
              : petDetails.species,
          concern,
          priorContext: supportContext,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to get response");
      }

      const { reframing } = await res.json();

      // Store support context
      onSetSupportContext([...supportContext, { userConcern: concern, aiReframing: reframing }]);

      // Show reframing as assistant message
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        onAddMessage({ role: "assistant", content: reframing });

        // If there's another support prompt, send it after the reframing
        const nextSupportIndex = supportContext.length + 1;
        if (nextSupportIndex < SUPPORT_PROMPTS.length) {
          setTimeout(() => {
            setIsTyping(true);
            setTimeout(() => {
              setIsTyping(false);
              onAddMessage({
                role: "assistant",
                content: SUPPORT_PROMPTS[nextSupportIndex](petName || "your pet"),
              });
            }, 1500);
          }, 500);
        }
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSupportLoading(false);
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

    if (tributeMode === "support" && !hasPassedTransition) {
      // In support phase — trigger AI reframing
      handleSupportReframing(text);
    } else if (tributeMode === "support" && hasPassedTransition) {
      // Support mode celebrate phase — still uses hardcoded prompts
      const offset = SUPPORT_PROMPTS.length;
      const nextCelebrateMessages = userMessages.length + 1 - offset;
      sendNextPrompt(SUPPORT_CELEBRATE_PROMPTS, nextCelebrateMessages);
    } else {
      // Celebrate mode — AI-driven conversation
      handleCelebrateChat(text);
    }
  };

  const handleSkip = () => {
    onAddMessage({ role: "user", content: "(skipped)" });

    if (tributeMode === "support" && !hasPassedTransition) {
      // Skip support question — move on without reframing
      const nextSupportIndex = supportContext.length + 1;
      if (nextSupportIndex < SUPPORT_PROMPTS.length) {
        sendNextPrompt(SUPPORT_PROMPTS, nextSupportIndex);
      }
    } else if (tributeMode === "support" && hasPassedTransition) {
      const offset = SUPPORT_PROMPTS.length;
      const nextCelebrateMessages = userMessages.length + 1 - offset;
      sendNextPrompt(SUPPORT_CELEBRATE_PROMPTS, nextCelebrateMessages);
    } else {
      // Celebrate mode — ask AI for next question (skip counts as thin answer)
      handleCelebrateChat("(skipped)");
    }
  };

  const handleModeSelect = (mode: "celebrate" | "support") => {
    onSetTributeMode(mode);
  };

  const handleModeSwitch = (mode: "celebrate" | "support" | "") => {
    if (chatMessages.length >= 2) {
      setPendingSwitchMode(mode);
      setSwitchConfirmOpen(true);
    } else {
      onSetTributeMode(mode);
    }
  };

  const confirmModeSwitch = () => {
    onSetTributeMode(pendingSwitchMode);
    setSwitchConfirmOpen(false);
    setPendingSwitchMode("");
  };

  const handleTransitionContinue = () => {
    onSetHasPassedTransition(true);
    // Send first celebrate prompt
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      onAddMessage({
        role: "assistant",
        content: SUPPORT_CELEBRATE_PROMPTS[0](petName || "your pet"),
      });
    }, 1500);
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
          birthDate: petDetails.birthDate,
          deathDate: petDetails.deathDate,
          mode: tributeMode || "celebrate",
          supportContext: tributeMode === "support" ? supportContext : undefined,
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
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  const handleSkipToMemories = () => {
    setError("");
    onSetHasPassedTransition(true);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      onAddMessage({
        role: "assistant",
        content: SUPPORT_CELEBRATE_PROMPTS[0](petName || "your pet"),
      });
    }, 1500);
  };

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {/* Mode switch confirmation dialog */}
      <Dialog open={switchConfirmOpen} onOpenChange={setSwitchConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Switch modes?</DialogTitle>
            <DialogDescription>
              Switching modes will clear your current conversation. You&apos;ll
              start fresh.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSwitchConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmModeSwitch}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Switch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">
            {generatedTribute
              ? `${petName || "Your pet"}\u2019s Tribute`
              : !tributeMode
                ? `How would you like to remember ${petName || "your pet"}?`
                : `Tell us about ${petName || "your pet"}`}
          </h1>
          {!generatedTribute && tributeMode && (
            <p className="text-gray-500">
              {tributeMode === "support"
                ? "We\u2019re here to listen. Take your time."
                : "Share some memories and we\u2019ll write a tribute together."}
            </p>
          )}
          {generatedTribute && (
            <p className="text-gray-500">
              Review your tribute below, then continue to preview your memorial.
            </p>
          )}
        </div>

        {/* Mode selection */}
        {!tributeMode && (
          <div className="space-y-4">
            <button
              ref={modeCardRef}
              type="button"
              onClick={() => handleModeSelect("celebrate")}
              aria-label="Choose to celebrate your pet's life"
              className="w-full rounded-xl border-2 border-amber-200 bg-amber-50 p-5 text-left transition hover:border-amber-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-amber-100 p-2.5">
                  <Heart className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Celebrate their life
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Share happy memories and we&apos;ll write a tribute
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleModeSelect("support")}
              aria-label="Choose to explore feelings of guilt or what-ifs"
              className="w-full rounded-xl border-2 border-blue-200 bg-blue-50 p-5 text-left transition hover:border-blue-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-blue-100 p-2.5">
                  <CloudRain className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    I&apos;m struggling with guilt or what-ifs
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Talk through what&apos;s weighing on you first
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Active chat flow */}
        {tributeMode && !generatedTribute && (
          <>
            {/* Mode switch link */}
            {chatMessages.length > 0 && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() =>
                    handleModeSwitch(
                      tributeMode === "celebrate" ? "support" : "celebrate"
                    )
                  }
                  className="text-xs text-gray-400 hover:text-gray-500 underline"
                >
                  Switch to{" "}
                  {tributeMode === "celebrate"
                    ? "decision support"
                    : "celebration"}{" "}
                  mode
                </button>
              </div>
            )}

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
              {(isTyping || supportLoading || chatLoading) && (
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

            {/* Transition interstitial for support mode */}
            {showTransitionInterstitial && !hasPassedTransition && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center space-y-4">
                <p className="text-gray-700">
                  When you&apos;re ready, let&apos;s celebrate what made{" "}
                  <strong>{petName}</strong> special.
                </p>
                <Button
                  onClick={handleTransitionContinue}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Continue
                </Button>
              </div>
            )}

            {/* Error with recovery options (support mode) */}
            {error && tributeMode === "support" && !hasPassedTransition && (
              <div className="space-y-2 text-center">
                <p className="text-sm text-red-500">{error}</p>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setError("");
                      const lastUserMsg = [...chatMessages]
                        .reverse()
                        .find((m) => m.role === "user");
                      if (lastUserMsg) handleSupportReframing(lastUserMsg.content);
                    }}
                  >
                    Try again
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSkipToMemories}
                  >
                    Skip to memories
                  </Button>
                </div>
              </div>
            )}

            {/* Input or generate button */}
            {!showTransitionInterstitial && (
              <>
                {allPromptsAnswered ? (
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
                    {error && tributeMode !== "support" && (
                      <p className="text-sm text-red-500 text-center">
                        {error}
                      </p>
                    )}
                  </div>
                ) : (
                  !supportPhaseComplete && (
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
                          disabled={supportLoading || isTyping || chatLoading}
                        />
                        <Button
                          onClick={handleSend}
                          disabled={
                            !input.trim() || isTyping || supportLoading || chatLoading
                          }
                          className="h-12 px-6 bg-amber-600 hover:bg-amber-700"
                        >
                          Send
                        </Button>
                      </div>
                      <button
                        type="button"
                        onClick={handleSkip}
                        disabled={supportLoading || isTyping || chatLoading}
                        className="text-sm text-gray-400 hover:text-gray-500 disabled:opacity-50"
                      >
                        Skip this question
                      </button>
                    </div>
                  )
                )}
              </>
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
    </>
  );
}
