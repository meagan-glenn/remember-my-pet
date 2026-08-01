import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { apiError } from "@/lib/error-messages";
import { generatePhotoMetadata } from "@/lib/gemini";
import { sanitizeForPrompt } from "@/lib/sanitize-prompt";

// Client-side compression targets 4MB, which is ~5.5M base64 chars; anything
// bigger than this is not a legitimate wizard upload.
const MAX_BASE64_LENGTH = 8_000_000;
const MAX_PET_NAME = 100;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: Request) {
  const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",").pop()?.trim() || "unknown";
  if (!rateLimit(`caption:${ip}`, 20)) {
    return apiError("RATE_LIMITED", 429);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ caption: "", tags: [] });
  }

  try {
    const { imageBase64, mimeType, petName, gender } = await request.json();

    if (!imageBase64 || !mimeType || !petName) {
      return NextResponse.json(
        { error: "Missing required fields", caption: "", tags: [] },
        { status: 400 }
      );
    }

    if (typeof imageBase64 !== "string" || imageBase64.length > MAX_BASE64_LENGTH) {
      return apiError("INVALID_INPUT", 400, "Image is too large.");
    }

    if (typeof mimeType !== "string" || !ALLOWED_MIME_TYPES.includes(mimeType)) {
      return apiError("INVALID_INPUT", 400, "Unsupported image type.");
    }

    if (typeof petName !== "string" || petName.length > MAX_PET_NAME) {
      return apiError("INVALID_INPUT", 400, "Invalid pet name.");
    }

    const { caption, tags } = await generatePhotoMetadata(
      imageBase64,
      mimeType,
      sanitizeForPrompt(petName),
      gender
    );
    return NextResponse.json({ caption, tags });
  } catch (error) {
    // Real API failures must be distinguishable from "no caption available"
    // (and reach monitoring) — don't disguise them as HTTP 200.
    console.error("Caption generation failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Caption generation failed", caption: "", tags: [] },
      { status: 502 }
    );
  }
}
