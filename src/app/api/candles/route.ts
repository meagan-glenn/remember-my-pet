import { NextResponse } from "next/server";
import { createHash } from "crypto";
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

async function getCurrentUser() {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return { supabase, user };
  } catch {
    return { supabase: null, user: null };
  }
}

/**
 * Counts on unpublished memorials are private: only the owner may see or
 * touch them. Returns the memorial row when access is allowed, null otherwise
 * (callers should 404 — not 403 — to avoid confirming the memorial exists).
 */
async function getAccessibleMemorial(
  serviceClient: ReturnType<typeof createServiceClient>,
  memorialId: string,
  userId: string | null
) {
  const { data: memorial } = await serviceClient
    .from("memorials")
    .select("id, is_published, user_id")
    .eq("id", memorialId)
    .maybeSingle();

  if (!memorial) return null;
  if (!memorial.is_published && memorial.user_id !== userId) return null;
  return memorial;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const memorialId = searchParams.get("memorial_id");

  if (!memorialId) {
    return apiError("INVALID_INPUT", 400, "memorial_id is required.");
  }

  const serviceClient = createServiceClient();
  const { supabase, user } = await getCurrentUser();

  const memorial = await getAccessibleMemorial(serviceClient, memorialId, user?.id ?? null);
  if (!memorial) {
    return apiError("MEMORIAL_NOT_FOUND", 404);
  }

  const totalCount = await getTotalCount(serviceClient, memorialId);

  // Check if current user has lit a candle
  let userLit = false;
  if (user && supabase) {
    const { data } = await supabase
      .from("candles")
      .select("id")
      .eq("memorial_id", memorialId)
      .eq("user_id", user.id)
      .maybeSingle();

    userLit = !!data;
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
  const { supabase, user } = await getCurrentUser();

  const memorial = await getAccessibleMemorial(serviceClient, memorial_id, user?.id ?? null);
  if (!memorial) {
    return apiError("MEMORIAL_NOT_FOUND", 404);
  }

  // Anonymous candle lighting
  if (anonymous) {
    const ip = getClientIp(request);

    // Fast in-process gate against tight loops
    if (!rateLimit(`anon-candle:${ip}:${memorial_id}`, 1)) {
      const totalCount = await getTotalCount(serviceClient, memorial_id);
      return NextResponse.json({ lit: true, count: totalCount });
    }

    // Durable one-candle-per-IP-per-memorial: the in-memory limiter resets
    // per Vercel instance, so the real dedup is this insert. IPs are stored
    // hashed. A conflict means this IP already lit here — return the current
    // count without incrementing.
    const ipHash = createHash("sha256").update(`${memorial_id}:${ip}`).digest("hex");
    const { error: dedupError } = await serviceClient
      .from("anonymous_candle_lights")
      .insert({ memorial_id, ip_hash: ipHash });

    if (dedupError) {
      const totalCount = await getTotalCount(serviceClient, memorial_id);
      return NextResponse.json({ lit: true, count: totalCount });
    }

    // Increment anonymous_candle_count atomically via database function
    const { error } = await serviceClient
      .rpc("increment_anonymous_candle_count", { p_memorial_id: memorial_id });

    if (error) {
      return apiError("CANDLE_FAILED", 500);
    }

    const totalCount = await getTotalCount(serviceClient, memorial_id);
    return NextResponse.json({ lit: true, count: totalCount });
  }

  // Authenticated candle toggle
  if (!user || !supabase) {
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
