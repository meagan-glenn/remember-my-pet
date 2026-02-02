import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";

const MAX_PET_NAME = 100;
const MAX_TRIBUTE = 5000;
const MAX_PHOTOS = 20;
const MAX_SLUG_ATTEMPTS = 10;

function generateSlug(petName: string, ownerLastName: string, deathDate: string | null): string {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const name = normalize(petName);
  const lastName = normalize(ownerLastName);
  const year = deathDate
    ? new Date(deathDate).getFullYear()
    : new Date().getFullYear();
  return lastName ? `${name}-${lastName}-${year}` : `${name}-${year}`;
}

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!rateLimit(`memorial:${user.id}`, 10)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { petName, species, customSpecies, gender, birthDate, deathDate, tribute, ownerLastName, memorialId, heroPhotoCropY } = body;
  // Support both new { url, caption, aiDetectedTags } format and legacy string[] format
  const photoItems: { url: string; caption?: string; aiDetectedTags?: string[] }[] = body.photos
    ? body.photos.map((p: { url: string; caption?: string; aiDetectedTags?: string[] }) => p)
    : (body.photoUrls || []).map((url: string) => ({ url }));

  // Input validation
  if (!petName || typeof petName !== "string" || !tribute || typeof tribute !== "string") {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  if (petName.length > MAX_PET_NAME) {
    return NextResponse.json(
      { error: `Pet name must be under ${MAX_PET_NAME} characters` },
      { status: 400 }
    );
  }

  if (tribute.length > MAX_TRIBUTE) {
    return NextResponse.json(
      { error: `Tribute must be under ${MAX_TRIBUTE} characters` },
      { status: 400 }
    );
  }

  // Validate photo URLs
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (photoItems.length > MAX_PHOTOS) {
    return NextResponse.json(
      { error: `Maximum ${MAX_PHOTOS} photos allowed` },
      { status: 400 }
    );
  }
  for (const item of photoItems) {
    if (typeof item.url !== "string" || !supabaseUrl || !item.url.startsWith(supabaseUrl)) {
      return NextResponse.json(
        { error: "Invalid photo URL" },
        { status: 400 }
      );
    }
  }

  // Ensure user row exists
  await supabase
    .from("users")
    .upsert({ id: user.id, email: user.email }, { onConflict: "id" });

  const memorialFields = {
    pet_name: petName.slice(0, MAX_PET_NAME),
    species: typeof species === "string" ? species.slice(0, 50) : null,
    custom_species: typeof customSpecies === "string" ? customSpecies.slice(0, 100) : null,
    gender: typeof gender === "string" && ["male", "female", "neutral"].includes(gender) ? gender : null,
    birth_date: birthDate || null,
    death_date: deathDate || null,
    tribute: tribute.slice(0, MAX_TRIBUTE),
    hero_photo_crop_y: typeof heroPhotoCropY === "number" ? Math.min(100, Math.max(0, heroPhotoCropY)) : 50,
  };

  let memorial: { id: string; slug: string };

  if (memorialId) {
    // ── Update existing memorial ──────────────────────────────────────────
    // Verify ownership
    const { data: existing } = await supabase
      .from("memorials")
      .select("id, slug, user_id")
      .eq("id", memorialId)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error: updateError } = await supabase
      .from("memorials")
      .update(memorialFields)
      .eq("id", memorialId);

    if (updateError) {
      console.error("Memorial update error:", updateError.message);
      return NextResponse.json(
        { error: "Failed to update memorial" },
        { status: 500 }
      );
    }

    // Replace photos: delete old, insert new
    await supabase.from("photos").delete().eq("memorial_id", memorialId);

    if (photoItems.length > 0) {
      const photosData = photoItems.slice(0, MAX_PHOTOS).map((item, index) => ({
        memorial_id: memorialId,
        url: item.url,
        caption: item.caption?.slice(0, 200) || null,
        ai_detected_tags: item.aiDetectedTags || [],
        sort_order: index,
        uploaded_by: user.id,
      }));
      await supabase.from("photos").insert(photosData);
    }

    memorial = { id: existing.id, slug: existing.slug };
  } else {
    // ── Create new memorial ───────────────────────────────────────────────
    const baseSlug = generateSlug(petName, ownerLastName || "", deathDate);
    let slug = baseSlug;
    let found = false;

    for (let i = 2; i <= MAX_SLUG_ATTEMPTS + 1; i++) {
      const { data } = await supabase
        .from("memorials")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (!data) {
        found = true;
        break;
      }
      slug = `${baseSlug}-${i}`;
    }

    if (!found) {
      slug = `${baseSlug}-${crypto.randomUUID().slice(0, 6)}`;
    }

    const { data: newMemorial, error: memError } = await supabase
      .from("memorials")
      .insert({
        user_id: user.id,
        ...memorialFields,
        slug,
        is_paid: false,
        is_published: false,
      })
      .select()
      .single();

    if (memError) {
      console.error("Memorial creation error:", memError.message);
      return NextResponse.json(
        { error: "Failed to create memorial" },
        { status: 500 }
      );
    }

    if (photoItems.length > 0) {
      const photosData = photoItems.slice(0, MAX_PHOTOS).map((item, index) => ({
        memorial_id: newMemorial.id,
        url: item.url,
        caption: item.caption?.slice(0, 200) || null,
        ai_detected_tags: item.aiDetectedTags || [],
        sort_order: index,
        uploaded_by: user.id,
      }));
      await supabase.from("photos").insert(photosData);
    }

    memorial = { id: newMemorial.id, slug: newMemorial.slug };
  }

  return NextResponse.json({
    memorialId: memorial.id,
    slug: memorial.slug,
  });
}
