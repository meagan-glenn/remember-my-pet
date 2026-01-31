"use client";

import { Book, Frame } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KeepsakeCardProps {
  productType: "memory_book" | "canvas_print";
  priceCents: number;
  onSelect: () => void;
  loading?: boolean;
}

const PRODUCT_INFO = {
  memory_book: {
    title: "Memory Book",
    description:
      "A beautiful hardcover photo book featuring your tribute, photos, and shared memories.",
    Icon: Book,
  },
  canvas_print: {
    title: "Canvas Print",
    description:
      "A gallery-wrapped canvas print of your favorite photo, ready to hang.",
    Icon: Frame,
  },
} as const;

export function KeepsakeCard({
  productType,
  priceCents,
  onSelect,
  loading,
}: KeepsakeCardProps) {
  const info = PRODUCT_INFO[productType];
  const price = (priceCents / 100).toFixed(2);

  return (
    <div className="rounded-2xl border border-amber-100 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100">
          <info.Icon className="h-6 w-6 text-amber-600" />
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="font-serif text-lg font-medium text-gray-900">
            {info.title}
          </h3>
          <p className="text-sm text-gray-500">{info.description}</p>
          <p className="text-lg font-semibold text-gray-900">${price}</p>
        </div>
      </div>
      <Button
        onClick={onSelect}
        disabled={loading}
        className="mt-4 w-full bg-amber-600 hover:bg-amber-700"
      >
        {loading ? "Loading..." : `Create ${info.title}`}
      </Button>
    </div>
  );
}
