import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // TODO: Accept pet details, call OpenAI GPT-4o to generate tribute
  const body = await request.json();

  return NextResponse.json({
    tribute: `Tribute for ${body.petName ?? "your pet"} — coming soon.`,
  });
}
