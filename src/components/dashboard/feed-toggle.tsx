"use client";

import { useState } from "react";
import { toast } from "sonner";

export function FeedToggle({
  memorialId,
  initialValue,
}: {
  memorialId: string;
  initialValue: boolean;
}) {
  const [enabled, setEnabled] = useState(initialValue);
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    if (toggling) return;
    setToggling(true);
    const newValue = !enabled;
    setEnabled(newValue); // optimistic

    try {
      const res = await fetch(`/api/memorial/${memorialId}/feed`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showInFeed: newValue }),
      });
      if (!res.ok) {
        setEnabled(!newValue); // revert
        toast.error("Couldn't update feed setting.", { duration: 4000 });
      }
    } catch {
      setEnabled(!newValue); // revert
      toast.error("Couldn't update feed setting.", { duration: 4000 });
    } finally {
      setToggling(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={toggling}
      className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2 disabled:opacity-50"
    >
      {enabled ? "Hide from community feed" : "Show on community feed"}
    </button>
  );
}
