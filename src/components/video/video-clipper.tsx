"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { WizardVideo, VideoClip } from "@/hooks/use-memorial-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause, Scissors } from "lucide-react";

interface VideoClipperProps {
  video: WizardVideo;
  onSaveClip: (clip: VideoClip) => void;
  /** Pre-fill for editing an existing clip */
  editingClip?: VideoClip | null;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${m}:${s.toString().padStart(2, "0")}.${ms}`;
}

export function VideoClipper({ video, onSaveClip, editingClip }: VideoClipperProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.durationSeconds ?? 0);

  const [startTime, setStartTime] = useState(editingClip?.startTime ?? 0);
  const [endTime, setEndTime] = useState(editingClip?.endTime ?? (video.durationSeconds ?? 0));
  const [tag, setTag] = useState(editingClip?.tag ?? "");

  // Track which handle is being dragged
  const rangeRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<"start" | "end" | null>(null);

  useEffect(() => {
    if (editingClip) {
      setStartTime(editingClip.startTime);
      setEndTime(editingClip.endTime);
      setTag(editingClip.tag);
    }
  }, [editingClip]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) {
      v.pause();
    } else {
      // If at/past endTime, seek to startTime
      if (v.currentTime >= endTime || v.currentTime < startTime) {
        v.currentTime = startTime;
      }
      v.play();
    }
    setPlaying(!playing);
  }, [playing, startTime, endTime]);

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    // Pause at endTime during clip preview
    if (v.currentTime >= endTime) {
      v.pause();
      setPlaying(false);
    }
  }, [endTime]);

  const handleLoadedMetadata = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setDuration(v.duration);
    if (!editingClip) {
      setEndTime(v.duration);
    }
  }, [editingClip]);

  const handleScrub = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = parseFloat(e.target.value);
      setCurrentTime(time);
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    },
    []
  );

  // Pointer-based range handle dragging
  const getTimeFromPointer = useCallback(
    (clientX: number) => {
      const rect = rangeRef.current?.getBoundingClientRect();
      if (!rect || duration === 0) return 0;
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return ratio * duration;
    },
    [duration]
  );

  const handlePointerDown = useCallback(
    (handle: "start" | "end") => (e: React.PointerEvent) => {
      e.preventDefault();
      draggingRef.current = handle;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return;
      const time = getTimeFromPointer(e.clientX);
      if (draggingRef.current === "start") {
        setStartTime(Math.min(time, endTime - 0.1));
      } else {
        setEndTime(Math.max(time, startTime + 0.1));
      }
    },
    [getTimeFromPointer, startTime, endTime]
  );

  const handlePointerUp = useCallback(() => {
    draggingRef.current = null;
  }, []);

  const handleSetStart = useCallback(() => {
    const t = videoRef.current?.currentTime ?? 0;
    setStartTime(Math.min(t, endTime - 0.1));
  }, [endTime]);

  const handleSetEnd = useCallback(() => {
    const t = videoRef.current?.currentTime ?? 0;
    setEndTime(Math.max(t, startTime + 0.1));
  }, [startTime]);

  const handleSave = useCallback(() => {
    onSaveClip({
      id: editingClip?.id ?? crypto.randomUUID(),
      videoId: video.id,
      startTime: Math.round(startTime * 100) / 100,
      endTime: Math.round(endTime * 100) / 100,
      tag: tag.trim(),
      sortOrder: editingClip?.sortOrder ?? 0,
    });
    // Reset for next clip
    if (!editingClip) {
      setStartTime(0);
      setEndTime(duration);
      setTag("");
    }
  }, [onSaveClip, video.id, startTime, endTime, tag, duration, editingClip]);

  const clipDuration = Math.max(0, endTime - startTime);
  const startPct = duration > 0 ? (startTime / duration) * 100 : 0;
  const endPct = duration > 0 ? (endTime / duration) * 100 : 100;

  return (
    <div className="space-y-4">
      {/* Video player */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={videoRef}
          src={video.url}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setPlaying(false)}
          className="h-full w-full"
        />
      </div>

      {/* Play/pause + time */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-600 text-white hover:bg-amber-700 transition-colors"
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" fill="white" />}
        </button>
        <span className="text-sm font-mono text-gray-600">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      {/* Scrub bar */}
      <input
        type="range"
        min={0}
        max={duration}
        step={0.01}
        value={currentTime}
        onChange={handleScrub}
        className="w-full accent-amber-600"
      />

      {/* Clip range selector */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Clip range</p>
        <div
          ref={rangeRef}
          className="relative h-10 rounded-lg bg-gray-100 touch-none select-none"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Selected region highlight */}
          <div
            className="absolute top-0 bottom-0 bg-amber-200/60 rounded"
            style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
          />
          {/* Start handle */}
          <div
            className="absolute top-0 bottom-0 w-5 cursor-ew-resize flex items-center justify-center z-10"
            style={{ left: `calc(${startPct}% - 10px)` }}
            onPointerDown={handlePointerDown("start")}
          >
            <div className="h-8 w-1.5 rounded-full bg-amber-600" />
          </div>
          {/* End handle */}
          <div
            className="absolute top-0 bottom-0 w-5 cursor-ew-resize flex items-center justify-center z-10"
            style={{ left: `calc(${endPct}% - 10px)` }}
            onPointerDown={handlePointerDown("end")}
          >
            <div className="h-8 w-1.5 rounded-full bg-amber-600" />
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Start: {formatTime(startTime)}</span>
          <span>Duration: {formatTime(clipDuration)}</span>
          <span>End: {formatTime(endTime)}</span>
        </div>
      </div>

      {/* Set start/end buttons (mobile accessibility) */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSetStart}
          className="flex-1"
        >
          Set Start
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSetEnd}
          className="flex-1"
        >
          Set End
        </Button>
      </div>

      {/* Tag input */}
      <Input
        placeholder="Tag this clip (e.g. &quot;her bark&quot;, &quot;favorite spot&quot;)"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        className="h-12 text-base"
      />

      {/* Save clip */}
      <Button
        type="button"
        onClick={handleSave}
        disabled={clipDuration < 0.1}
        className="w-full h-12 text-base bg-amber-600 hover:bg-amber-700 gap-2"
      >
        <Scissors className="h-5 w-5" />
        {editingClip ? "Update Clip" : "Save Clip"}
      </Button>
    </div>
  );
}
