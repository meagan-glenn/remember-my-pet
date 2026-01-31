import { Heart } from "lucide-react";
import { MemoryCard, type Memory } from "./memory-card";

interface MemoryListProps {
  memories: Memory[];
  petName: string;
}

export function MemoryList({ memories, petName }: MemoryListProps) {
  if (memories.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 p-8 text-center">
        <Heart className="mx-auto mb-3 h-8 w-8 text-amber-300" />
        <p className="text-gray-500">
          No memories shared yet. Be the first to share a memory of {petName}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {memories.map((memory) => (
        <MemoryCard key={memory.id} memory={memory} />
      ))}
    </div>
  );
}
