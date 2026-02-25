import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { apiError } from "@/lib/error-messages";

export async function GET(request: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("AUTH_REQUIRED", 401);
  }

  if (!rateLimit(`video-status:${user.id}`, 30)) {
    return apiError("RATE_LIMITED", 429);
  }

  const { searchParams } = new URL(request.url);
  const compilationId = searchParams.get("compilationId");

  if (!compilationId) {
    return apiError("INVALID_INPUT", 400, "Missing compilationId.");
  }

  // Join through memorial to verify the requesting user owns the compilation
  const { data, error } = await supabase
    .from("video_compilations")
    .select("id, status, url, error_message, duration_seconds, memorial_id, memorials(user_id)")
    .eq("id", compilationId)
    .single();

  if (error || !data) {
    return apiError("MEMORIAL_NOT_FOUND", 404, "Compilation not found.");
  }

  const memorial = data.memorials as unknown as { user_id: string } | null;
  if (!memorial || memorial.user_id !== user.id) {
    return apiError("AUTH_REQUIRED", 403, "You don't have permission.");
  }

  return NextResponse.json({
    compilationId: data.id,
    status: data.status,
    url: data.url,
    errorMessage: data.error_message,
    durationSeconds: data.duration_seconds,
  });
}
