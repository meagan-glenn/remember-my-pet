import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";
import { apiError } from "@/lib/error-messages";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const memorialId = searchParams.get("memorial_id");

  if (!memorialId) {
    return apiError("INVALID_INPUT", 400, "memorial_id is required.");
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
    return apiError("CANDLE_FAILED", 500);
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
    return apiError("AUTH_REQUIRED", 401);
  }

  const body = await request.json();
  const { memorial_id } = body;

  if (!memorial_id || typeof memorial_id !== "string") {
    return apiError("INVALID_INPUT", 400, "memorial_id is required.");
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
      return apiError("CANDLE_FAILED", 500);
    }
  }

  // Get updated count
  const { count } = await serviceClient
    .from("candles")
    .select("*", { count: "exact", head: true })
    .eq("memorial_id", memorial_id);

  return NextResponse.json({ lit: !existing, count: count ?? 0 });
}
