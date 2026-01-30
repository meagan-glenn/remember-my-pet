"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Film } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReelPage() {
  const router = useRouter();

  return (
    <div className="py-8 px-4">
      <div className="mx-auto max-w-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/create")}
          className="mb-4 -ml-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to workspace
        </Button>

        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="rounded-2xl bg-gray-100 p-6">
            <Film className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Video Reel</h2>
          <p className="text-gray-500 max-w-xs">
            Turn your photos into a beautiful video memory. This feature is coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
