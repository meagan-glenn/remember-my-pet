import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/rate-limit";
import { apiError } from "@/lib/error-messages";
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
    return apiError("RATE_LIMITED", 429);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { memorialId, contributorName, contributorEmail, content, photoUrls } =
    await request.json();

  // Validate required fields
  if (!memorialId || typeof memorialId !== "string") {
    return apiError("INVALID_INPUT", 400, "Memorial ID is required.");
  }

  if (!contributorName || typeof contributorName !== "string" || contributorName.trim().length === 0) {
    return apiError("INVALID_INPUT", 400, "Your name is required.");
  }

  if (contributorName.length > MAX_NAME) {
    return apiError("INVALID_INPUT", 400, `Name must be under ${MAX_NAME} characters.`);
  }

  const contentValidation = validateMemoryContent(content);
  if (!contentValidation.valid) {
    return apiError("INVALID_INPUT", 400, contentValidation.error);
  }

  if (contributorEmail && !validateEmail(contributorEmail)) {
    return apiError("INVALID_INPUT", 400, "Invalid email address.");
  }

  // Validate photo URLs
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (photoUrls && Array.isArray(photoUrls)) {
    if (photoUrls.length > MAX_PHOTOS) {
      return apiError("INVALID_INPUT", 400, `Maximum ${MAX_PHOTOS} photos allowed.`);
    }
    for (const url of photoUrls) {
      if (typeof url !== "string" || !supabaseUrl || !url.startsWith(supabaseUrl)) {
        return apiError("INVALID_INPUT", 400, "Invalid photo URL.");
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
    return apiError("MEMORIAL_NOT_FOUND", 404);
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
    return apiError("MEMORY_SUBMIT_FAILED", 500);
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
