import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import type { Metadata } from "next";
import { PawPrint } from "lucide-react";
import { ExpandableMemoryForm } from "@/components/memory-wall/expandable-memory-form";
import { LightCandle } from "@/components/memorial/light-candle";
import { CandleProvider } from "@/components/memorial/candle-provider";
import { MemorialPhotos } from "@/components/memorial/memorial-photos";
import { OwnerActionsMenu } from "@/components/memorial/owner-actions-menu";
import { HeroMedia } from "@/components/memorial/hero-media";
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

/**
 * Format birth/death dates as a commemorative year range for the hero.
 *   "2012 — 2024"  (both)
 *   "Born 2012"    (birth only)
 *   "2024"         (death only)
 *   null           (neither)
 */
function formatYearRange(
  birth: string | null,
  death: string | null
): string | null {
  const birthYear = birth ? birth.split("-")[0] : null;
  const deathYear = death ? death.split("-")[0] : null;
  if (birthYear && deathYear) return `${birthYear} — ${deathYear}`;
  if (birthYear) return `Born ${birthYear}`;
  if (deathYear) return deathYear;
  return null;
}

function getSpeciesLabel(species?: string | null, customSpecies?: string | null): string | null {
  if (customSpecies) return customSpecies;
  if (!species || species === "other") return null;
  // Capitalize first letter
  return species.charAt(0).toUpperCase() + species.slice(1);
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
  const speciesLabel = getSpeciesLabel(memorial.species, memorial.custom_species);
  const petDescription = speciesLabel
    ? `${memorial.pet_name} the ${speciesLabel}`
    : memorial.pet_name;
  const description = memorial.tribute
    ? memorial.tribute.slice(0, 155) + (memorial.tribute.length > 155 ? "…" : "")
    : `A memorial for ${petDescription}. Forever loved, forever remembered.`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://remembermypet.ai";
  const memorialUrl = `${siteUrl}/${memorial.slug}`;

  const title = speciesLabel
    ? `Remembering ${memorial.pet_name} the ${speciesLabel} — Pet Memorial | RememberMyPet.ai`
    : `Remembering ${memorial.pet_name} — Pet Memorial | RememberMyPet.ai`;

  const ogTitle = speciesLabel
    ? `Remembering ${memorial.pet_name} the ${speciesLabel}`
    : `Remembering ${memorial.pet_name}`;

  const heroAlt = heroPhoto?.caption
    || (speciesLabel ? `Photo of ${memorial.pet_name} the ${speciesLabel}` : `Photo of ${memorial.pet_name}`);

  return {
    title,
    description,
    alternates: {
      canonical: memorialUrl,
    },
    openGraph: {
      title: ogTitle,
      description,
      type: "article",
      url: memorialUrl,
      siteName: "RememberMyPet.ai",
      ...(heroPhoto && {
        images: [{ url: heroPhoto.url, alt: heroAlt }],
      }),
    },
    twitter: {
      card: heroPhoto ? "summary_large_image" : "summary",
      title: ogTitle,
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
  // All non-hero photos flow into the unified masonry wall (phase 4).
  const masonryPhotos = memorial.photos?.slice(1) ?? [];
  const heroCropY = memorial.hero_photo_crop_y ?? 50;
  const yearRange = formatYearRange(memorial.birth_date, memorial.death_date);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://remembermypet.ai";
  const memorialUrl = `${siteUrl}/${memorial.slug}`;
  const speciesLabel = getSpeciesLabel(memorial.species, memorial.custom_species);

  // Sanitize user data for JSON-LD to prevent XSS via dangerouslySetInnerHTML
  const safePetName = memorial.pet_name.replace(/[<>"]/g, "");
  const safeSpecies = speciesLabel?.replace(/[<>"]/g, "") ?? null;
  const safeDescription = (memorial.tribute?.slice(0, 160) || `A memorial for ${safePetName}.`).replace(/[<>"]/g, "");

  // Build descriptive alt text for hero image
  const heroAlt = heroPhoto?.caption
    || (safeSpecies ? `Photo of ${safePetName} the ${safeSpecies}` : `Photo of ${safePetName}`);

  // Rich JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Memorial for ${safePetName}${safeSpecies ? ` the ${safeSpecies}` : ""}`,
    description: safeDescription,
    url: memorialUrl,
    ...(heroPhoto && {
      image: {
        "@type": "ImageObject",
        url: heroPhoto.url,
        caption: heroAlt,
      },
    }),
    ...(memorial.birth_date && { dateCreated: memorial.birth_date }),
    mainEntity: {
      "@type": "Thing",
      name: safePetName,
      ...(safeSpecies && { description: `A beloved ${safeSpecies}` }),
      ...(memorial.birth_date && memorial.death_date && {
        additionalProperty: [
          { "@type": "PropertyValue", name: "born", value: memorial.birth_date },
          { "@type": "PropertyValue", name: "passed", value: memorial.death_date },
        ],
      }),
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: siteUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Memorials",
          item: `${siteUrl}/memorials`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: safePetName,
          item: memorialUrl,
        },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-950 print:bg-white print:from-white print:via-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CandleProvider memorialId={memorial.id}>
        {/* Hero Section — presence-first. When a video compilation exists,
            HeroMedia makes it the ambient hero. Otherwise a still image with
            Ken Burns motion (disabled under prefers-reduced-motion). */}
        <section className="relative">
          {heroPhoto ? (
            <div className="relative h-[65vh] min-h-[500px] max-h-[720px] w-full overflow-hidden sm:h-[70vh] sm:min-h-[560px] sm:max-h-[800px]">
              <HeroMedia
                videoUrl={memorial.compilation_url}
                posterUrl={heroPhoto.url}
                posterAlt={heroAlt}
                cropY={heroCropY}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10 md:p-14">
                <h1 className="font-serif text-5xl font-normal leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
                  {memorial.pet_name}
                </h1>
                {yearRange && (
                  <p className="mt-3 font-serif text-base font-light tracking-[0.15em] text-white/75 sm:mt-4 sm:text-lg">
                    {yearRange}
                  </p>
                )}
              </div>
              {/* Candle (visitors only, bottom-right) */}
              {!isOwner && (
                <div
                  className="absolute right-4 z-10 print:hidden sm:right-6"
                  style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
                >
                  <LightCandle variant="hero" petName={memorial.pet_name} />
                </div>
              )}
              {/* Owner actions ellipsis (owners only, top-right) */}
              {isOwner && (
                <div
                  className="absolute right-4 z-20 print:hidden sm:right-6"
                  style={{ top: "max(1rem, env(safe-area-inset-top))" }}
                >
                  <OwnerActionsMenu
                    editUrl={`/create?edit=${memorial.id}`}
                    petName={memorial.pet_name}
                    memorialUrl={memorialUrl}
                    allowMemories={memorial.allow_memories !== false}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="relative flex h-[65vh] min-h-[500px] w-full flex-col items-center justify-center bg-gradient-to-b from-amber-100 to-amber-50 dark:from-gray-900 dark:to-gray-950 sm:h-[70vh] sm:min-h-[560px]">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-200/60 dark:bg-amber-900/30">
                <PawPrint className="h-10 w-10 text-amber-600 dark:text-amber-400" />
              </div>
              <h1 className="font-serif text-5xl font-normal leading-[1.05] tracking-tight text-gray-900 dark:text-amber-50 sm:text-6xl md:text-7xl">
                {memorial.pet_name}
              </h1>
              {yearRange && (
                <p className="mt-3 font-serif text-base font-light tracking-[0.15em] text-gray-500 dark:text-gray-400 sm:mt-4 sm:text-lg">
                  {yearRange}
                </p>
              )}
              {/* Candle (visitors only, bottom-right) */}
              {!isOwner && (
                <div
                  className="absolute right-4 z-10 print:hidden sm:right-6"
                  style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
                >
                  <LightCandle variant="hero" petName={memorial.pet_name} />
                </div>
              )}
              {/* Owner actions ellipsis (owners only) — light background variant */}
              {isOwner && (
                <div
                  className="absolute right-4 z-20 print:hidden sm:right-6"
                  style={{ top: "max(1rem, env(safe-area-inset-top))" }}
                >
                  <OwnerActionsMenu
                    editUrl={`/create?edit=${memorial.id}`}
                    petName={memorial.pet_name}
                    memorialUrl={memorialUrl}
                    allowMemories={memorial.allow_memories !== false}
                    onLightBackground
                  />
                </div>
              )}
            </div>
          )}
        </section>

        {/* Wall + Tribute (unified lightbox). Wall renders first: sensory content before narrative.
            The video compilation has been hoisted into HeroMedia above; don't pass it here. */}
        <MemorialPhotos
          masonryPhotos={masonryPhotos}
          memories={memorial.memories}
          petName={memorial.pet_name}
          tribute={memorial.tribute}
          isOwner={isOwner}
          editUrl={`/create?edit=${memorial.id}`}
        />

        {/* Candle section */}
        <section className="mx-auto max-w-6xl px-4 pb-6 sm:px-6 sm:pb-10">
          <LightCandle petName={memorial.pet_name} variant="section" />
        </section>
      </CandleProvider>

      {/* Memory Form (for published memorials with memories enabled) */}
      {memorial.is_published && memorial.allow_memories !== false && (
        <section className="mx-auto max-w-6xl px-4 pb-6 sm:px-6 sm:pb-10">
          <ExpandableMemoryForm memorialId={memorial.id} petName={memorial.pet_name} />
        </section>
      )}

      {/* Memorial page footer — end-of-visit, not conversion.
          The acquisition CTA lives on the directory / visitor empty state,
          not on a live memorial. */}
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 text-center print:hidden sm:px-6 sm:pb-16 sm:pt-10">
        {creatorName && (
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Created by {creatorName}
          </p>
        )}
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          Made with love at{" "}
          <Link
            href="/"
            className="underline-offset-2 hover:text-amber-600 hover:underline dark:hover:text-amber-400"
          >
            RememberMyPet.ai
          </Link>
        </p>
      </div>

      {/* Print footer */}
      <div className="hidden print:block print:py-8 print:text-center print:text-sm print:text-gray-400">
        Created with RememberMyPet.ai
      </div>
    </div>
  );
}
