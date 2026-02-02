import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import type { Metadata } from "next";
import Image from "next/image";
import { PawPrint, Gift } from "lucide-react";
import { ShareButton } from "./share-button";
import { MasonryWall } from "@/components/memorial-wall/masonry-wall";
import { MemoryForm } from "@/components/memory-wall/memory-form";
import { LightCandle } from "@/components/memorial/light-candle";

interface MemorialPageProps {
  params: Promise<{ slug: string }>;
}

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  sort_order: number;
}

interface MemoryRow {
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

interface Memorial {
  id: string;
  user_id: string;
  pet_name: string;
  slug: string;
  species?: string | null;
  custom_species?: string | null;
  gender?: string | null;
  birth_date: string | null;
  death_date: string | null;
  tribute: string | null;
  is_published: boolean;
  photos: Photo[];
  compilation_url?: string | null;
  memories: MemoryRow[];
}

async function getMemorial(slug: string) {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: memorial, error } = await supabase
    .from("memorials")
    .select("*, photos(*)")
    .eq("slug", slug)
    .single();

  if (error || !memorial) return null;

  const isOwner = user?.id === memorial.user_id;

  // Non-owners can only see published memorials
  if (!isOwner && !memorial.is_published) return null;

  // Sort photos by sort_order
  if (memorial.photos) {
    memorial.photos.sort(
      (a: Photo, b: Photo) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    );
  }

  // Fetch latest completed video compilation
  const { data: compilation } = await supabase
    .from("video_compilations")
    .select("url")
    .eq("memorial_id", memorial.id)
    .eq("status", "complete")
    .order("completed_at", { ascending: false })
    .limit(1)
    .single();

  // Fetch approved memories
  const { data: memories } = await supabase
    .from("memories")
    .select("*")
    .eq("memorial_id", memorial.id)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  const memorialData: Memorial = {
    ...(memorial as Memorial),
    compilation_url: compilation?.url ?? null,
    memories: (memories as MemoryRow[]) || [],
  };

  return { memorial: memorialData, isOwner };
}

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateMetadata({
  params,
}: MemorialPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getMemorial(slug);

  if (!result) {
    return { title: "Memorial Not Found" };
  }

  const { memorial } = result;
  const heroPhoto = memorial.photos?.[0];
  const description = memorial.tribute
    ? memorial.tribute.slice(0, 155) + (memorial.tribute.length > 155 ? "…" : "")
    : `A memorial for ${memorial.pet_name}. Forever loved, forever remembered.`;

  return {
    title: `Remembering ${memorial.pet_name} — PetMemorial.ai`,
    description,
    openGraph: {
      title: `Remembering ${memorial.pet_name}`,
      description,
      type: "article",
      ...(heroPhoto && {
        images: [{ url: heroPhoto.url, alt: memorial.pet_name }],
      }),
    },
    twitter: {
      card: heroPhoto ? "summary_large_image" : "summary",
      title: `Remembering ${memorial.pet_name}`,
      description,
      ...(heroPhoto && { images: [heroPhoto.url] }),
    },
  };
}

