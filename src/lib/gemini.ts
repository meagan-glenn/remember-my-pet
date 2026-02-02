import { GoogleGenAI, createUserContent, createPartFromBase64 } from "@google/genai";
import { getPronouns, type Gender } from "@/lib/pronouns";

const MODEL = "gemini-2.5-flash-lite";

let _ai: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!_ai) {
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error("GOOGLE_AI_API_KEY is not set");
    }
    _ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });
  }
  return _ai;
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
  const contents = createUserContent([
    `Analyze this photo of a pet named ${petName} and return a JSON object with two fields. Use ${subject}/${possessive} pronouns when referring to ${petName}.

1. "caption": A short, warm sentence suitable for a memorial photo caption. Focus on what ${subject}'s doing or the setting. Use ${subject}/${possessive} pronouns naturally. Keep it under 150 characters. Do not use quotes or clichés like "rainbow bridge," "forever in our hearts," or "best friend."

2. "tags": An array of relevant tags from these categories:
   - Life stage: "puppy", "kitten", "young", "adult", "senior"
   - Habits: "sunny_spot", "favorite_toy", "nap_time", "meal_time", "grooming"
   - Connection: "eye_contact", "lap_time", "cuddling", "playing", "walking"
   - Setting: "outdoor", "indoor", "beach", "park", "home", "car"
   Only include tags that clearly apply. Use 1-5 tags.

Return ONLY valid JSON, no markdown fences. Example:
{"caption": "Stretching out in a warm patch of sunlight", "tags": ["sunny_spot", "indoor", "senior"]}`,
    createPartFromBase64(imageBase64, mimeType),
  ]);

  const response = await getClient().models.generateContent({
    model: MODEL,
    contents,
  });

  const text = response.text?.trim() || "";

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
