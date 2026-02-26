import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import { apiError } from "@/lib/error-messages";
import { getClientIp } from "@/lib/request-utils";

async function getTotalCount(serviceClient: ReturnType<typeof createServiceClient>, memorialId: string) {
  const [{ count }, { data: memorial }] = await Promise.all([
    serviceClient
      .from("candles")
      .select("*", { count: "exact", head: true })
      .eq("memorial_id", memorialId),
    serviceClient
      .from("memorials")
      .select("anonymous_candle_count")
      .eq("id", memorialId)
      .single(),
  ]);
  return (count ?? 0) + (memorial?.anonymous_candle_count ?? 0);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const memorialId = searchParams.get("memorial_id");

  if (!memorialId) {
    return apiError("INVALID_INPUT", 400, "memorial_id is required.");
  }

  const serviceClient = createServiceClient();
  const totalCount = await getTotalCount(serviceClient, memorialId);

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
    // Not authenticated — userLit stays false (client checks localStorage for anonymous)
  }

  return NextResponse.json({ count: totalCount, userLit });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { memorial_id, anonymous } = body;

  if (!memorial_id || typeof memorial_id !== "string") {
    return apiError("INVALID_INPUT", 400, "memorial_id is required.");
  }

  const serviceClient = createServiceClient();

  // Anonymous candle lighting
  if (anonymous) {
    const ip = getClientIp(request);

    // 1 anonymous candle per IP per memorial (rate limit window = 1 minute, effectively one-time)
    if (!rateLimit(`anon-candle:${ip}:${memorial_id}`, 1)) {
      // Already lit — just return current count without error
      const totalCount = await getTotalCount(serviceClient, memorial_id);
      return NextResponse.json({ lit: true, count: totalCount });
    }

    // Increment anonymous_candle_count atomically via database function
    const { data: newAnonCount, error } = await serviceClient
      .rpc("increment_anonymous_candle_count", { p_memorial_id: memorial_id });

    if (error) {
      // If memorial doesn't exist, the RPC returns no rows
      if (newAnonCount === null) {
        return apiError("MEMORIAL_NOT_FOUND", 404);
      }
      return apiError("CANDLE_FAILED", 500);
    }

    const totalCount = await getTotalCount(serviceClient, memorial_id);
    return NextResponse.json({ lit: true, count: totalCount });
  }

  // Authenticated candle toggle
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

  const { data: existing } = await supabase
    .from("candles")
    .select("id")
    .eq("memorial_id", memorial_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("candles").delete().eq("id", existing.id);
  } else {
    const { error } = await supabase.from("candles").insert({
      memorial_id,
      user_id: user.id,
    });

    if (error) {
      return apiError("CANDLE_FAILED", 500);
    }
  }

  const totalCount = await getTotalCount(serviceClient, memorial_id);
  return NextResponse.json({ lit: !existing, count: totalCount });
}
