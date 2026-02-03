import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { apiError } from "@/lib/error-messages";

export async function GET(request: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("AUTH_REQUIRED", 401);
  }

  const { searchParams } = new URL(request.url);
  const compilationId = searchParams.get("compilationId");

  if (!compilationId) {
    return apiError("INVALID_INPUT", 400, "Missing compilationId.");
  }

  const { data, error } = await supabase
    .from("video_compilations")
    .select("id, status, url, error_message, duration_seconds")
    .eq("id", compilationId)
    .single();

  if (error || !data) {
    return apiError("MEMORIAL_NOT_FOUND", 404, "Compilation not found.");
  }

  return NextResponse.json({
    compilationId: data.id,
    status: data.status,
    url: data.url,
    errorMessage: data.error_message,
    durationSeconds: data.duration_seconds,
  });
}
