import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "6", 10) || 6, 24);
  const offset = parseInt(searchParams.get("offset") || "0", 10) || 0;

  // Service role needed: public feed reads across all published memorials
  const serviceClient = createServiceClient();

  // Fetch published memorials opted into feed, with photos. The inner join
  // excludes photoless memorials in SQL, so .range() and hasMore operate on
  // the same set the client sees — filtering after .range() made pages
  // overlap and stranded rows.
  const { data: memorials, error } = await serviceClient
    .from("memorials")
    .select(`
      id,
      pet_name,
      species,
      custom_species,
      slug,
      tribute,
      anonymous_candle_count,
      created_at,
      photos!inner(url, sort_order)
    `)
    .eq("is_published", true)
    .eq("show_in_feed", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ items: [], hasMore: false }, { status: 500 });
  }

  const withPhotos = memorials || [];

  const memorialIds = withPhotos.map((m) => m.id);

  // Batch-fetch candle counts
  let candleCounts: Record<string, number> = {};
  if (memorialIds.length > 0) {
    const { data: candles } = await serviceClient
      .from("candles")
      .select("memorial_id")
      .in("memorial_id", memorialIds);

    if (candles) {
      for (const c of candles) {
        candleCounts[c.memorial_id] = (candleCounts[c.memorial_id] || 0) + 1;
      }
    }
  }

  // Check which candles current user has lit (if authenticated)
  let userLitSet = new Set<string>();
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (user && memorialIds.length > 0) {
      const { data: userCandles } = await serviceClient
        .from("candles")
        .select("memorial_id")
        .eq("user_id", user.id)
        .in("memorial_id", memorialIds);
      if (userCandles) {
        userLitSet = new Set(userCandles.map((c) => c.memorial_id));
      }
    }
  } catch {
    // Not authenticated — userLit stays false for all
  }

  // Transform data
  const items = withPhotos.map((m) => {
    const photos = Array.isArray(m.photos) ? m.photos : [];
    const heroPhoto = photos.sort(
      (a: { sort_order: number }, b: { sort_order: number }) =>
        (a.sort_order ?? 0) - (b.sort_order ?? 0)
    )[0];

    const speciesDisplay = m.species === "other"
      ? m.custom_species || null
      : m.species
        ? m.species.charAt(0).toUpperCase() + m.species.slice(1)
        : null;

    return {
      id: m.id,
      petName: m.pet_name,
      species: speciesDisplay,
      slug: m.slug,
      tributeSnippet: m.tribute
        ? m.tribute.slice(0, 120) + (m.tribute.length > 120 ? "..." : "")
        : null,
      heroPhotoUrl: heroPhoto?.url || null,
      candleCount: (candleCounts[m.id] || 0) + (m.anonymous_candle_count ?? 0),
      userLit: userLitSet.has(m.id),
      createdAt: m.created_at,
    };
  });

  return NextResponse.json({
    items,
    hasMore: (memorials || []).length === limit,
  });
}
