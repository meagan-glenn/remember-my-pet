import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import OpenAI from "openai";

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { petName, species, birthDate, deathDate, chatHistory } =
    await request.json();

  if (!petName || !chatHistory?.length) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const conversationSummary = chatHistory
    .map((m: { role: string; content: string }) =>
      m.role === "assistant" ? `Q: ${m.content}` : `A: ${m.content}`
    )
    .join("\n");

  const dateInfo = [
    birthDate && `Born: ${birthDate}`,
    deathDate && `Passed: ${deathDate}`,
  ]
    .filter(Boolean)
    .join(", ");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a compassionate memorial writer. Write a heartfelt tribute (250-400 words) celebrating the pet's life using the owner's stories. Focus on joyful memories. Write in a warm, conversational tone. Do not use the word "eulogy" — this is a "tribute."`,
      },
      {
        role: "user",
        content: `Pet: ${petName} (${species || "pet"})${dateInfo ? ` | ${dateInfo}` : ""}

Owner's responses:
${conversationSummary}

Write a beautiful tribute that captures who ${petName} was.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 600,
  });

  const tribute = completion.choices[0].message.content;

  return NextResponse.json({ tribute });
}
