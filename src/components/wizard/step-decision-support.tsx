"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { detectCrisisKeywords } from "@/lib/crisis-detection";
import { ArrowRight } from "lucide-react";
import type { SupportContextEntry } from "@/hooks/use-memorial-state";

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"
          style={{ animationDelay: `${i * 200}ms` }}
        />
      ))}
    </div>
  );
}

interface StepDecisionSupportProps {
  petName: string;
  species?: string;
  gender?: "male" | "female" | "neutral";
  supportContext: SupportContextEntry[];
  onSetSupportContext: (ctx: SupportContextEntry[]) => void;
  onBack?: () => void;
  onReadyToCreate?: () => void;
}

export function StepDecisionSupport({
  petName,
  species,
  gender,
  supportContext,
  onSetSupportContext,
  onBack,
  onReadyToCreate,
}: StepDecisionSupportProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [crisisBanner, setCrisisBanner] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when exchanges change or loading starts
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [supportContext, loading]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const concern = input.trim();
      if (!concern || loading) return;

      // Crisis detection
      if (detectCrisisKeywords(concern)) {
        setCrisisBanner(true);
      }

      setInput("");
      setError("");
      setRateLimited(false);
      setLoading(true);

      try {
        const res = await fetch("/api/tribute/support", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            petName,
            species: species || undefined,
            gender: gender || undefined,
            concern,
            priorContext: supportContext,
          }),
        });

        if (res.status === 429) {
          setRateLimited(true);
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to get response");
        }

        const { reframing } = await res.json();
        onSetSupportContext([
          ...supportContext,
          { userConcern: concern, aiReframing: reframing },
        ]);
      } catch {
        setError("Something went wrong. Your thoughts are safe — try again in a moment.");
      } finally {
        setLoading(false);
      }
    },
    [input, loading, petName, species, gender, supportContext, onSetSupportContext]
  );

  const hasExchanges = supportContext.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="font-serif text-2xl font-medium text-gray-900 dark:text-amber-50">
          You don&apos;t have to be ready yet
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          If something about {petName} is weighing on you, say it here first.
        </p>
      </div>

      {/* Crisis banner */}
      {crisisBanner && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-800/40 dark:bg-blue-950/30 dark:text-blue-200">
          <div className="flex items-start justify-between gap-2">
            <p>
              If you&apos;re in crisis, please reach out:{" "}
              <strong>988 Suicide &amp; Crisis Lifeline</strong> (call or text
              988)
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

      {/* Conversation history */}
      {hasExchanges && (
        <div
          ref={scrollRef}
          className="space-y-4 max-h-[400px] overflow-y-auto px-1"
        >
          {supportContext.map((entry, i) => (
            <div key={i} className="space-y-3">
              {/* User concern */}
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-100">
                  {entry.userConcern}
                </div>
              </div>
              {/* AI reframing */}
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-amber-50/80 text-gray-700 dark:bg-amber-950/30 dark:text-amber-100/80">
                  {entry.aiReframing}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-amber-50/80 dark:bg-amber-950/30">
                <TypingIndicator />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading indicator when no exchanges yet */}
      {!hasExchanges && loading && (
        <div className="flex justify-start px-1">
          <div className="rounded-2xl bg-amber-50/80 dark:bg-amber-950/30">
            <TypingIndicator />
          </div>
        </div>
      )}

      {/* Rate limit message */}
      {rateLimited && (
        <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600 text-center">
          Let&apos;s take a moment. You can share more in a minute.
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      {/* Input area */}
      {!loading && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (input.trim()) handleSubmit(e);
              }
            }}
            placeholder={
              hasExchanges
                ? "Is there something else weighing on you?"
                : `What's weighing on you about ${petName}?`
            }
            rows={hasExchanges ? 3 : 4}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none leading-relaxed dark:border-amber-800/30 dark:bg-gray-900 dark:text-amber-50 dark:placeholder:text-gray-500"
          />
          {!hasExchanges && (
            <p className="text-xs text-gray-400 leading-relaxed">
              You might be thinking about the timing of a decision, not being
              there, wondering if you did enough, or something you wish
              you&apos;d done differently.
            </p>
          )}
          <Button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-full h-11 border border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent disabled:opacity-40 dark:border-amber-800/40 dark:text-amber-200 dark:hover:bg-amber-900/20"
          >
            Share
          </Button>
        </form>
      )}

      {/* Continue / create memorial buttons */}
      {hasExchanges && !loading && (
        <div className="space-y-2 pt-2">
          {onBack && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="w-full h-11 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800/40 dark:text-amber-200 dark:hover:bg-amber-900/20"
            >
              I&apos;m ready to continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {onReadyToCreate && (
            <Button
              type="button"
              variant="outline"
              onClick={onReadyToCreate}
              className="w-full h-11 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800/40 dark:text-amber-200 dark:hover:bg-amber-900/20"
            >
              Create {petName}&apos;s memorial when you&apos;re ready
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
