import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { apiError } from "@/lib/error-messages";
import { generatePhotoMetadata } from "@/lib/gemini";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
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

    const { caption, tags } = await generatePhotoMetadata(imageBase64, mimeType, petName, gender);
    return NextResponse.json({ caption, tags });
  } catch (error) {
    console.error("Caption generation failed:", error);
    return NextResponse.json({ caption: "", tags: [] });
  }
}
