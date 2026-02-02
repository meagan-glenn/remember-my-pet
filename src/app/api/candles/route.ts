import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const memorialId = searchParams.get("memorial_id");

  if (!memorialId) {
    return NextResponse.json(
      { error: "memorial_id is required" },
      { status: 400 }
    );
  }

  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get count
  const { count, error } = await serviceClient
    .from("candles")
    .select("*", { count: "exact", head: true })
    .eq("memorial_id", memorialId);

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch candle count" },
      { status: 500 }
    );
  }

  // Check if current user has lit a candle
  let userLit = false;
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await serviceClient
        .from("candles")
        .select("id")
        .eq("memorial_id", memorialId)
        .eq("user_id", user.id)
        .maybeSingle();

      userLit = !!data;
    }
  } catch {
    // Not authenticated — userLit stays false
  }

  return NextResponse.json({ count: count ?? 0, userLit });
}

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await request.json();
  const { memorial_id } = body;

  if (!memorial_id || typeof memorial_id !== "string") {
    return NextResponse.json(
      { error: "memorial_id is required" },
      { status: 400 }
    );
  }

  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check if candle already exists
  const { data: existing } = await serviceClient
    .from("candles")
    .select("id")
    .eq("memorial_id", memorial_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    // Unlight
    await serviceClient.from("candles").delete().eq("id", existing.id);
  } else {
    // Light
    const { error } = await serviceClient.from("candles").insert({
      memorial_id,
      user_id: user.id,
    });

    if (error) {
      return NextResponse.json(
        { error: "Failed to light candle" },
        { status: 500 }
      );
    }
  }

  // Get updated count
  const { count } = await serviceClient
    .from("candles")
    .select("*", { count: "exact", head: true })
    .eq("memorial_id", memorial_id);

  return NextResponse.json({ lit: !existing, count: count ?? 0 });
}
