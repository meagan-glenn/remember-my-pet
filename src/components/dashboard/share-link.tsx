"use client";

import { useState } from "react";
import { Link as LinkIcon, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareLinkProps {
  url: string;
}

export function ShareLink({ url }: ShareLinkProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ url });
        return;
      } catch {
        // User cancelled or share failed — fall through to copy
      }
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied", { duration: 3000 });
    setTimeout(() => setCopied(false), 2000);
  }

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={handleShare}
      title={hasNativeShare ? "Share memorial" : "Copy link"}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <LinkIcon className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}
