"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { wordCount } from "@/lib/validation";
import Image from "next/image";

interface MemoryFormProps {
  memorialId: string;
  petName: string;
  onSubmitted?: () => void;
}

const PROMPTS = [
  "What's your favorite memory with",
  "What made",
  "Share a story about",
];

export function MemoryForm({ memorialId, petName, onSubmitted }: MemoryFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [photos, setPhotos] = useState<{ file: File; preview: string; url?: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const words = content.trim() ? wordCount(content) : 0;

  async function uploadPhoto(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    form.append("memorialId", memorialId);

    const res = await fetch("/api/memories/upload", { method: "POST", body: form });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Upload failed");
    }
    const data = await res.json();
    return data.url;
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const remaining = 3 - photos.length;
    const toAdd = files.slice(0, remaining);

    const newPhotos = toAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!content.trim()) {
      toast.error("Please share a memory");
      return;
    }
    if (words > 500) {
      toast.error("Memory must be 500 words or fewer");
      return;
    }

    setSubmitting(true);

    try {
      // Upload photos first
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const url = await uploadPhoto(photo.file);
        photoUrls.push(url);
      }

      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memorialId,
          contributorName: name.trim(),
          contributorEmail: email.trim() || undefined,
          content: content.trim(),
          photoUrls: photoUrls.length ? photoUrls : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      setSubmitted(true);
      onSubmitted?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <Card className="border-amber-100 bg-white/80 backdrop-blur-sm">
        <CardContent className="py-10 text-center">
          <p className="text-lg font-medium text-gray-900">
            Thank you for sharing your memory
          </p>
          <p className="mt-2 text-gray-500">
            It will appear here once the memorial owner has reviewed it.
          </p>
          <Button
            variant="ghost"
            className="mt-4 text-amber-600 hover:text-amber-700"
            onClick={() => {
              setSubmitted(false);
              setName("");
              setEmail("");
              setContent("");
              setPhotos([]);
            }}
          >
            Share another memory
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-100 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-5 sm:p-6">
        <h3 className="mb-1 font-serif text-xl font-medium text-gray-900">
          Share a Memory
        </h3>
        <p className="mb-5 text-sm text-gray-500">
          {PROMPTS[Math.floor(Date.now() / 86400000) % PROMPTS.length]} {petName}?
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="memory-name">Your name *</Label>
              <Input
                id="memory-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                maxLength={100}
                disabled={submitting}
              />
            </div>
            <div>
              <Label htmlFor="memory-email">Email (optional)</Label>
              <Input
                id="memory-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={submitting}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="memory-content">Your memory *</Label>
            <Textarea
              id="memory-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Share a favorite memory, funny story, or what ${petName} meant to you…`}
              rows={5}
              disabled={submitting}
              className="resize-none"
            />
            <p className={`mt-1 text-right text-xs ${words > 500 ? "text-red-500" : "text-gray-400"}`}>
              {words}/500 words
            </p>
          </div>

          {/* Photo upload */}
          <div>
            {photos.length > 0 && (
              <div className="mb-3 flex gap-2 flex-wrap">
                {photos.map((photo, i) => (
                  <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg">
                    <Image
                      src={photo.preview}
                      alt="Upload preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white hover:bg-black/70"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {photos.length < 3 && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                  multiple
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={submitting}
                  className="text-gray-500"
                >
                  <Camera className="mr-1.5 h-4 w-4" />
                  Add photo{photos.length > 0 ? ` (${3 - photos.length} remaining)` : ""}
                </Button>
              </>
            )}
          </div>

          <Button
            type="submit"
            disabled={submitting || !name.trim() || !content.trim()}
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              "Share Memory"
            )}
          </Button>

          <p className="text-center text-xs text-gray-400">
            Your memory will be reviewed before appearing publicly.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
