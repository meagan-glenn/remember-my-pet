"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

export interface Memory {
  id: string;
  memorial_id: string;
  contributor_name: string;
  contributor_email: string | null;
  content: string;
  photo_urls: string[] | null;
  is_approved: boolean;
  moderation_status: string;
  created_at: string;
  approved_at: string | null;
}

interface MemoryCardProps {
  memory: Memory;
}

export function MemoryCard({ memory }: MemoryCardProps) {
  const date = new Date(memory.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card className="border-amber-100 dark:border-amber-900/30 bg-white/80 dark:bg-gray-900/40 backdrop-blur-sm">
      <CardContent className="p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-medium text-gray-900 dark:text-amber-50">
            {memory.contributor_name}
          </span>
          <span className="text-sm text-gray-400 dark:text-gray-500">{date}</span>
        </div>
        <p className="whitespace-pre-line text-base leading-relaxed text-gray-700 dark:text-gray-300">
          {memory.content}
        </p>
        {memory.photo_urls && memory.photo_urls.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {memory.photo_urls.map((url, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-lg"
              >
                <Image
                  src={url}
                  alt={`Photo shared by ${memory.contributor_name}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
