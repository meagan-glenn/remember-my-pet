"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMemorialContext } from "@/contexts/memorial-state-context";
import { AuthModal } from "@/components/wizard/auth-modal";
import { createBrowserSupabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clapperboard, Check, AlertCircle, Loader2 } from "lucide-react";

type Transition = "cut" | "fade" | "dissolve";

const TRANSITIONS: { value: Transition; label: string; description: string }[] = [
  { value: "cut", label: "Cut", description: "Direct cut between clips" },
  { value: "fade", label: "Fade", description: "Fade to/from black" },
  { value: "dissolve", label: "Dissolve", description: "Cross-dissolve between clips" },
];

export default function CompilePage() {
  const router = useRouter();
  const {
    videos,
    videoClips,
    compilationUrl,
    setCompilationUrl,
    reorderVideos,
    videoFilesRef,
    memorialId,
    hydrated,
  } = useMemorialContext();

  const [transition, setTransition] = useState<Transition>("cut");
  const [status, setStatus] = useState<"idle" | "compiling" | "complete" | "failed">("idle");
  const [statusText, setStatusText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [resultUrl, setResultUrl] = useState(compilationUrl);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const sortedClips = [...videoClips].sort((a, b) => a.sortOrder - b.sortOrder);

  const totalDuration = sortedClips.reduce(
    (sum, c) => sum + (c.endTime - c.startTime),
    0
  );

  // Check auth on mount
  useEffect(() => {
    const supabase = createBrowserSupabase();
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(!!data.user);
    });
  }, []);

  /** Upload any videos still using blob URLs to Supabase. Returns updated URL map. */
  const uploadBlobVideos = useCallback(async (): Promise<Map<string, string>> => {
    const urlUpdates = new Map<string, string>();
    const updatedVideos = [...videos];

    for (let i = 0; i < updatedVideos.length; i++) {
      const video = updatedVideos[i];
      if (!video.url.startsWith("blob:")) continue;

      const file = videoFilesRef.current.get(video.id);
      if (!file) continue;

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-video", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = typeof data.error === "object" ? data.error?.message : data.error;
        throw new Error(msg || "Video upload failed");
      }

      const { url } = await res.json();
      urlUpdates.set(video.id, url);
      updatedVideos[i] = { ...video, url };
    }

    if (urlUpdates.size > 0) {
      reorderVideos(updatedVideos);
    }

    return urlUpdates;
  }, [videos, videoFilesRef, reorderVideos]);

  const handleCompile = useCallback(async () => {
    if (sortedClips.length === 0) return;

    // Require auth before compiling
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    setStatus("compiling");
    setStatusText("Starting compilation...");
    setErrorMessage("");

    try {
      // Upload any local blob videos first
      setStatusText("Uploading videos...");
      const urlUpdates = await uploadBlobVideos();

      // Build clip inputs with Supabase URLs
      const clipInputs = sortedClips.map((clip) => {
        const video = videos.find((v) => v.id === clip.videoId);
        const videoUrl = urlUpdates.get(clip.videoId) ?? video?.url ?? "";
        return {
          videoUrl,
          startTime: clip.startTime,
          endTime: clip.endTime,
        };
      });

      setStatusText("Rendering video...");
      const res = await fetch("/api/compile-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memorialId,
          clips: clipInputs,
          transition,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = typeof data.error === "object" ? data.error?.message : data.error;
        throw new Error(errorMsg || "Compilation failed");
      }

      if (data.status === "complete" && data.url) {
        setResultUrl(data.url);
        setCompilationUrl(data.url);
        setStatus("complete");
        setStatusText("Compilation complete!");
      } else if (data.compilationId) {
        // Poll for completion
        setStatusText("Processing...");
        await pollStatus(data.compilationId);
      }
    } catch (err) {
      setStatus("failed");
      setErrorMessage(err instanceof Error ? err.message : "The video couldn't be compiled. Your clips are saved.");
      setStatusText("");
    }
  }, [sortedClips, videos, memorialId, transition, setCompilationUrl, isAuthenticated, uploadBlobVideos]);

  const pollStatus = useCallback(async (compilationId: string) => {
    const maxAttempts = 150; // 5 minutes at 2s interval
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 2000));

      try {
        const res = await fetch(`/api/compile-video/status?compilationId=${compilationId}`);
        const data = await res.json();

        if (data.status === "complete" && data.url) {
          setResultUrl(data.url);
          setCompilationUrl(data.url);
          setStatus("complete");
          setStatusText("Compilation complete!");
          return;
        } else if (data.status === "failed") {
          throw new Error(data.errorMessage || "Compilation failed");
        }
        // Still processing, continue polling
      } catch (err) {
        setStatus("failed");
        setErrorMessage(err instanceof Error ? err.message : "Connection lost. Your compilation may still be processing.");
        setStatusText("");
        return;
      }
    }
    // Timeout
    setStatus("failed");
    setErrorMessage("Compilation is taking longer than expected. Your clips are saved — please try again.");
    setStatusText("");
  }, [setCompilationUrl]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (videoClips.length === 0) {
    router.push("/create/reel/clips");
    return null;
  }

  return (
    <div className="py-8 px-4">
      <div className="mx-auto max-w-lg space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/create/reel/clips")}
          className="mb-2 -ml-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to clips
        </Button>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">Compile Video</h1>
          <p className="text-gray-500">
            {sortedClips.length} clip{sortedClips.length !== 1 ? "s" : ""}, ~{Math.round(totalDuration)} seconds
          </p>
        </div>

        {/* Transition selector */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Transition style</p>
          <div className="grid grid-cols-3 gap-2">
            {TRANSITIONS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTransition(t.value)}
                disabled={status === "compiling"}
                className={`rounded-lg border p-3 text-center transition-colors ${
                  transition === t.value
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <p className="text-sm font-medium">{t.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
              </button>
            ))}
          </div>
        </div>

        {totalDuration > 120 && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Total duration exceeds 2 minutes. Consider shortening clips for best results.
            </p>
          </div>
        )}

        {/* Status / Result */}
        {status === "compiling" && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600 mx-auto" />
            <p className="text-sm font-medium text-gray-700">{statusText}</p>
            <p className="text-xs text-gray-500">This may take a few moments</p>
          </div>
        )}

        {status === "complete" && resultUrl && (
          <div className="space-y-4">
            <div className="rounded-xl border border-green-200 bg-green-50 p-3 flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <p className="text-sm font-medium text-green-800">{statusText}</p>
            </div>
            <div className="rounded-xl overflow-hidden bg-black">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                src={resultUrl}
                controls
                playsInline
                className="w-full"
              />
            </div>
            <Button
              onClick={() => router.push("/create")}
              className="w-full h-12 text-base bg-amber-600 hover:bg-amber-700"
            >
              Back to Workspace
            </Button>
          </div>
        )}

        {status === "failed" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm font-medium text-red-800">Compilation failed</p>
              </div>
              {errorMessage && (
                <p className="text-sm text-red-700">{errorMessage}</p>
              )}
            </div>
            <Button
              onClick={handleCompile}
              className="w-full h-12 text-base bg-amber-600 hover:bg-amber-700 gap-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {status === "idle" && (
          <Button
            onClick={handleCompile}
            className="w-full h-12 text-base bg-amber-600 hover:bg-amber-700 gap-2"
          >
            <Clapperboard className="h-5 w-5" />
            Compile Video
          </Button>
        )}
      </div>

      <AuthModal
        open={showAuthModal}
        title="Sign in to compile"
        description="Create a free account to compile your video and save your memorial."
        onClose={() => setShowAuthModal(false)}
        onAuthenticated={() => {
          setIsAuthenticated(true);
          setShowAuthModal(false);
          handleCompile();
        }}
      />
    </div>
  );
}
