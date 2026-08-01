"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createBrowserClient } from "@supabase/ssr";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import Image from "next/image";

interface Memory {
  id: string;
  memorial_id: string;
  contributor_name: string;
  contributor_email: string | null;
  content: string;
  photo_urls: string[] | null;
  moderation_status: string;
  created_at: string;
  memorials: { pet_name: string; slug: string };
}

export function ModerationQueue() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Get user's memorial IDs
    const { data: memorials } = await supabase
      .from("memorials")
      .select("id")
      .eq("user_id", user.id);

    if (!memorials?.length) {
      setMemories([]);
      setLoading(false);
      return;
    }

    const ids = memorials.map((m) => m.id);

    const { data } = await supabase
      .from("memories")
      .select("*, memorials(pet_name, slug)")
      .in("memorial_id", ids)
      .eq("moderation_status", "pending")
      .order("created_at", { ascending: false });

    setMemories((data as Memory[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  async function handleAction(memoryId: string, action: string, content?: string) {
    setActionLoading(memoryId);
    try {
      const res = await fetch(`/api/memories/${memoryId}`, {
        method: action === "delete" ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: action === "delete" ? undefined : JSON.stringify({ action, content }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error?.message || "Action failed");
      }

      setMemories((prev) => prev.filter((m) => m.id !== memoryId));

      if (action === "approve") toast.success("Memory approved");
      if (action === "reject") toast.success("Memory rejected");
      if (action === "edit") {
        toast.success("Memory updated");
        setEditingMemory(null);
      }
      if (action === "delete") {
        toast.success("Memory deleted");
        setDeletingId(null);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : ERROR_MESSAGES.MODERATION_FAILED.message, {
        duration: Infinity,
      });
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No pending memories to review.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {memories.map((memory) => {
          const date = new Date(memory.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          const isActioning = actionLoading === memory.id;

          return (
            <Card key={memory.id} className="border-amber-100 dark:border-amber-900/30">
              <CardContent className="p-4 sm:p-5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-medium text-gray-900 dark:text-amber-50">
                      {memory.contributor_name}
                    </span>
                    {memory.contributor_email && (
                      <span className="ml-2 text-sm text-gray-400">
                        {memory.contributor_email}
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {memory.memorials.pet_name}
                    </Badge>
                    <span className="text-xs text-gray-400">{date}</span>
                  </div>
                </div>

                <p className="mb-3 whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {memory.content}
                </p>

                {memory.photo_urls && memory.photo_urls.length > 0 && (
                  <div className="mb-3 flex gap-2">
                    {memory.photo_urls.map((url, i) => (
                      <div
                        key={i}
                        className="relative h-16 w-16 overflow-hidden rounded-lg"
                      >
                        <Image
                          src={url}
                          alt="Memory photo"
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-gray-900"
                    disabled={isActioning}
                    onClick={() => handleAction(memory.id, "approve")}
                  >
                    <Check className="mr-1 h-3.5 w-3.5" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isActioning}
                    onClick={() => {
                      setEditingMemory(memory);
                      setEditContent(memory.content);
                    }}
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                    disabled={isActioning}
                    onClick={() => setDeletingId(memory.id)}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editingMemory} onOpenChange={() => setEditingMemory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit memory</DialogTitle>
          </DialogHeader>
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={6}
            className="resize-none"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMemory(null)}>
              Cancel
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-gray-900"
              disabled={actionLoading === editingMemory?.id}
              onClick={() => {
                if (editingMemory) {
                  handleAction(editingMemory.id, "edit", editContent);
                }
              }}
            >
              Save & Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this memory?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={actionLoading === deletingId}
              onClick={() => {
                if (deletingId) handleAction(deletingId, "delete");
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
