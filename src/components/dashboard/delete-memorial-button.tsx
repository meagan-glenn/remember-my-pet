"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteMemorialButtonProps {
  memorialId: string;
  petName: string;
}

export function DeleteMemorialButton({ memorialId, petName }: DeleteMemorialButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/memorial/${memorialId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error?.message || "Failed to delete memorial");
      }
      toast.success(`${petName}'s memorial has been deleted`);
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't delete memorial right now",
        { duration: Infinity }
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-xs" title="Delete memorial">
          <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-500 transition-colors" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {petName}&apos;s memorial?</DialogTitle>
          <DialogDescription>
            This will permanently delete the memorial, all photos, memories, and
            candles. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete forever"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
