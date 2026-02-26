import Image from "next/image";

interface PhotoCardProps {
  url: string;
  caption: string | null;
  petName?: string;
  onClick?: () => void;
}

export function PhotoCard({ url, caption, petName, onClick }: PhotoCardProps) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      className={`overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-900/40 shadow-sm backdrop-blur-sm border border-amber-100 dark:border-amber-900/30 text-left w-full${onClick ? " cursor-pointer transition-opacity hover:opacity-90" : ""}`}
    >
      <Image
        src={url}
        alt={caption || `Photo of ${petName || "pet"}`}
        width={800}
        height={600}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
        className="w-full h-auto"
        style={{ height: "auto" }}
      />
      {caption && (
        <p className="px-3 py-2 text-sm italic text-gray-500 dark:text-gray-400">{caption}</p>
      )}
    </Wrapper>
  );
}
