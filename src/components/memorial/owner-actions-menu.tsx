"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InviteDialog } from "@/components/memory-wall/invite-dialog";

interface OwnerActionsMenuProps {
  editUrl: string;
  petName: string;
  memorialUrl: string;
  allowMemories: boolean;
  /**
   * When true, the trigger uses dark-on-light styling for memorials without
   * a hero photo (where the paw-print placeholder shows an amber background).
   * When false (default), uses light-on-dark for overlay over a hero photo.
   */
  onLightBackground?: boolean;
}

export function OwnerActionsMenu({
  editUrl,
  petName,
  memorialUrl,
  allowMemories,
  onLightBackground = false,
}: OwnerActionsMenuProps) {
  const [inviteOpen, setInviteOpen] = useState(false);

  const triggerClass = onLightBackground
    ? "bg-white/80 text-gray-700 hover:bg-white dark:bg-gray-900/60 dark:text-gray-200 dark:hover:bg-gray-900/80"
    : "bg-black/30 text-white/90 hover:bg-black/50";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Memorial options"
          className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${triggerClass}`}
        >
          <MoreHorizontal className="h-5 w-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-48">
          <DropdownMenuItem asChild>
            <a href={editUrl} className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              Edit memorial
            </a>
          </DropdownMenuItem>
          {allowMemories && (
            <DropdownMenuItem
              onSelect={(e) => {
                // Let Radix close the dropdown first; open the dialog on
                // the next frame to avoid focus-trap collision.
                e.preventDefault();
                requestAnimationFrame(() => setInviteOpen(true));
              }}
            >
              <UserPlus className="h-4 w-4" />
              Invite others
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <InviteDialog
        petName={petName}
        memorialUrl={memorialUrl}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />
    </>
  );
}
