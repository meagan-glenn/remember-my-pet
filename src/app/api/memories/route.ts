import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/rate-limit";
import { validateMemoryContent, validateEmail } from "@/lib/validation";
import { sendMemoryNotification } from "@/lib/email";

const MAX_NAME = 100;
const MAX_PHOTOS = 3;

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (!rateLimit(`memory:${ip}`, 5)) {
    return NextResponse.json(
      { error: "Too many submissions. Please wait a moment." },
      { status: 429 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { memorialId, contributorName, contributorEmail, content, photoUrls } =
    await request.json();

  // Validate required fields
  if (!memorialId || typeof memorialId !== "string") {
    return NextResponse.json({ error: "Memorial ID is required" }, { status: 400 });
  }

  if (!contributorName || typeof contributorName !== "string" || contributorName.trim().length === 0) {
    return NextResponse.json({ error: "Your name is required" }, { status: 400 });
  }

  if (contributorName.length > MAX_NAME) {
    return NextResponse.json({ error: `Name must be under ${MAX_NAME} characters` }, { status: 400 });
  }

  const contentValidation = validateMemoryContent(content);
  if (!contentValidation.valid) {
    return NextResponse.json({ error: contentValidation.error }, { status: 400 });
  }

  if (contributorEmail && !validateEmail(contributorEmail)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  // Validate photo URLs
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (photoUrls && Array.isArray(photoUrls)) {
    if (photoUrls.length > MAX_PHOTOS) {
      return NextResponse.json({ error: `Maximum ${MAX_PHOTOS} photos allowed` }, { status: 400 });
    }
    for (const url of photoUrls) {
      if (typeof url !== "string" || !supabaseUrl || !url.startsWith(supabaseUrl)) {
        return NextResponse.json({ error: "Invalid photo URL" }, { status: 400 });
      }
    }
  }

  // Verify memorial exists and is published
  const { data: memorial, error: memError } = await supabase
    .from("memorials")
    .select("id, pet_name, user_id, is_published")
    .eq("id", memorialId)
    .single();

  if (memError || !memorial || !memorial.is_published) {
    return NextResponse.json({ error: "Memorial not found" }, { status: 404 });
  }

  // Insert memory
  const { error: insertError } = await supabase.from("memories").insert({
    memorial_id: memorialId,
    contributor_name: contributorName.trim().slice(0, MAX_NAME),
    contributor_email: contributorEmail?.trim() || null,
    content: content.trim(),
    photo_urls: photoUrls?.length ? photoUrls : null,
    is_approved: false,
    moderation_status: "pending",
  });

  if (insertError) {
    console.error("Memory insert error:", insertError.message);
    return NextResponse.json({ error: "Failed to submit memory" }, { status: 500 });
  }

  // Upsert contributor record
  if (contributorEmail) {
    await supabase.from("contributors").upsert(
      {
        memorial_id: memorialId,
        email: contributorEmail.trim(),
        name: contributorName.trim(),
      },
      { onConflict: "memorial_id,email" }
    );
  }

  // Send email notification to memorial owner
  const { data: owner } = await supabase
    .from("users")
    .select("email")
    .eq("id", memorial.user_id)
    .single();

  if (owner?.email) {
    const { data: memorialForSlug } = await supabase
      .from("memorials")
      .select("slug")
      .eq("id", memorialId)
      .single();

    await sendMemoryNotification({
      ownerEmail: owner.email,
      petName: memorial.pet_name,
      contributorName: contributorName.trim(),
      memoryPreview: content.trim(),
      memorialSlug: memorialForSlug?.slug || "",
    });
  }

  return NextResponse.json({ success: true });
}
