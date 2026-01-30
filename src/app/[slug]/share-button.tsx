"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, Check } from "lucide-react";

interface ShareButtonProps {
  url: string;
  petName: string;
}

export function ShareButton({ url, petName }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="rounded-full border-amber-200 text-sm hover:bg-amber-50"
      aria-label={`Copy link to ${petName}'s memorial`}
    >
      {copied ? (
        <>
          <Check className="mr-1.5 h-3.5 w-3.5 text-green-600" />
          Copied
        </>
      ) : (
        <>
          <Link className="mr-1.5 h-3.5 w-3.5" />
          Copy link
        </>
      )}
    </Button>
  );
}
