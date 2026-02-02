interface VideoCardProps {
  url: string;
  posterUrl?: string;
}

export function VideoCard({ url, posterUrl }: VideoCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl bg-gray-900 shadow-sm">
      <video
        src={url}
        poster={posterUrl}
        controls
        preload="metadata"
        className="w-full"
      />
    </div>
  );
}