export default async function MemorialPage({ params }: MemorialPageProps) {
  const { slug } = await params;
  const result = await getMemorial(slug);

  if (!result) notFound();

  const { memorial, isOwner } = result;
  const heroPhoto = memorial.photos?.[0];
  const galleryPhotos = memorial.photos?.slice(1) ?? [];
  const birthFormatted = formatDate(memorial.birth_date);
  const deathFormatted = formatDate(memorial.death_date);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const memorialUrl = `${siteUrl}/${memorial.slug}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-white print:bg-white print:from-white print:via-white">
      {/* Hero Section */}
      <section className="relative">
        {heroPhoto ? (
          <div className="relative h-[35vh] min-h-[280px] max-h-[500px] w-full sm:h-[50vh]">
            <Image
              src={heroPhoto.url}
              alt={memorial.pet_name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10">
              <h1 className="font-serif text-4xl font-medium tracking-tight sm:text-5xl">
                {memorial.pet_name}
              </h1>
              {(birthFormatted || deathFormatted) && (
                <p className="mt-2 text-lg text-white/80">
                  {birthFormatted && deathFormatted
                    ? `${birthFormatted} — ${deathFormatted}`
                    : deathFormatted
                      ? `Passed ${deathFormatted}`
                      : `Born ${birthFormatted}`}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-[35vh] min-h-[280px] w-full flex-col items-center justify-center bg-gradient-to-b from-amber-100 to-amber-50">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-200/60">
              <PawPrint className="h-10 w-10 text-amber-600" />
            </div>
            <h1 className="font-serif text-4xl font-medium tracking-tight text-gray-900 sm:text-5xl">
              {memorial.pet_name}
            </h1>
            {(birthFormatted || deathFormatted) && (
              <p className="mt-3 text-lg text-gray-500">
                {birthFormatted && deathFormatted
                  ? `${birthFormatted} — ${deathFormatted}`
                  : deathFormatted
                    ? `Passed ${deathFormatted}`
                    : `Born ${birthFormatted}`}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Actions bar */}
      <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-4 pt-6 print:hidden sm:px-6">
        {isOwner && (
          <a
            href={`/create?edit=${memorial.id}`}
            className="text-sm text-amber-600 hover:text-amber-700 hover:underline"
          >
            Edit memorial
          </a>
        )}
        <LightCandle memorialId={memorial.id} />
        <ShareButton url={memorialUrl} petName={memorial.pet_name} />
      </div>

      {/* Wall intro */}
      <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <p className="mb-6 text-center text-sm text-gray-400 italic">
          {memorial.pet_name}&apos;s life, through the eyes of those who loved them
        </p>
      </section>

      {/* Tribute + Side Photos */}
      {memorial.tribute ? (
        <section className="mx-auto max-w-6xl px-4 pb-3 sm:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-stretch md:gap-4">
            <div className="flex-1 rounded-2xl border-l-4 border-l-amber-700 border border-amber-100 bg-amber-50/50 p-6 shadow-sm backdrop-blur-sm sm:p-8">
              <h2 className="mb-4 font-serif text-2xl font-medium text-gray-900">
                A Tribute
              </h2>
              <div className="whitespace-pre-line text-base leading-relaxed text-gray-700">
                {memorial.tribute}
              </div>
            </div>
            {galleryPhotos.length > 0 && (
              <div className="flex gap-3 md:w-80 md:shrink-0 md:flex-col">
                {galleryPhotos.slice(0, 2).map((photo) => (
                  <div key={photo.id} className="overflow-hidden rounded-2xl border border-amber-100 bg-white/80 shadow-sm">
                    <div className="relative aspect-square">
                      <Image
                        src={photo.url}
                        alt={photo.caption || memorial.pet_name}
                        fill
                        sizes="(max-width: 768px) 50vw, 224px"
                        className="object-cover"
                      />
                    </div>
                    {photo.caption && (
                      <p className="px-3 py-2 text-xs italic text-gray-500">{photo.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : isOwner ? (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 p-6 text-center">
            <p className="text-gray-500">No tribute yet.</p>
            <a
              href={`/create?edit=${memorial.id}`}
              className="mt-2 inline-block text-sm text-amber-600 hover:underline"
            >
              Add a tribute
            </a>
          </div>
        </section>
      ) : null}

      {/* Wall intro + Masonry Wall */}
      {(galleryPhotos.length > 2 || memorial.memories.length > 0 || memorial.compilation_url) && (
        <>
          <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
            <MasonryWall
              photos={galleryPhotos.slice(2)}
              memories={memorial.memories}
              videoUrl={memorial.compilation_url ?? undefined}
              videoPosterUrl={heroPhoto?.url}
              petName={memorial.pet_name}
            />
          </section>
        </>
      )}

      {/* Keepsake CTA (owner only) */}
      {isOwner && (
        <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 print:hidden">
          <a
            href={`/${memorial.slug}/shop`}
            className="flex items-center gap-4 rounded-2xl border border-amber-100 bg-white/80 p-6 shadow-sm backdrop-blur-sm hover:border-amber-200 transition-colors"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100">
              <Gift className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-gray-900">
                Create a Keepsake
              </h3>
              <p className="text-sm text-gray-500">
                Turn this memorial into a memory book or canvas print.
              </p>
            </div>
          </a>
        </section>
      )}

      {/* Memory Form (for published memorials) */}
      {memorial.is_published && (
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <MemoryForm memorialId={memorial.id} petName={memorial.pet_name} />
        </section>
      )}

      {/* Print footer */}
      <div className="hidden print:block print:py-8 print:text-center print:text-sm print:text-gray-400">
        Created with PetMemorial.ai
      </div>
    </div>
  );
}
