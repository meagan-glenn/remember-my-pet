import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

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

  const { petName, species, birthDate, deathDate, tribute, photoUrls } =
    await request.json();

  if (!petName || !tribute) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Ensure user row exists
  await supabase
    .from("users")
    .upsert({ id: user.id, email: user.email }, { onConflict: "id" });

  // Generate unique slug
  const baseSlug = generateSlug(petName, deathDate);
  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const { data } = await supabase
      .from("memorials")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Insert memorial
  const { data: memorial, error: memError } = await supabase
    .from("memorials")
    .insert({
      user_id: user.id,
      pet_name: petName,
      slug,
      birth_date: birthDate || null,
      death_date: deathDate || null,
      eulogy: tribute,
      is_paid: false,
      is_published: false,
    })
    .select()
    .single();

  if (memError) {
    return NextResponse.json({ error: memError.message }, { status: 500 });
  }

  // Insert photos
  if (photoUrls?.length) {
    const photosData = photoUrls.map((url: string, index: number) => ({
      memorial_id: memorial.id,
      url,
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
