"use client";

import { useCallback, useRef, useState } from "react";
import type { VideoClip, WizardVideo } from "@/hooks/use-memorial-state";
import { X, GripVertical, Tag, Clock } from "lucide-react";

interface ClipListProps {
  clips: VideoClip[];
  videos: WizardVideo[];
  onReorder: (clips: VideoClip[]) => void;
  onRemove: (id: string) => void;
  onEdit: (clip: VideoClip) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ClipList({ clips, videos, onReorder, onRemove, onEdit }: ClipListProps) {
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  const sorted = [...clips].sort((a, b) => a.sortOrder - b.sortOrder);

  const getVideoName = useCallback(
    (videoId: string) => {
      const v = videos.find((vid) => vid.id === videoId);
      return v?.filename ?? "Unknown video";
    },
    [videos]
  );

  const handleDragStart = useCallback((idx: number) => {
    setDraggingIdx(idx);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setOverIdx(idx);
  }, []);

  const handleDrop = useCallback(
    (dropIdx: number) => {
      if (draggingIdx === null || draggingIdx === dropIdx) {
        setDraggingIdx(null);
        setOverIdx(null);
        return;
      }
      const reordered = [...sorted];
      const [moved] = reordered.splice(draggingIdx, 1);
      reordered.splice(dropIdx, 0, moved);
      // Reassign sortOrder
      const updated = reordered.map((clip, i) => ({ ...clip, sortOrder: i }));
      onReorder(updated);
      setDraggingIdx(null);
      setOverIdx(null);
    },
    [draggingIdx, sorted, onReorder]
  );

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-500">No clips yet. Select a video above to create clips.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">
        Clip Order ({sorted.length} clip{sorted.length !== 1 ? "s" : ""})
      </h3>
      <div className="space-y-1.5">
        {sorted.map((clip, idx) => (
          <div
            key={clip.id}
            ref={(el) => { itemsRef.current[idx] = el; }}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={() => handleDrop(idx)}
            onDragEnd={() => { setDraggingIdx(null); setOverIdx(null); }}
            onClick={() => onEdit(clip)}
            className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
              draggingIdx === idx
                ? "opacity-50 border-amber-300"
                : overIdx === idx
                  ? "border-amber-400 bg-amber-50"
                  : "border-gray-200 bg-white hover:border-amber-200"
            }`}
          >
            <div className="cursor-grab text-gray-400 hover:text-gray-600 touch-none">
              <GripVertical className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {getVideoName(clip.videoId)}
              </p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {formatTime(clip.startTime)} — {formatTime(clip.endTime)}
                </span>
                {clip.tag && (
                  <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                    <Tag className="h-3 w-3" />
                    {clip.tag}
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs font-medium text-gray-400 tabular-nums">
              {formatTime(clip.endTime - clip.startTime)}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(clip.id);
              }}
              className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
