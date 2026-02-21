import Anthropic from "@anthropic-ai/sdk";
import { getPronouns, type Gender } from "@/lib/pronouns";

const MODEL = "claude-haiku-3-5-20241022";

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

  const prompt = `Analyze this photo of a pet named ${petName} and return a JSON object with two fields. Use ${subject}/${possessive} pronouns when referring to ${petName}.

1. "caption": A short, warm sentence suitable for a memorial photo caption. Focus on what ${subject}'s doing or the setting. Use ${subject}/${possessive} pronouns naturally. Keep it under 150 characters. Do not use quotes or clichés like "rainbow bridge," "forever in our hearts," or "best friend."

2. "tags": An array of relevant tags from these categories:
   - Life stage: "puppy", "kitten", "young", "adult", "senior"
   - Habits: "sunny_spot", "favorite_toy", "nap_time", "meal_time", "grooming"
   - Connection: "eye_contact", "lap_time", "cuddling", "playing", "walking"
   - Setting: "outdoor", "indoor", "beach", "park", "home", "car"
   Only include tags that clearly apply. Use 1-5 tags.

Return ONLY valid JSON, no markdown fences. Example:
{"caption": "Stretching out in a warm patch of sunlight", "tags": ["sunny_spot", "indoor", "senior"]}`;

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

  const text = response.content[0].type === "text" ? response.content[0].text.trim() : "";

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
