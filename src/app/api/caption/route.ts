import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { generatePhotoCaption } from "@/lib/gemini";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(`caption:${ip}`, 20)) {
    return NextResponse.json(
      { error: "Too many requests", caption: "" },
      { status: 429 }
    );
  }

  if (!process.env.GOOGLE_AI_API_KEY) {
    return NextResponse.json({ caption: "" });
  }

  try {
    const { imageBase64, mimeType, petName } = await request.json();

    if (!imageBase64 || !mimeType || !petName) {
      return NextResponse.json(
        { error: "Missing required fields", caption: "" },
        { status: 400 }
      );
    }

    const caption = await generatePhotoCaption(imageBase64, mimeType, petName);
    return NextResponse.json({ caption });
  } catch (error) {
    console.error("Caption generation failed:", error);
    return NextResponse.json({ caption: "" });
  }
}
