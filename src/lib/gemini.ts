import { GoogleGenAI, createUserContent, createPartFromBase64 } from "@google/genai";

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

export async function generatePhotoCaption(
  imageBase64: string,
  mimeType: string,
  petName: string
): Promise<string> {
  const contents = createUserContent([
    `Describe this photo of a pet named ${petName} in one short, warm sentence suitable for a memorial photo caption. Focus on what the pet is doing or the setting. Keep it under 150 characters. Do not use quotes. Do not use clichés like "rainbow bridge," "forever in our hearts," or "best friend."`,
    createPartFromBase64(imageBase64, mimeType),
  ]);

  const response = await getClient().models.generateContent({
    model: MODEL,
    contents,
  });

  return response.text?.trim() || "";
}
