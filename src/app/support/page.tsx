"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { StepDecisionSupport } from "@/components/wizard/step-decision-support";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PawPrint, ArrowLeft } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { SupportContextEntry } from "@/hooks/use-memorial-state";
import Link from "next/link";

const STORAGE_KEY = "petmemorial-support-seed";
const AUTH_DISMISSED_KEY = "petmemorial-support-auth-dismissed";
const ANON_EXCHANGE_LIMIT = 3;
const ANON_EXCHANGE_LIMIT_AFTER_DISMISS = 5;

interface SupportSeed {
  petName: string;
  supportContext: SupportContextEntry[];
}

function loadSeed(): SupportSeed | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.petName === "string" && Array.isArray(parsed.supportContext)) {
      return parsed as SupportSeed;
    }
  } catch {
    // ignore
  }
  return null;
}

function saveSeed(seed: SupportSeed) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
}

export default function StandaloneSupportPage() {
  const router = useRouter();
  const [petName, setPetName] = useState("");
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [supportContext, setSupportContext] = useState<SupportContextEntry[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showAuthBanner, setShowAuthBanner] = useState(false);
  const [authDismissed, setAuthDismissed] = useState(false);
  const [authError] = useState("");

  // Restore from localStorage on mount
  useEffect(() => {
    const seed = loadSeed();
    if (seed && seed.petName) {
      setPetName(seed.petName);
      setSupportContext(seed.supportContext);
      setNameSubmitted(true);
    }

    if (localStorage.getItem(AUTH_DISMISSED_KEY)) {
      setAuthDismissed(true);
    }

    // Check auth status
    const supabase = createBrowserSupabase();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        setIsAuthenticated(true);
        setShowAuthBanner(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Persist to localStorage when context changes
  useEffect(() => {
    if (nameSubmitted && petName) {
      saveSeed({ petName, supportContext });
    }
  }, [petName, supportContext, nameSubmitted]);

  // Show auth banner after ANON_EXCHANGE_LIMIT exchanges for anonymous users
  useEffect(() => {
    if (isAuthenticated) return;
    if (authDismissed && supportContext.length < ANON_EXCHANGE_LIMIT_AFTER_DISMISS) return;
    if (!authDismissed && supportContext.length >= ANON_EXCHANGE_LIMIT) {
      setShowAuthBanner(true);
    }
    if (authDismissed && supportContext.length >= ANON_EXCHANGE_LIMIT_AFTER_DISMISS) {
      setShowAuthBanner(true);
    }
  }, [supportContext.length, isAuthenticated, authDismissed]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (petName.trim()) {
      setNameSubmitted(true);
    }
  };

  const handleSetSupportContext = useCallback(
    (ctx: SupportContextEntry[]) => {
      setSupportContext(ctx);
    },
    []
  );

  const handleReadyToCreate = useCallback(() => {
    // Seed the wizard with pet name and support context
    const wizardSeed = {
      petName: petName.trim(),
      species: "",
      gender: undefined,
      conversation: [],
      supportContext,
    };
    localStorage.setItem("petmemorial-wizard-seed", JSON.stringify(wizardSeed));
    router.push("/create");
  }, [petName, supportContext, router]);

  const handleGoogleSignIn = () => {
    toast("Google sign-in is coming soon! Use a magic link for now.", { duration: 4000 });
  };

  const handleDismissAuth = () => {
    localStorage.setItem(AUTH_DISMISSED_KEY, "1");
    setAuthDismissed(true);
    setShowAuthBanner(false);
  };

  // Check if user is at their anonymous exchange limit
  const atAnonLimit =
    !isAuthenticated &&
    ((authDismissed && supportContext.length >= ANON_EXCHANGE_LIMIT_AFTER_DISMISS) ||
     (!authDismissed && supportContext.length >= ANON_EXCHANGE_LIMIT && showAuthBanner));

  // Name entry screen
  if (!nameSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
        <div className="py-8 px-4">
          <div className="mx-auto max-w-lg">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>

            <div className="text-center space-y-4 mt-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <PawPrint className="h-7 w-7 text-amber-600 dark:text-amber-400" />
              </div>
              <h1 className="font-serif text-2xl font-medium text-gray-900 dark:text-amber-50">
                You don&apos;t have to be ready yet
              </h1>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                If you&apos;re carrying something heavy about your pet, this is
                a safe place to say it out loud. No memorial required.
              </p>
            </div>

            <form onSubmit={handleNameSubmit} className="mt-8 space-y-4">
              <div className="space-y-2">
                <label htmlFor="petName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  What&apos;s your pet&apos;s name?
                </label>
                <Input
                  id="petName"
                  type="text"
                  placeholder="Their name"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  className="h-12 text-base"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                disabled={!petName.trim()}
                className="w-full h-12 text-base bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-gray-900 disabled:opacity-40"
              >
                Continue
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Support conversation
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
      <div className="py-8 px-4">
        <div className="mx-auto max-w-lg">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          {/* Auth banner */}
          {showAuthBanner && !isAuthenticated && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-950/30 p-4">
              <div className="flex flex-col gap-3">
                <p className="text-sm text-amber-900 dark:text-amber-100">
                  Sign in to save your conversation and create {petName.trim()}&apos;s
                  memorial when you&apos;re ready.
                </p>
                {authError && <p className="text-xs text-red-600">{authError}</p>}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    className="text-sm"
                  >
                    <svg className="mr-1.5 h-4 w-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                  </Button>
                  {!authDismissed && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDismissAuth}
                      className="text-sm text-amber-700 dark:text-amber-300"
                    >
                      Maybe later
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* At anonymous limit message */}
          {atAnonLimit && authDismissed && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-950/30 p-4 text-center">
              <p className="text-sm text-amber-900 dark:text-amber-100 mb-3">
                Sign in to continue your conversation with {petName.trim()}.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleGoogleSignIn}
                className="text-sm"
              >
                <svg className="mr-1.5 h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </Button>
            </div>
          )}

          <StepDecisionSupport
            petName={petName.trim()}
            supportContext={supportContext}
            onSetSupportContext={handleSetSupportContext}
            onReadyToCreate={handleReadyToCreate}
          />
        </div>
      </div>
    </div>
  );
}
