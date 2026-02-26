"use client";

import { Share2, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";

interface ShareCardProps {
  url: string;
}

export function ShareCard({ url }: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ url });
        return;
      } catch {
        // User cancelled — fall through to copy
      }
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied", { duration: 3000 });
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button onClick={handleClick} className="w-full text-left">
      <Card className="group cursor-pointer border-amber-100 dark:border-amber-900/30 transition-colors hover:bg-amber-50/50 dark:hover:bg-amber-950/20">
        <CardContent className="flex items-center gap-3 py-4">
          {copied ? (
            <Check className="h-5 w-5 shrink-0 text-green-500" />
          ) : (
            <Share2 className="h-5 w-5 shrink-0 text-amber-500 dark:text-amber-400" />
          )}
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {copied ? "Link copied!" : "Share on social"}
          </p>
        </CardContent>
      </Card>
    </button>
  );
}
