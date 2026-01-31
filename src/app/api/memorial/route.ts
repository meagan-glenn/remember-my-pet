import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";

const MAX_PET_NAME = 100;
const MAX_TRIBUTE = 5000;
const MAX_PHOTOS = 20;
const MAX_SLUG_ATTEMPTS = 10;

function generateSlug(petName: string, deathDate: string | null): string {
  const name = petName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const year = deathDate
    ? new Date(deathDate).getFullYear()
    : new Date().getFullYear();
  return `${name}-${year}`;
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
  const { petName, species, birthDate, deathDate, tribute } = body;
  // Support both new { url, caption } format and legacy string[] format
  const photoItems: { url: string; caption?: string }[] = body.photos
    ? body.photos.map((p: { url: string; caption?: string }) => p)
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

  // Generate unique slug (capped attempts)
  const baseSlug = generateSlug(petName, deathDate);
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

  // Insert memorial
  const { data: memorial, error: memError } = await supabase
    .from("memorials")
    .insert({
      user_id: user.id,
      pet_name: petName.slice(0, MAX_PET_NAME),
      slug,
      birth_date: birthDate || null,
      death_date: deathDate || null,
      tribute: tribute.slice(0, MAX_TRIBUTE),
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

  // Insert photos
  if (photoItems.length > 0) {
    const photosData = photoItems.slice(0, MAX_PHOTOS).map((item, index) => ({
      memorial_id: memorial.id,
      url: item.url,
      caption: item.caption?.slice(0, 200) || null,
      sort_order: index,
      uploaded_by: user.id,
    }));

    await supabase.from("photos").insert(photosData);
  }

  return NextResponse.json({
    memorialId: memorial.id,
    slug: memorial.slug,
  });
}
