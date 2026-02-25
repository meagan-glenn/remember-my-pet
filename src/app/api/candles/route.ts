import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import { apiError } from "@/lib/error-messages";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const memorialId = searchParams.get("memorial_id");

  if (!memorialId) {
    return apiError("INVALID_INPUT", 400, "memorial_id is required.");
  }

  // Service role needed: candle counts are public (no auth required for reads)
  const serviceClient = createServiceClient();

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
      const { data } = await supabase
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

  if (!rateLimit(`candle-toggle:${user.id}`, 20)) {
    return apiError("RATE_LIMITED", 429);
  }

  const body = await request.json();
  const { memorial_id } = body;

  if (!memorial_id || typeof memorial_id !== "string") {
    return apiError("INVALID_INPUT", 400, "memorial_id is required.");
  }

  // Check if candle already exists (uses auth-aware client — RLS enforces user_id)
  const { data: existing } = await supabase
    .from("candles")
    .select("id")
    .eq("memorial_id", memorial_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    // Unlight
    await supabase.from("candles").delete().eq("id", existing.id);
  } else {
    // Light
    const { error } = await supabase.from("candles").insert({
      memorial_id,
      user_id: user.id,
    });

    if (error) {
      return apiError("CANDLE_FAILED", 500);
    }
  }

  // Get updated count (service role for public count across all users)
  const serviceClient = createServiceClient();
  const { count } = await serviceClient
    .from("candles")
    .select("*", { count: "exact", head: true })
    .eq("memorial_id", memorial_id);

  return NextResponse.json({ lit: !existing, count: count ?? 0 });
}
