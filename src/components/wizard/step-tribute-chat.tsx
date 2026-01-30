"use client";

import { useState, useEffect, useRef } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { AuthModal } from "./auth-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PROMPTS = [
  (name: string) => `What was ${name}'s favorite thing to do?`,
  (name: string) => `What quirk or habit always made you laugh?`,
  (name: string) => `What's your favorite memory together?`,
  (name: string) => `What made ${name} one of a kind?`,
  (name: string) => `What's a small, everyday moment with ${name} you never want to forget?`,
];

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
  homepageMemory?: string;
  onAddMessage: (message: { role: "assistant" | "user"; content: string }) => void;
  onSetTribute: (tribute: string) => void;
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
  homepageMemory,
  onNext,
  onBack,
}: StepTributeChatProps) {
  const [needsAuth, setNeedsAuth] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check auth on mount
  useEffect(() => {
    const check = async () => {
      const supabase = createBrowserSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setNeedsAuth(!user);
      setAuthChecked(true);
    };
    check();
  }, []);

  // Send first prompt if no messages yet
  useEffect(() => {
    if (authChecked && !needsAuth && chatMessages.length === 0) {
      onAddMessage({
        role: "assistant",
        content: PROMPTS[0](petName || "your pet"),
      });
    }
  }, [authChecked, needsAuth, chatMessages.length, petName, onAddMessage]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const currentPromptIndex = Math.floor(chatMessages.length / 2);
  const allPromptsAnswered = currentPromptIndex >= PROMPTS.length;

  const sendNextPrompt = (nextIndex: number) => {
    if (nextIndex < PROMPTS.length) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        onAddMessage({
          role: "assistant",
          content: PROMPTS[nextIndex](petName || "your pet"),
        });
      }, 1500);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    onAddMessage({ role: "user", content: input.trim() });
    setInput("");
    sendNextPrompt(currentPromptIndex + 1);
  };

  const handleSkip = () => {
    onAddMessage({ role: "user", content: "(skipped)" });
    sendNextPrompt(currentPromptIndex + 1);
  };

  const handleGenerateTribute = async () => {
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
          chatHistory: [
            // Include homepage memory as context if available
            ...(homepageMemory ? [
              { role: "assistant" as const, content: "Tell me a memory about " + (petDetails.petName || "your pet") + "." },
              { role: "user" as const, content: homepageMemory },
            ] : []),
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
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
    <>
      <AuthModal
        open={needsAuth}
        onAuthenticated={() => setNeedsAuth(false)}
      />

      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">
            Tell us about {petName || "your pet"}
          </h1>
          <p className="text-gray-500">
            Answer a few questions and we&apos;ll write a tribute for you.
          </p>
        </div>

        {/* If tribute is already generated, show it */}
        {generatedTribute ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-3">
                Your Tribute
              </h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {generatedTribute}
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  onSetTribute("");
                  handleGenerateTribute();
                }}
                className="h-12 flex-1"
              >
                Regenerate
              </Button>
              <Button
                onClick={onNext}
                className="h-12 flex-1 bg-amber-600 hover:bg-amber-700"
              >
                Continue to Preview
              </Button>
            </div>
          </div>
        ) : (
          <>
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
              {isTyping && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-4 py-3 bg-gray-100 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input or generate button */}
            {allPromptsAnswered ? (
              <div className="space-y-3">
                <Button
                  onClick={handleGenerateTribute}
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
                  <p className="text-sm text-red-500 text-center">{error}</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your answer..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="h-12 text-base"
                    autoFocus
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="h-12 px-6 bg-amber-600 hover:bg-amber-700"
                  >
                    Send
                  </Button>
                </div>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-sm text-gray-400 hover:text-gray-500"
                >
                  Skip this question
                </button>
              </div>
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
      </div>
    </>
  );
}
