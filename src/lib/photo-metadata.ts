import Anthropic from "@anthropic-ai/sdk";
import { getPronouns, type Gender } from "@/lib/pronouns";

const MODEL = "claude-haiku-4-5-20251001";

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export interface PhotoMetadata {
  caption: string;
  tags: string[];
}

export async function generatePhotoMetadata(
  imageBase64: string,
  mimeType: string,
  petName: string,
  gender?: string
): Promise<PhotoMetadata> {
  const safeGender: Gender = typeof gender === "string" && ["male", "female", "neutral"].includes(gender) ? gender as Gender : undefined;
  const { subject, possessive } = getPronouns(safeGender);

  const prompt = `This is a photo of a pet named ${petName}. Write a caption the way ${possessive} owner would — like a fond memory shared with a friend, not an image description. Use ${subject}/${possessive} for pronouns.

Return a JSON object with two fields:

1. "caption": A short, casual caption (under 100 characters) written from the owner's perspective. Think Instagram caption energy — warm, personal, sometimes playful or funny.
   - Focus on personality, habits, or the vibe of the moment — not what the image literally shows.
   - If there's a person in the photo, write as if the owner is in it (e.g. "Snuggles with mom on the couch" not "Skylar sits beside a person").
   - If ${petName} looks silly, proud, regal, cozy — lean into that personality.
   - Keep it simple. Short is better. A few words can say everything.
   - This is a starting point the owner will edit, so capture the right *tone* even if you can't know the specific memory.
   - No clichés like "rainbow bridge," "forever in our hearts," or "best friend."
   Examples of good captions: "The Queen soaking up the sun", "Always ready for an adventure", "That face got ${subject} out of everything", "Nap champion", "Sunday morning snuggles"

2. "tags": An array of relevant tags from these categories:
   - Life stage: "puppy", "kitten", "young", "adult", "senior"
   - Habits: "sunny_spot", "favorite_toy", "nap_time", "meal_time", "grooming"
   - Connection: "eye_contact", "lap_time", "cuddling", "playing", "walking"
   - Setting: "outdoor", "indoor", "beach", "park", "home", "car"
   Only include tags that clearly apply. Use 1-5 tags.

Return ONLY valid JSON, no markdown fences. Example:
{"caption": "That post-walk look of pure satisfaction", "tags": ["walking", "outdoor", "adult"]}`;

  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
              data: imageBase64,
            },
          },
          { type: "text", text: prompt },
        ],
      },
    ],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text.trim() : "";
  // Strip markdown code fences if present (e.g. ```json ... ```)
  const text = raw.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

  try {
    const parsed = JSON.parse(text);
    return {
      caption: typeof parsed.caption === "string" ? parsed.caption : "",
      tags: Array.isArray(parsed.tags) ? parsed.tags.filter((t: unknown) => typeof t === "string") : [],
    };
  } catch {
    // Fallback: treat entire response as caption (backward compat)
    return { caption: text, tags: [] };
  }
}
