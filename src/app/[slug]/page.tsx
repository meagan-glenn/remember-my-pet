import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import type { Metadata } from "next";
import Image from "next/image";
import { PawPrint } from "lucide-react";
import { ShareButton } from "./share-button";

interface MemorialPageProps {
  params: Promise<{ slug: string }>;
}

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  sort_order: number;
}

interface Memorial {
  id: string;
  user_id: string;
  pet_name: string;
  slug: string;
  birth_date: string | null;
  death_date: string | null;
  tribute: string | null;
  is_published: boolean;
  photos: Photo[];
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

  return { memorial: memorial as Memorial, isOwner };
}

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
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
          <div className="relative h-[50vh] min-h-[320px] max-h-[500px] w-full sm:h-[60vh]">
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
          <div className="flex h-[40vh] min-h-[280px] w-full flex-col items-center justify-center bg-gradient-to-b from-amber-100 to-amber-50">
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
      <div className="mx-auto flex max-w-2xl items-center justify-end gap-3 px-4 pt-6 print:hidden sm:px-6">
        {isOwner && (
          <a
            href={`/create?edit=${memorial.id}`}
            className="text-sm text-amber-600 hover:text-amber-700 hover:underline"
          >
            Edit memorial
          </a>
        )}
        <ShareButton url={memorialUrl} petName={memorial.pet_name} />
      </div>

      {/* Tribute */}
      {memorial.tribute ? (
        <section className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
          <div className="rounded-2xl border border-amber-100 bg-white/80 p-6 shadow-sm backdrop-blur-sm sm:p-8">
            <h2 className="mb-4 font-serif text-2xl font-medium text-gray-900">
              A Tribute
            </h2>
            <div className="whitespace-pre-line text-base leading-relaxed text-gray-700">
              {memorial.tribute}
            </div>
          </div>
        </section>
      ) : isOwner ? (
        <section className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
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

      {/* Photo Gallery */}
      {galleryPhotos.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
          <h2 className="mb-6 font-serif text-2xl font-medium text-gray-900">
            Photos
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {galleryPhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square overflow-hidden rounded-xl"
              >
                <Image
                  src={photo.url}
                  alt={photo.caption || memorial.pet_name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Print footer */}
      <div className="hidden print:block print:py-8 print:text-center print:text-sm print:text-gray-400">
        Created with PetMemorial.ai
      </div>
    </div>
  );
}
