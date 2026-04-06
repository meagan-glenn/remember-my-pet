"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Copy, Check, Share2 } from "lucide-react";
import { toast } from "sonner";

interface InviteDialogProps {
  petName: string;
  memorialUrl: string;
  /**
   * Optional controlled mode. When `open` is provided, the dialog is
   * controlled by the parent and the default `DialogTrigger` button is
   * not rendered. Used by OwnerActionsMenu to open from a dropdown item.
   */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function InviteDialog({ petName, memorialUrl, open, onOpenChange }: InviteDialogProps) {
  const [copied, setCopied] = useState(false);
  const isControlled = open !== undefined;

  const message = `I created a memorial for ${petName}. If you have a favorite memory or photo, I'd love for you to share it.\n\n${memorialUrl}`;

  async function handleCopyMessage() {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success("Message copied", { duration: 3000 });
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleNativeShare() {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: `Share a memory of ${petName}`,
        text: message,
      });
    } catch {
      // User cancelled — ignore
    }
  }

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-amber-200 dark:border-amber-800/30 text-sm hover:bg-amber-50 dark:hover:bg-amber-900/20 dark:text-amber-200"
          >
            <Users className="mr-1.5 h-3.5 w-3.5" />
            Invite others to share
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg">
            Invite friends & family
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Send this message to anyone who knew {petName}. They can share memories and photos directly on the memorial.
        </p>
        <div className="rounded-lg border border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-gray-900/40 p-4">
          <p className="whitespace-pre-line text-sm text-gray-700 dark:text-gray-300">
            {message}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleCopyMessage}
            className="flex-1 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-gray-900"
          >
            {copied ? (
              <>
                <Check className="mr-1.5 h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-4 w-4" />
                Copy message
              </>
            )}
          </Button>
          {hasNativeShare && (
            <Button
              variant="outline"
              onClick={handleNativeShare}
            >
              <Share2 className="mr-1.5 h-4 w-4" />
              Share
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
