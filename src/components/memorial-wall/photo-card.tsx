import Image from "next/image";

interface PhotoCardProps {
  url: string;
  caption: string | null;
  petName?: string;
}

export function PhotoCard({ url, caption, petName }: PhotoCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-900/40 shadow-sm backdrop-blur-sm border border-amber-100 dark:border-amber-900/30">
      <div className="relative aspect-square">
        <Image
          src={url}
          alt={caption || `Photo of ${petName || "pet"}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
          className="object-cover"
        />
      </div>
      {caption && (
        <p className="px-3 py-2 text-sm italic text-gray-500 dark:text-gray-400">{caption}</p>
      )}
    </div>
  );
}
