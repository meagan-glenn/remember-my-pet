import { cache } from "react";
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import type { Metadata } from "next";
import Image from "next/image";
import { PawPrint } from "lucide-react";
import { getPronouns } from "@/lib/pronouns";
import { ExpandableMemoryForm } from "@/components/memory-wall/expandable-memory-form";
import { InviteDialog } from "@/components/memory-wall/invite-dialog";
import { LightCandle } from "@/components/memorial/light-candle";
import { CandleProvider } from "@/components/memorial/candle-provider";
import { MemorialPhotos } from "@/components/memorial/memorial-photos";
import { createServiceClient } from "@/lib/supabase";

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
  allow_memories?: boolean | null;
  photos: Photo[];
  hero_photo_crop_y?: number | null;
  compilation_url?: string | null;
  memories: MemoryRow[];
}

const getMemorial = cache(async (slug: string) => {
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

  // Fetch video compilation and approved memories in parallel
  const [{ data: compilation }, { data: memories }] = await Promise.all([
    supabase
      .from("video_compilations")
      .select("url")
      .eq("memorial_id", memorial.id)
      .eq("status", "complete")
      .order("completed_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("memories")
      .select("*")
      .eq("memorial_id", memorial.id)
      .eq("is_approved", true)
      .order("created_at", { ascending: false }),
  ]);

  // Fetch creator display name via service client (bypasses RLS)
  const serviceClient = createServiceClient();
  const { data: creator } = await serviceClient
    .from("users")
    .select("display_name")
    .eq("id", memorial.user_id)
    .single();

  const memorialData: Memorial = {
    ...(memorial as Memorial),
    compilation_url: compilation?.url ?? null,
    memories: (memories as MemoryRow[]) || [],
  };

  return { memorial: memorialData, isOwner, creatorName: creator?.display_name ?? null };
});

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
    title: `Remembering ${memorial.pet_name} — RememberMyPet.ai`,
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

  const { memorial, isOwner, creatorName } = result;
  const heroPhoto = memorial.photos?.[0];
  const galleryPhotos = memorial.photos?.slice(1) ?? [];
  const sidePhotos = galleryPhotos.slice(0, 2);
  const masonryPhotos = galleryPhotos.slice(2);
  const heroCropY = memorial.hero_photo_crop_y ?? 50;
  const birthFormatted = formatDate(memorial.birth_date);
  const deathFormatted = formatDate(memorial.death_date);
  const pronouns = getPronouns(memorial.gender as "male" | "female" | "neutral" | null | undefined);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const memorialUrl = `${siteUrl}/${memorial.slug}`;

  // Sanitize user data for JSON-LD to prevent XSS via dangerouslySetInnerHTML
  const safePetName = memorial.pet_name.replace(/[<>"]/g, "");
  const safeDescription = (memorial.tribute?.slice(0, 160) || `A memorial for ${safePetName}.`).replace(/[<>"]/g, "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Memorial for ${safePetName}`,
    description: safeDescription,
    url: memorialUrl,
    ...(heroPhoto && { image: heroPhoto.url }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-950 print:bg-white print:from-white print:via-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CandleProvider memorialId={memorial.id}>
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
                style={{ objectPosition: `center ${heroCropY}%` }}
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
              {/* Candle overlay on hero photo */}
              {!isOwner && (
                <div className="absolute bottom-4 right-4 z-10 print:hidden sm:bottom-6 sm:right-6">
                  <LightCandle variant="hero" />
                </div>
              )}
            </div>
          ) : (
            <div className="relative flex h-[35vh] min-h-[280px] w-full flex-col items-center justify-center bg-gradient-to-b from-amber-100 to-amber-50 dark:from-gray-900 dark:to-gray-950">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-200/60 dark:bg-amber-900/30">
                <PawPrint className="h-10 w-10 text-amber-600 dark:text-amber-400" />
              </div>
              <h1 className="font-serif text-4xl font-medium tracking-tight text-gray-900 dark:text-amber-50 sm:text-5xl">
                {memorial.pet_name}
              </h1>
              {(birthFormatted || deathFormatted) && (
                <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">
                  {birthFormatted && deathFormatted
                    ? `${birthFormatted} — ${deathFormatted}`
                    : deathFormatted
                      ? `Passed ${deathFormatted}`
                      : `Born ${birthFormatted}`}
                </p>
              )}
              {/* Candle overlay on no-photo hero */}
              {!isOwner && (
                <div className="absolute bottom-4 right-4 z-10 print:hidden sm:bottom-6 sm:right-6">
                  <LightCandle variant="hero" />
                </div>
              )}
            </div>
          )}
        </section>

        {/* Actions bar */}
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-4 pt-4 print:hidden sm:px-6">
          {isOwner && (
            <a
              href={`/create?edit=${memorial.id}`}
              className="text-sm text-amber-600 hover:text-amber-700 hover:underline dark:text-amber-400 dark:hover:text-amber-300"
            >
              Edit memorial
            </a>
          )}
          {isOwner && memorial.allow_memories !== false && (
            <InviteDialog petName={memorial.pet_name} memorialUrl={memorialUrl} />
          )}
        </div>

        {/* Wall intro */}
        <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
          <p className="mb-8 text-center text-sm text-gray-400 dark:text-gray-500 italic">
            {memorial.pet_name}&apos;s life, through the eyes of those who loved {pronouns.object}
          </p>
        </section>

        {/* Tribute + Side Photos + Masonry Wall (unified lightbox) */}
        <MemorialPhotos
          sidePhotos={sidePhotos}
          masonryPhotos={masonryPhotos}
          memories={memorial.memories}
          videoUrl={memorial.compilation_url ?? undefined}
          videoPosterUrl={heroPhoto?.url}
          petName={memorial.pet_name}
          tribute={memorial.tribute}
          isOwner={isOwner}
          editUrl={`/create?edit=${memorial.id}`}
        />

        {/* Candle section */}
        <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
          <LightCandle petName={memorial.pet_name} variant="section" />
        </section>
      </CandleProvider>

      {/* Memory Form (for published memorials with memories enabled) */}
      {memorial.is_published && memorial.allow_memories !== false && (
        <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
          <ExpandableMemoryForm memorialId={memorial.id} petName={memorial.pet_name} />
        </section>
      )}

      {/* Memorial page nav */}
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-6 text-center print:hidden sm:px-6">
        {creatorName && (
          <>
            <span className="text-sm text-gray-400 dark:text-gray-500">
              Created by {creatorName}
            </span>
            <span className="mx-2 text-gray-300 dark:text-gray-700">&middot;</span>
          </>
        )}
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-amber-600 dark:text-gray-500 dark:hover:text-amber-400 transition-colors"
        >
          <PawPrint className="h-3.5 w-3.5" />
          RememberMyPet.ai
        </a>
        <span className="mx-2 text-gray-300 dark:text-gray-700">&middot;</span>
        <a
          href="/create"
          className="text-sm text-gray-400 hover:text-amber-600 dark:text-gray-500 dark:hover:text-amber-400 transition-colors"
        >
          Create your own memorial
        </a>
      </div>

      {/* Print footer */}
      <div className="hidden print:block print:py-8 print:text-center print:text-sm print:text-gray-400">
        Created with RememberMyPet.ai
      </div>
    </div>
  );
}
